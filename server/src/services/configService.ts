/**
 * API配置服务
 * 负责API配置的CRUD操作和管理
 * 使用内存缓存优化适配器和模型列表
 */

import fs from 'fs/promises';
import path from 'path';
import {
  APIConfig,
  APIConfigData,
  CreateAPIConfigParams,
  UpdateAPIConfigParams,
} from '../models/apiConfig';
import { createAdapterFromAPIConfig } from '../adapters/factory';
import { createCache, MemoryCache } from '../utils/cache';

/**
 * 配置服务类
 */
export class ConfigService {
  private dataDir: string;
  private configs: Map<string, APIConfig> = new Map();
  private modelCache: MemoryCache<string[]>;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'server', 'data', 'configs');
    // 模型列表缓存：最多100个，TTL 10分钟
    this.modelCache = createCache<string[]>(100, 10 * 60 * 1000);
  }

  /**
   * 初始化数据目录
   */
  async init(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    await this.loadConfigs();
  }

  /**
   * 从文件加载所有配置
   */
  private async loadConfigs(): Promise<void> {
    try {
      const files = await fs.readdir(this.dataDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const data: APIConfigData = JSON.parse(content);
          const config = APIConfig.fromJSON(data);
          this.configs.set(config.id, config);
        }
      }

      console.log(`✅ 加载了 ${this.configs.size} 个API配置`);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  }

  /**
   * 保存配置到文件
   */
  private async saveConfig(config: APIConfig): Promise<void> {
    const filePath = path.join(this.dataDir, `${config.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(config.toJSON(), null, 2));
  }

  /**
   * 删除配置文件
   */
  private async deleteConfigFile(id: string): Promise<void> {
    const filePath = path.join(this.dataDir, `${id}.json`);
    await fs.unlink(filePath);
  }

  /**
   * 获取所有配置
   */
  async getAll(): Promise<APIConfig[]> {
    return Array.from(this.configs.values());
  }

  /**
   * 根据ID获取配置
   */
  async getById(id: string): Promise<APIConfig | null> {
    return this.configs.get(id) || null;
  }

  /**
   * 根据名称获取配置
   */
  async getByName(name: string): Promise<APIConfig | null> {
    for (const config of this.configs.values()) {
      if (config.name === name) {
        return config;
      }
    }
    return null;
  }

  /**
   * 创建配置
   */
  async create(params: CreateAPIConfigParams): Promise<APIConfig> {
    // 检查名称是否已存在
    const existing = await this.getByName(params.name);
    if (existing) {
      throw new Error(`配置名称 "${params.name}" 已存在`);
    }

    // 创建配置实例
    const config = new APIConfig(params);

    // 验证配置
    const validation = config.validate();
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
    }

    // 保存到内存和文件
    this.configs.set(config.id, config);
    await this.saveConfig(config);

    console.log(`✅ 创建API配置: ${config.name} (${config.id})`);
    return config;
  }

  /**
   * 更新配置（清除相关缓存）
   */
  async update(id: string, params: UpdateAPIConfigParams): Promise<APIConfig> {
    const config = await this.getById(id);
    if (!config) {
      throw new Error(`配置不存在: ${id}`);
    }

    // 如果更新名称，检查新名称是否已被使用
    if (params.name && params.name !== config.name) {
      const existing = await this.getByName(params.name);
      if (existing) {
        throw new Error(`配置名称 "${params.name}" 已存在`);
      }
    }

    // 更新配置
    config.update(params);

    // 验证配置
    const validation = config.validate();
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
    }

    // 保存到文件
    await this.saveConfig(config);

    // 清除模型缓存
    this.modelCache.delete(`models:${id}`);

    console.log(`✅ 更新API配置: ${config.name} (${config.id})`);
    return config;
  }

  /**
   * 删除配置（清除相关缓存）
   */
  async delete(id: string): Promise<boolean> {
    const config = await this.getById(id);
    if (!config) {
      return false;
    }

    // 从内存中删除
    this.configs.delete(id);

    // 清除模型缓存
    this.modelCache.delete(`models:${id}`);

    // 删除文件
    try {
      await this.deleteConfigFile(id);
      console.log(`✅ 删除API配置: ${config.name} (${config.id})`);
      return true;
    } catch (error) {
      console.error('删除配置文件失败:', error);
      return false;
    }
  }

  /**
   * 测试API连接
   */
  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const config = await this.getById(id);
    if (!config) {
      return {
        success: false,
        message: '配置不存在',
      };
    }

    try {
      // 创建适配器
      const adapter = createAdapterFromAPIConfig(config.toJSON());

      // 测试连接
      const success = await adapter.testConnection();

      if (success) {
        return {
          success: true,
          message: '连接成功',
        };
      } else {
        return {
          success: false,
          message: '连接失败',
        };
      }
    } catch (error: any) {
      console.error('测试连接失败:', error);
      return {
        success: false,
        message: error.message || '连接失败',
      };
    }
  }

  /**
   * 获取可用模型列表（带缓存）
   */
  async getAvailableModels(id: string): Promise<string[]> {
    const config = await this.getById(id);
    if (!config) {
      throw new Error('配置不存在');
    }

    const cacheKey = `models:${id}`;
    
    return this.modelCache.getOrSet(cacheKey, async () => {
      try {
        // 如果配置中已有模型列表，直接返回
        if (config.models && config.models.length > 0) {
          return config.models;
        }

        // 否则从API获取
        const adapter = createAdapterFromAPIConfig(config.toJSON());
        const models = await adapter.getAvailableModels();

        // 更新配置中的模型列表
        if (models.length > 0) {
          config.models = models;
          if (!config.defaultModel && models.length > 0) {
            config.defaultModel = models[0];
          }
          await this.saveConfig(config);
        }

        return models;
      } catch (error) {
        console.error('获取模型列表失败:', error);
        return [];
      }
    });
  }
}

// 导出单例实例
export const configService = new ConfigService();
