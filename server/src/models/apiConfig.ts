/**
 * API配置模型
 * 管理API配置的数据结构和验证
 */

import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt } from '../utils/crypto';

/**
 * API配置类型
 */
export type APIConfigType = 'openai' | 'openrouter' | 'openai-compatible' | 'custom';

/**
 * API配置接口
 */
export interface APIConfigData {
  id: string;
  name: string;
  type: APIConfigType;
  baseURL: string;
  apiKey?: string;
  models?: string[];
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitPerMinute?: number;
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API配置创建参数
 */
export interface CreateAPIConfigParams {
  name: string;
  type: APIConfigType;
  baseURL?: string;
  apiKey?: string;
  models?: string[];
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitPerMinute?: number;
  config?: Record<string, any>;
}

/**
 * API配置更新参数
 */
export interface UpdateAPIConfigParams {
  name?: string;
  type?: APIConfigType;
  baseURL?: string;
  apiKey?: string;
  models?: string[];
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitPerMinute?: number;
  config?: Record<string, any>;
}

/**
 * API配置类
 */
export class APIConfig {
  id: string;
  name: string;
  type: APIConfigType;
  baseURL: string;
  private _apiKey?: string; // 加密存储
  models: string[];
  defaultModel?: string;
  timeout: number;
  maxRetries: number;
  rateLimitPerMinute?: number;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<APIConfigData>) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.type = data.type || 'openai-compatible';
    this.baseURL = data.baseURL || this.getDefaultBaseURL(this.type);
    this._apiKey = data.apiKey;
    this.models = data.models || [];
    this.defaultModel = data.defaultModel;
    this.timeout = data.timeout || 60000;
    this.maxRetries = data.maxRetries || 3;
    this.rateLimitPerMinute = data.rateLimitPerMinute;
    this.config = data.config || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * 获取API密钥（解密）
   */
  get apiKey(): string | undefined {
    if (!this._apiKey) return undefined;
    try {
      return decrypt(this._apiKey);
    } catch (error) {
      console.error('解密API密钥失败:', error);
      return undefined;
    }
  }

  /**
   * 设置API密钥（加密）
   */
  set apiKey(value: string | undefined) {
    if (!value) {
      this._apiKey = undefined;
      return;
    }
    try {
      this._apiKey = encrypt(value);
    } catch (error) {
      console.error('加密API密钥失败:', error);
      this._apiKey = value; // 如果加密失败，存储原始值
    }
  }

  /**
   * 获取默认baseURL
   */
  private getDefaultBaseURL(type: APIConfigType): string {
    switch (type) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'openrouter':
        return 'https://openrouter.ai/api/v1';
      default:
        return '';
    }
  }

  /**
   * 验证配置
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('配置名称不能为空');
    }

    if (!this.baseURL || this.baseURL.trim() === '') {
      errors.push('baseURL不能为空');
    }

    // 验证baseURL格式
    if (this.baseURL) {
      try {
        new URL(this.baseURL);
      } catch (error) {
        errors.push('baseURL格式无效');
      }
    }

    // OpenAI和OpenRouter需要API密钥
    if ((this.type === 'openai' || this.type === 'openrouter') && !this.apiKey) {
      errors.push(`${this.type}类型需要提供API密钥`);
    }

    if (this.timeout && this.timeout < 1000) {
      errors.push('超时时间不能小于1000ms');
    }

    if (this.maxRetries && (this.maxRetries < 0 || this.maxRetries > 10)) {
      errors.push('重试次数必须在0-10之间');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 转换为JSON（用于存储）
   */
  toJSON(): APIConfigData {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      baseURL: this.baseURL,
      apiKey: this._apiKey, // 存储加密后的密钥
      models: this.models,
      defaultModel: this.defaultModel,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      rateLimitPerMinute: this.rateLimitPerMinute,
      config: this.config,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 转换为安全的JSON（用于API响应，不包含敏感信息）
   */
  toSafeJSON(): Omit<APIConfigData, 'apiKey'> & { hasApiKey: boolean } {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      baseURL: this.baseURL,
      hasApiKey: !!this._apiKey,
      models: this.models,
      defaultModel: this.defaultModel,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      rateLimitPerMinute: this.rateLimitPerMinute,
      config: this.config,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 从JSON创建实例
   */
  static fromJSON(data: APIConfigData): APIConfig {
    return new APIConfig(data);
  }

  /**
   * 更新配置
   */
  update(params: UpdateAPIConfigParams): void {
    if (params.name !== undefined) this.name = params.name;
    if (params.type !== undefined) this.type = params.type;
    if (params.baseURL !== undefined) this.baseURL = params.baseURL;
    if (params.apiKey !== undefined) this.apiKey = params.apiKey;
    if (params.models !== undefined) this.models = params.models;
    if (params.defaultModel !== undefined) this.defaultModel = params.defaultModel;
    if (params.timeout !== undefined) this.timeout = params.timeout;
    if (params.maxRetries !== undefined) this.maxRetries = params.maxRetries;
    if (params.rateLimitPerMinute !== undefined) {
      this.rateLimitPerMinute = params.rateLimitPerMinute;
    }
    if (params.config !== undefined) this.config = params.config;

    this.updatedAt = new Date();
  }
}
