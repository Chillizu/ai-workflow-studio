/**
 * 基础适配器接口
 * 定义所有AI API适配器的通用接口
 */

/**
 * 图片生成请求参数
 */
export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  model?: string;
  referenceImage?: string;
  [key: string]: any;
}

/**
 * 图片生成响应
 */
export interface ImageGenerationResponse {
  imageUrl: string;
  seed?: number;
  metadata?: Record<string, any>;
}

/**
 * 适配器配置
 */
export interface AdapterConfig {
  apiKey?: string;
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
  model?: string;
  [key: string]: any;
}

/**
 * 适配器错误类型
 */
export enum AdapterErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 适配器错误
 */
export class AdapterError extends Error {
  constructor(
    public type: AdapterErrorType,
    message: string,
    public originalError?: any,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AdapterError';
  }
}

/**
 * 基础适配器抽象类
 */
export abstract class BaseAdapter {
  protected config: AdapterConfig;

  constructor(config: AdapterConfig) {
    this.config = {
      timeout: 60000, // 默认60秒超时
      maxRetries: 3, // 默认重试3次
      ...config,
    };
  }

  /**
   * 生成图片
   */
  abstract generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;

  /**
   * 测试连接
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * 获取可用模型列表
   */
  abstract getAvailableModels(): Promise<string[]>;

  /**
   * 处理错误，转换为统一的AdapterError
   */
  protected handleError(error: any): AdapterError {
    // 网络错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new AdapterError(
        AdapterErrorType.NETWORK_ERROR,
        `网络连接失败: ${error.message}`,
        error,
        true
      );
    }

    // 超时错误
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return new AdapterError(
        AdapterErrorType.TIMEOUT_ERROR,
        `请求超时: ${error.message}`,
        error,
        true
      );
    }

    // HTTP错误
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // 认证错误
      if (status === 401 || status === 403) {
        return new AdapterError(
          AdapterErrorType.AUTH_ERROR,
          `认证失败: ${data?.error?.message || '无效的API密钥'}`,
          error,
          false
        );
      }

      // 限流错误
      if (status === 429) {
        return new AdapterError(
          AdapterErrorType.RATE_LIMIT_ERROR,
          `请求过于频繁，请稍后重试`,
          error,
          true
        );
      }

      // 请求参数错误
      if (status === 400) {
        return new AdapterError(
          AdapterErrorType.INVALID_REQUEST,
          `请求参数错误: ${data?.error?.message || '未知错误'}`,
          error,
          false
        );
      }

      // 服务器错误
      if (status >= 500) {
        return new AdapterError(
          AdapterErrorType.API_ERROR,
          `API服务错误: ${data?.error?.message || '服务器内部错误'}`,
          error,
          true
        );
      }

      // 其他HTTP错误
      return new AdapterError(
        AdapterErrorType.API_ERROR,
        `API错误 (${status}): ${data?.error?.message || '未知错误'}`,
        error,
        false
      );
    }

    // 未知错误
    return new AdapterError(
      AdapterErrorType.UNKNOWN_ERROR,
      `未知错误: ${error.message}`,
      error,
      false
    );
  }

  /**
   * 验证配置
   */
  protected validateConfig(): void {
    if (!this.config.baseURL) {
      throw new Error('baseURL is required');
    }
  }
}
