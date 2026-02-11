import { BaseNodeProcessor } from '../base';
import { NodeExecutionContext, NodeExecutionResult } from '../../types';
import { NODE_TYPES } from '../../../../shared/constants';
import { configService } from '../../services/configService';
import { createAdapterFromAPIConfig } from '../../adapters/factory';
import { AdapterError } from '../../adapters/base';

/**
 * AI图片生成处理器
 * 使用配置的API服务生成图片
 */
export class AIImageGenerationProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.AI_IMAGE_GENERATION;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs, config } = context;
    const prompt = inputs.prompt || '';
    const negativePrompt = inputs.negativePrompt || '';
    const referenceImage = inputs.referenceImage;
    
    // 验证输入
    if (!prompt || prompt.trim() === '') {
      return {
        outputs: {},
        error: '提示词不能为空',
      };
    }

    // 获取API配置
    const apiConfigId = config.apiConfigId;
    if (!apiConfigId) {
      return {
        outputs: {},
        error: '未配置API服务，请先在API设置中添加配置',
      };
    }

    try {
      // 加载API配置
      const apiConfig = await configService.getById(apiConfigId);
      if (!apiConfig) {
        return {
          outputs: {},
          error: `API配置不存在: ${apiConfigId}`,
        };
      }

      console.log(`🎨 开始生成图片，使用配置: ${apiConfig.name}`);
      console.log(`📝 提示词: ${prompt}`);

      // 创建适配器
      const adapter = createAdapterFromAPIConfig(apiConfig.toJSON());

      // 构建生成请求
      const request = {
        prompt,
        negativePrompt,
        referenceImage,
        model: config.model || apiConfig.defaultModel,
        width: config.width || 1024,
        height: config.height || 1024,
        steps: config.steps || 30,
        cfgScale: config.cfgScale || 7,
        seed: config.seed,
      };

      // 记录开始时间
      const startTime = Date.now();

      // 调用API生成图片
      const response = await adapter.generateImage(request);

      // 计算耗时
      const duration = Date.now() - startTime;

      console.log(`✅ 图片生成成功，耗时: ${duration}ms`);
      console.log(`🖼️ 图片URL: ${response.imageUrl}`);

      return {
        outputs: {
          image: response.imageUrl,
        },
        metadata: {
          prompt,
          negativePrompt,
          model: request.model,
          apiProvider: apiConfig.name,
          duration,
          seed: response.seed,
          ...response.metadata,
        },
      };
    } catch (error: any) {
      console.error('❌ 图片生成失败:', error);

      // 处理适配器错误
      if (error instanceof AdapterError) {
        return {
          outputs: {},
          error: `图片生成失败: ${error.message}`,
          metadata: {
            errorType: error.type,
            retryable: error.retryable,
          },
        };
      }

      // 处理其他错误
      return {
        outputs: {},
        error: `图片生成失败: ${error.message || '未知错误'}`,
      };
    }
  }
}
