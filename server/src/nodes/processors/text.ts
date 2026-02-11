import { BaseNodeProcessor } from '../base';
import { NodeExecutionContext, NodeExecutionResult } from '../../types';
import { NODE_TYPES } from '../../../../shared/constants';

/**
 * 文本输入处理器
 */
export class TextInputProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.TEXT_INPUT;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config } = context;
    const value = config.value || '';
    
    return {
      outputs: {
        text: value
      }
    };
  }
}

/**
 * 文本输出处理器
 */
export class TextOutputProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.TEXT_OUTPUT;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs } = context;
    const text = inputs.text || '';
    
    return {
      outputs: {
        result: text
      }
    };
  }
}

/**
 * 文本合并处理器
 */
export class TextMergeProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.TEXT_MERGE;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs, config } = context;
    const separator = config.separator || ' ';
    const template = config.template;
    
    // 获取所有文本输入
    const texts: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const key = `text${i}`;
      if (inputs[key] !== undefined) {
        texts.push(String(inputs[key]));
      }
    }
    
    let result: string;
    
    if (template) {
      // 使用模板
      result = template;
      texts.forEach((text, index) => {
        result = result.replace(new RegExp(`\\{text${index + 1}\\}`, 'g'), text);
      });
      result = result.replace(/\{separator\}/g, separator);
    } else {
      // 简单合并
      result = texts.join(separator);
    }
    
    return {
      outputs: {
        result
      }
    };
  }
}

/**
 * 文本模板处理器
 */
export class TextTemplateProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.TEXT_TEMPLATE;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs, config } = context;
    const template = config.template || '';
    
    let result = template;
    
    // 替换所有变量
    Object.entries(inputs).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    });
    
    return {
      outputs: {
        result
      }
    };
  }
}
