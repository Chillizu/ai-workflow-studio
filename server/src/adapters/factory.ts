/**
 * 适配器工厂
 * 根据配置创建和管理适配器实例
 */

import { BaseAdapter } from './base';
import { OpenAICompatibleAdapter, OpenAICompatibleConfig } from './openai-compatible';

/**
 * 适配器类型
 */
export enum AdapterType {
  OPENAI_COMPATIBLE = 'openai-compatible',
}

/**
 * 适配器配置联合类型
 */
export type AnyAdapterConfig = OpenAICompatibleConfig;

/**
 * 适配器工厂类
 */
export class AdapterFactory {
  private static adapters: Map<string, BaseAdapter> = new Map();

  /**
   * 创建适配器
   */
  static createAdapter(type: AdapterType, config: AnyAdapterConfig): BaseAdapter {
    switch (type) {
      case AdapterType.OPENAI_COMPATIBLE:
        return new OpenAICompatibleAdapter(config as OpenAICompatibleConfig);
      default:
        throw new Error(`不支持的适配器类型: ${type}`);
    }
  }

  /**
   * 获取或创建适配器（带缓存）
   * @param key 缓存键
   * @param type 适配器类型
   * @param config 适配器配置
   */
  static getOrCreateAdapter(
    key: string,
    type: AdapterType,
    config: AnyAdapterConfig
  ): BaseAdapter {
    if (!this.adapters.has(key)) {
      const adapter = this.createAdapter(type, config);
      this.adapters.set(key, adapter);
    }
    return this.adapters.get(key)!;
  }

  /**
   * 移除适配器
   */
  static removeAdapter(key: string): void {
    const adapter = this.adapters.get(key);
    if (adapter) {
      // 如果适配器有清理方法，调用它
      if ('destroy' in adapter && typeof adapter.destroy === 'function') {
        (adapter as any).destroy();
      }
      this.adapters.delete(key);
    }
  }

  /**
   * 清空所有适配器
   */
  static clearAll(): void {
    this.adapters.forEach((adapter) => {
      if ('destroy' in adapter && typeof adapter.destroy === 'function') {
        (adapter as any).destroy();
      }
    });
    this.adapters.clear();
  }

  /**
   * 获取适配器数量
   */
  static getAdapterCount(): number {
    return this.adapters.size;
  }

  /**
   * 检查适配器是否存在
   */
  static hasAdapter(key: string): boolean {
    return this.adapters.has(key);
  }
}

/**
 * 从API配置创建适配器
 */
export function createAdapterFromAPIConfig(apiConfig: any): BaseAdapter {
  // 根据API配置的类型确定适配器类型
  let adapterType: AdapterType;
  let adapterConfig: AnyAdapterConfig;

  // 判断API类型
  if (
    apiConfig.type === 'openai' ||
    apiConfig.type === 'openrouter' ||
    apiConfig.type === 'openai-compatible' ||
    apiConfig.type === 'custom'
  ) {
    adapterType = AdapterType.OPENAI_COMPATIBLE;
    adapterConfig = {
      apiKey: apiConfig.apiKey,
      baseURL: apiConfig.baseURL || apiConfig.endpoint || getDefaultBaseURL(apiConfig.type),
      model: apiConfig.model || apiConfig.defaultModel,
      timeout: apiConfig.timeout || 60000,
      maxRetries: apiConfig.maxRetries || 3,
      rateLimitPerMinute: apiConfig.rateLimitPerMinute,
    };
  } else {
    throw new Error(`不支持的API类型: ${apiConfig.type}`);
  }

  return AdapterFactory.createAdapter(adapterType, adapterConfig);
}

/**
 * 获取默认的baseURL
 */
function getDefaultBaseURL(type: string): string {
  switch (type) {
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1';
    default:
      throw new Error(`无法确定${type}类型的默认baseURL`);
  }
}
