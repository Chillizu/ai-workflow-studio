import { BaseNodeProcessor } from '../base';
import { NodeExecutionContext, NodeExecutionResult } from '../../types';
import { NODE_TYPES } from '../../../../shared/constants';

/**
 * AI图片生成处理器（占位实现）
 * 实际的AI API调用将在阶段4实现
 */
export class AIImageGenerationProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.AI_IMAGE_GENERATION;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs, config } = context;
    const prompt = inputs.prompt || '';
    const negativePrompt = inputs.negativePrompt || '';
    const referenceImage = inputs.referenceImage;
    
    // 占位实现：返回一个模拟的图片URL
    // 实际实现将在阶段4中调用真实的AI API
    const mockImageUrl = `/uploads/mock/ai_generated_${Date.now()}.png`;
    
    console.log('AI生图请求（占位）:', {
      prompt,
      negativePrompt,
      referenceImage,
      apiProvider: config.apiProvider,
      model: config.model
    });
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      outputs: {
        image: mockImageUrl
      },
      metadata: {
        prompt,
        model: config.model,
        cost: 0,
        duration: 1000,
        note: '这是占位实现，实际AI调用将在阶段4实现'
      }
    };
  }
}
