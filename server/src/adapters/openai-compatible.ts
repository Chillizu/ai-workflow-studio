/**
 * OpenAI兼容API适配器
 * 支持OpenAI、OpenRouter、以及其他兼容OpenAI API格式的服务
 */

import axios, { AxiosInstance } from 'axios';
import {
  BaseAdapter,
  AdapterConfig,
  ImageGenerationRequest,
  ImageGenerationResponse,
  AdapterError,
  AdapterErrorType,
} from './base';
import { withRetry } from '../utils/retry';
import { RateLimiter } from '../utils/rateLimiter';

/**
 * OpenAI兼容适配器配置
 */
export interface OpenAICompatibleConfig extends AdapterConfig {
  apiKey?: string;
  baseURL: string;
  model?: string;
  organization?: string; // OpenAI组织ID（可选）
  rateLimitPerMinute?: number; // 每分钟请求限制
}

/**
 * OpenAI API图片生成请求格式
 */
interface OpenAIImageRequest {
  prompt: string;
  model?: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
  response_format?: 'url' | 'b64_json';
  user?: string;
}

/**
 * OpenAI API响应格式
 */
interface OpenAIImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

/**
 * OpenAI兼容适配器
 */
export class OpenAICompatibleAdapter extends BaseAdapter {
  private client: AxiosInstance;
  private rateLimiter?: RateLimiter;
  protected config: OpenAICompatibleConfig;

  constructor(config: OpenAICompatibleConfig) {
    super(config);
    this.config = config;
    this.validateConfig();

    // 创建axios实例
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        ...(this.config.organization && { 'OpenAI-Organization': this.config.organization }),
      },
    });

    // 设置请求限流
    if (this.config.rateLimitPerMinute) {
      this.rateLimiter = new RateLimiter({
        maxTokens: this.config.rateLimitPerMinute,
        refillRate: this.config.rateLimitPerMinute / 60, // 每秒补充的令牌数
      });
    }
  }

  /**
   * 生成图片
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // 等待限流器
    if (this.rateLimiter) {
      await this.rateLimiter.waitForToken(1, 30000); // 最多等待30秒
    }

    // 使用重试机制
    return withRetry(
      async () => {
        try {
          // 构建OpenAI格式的请求
          const openaiRequest = this.buildOpenAIRequest(request);

          // 发送请求
          const response = await this.client.post<OpenAIImageResponse>(
            '/images/generations',
            openaiRequest
          );

          // 解析响应
          return this.parseOpenAIResponse(response.data, request);
        } catch (error) {
          throw this.handleError(error);
        }
      },
      {
        maxRetries: this.config.maxRetries || 3,
        initialDelay: 1000,
        maxDelay: 30000,
      }
    );
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      // 尝试获取模型列表来测试连接
      await this.client.get('/models');
      return true;
    } catch (error) {
      const adapterError = this.handleError(error);
      console.error('连接测试失败:', adapterError.message);
      return false;
    }
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/models');
      const models = response.data.data || [];

      // 过滤出图片生成相关的模型
      return models
        .filter((model: any) => {
          const id = model.id.toLowerCase();
          return (
            id.includes('dall-e') ||
            id.includes('stable-diffusion') ||
            id.includes('midjourney') ||
            id.includes('imagen')
          );
        })
        .map((model: any) => model.id);
    } catch (error) {
      console.error('获取模型列表失败:', error);
      // 返回默认模型列表
      return this.getDefaultModels();
    }
  }

  /**
   * 获取默认模型列表
   */
  private getDefaultModels(): string[] {
    const baseURL = this.config.baseURL.toLowerCase();

    if (baseURL.includes('openai.com')) {
      return ['dall-e-2', 'dall-e-3'];
    } else if (baseURL.includes('openrouter.ai')) {
      return [
        'openai/dall-e-3',
        'openai/dall-e-2',
        'stability-ai/stable-diffusion-xl',
        'stability-ai/stable-diffusion-2-1',
      ];
    } else {
      // 自定义服务，返回配置中的模型或空数组
      return this.config.model ? [this.config.model] : [];
    }
  }

  /**
   * 构建OpenAI格式的请求
   */
  private buildOpenAIRequest(request: ImageGenerationRequest): OpenAIImageRequest {
    const openaiRequest: OpenAIImageRequest = {
      prompt: request.prompt,
      model: request.model || this.config.model || 'dall-e-3',
      n: 1,
      response_format: 'url',
    };

    // 设置图片尺寸
    if (request.width && request.height) {
      openaiRequest.size = `${request.width}x${request.height}`;
    } else {
      // 默认尺寸
      openaiRequest.size = '1024x1024';
    }

    // DALL-E 3特定参数
    if (openaiRequest.model?.includes('dall-e-3')) {
      openaiRequest.quality = 'standard'; // 或 'hd'
      openaiRequest.style = 'vivid'; // 或 'natural'
    }

    return openaiRequest;
  }

  /**
   * 解析OpenAI响应
   */
  private parseOpenAIResponse(
    response: OpenAIImageResponse,
    request: ImageGenerationRequest
  ): ImageGenerationResponse {
    if (!response.data || response.data.length === 0) {
      throw new AdapterError(
        AdapterErrorType.API_ERROR,
        'API返回了空的图片数据',
        null,
        false
      );
    }

    const imageData = response.data[0];
    const imageUrl = imageData.url || imageData.b64_json;

    if (!imageUrl) {
      throw new AdapterError(
        AdapterErrorType.API_ERROR,
        'API返回的图片数据格式错误',
        null,
        false
      );
    }

    return {
      imageUrl,
      metadata: {
        prompt: request.prompt,
        revisedPrompt: imageData.revised_prompt,
        model: request.model || this.config.model,
        created: response.created,
      },
    };
  }

  /**
   * 验证配置
   */
  protected validateConfig(): void {
    super.validateConfig();

    // OpenAI和OpenRouter需要API密钥
    const baseURL = this.config.baseURL.toLowerCase();
    if (
      (baseURL.includes('openai.com') || baseURL.includes('openrouter.ai')) &&
      !this.config.apiKey
    ) {
      throw new Error('OpenAI/OpenRouter requires an API key');
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.rateLimiter) {
      this.rateLimiter.stop();
    }
  }
}
