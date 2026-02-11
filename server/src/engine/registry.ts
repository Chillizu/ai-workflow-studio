import { BaseNodeProcessor } from '../nodes/base';
import { TextInputProcessor, TextOutputProcessor, TextMergeProcessor, TextTemplateProcessor } from '../nodes/processors/text';
import { ImageInputProcessor, ImageOutputProcessor, ImageResizeProcessor } from '../nodes/processors/image';
import { AIImageGenerationProcessor } from '../nodes/processors/ai';

/**
 * 处理器注册表
 */
export class ProcessorRegistry {
  private processors: Map<string, BaseNodeProcessor> = new Map();
  
  /**
   * 注册处理器
   */
  register(processor: BaseNodeProcessor) {
    this.processors.set(processor.type, processor);
  }
  
  /**
   * 获取处理器
   */
  get(type: string): BaseNodeProcessor | undefined {
    return this.processors.get(type);
  }
  
  /**
   * 获取所有处理器
   */
  getAll(): BaseNodeProcessor[] {
    return Array.from(this.processors.values());
  }
}

/**
 * 创建并初始化处理器注册表
 */
export function createProcessorRegistry(): ProcessorRegistry {
  const registry = new ProcessorRegistry();
  
  // 注册文本处理器
  registry.register(new TextInputProcessor());
  registry.register(new TextOutputProcessor());
  registry.register(new TextMergeProcessor());
  registry.register(new TextTemplateProcessor());
  
  // 注册图片处理器
  registry.register(new ImageInputProcessor());
  registry.register(new ImageOutputProcessor());
  registry.register(new ImageResizeProcessor());
  
  // 注册AI处理器
  registry.register(new AIImageGenerationProcessor());
  
  return registry;
}
