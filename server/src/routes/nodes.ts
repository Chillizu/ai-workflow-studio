import { Router, Request, Response } from 'express';
import { NODE_TYPES } from '../../../shared/constants';

const router = Router();

/**
 * 节点类型定义
 */
const nodeTypeDefinitions = {
  [NODE_TYPES.TEXT_INPUT]: {
    type: NODE_TYPES.TEXT_INPUT,
    category: 'input',
    label: '文本输入',
    description: '输入文本内容',
    icon: 'Type',
    color: '#3b82f6',
    inputs: [],
    outputs: [{ id: 'text', name: '文本', type: 'text' }],
    configSchema: [
      { key: 'value', label: '文本内容', type: 'textarea', defaultValue: '' }
    ]
  },
  [NODE_TYPES.IMAGE_INPUT]: {
    type: NODE_TYPES.IMAGE_INPUT,
    category: 'input',
    label: '图片输入',
    description: '上传或输入图片URL',
    icon: 'Image',
    color: '#8b5cf6',
    inputs: [],
    outputs: [{ id: 'image', name: '图片', type: 'image' }],
    configSchema: [
      { key: 'source', label: '图片来源', type: 'select', defaultValue: 'upload', options: [
        { label: '上传文件', value: 'upload' },
        { label: 'URL地址', value: 'url' }
      ]},
      { key: 'url', label: '图片URL', type: 'text', defaultValue: '' },
      { key: 'file', label: '上传图片', type: 'file', defaultValue: null }
    ]
  },
  [NODE_TYPES.TEXT_OUTPUT]: {
    type: NODE_TYPES.TEXT_OUTPUT,
    category: 'output',
    label: '文本输出',
    description: '显示文本内容',
    icon: 'FileText',
    color: '#f59e0b',
    inputs: [{ id: 'text', name: '文本', type: 'text', required: true }],
    outputs: [],
    configSchema: []
  },
  [NODE_TYPES.IMAGE_OUTPUT]: {
    type: NODE_TYPES.IMAGE_OUTPUT,
    category: 'output',
    label: '图片输出',
    description: '显示和下载图片',
    icon: 'ImageIcon',
    color: '#ec4899',
    inputs: [{ id: 'image', name: '图片', type: 'image', required: true }],
    outputs: [],
    configSchema: [
      { key: 'downloadable', label: '允许下载', type: 'boolean', defaultValue: true },
      { key: 'filename', label: '文件名', type: 'text', defaultValue: 'output.png' }
    ]
  },
  [NODE_TYPES.TEXT_MERGE]: {
    type: NODE_TYPES.TEXT_MERGE,
    category: 'process',
    label: '文本合并',
    description: '合并多个文本',
    icon: 'Merge',
    color: '#06b6d4',
    inputs: [
      { id: 'text1', name: '文本1', type: 'text', required: true },
      { id: 'text2', name: '文本2', type: 'text', required: true },
      { id: 'text3', name: '文本3', type: 'text', required: false }
    ],
    outputs: [{ id: 'result', name: '结果', type: 'text' }],
    configSchema: [
      { key: 'separator', label: '分隔符', type: 'text', defaultValue: ' ' }
    ]
  },
  [NODE_TYPES.TEXT_TEMPLATE]: {
    type: NODE_TYPES.TEXT_TEMPLATE,
    category: 'process',
    label: '文本模板',
    description: '使用模板生成文本',
    icon: 'FileCode',
    color: '#14b8a6',
    inputs: [
      { id: 'var1', name: '变量1', type: 'any', required: false },
      { id: 'var2', name: '变量2', type: 'any', required: false }
    ],
    outputs: [{ id: 'result', name: '结果', type: 'text' }],
    configSchema: [
      { key: 'template', label: '模板内容', type: 'textarea', defaultValue: 'Hello {var1}!' }
    ]
  },
  [NODE_TYPES.IMAGE_RESIZE]: {
    type: NODE_TYPES.IMAGE_RESIZE,
    category: 'process',
    label: '图片调整',
    description: '调整图片大小',
    icon: 'Maximize',
    color: '#a855f7',
    inputs: [{ id: 'image', name: '图片', type: 'image', required: true }],
    outputs: [{ id: 'result', name: '结果', type: 'image' }],
    configSchema: [
      { key: 'width', label: '宽度', type: 'number', defaultValue: 512 },
      { key: 'height', label: '高度', type: 'number', defaultValue: 512 },
      { key: 'fit', label: '适应方式', type: 'select', defaultValue: 'cover', options: [
        { label: '覆盖', value: 'cover' },
        { label: '包含', value: 'contain' },
        { label: '填充', value: 'fill' }
      ]}
    ]
  },
  [NODE_TYPES.AI_IMAGE_GENERATION]: {
    type: NODE_TYPES.AI_IMAGE_GENERATION,
    category: 'ai',
    label: 'AI生图',
    description: '使用AI生成图片',
    icon: 'Sparkles',
    color: '#ef4444',
    inputs: [
      { id: 'prompt', name: '提示词', type: 'text', required: true },
      { id: 'negativePrompt', name: '负面提示词', type: 'text', required: false }
    ],
    outputs: [{ id: 'image', name: '生成图片', type: 'image' }],
    configSchema: [
      { key: 'apiProvider', label: 'API提供商', type: 'select', defaultValue: 'openai', options: [
        { label: 'OpenAI DALL-E', value: 'openai' },
        { label: 'Stable Diffusion', value: 'stable-diffusion' }
      ]},
      { key: 'model', label: '模型', type: 'select', defaultValue: 'dall-e-3', options: [
        { label: 'DALL-E 3', value: 'dall-e-3' },
        { label: 'DALL-E 2', value: 'dall-e-2' }
      ]}
    ]
  }
};

/**
 * 获取所有节点类型
 */
router.get('/types', (_req: Request, res: Response) => {
  return res.json(Object.values(nodeTypeDefinitions));
});

/**
 * 获取单个节点类型
 */
router.get('/types/:type', (req: Request, res: Response) => {
  const nodeType = nodeTypeDefinitions[req.params.type as keyof typeof nodeTypeDefinitions];
  
  if (!nodeType) {
    return res.status(404).json({ error: '节点类型不存在' });
  }
  
  return res.json(nodeType);
});

export default router;
