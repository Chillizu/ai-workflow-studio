import { BaseNodeProcessor } from '../base';
import { NodeExecutionContext, NodeExecutionResult } from '../../types';
import { NODE_TYPES } from '../../../../shared/constants';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * 图片输入处理器
 */
export class ImageInputProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.IMAGE_INPUT;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config } = context;
    const source = config.source || 'upload';
    
    let imageUrl: string;
    
    if (source === 'url') {
      imageUrl = config.url || '';
    } else {
      // 上传的文件
      imageUrl = config.file || '';
    }
    
    return {
      outputs: {
        image: imageUrl
      }
    };
  }
}

/**
 * 图片输出处理器
 */
export class ImageOutputProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.IMAGE_OUTPUT;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs } = context;
    const image = inputs.image || '';
    
    return {
      outputs: {
        result: image
      }
    };
  }
}

/**
 * 图片调整处理器
 */
export class ImageResizeProcessor extends BaseNodeProcessor {
  type = NODE_TYPES.IMAGE_RESIZE;
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs, config, executionId } = context;
    const imageUrl = inputs.image;
    const width = config.width || 512;
    const height = config.height || 512;
    const fit = config.fit || 'cover';
    
    if (!imageUrl) {
      throw new Error('缺少图片输入');
    }
    
    try {
      // 读取图片
      const imagePath = path.join(process.cwd(), 'server', imageUrl);
      const imageBuffer = await fs.readFile(imagePath);
      
      // 调整大小
      const resizedBuffer = await sharp(imageBuffer)
        .resize(width, height, { fit: fit as any })
        .toBuffer();
      
      // 保存调整后的图片
      const outputDir = path.join(process.cwd(), 'server', 'uploads', executionId);
      await fs.mkdir(outputDir, { recursive: true });
      
      const outputFilename = `resized_${Date.now()}.png`;
      const outputPath = path.join(outputDir, outputFilename);
      await fs.writeFile(outputPath, resizedBuffer);
      
      const outputUrl = `/uploads/${executionId}/${outputFilename}`;
      
      return {
        outputs: {
          result: outputUrl
        }
      };
    } catch (error: any) {
      throw new Error(`图片处理失败: ${error.message}`);
    }
  }
}
