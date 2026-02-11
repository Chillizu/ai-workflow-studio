# 节点系统详细设计

## 1. 节点类型定义

### 1.1 节点基础接口

```typescript
// shared/types/node.ts

export type NodeDataType = 'text' | 'image' | 'number' | 'boolean' | 'any';

export interface NodePort {
  id: string;
  name: string;
  type: NodeDataType;
  required?: boolean;
}

export interface BaseNodeData {
  label: string;
  description?: string;
  inputs: NodePort[];
  outputs: NodePort[];
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  error?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: BaseNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}
```

### 1.2 节点配置接口

```typescript
export interface NodeTypeDefinition {
  type: string;
  category: 'input' | 'output' | 'process' | 'ai' | 'logic';
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultData: BaseNodeData;
  configSchema: ConfigSchema[];
}

export interface ConfigSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'file' | 'boolean';
  defaultValue: any;
  options?: { label: string; value: any }[];
  required?: boolean;
  placeholder?: string;
  description?: string;
}
```

## 2. 节点类型清单

### 2.1 输入节点 (Input Nodes)

#### TextInputNode - 文本输入节点
```typescript
{
  type: 'textInput',
  category: 'input',
  label: '文本输入',
  description: '输入文本内容',
  icon: 'Type',
  color: '#3b82f6',
  defaultData: {
    label: '文本输入',
    inputs: [],
    outputs: [
      { id: 'text', name: '文本', type: 'text' }
    ],
    config: {
      value: '',
      multiline: false
    }
  },
  configSchema: [
    {
      key: 'value',
      label: '文本内容',
      type: 'textarea',
      defaultValue: '',
      placeholder: '输入文本...'
    },
    {
      key: 'multiline',
      label: '多行输入',
      type: 'boolean',
      defaultValue: false
    }
  ]
}
```

#### ImageInputNode - 图片输入节点
```typescript
{
  type: 'imageInput',
  category: 'input',
  label: '图片输入',
  description: '上传或输入图片URL',
  icon: 'Image',
  color: '#8b5cf6',
  defaultData: {
    label: '图片输入',
    inputs: [],
    outputs: [
      { id: 'image', name: '图片', type: 'image' }
    ],
    config: {
      source: 'upload', // 'upload' | 'url'
      url: '',
      file: null
    }
  },
  configSchema: [
    {
      key: 'source',
      label: '图片来源',
      type: 'select',
      defaultValue: 'upload',
      options: [
        { label: '上传文件', value: 'upload' },
        { label: 'URL地址', value: 'url' }
      ]
    },
    {
      key: 'url',
      label: '图片URL',
      type: 'text',
      defaultValue: '',
      placeholder: 'https://...'
    },
    {
      key: 'file',
      label: '上传图片',
      type: 'file',
      defaultValue: null
    }
  ]
}
```

#### NumberInputNode - 数字输入节点
```typescript
{
  type: 'numberInput',
  category: 'input',
  label: '数字输入',
  description: '输入数字值',
  icon: 'Hash',
  color: '#10b981',
  defaultData: {
    label: '数字输入',
    inputs: [],
    outputs: [
      { id: 'number', name: '数字', type: 'number' }
    ],
    config: {
      value: 0,
      min: undefined,
      max: undefined,
      step: 1
    }
  },
  configSchema: [
    {
      key: 'value',
      label: '数值',
      type: 'number',
      defaultValue: 0
    },
    {
      key: 'min',
      label: '最小值',
      type: 'number',
      defaultValue: undefined
    },
    {
      key: 'max',
      label: '最大值',
      type: 'number',
      defaultValue: undefined
    },
    {
      key: 'step',
      label: '步长',
      type: 'number',
      defaultValue: 1
    }
  ]
}
```

### 2.2 输出节点 (Output Nodes)

#### TextOutputNode - 文本输出节点
```typescript
{
  type: 'textOutput',
  category: 'output',
  label: '文本输出',
  description: '显示文本内容',
  icon: 'FileText',
  color: '#f59e0b',
  defaultData: {
    label: '文本输出',
    inputs: [
      { id: 'text', name: '文本', type: 'text', required: true }
    ],
    outputs: [],
    config: {
      displayMode: 'preview' // 'preview' | 'raw'
    }
  },
  configSchema: [
    {
      key: 'displayMode',
      label: '显示模式',
      type: 'select',
      defaultValue: 'preview',
      options: [
        { label: '预览', value: 'preview' },
        { label: '原始文本', value: 'raw' }
      ]
    }
  ]
}
```

#### ImageOutputNode - 图片输出节点
```typescript
{
  type: 'imageOutput',
  category: 'output',
  label: '图片输出',
  description: '显示和下载图片',
  icon: 'ImageIcon',
  color: '#ec4899',
  defaultData: {
    label: '图片输出',
    inputs: [
      { id: 'image', name: '图片', type: 'image', required: true }
    ],
    outputs: [],
    config: {
      downloadable: true,
      filename: 'output.png'
    }
  },
  configSchema: [
    {
      key: 'downloadable',
      label: '允许下载',
      type: 'boolean',
      defaultValue: true
    },
    {
      key: 'filename',
      label: '文件名',
      type: 'text',
      defaultValue: 'output.png',
      placeholder: 'output.png'
    }
  ]
}
```

### 2.3 处理节点 (Process Nodes)

#### TextMergeNode - 文本合并节点
```typescript
{
  type: 'textMerge',
  category: 'process',
  label: '文本合并',
  description: '合并多个文本',
  icon: 'Merge',
  color: '#06b6d4',
  defaultData: {
    label: '文本合并',
    inputs: [
      { id: 'text1', name: '文本1', type: 'text', required: true },
      { id: 'text2', name: '文本2', type: 'text', required: true },
      { id: 'text3', name: '文本3', type: 'text', required: false }
    ],
    outputs: [
      { id: 'result', name: '结果', type: 'text' }
    ],
    config: {
      separator: ' ',
      template: '{text1}{separator}{text2}{separator}{text3}'
    }
  },
  configSchema: [
    {
      key: 'separator',
      label: '分隔符',
      type: 'text',
      defaultValue: ' ',
      placeholder: '空格'
    },
    {
      key: 'template',
      label: '模板',
      type: 'textarea',
      defaultValue: '{text1}{separator}{text2}{separator}{text3}',
      description: '使用{text1}, {text2}等占位符'
    }
  ]
}
```

#### TextTemplateNode - 文本模板节点
```typescript
{
  type: 'textTemplate',
  category: 'process',
  label: '文本模板',
  description: '使用模板生成文本',
  icon: 'FileCode',
  color: '#14b8a6',
  defaultData: {
    label: '文本模板',
    inputs: [
      { id: 'var1', name: '变量1', type: 'any', required: false },
      { id: 'var2', name: '变量2', type: 'any', required: false }
    ],
    outputs: [
      { id: 'result', name: '结果', type: 'text' }
    ],
    config: {
      template: 'Hello {var1}, welcome to {var2}!'
    }
  },
  configSchema: [
    {
      key: 'template',
      label: '模板内容',
      type: 'textarea',
      defaultValue: 'Hello {var1}, welcome to {var2}!',
      placeholder: '使用{var1}, {var2}等占位符',
      description: '支持变量替换'
    }
  ]
}
```

#### ImageResizeNode - 图片调整节点
```typescript
{
  type: 'imageResize',
  category: 'process',
  label: '图片调整',
  description: '调整图片大小',
  icon: 'Maximize',
  color: '#a855f7',
  defaultData: {
    label: '图片调整',
    inputs: [
      { id: 'image', name: '图片', type: 'image', required: true }
    ],
    outputs: [
      { id: 'result', name: '结果', type: 'image' }
    ],
    config: {
      width: 512,
      height: 512,
      fit: 'cover' // 'cover' | 'contain' | 'fill'
    }
  },
  configSchema: [
    {
      key: 'width',
      label: '宽度',
      type: 'number',
      defaultValue: 512
    },
    {
      key: 'height',
      label: '高度',
      type: 'number',
      defaultValue: 512
    },
    {
      key: 'fit',
      label: '适应方式',
      type: 'select',
      defaultValue: 'cover',
      options: [
        { label: '覆盖', value: 'cover' },
        { label: '包含', value: 'contain' },
        { label: '填充', value: 'fill' }
      ]
    }
  ]
}
```

### 2.4 AI节点 (AI Nodes)

#### AIImageGenerationNode - AI生图节点
```typescript
{
  type: 'aiImageGeneration',
  category: 'ai',
  label: 'AI生图',
  description: '使用AI生成图片',
  icon: 'Sparkles',
  color: '#ef4444',
  defaultData: {
    label: 'AI生图',
    inputs: [
      { id: 'prompt', name: '提示词', type: 'text', required: true },
      { id: 'negativePrompt', name: '负面提示词', type: 'text', required: false },
      { id: 'referenceImage', name: '参考图片', type: 'image', required: false }
    ],
    outputs: [
      { id: 'image', name: '生成图片', type: 'image' }
    ],
    config: {
      apiProvider: 'openai', // 'openai' | 'stable-diffusion' | 'custom'
      apiConfigId: '',
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
      // Stable Diffusion specific
      steps: 30,
      cfgScale: 7,
      sampler: 'Euler a',
      seed: -1
    }
  },
  configSchema: [
    {
      key: 'apiProvider',
      label: 'API提供商',
      type: 'select',
      defaultValue: 'openai',
      options: [
        { label: 'OpenAI DALL-E', value: 'openai' },
        { label: 'Stable Diffusion', value: 'stable-diffusion' },
        { label: '自定义API', value: 'custom' }
      ]
    },
    {
      key: 'apiConfigId',
      label: 'API配置',
      type: 'select',
      defaultValue: '',
      options: [] // 动态加载
    },
    {
      key: 'model',
      label: '模型',
      type: 'select',
      defaultValue: 'dall-e-3',
      options: [
        { label: 'DALL-E 3', value: 'dall-e-3' },
        { label: 'DALL-E 2', value: 'dall-e-2' }
      ]
    },
    {
      key: 'size',
      label: '图片尺寸',
      type: 'select',
      defaultValue: '1024x1024',
      options: [
        { label: '1024x1024', value: '1024x1024' },
        { label: '1024x1792', value: '1024x1792' },
        { label: '1792x1024', value: '1792x1024' }
      ]
    },
    {
      key: 'quality',
      label: '质量',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准', value: 'standard' },
        { label: '高清', value: 'hd' }
      ]
    },
    {
      key: 'style',
      label: '风格',
      type: 'select',
      defaultValue: 'vivid',
      options: [
        { label: '生动', value: 'vivid' },
        { label: '自然', value: 'natural' }
      ]
    }
  ]
}
```

### 2.5 逻辑节点 (Logic Nodes) - 可选高级功能

#### ConditionalNode - 条件节点
```typescript
{
  type: 'conditional',
  category: 'logic',
  label: '条件判断',
  description: '根据条件选择输出',
  icon: 'GitBranch',
  color: '#64748b',
  defaultData: {
    label: '条件判断',
    inputs: [
      { id: 'condition', name: '条件', type: 'boolean', required: true },
      { id: 'trueValue', name: '真值', type: 'any', required: true },
      { id: 'falseValue', name: '假值', type: 'any', required: true }
    ],
    outputs: [
      { id: 'result', name: '结果', type: 'any' }
    ],
    config: {}
  },
  configSchema: []
}
```

## 3. 节点处理器实现

### 3.1 后端节点处理器接口

```typescript
// server/src/nodes/base.ts

export interface NodeExecutionContext {
  nodeId: string;
  inputs: Record<string, any>;
  config: Record<string, any>;
  workflowId: string;
  executionId: string;
}

export interface NodeExecutionResult {
  outputs: Record<string, any>;
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class BaseNodeProcessor {
  abstract type: string;
  
  abstract execute(
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult>;
  
  validate(context: NodeExecutionContext): boolean {
    // 基础验证逻辑
    return true;
  }
}
```

### 3.2 示例处理器实现

```typescript
// server/src/nodes/processors/textMerge.ts

export class TextMergeProcessor extends BaseNodeProcessor {
  type = 'textMerge';
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs, config } = context;
    const { separator = ' ', template } = config;
    
    // 获取所有文本输入
    const texts = Object.entries(inputs)
      .filter(([key]) => key.startsWith('text'))
      .map(([, value]) => value || '');
    
    let result: string;
    
    if (template) {
      // 使用模板
      result = template;
      texts.forEach((text, index) => {
        result = result.replace(
          new RegExp(`\\{text${index + 1}\\}`, 'g'),
          text
        );
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
```

```typescript
// server/src/nodes/processors/aiImageGeneration.ts

export class AIImageGenerationProcessor extends BaseNodeProcessor {
  type = 'aiImageGeneration';
  
  constructor(private apiAdapterFactory: APIAdapterFactory) {
    super();
  }
  
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { inputs, config } = context;
    const { prompt, negativePrompt, referenceImage } = inputs;
    const { apiProvider, apiConfigId, ...apiParams } = config;
    
    // 获取API适配器
    const adapter = await this.apiAdapterFactory.getAdapter(
      apiProvider,
      apiConfigId
    );
    
    // 调用AI API生成图片
    const result = await adapter.generateImage({
      prompt,
      negativePrompt,
      referenceImage,
      ...apiParams
    });
    
    return {
      outputs: {
        image: result.imageUrl
      },
      metadata: {
        cost: result.cost,
        duration: result.duration
      }
    };
  }
}
```

## 4. 前端节点组件

### 4.1 节点组件结构

```typescript
// client/src/nodes/components/BaseNode.tsx

interface BaseNodeProps {
  id: string;
  data: BaseNodeData;
  selected: boolean;
}

export const BaseNode: React.FC<BaseNodeProps> = ({ id, data, selected }) => {
  return (
    <div className={`node ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <span className="node-icon">{/* icon */}</span>
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-body">
        {/* 输入端口 */}
        {data.inputs.map(input => (
          <Handle
            key={input.id}
            type="target"
            position={Position.Left}
            id={input.id}
          />
        ))}
        
        {/* 节点内容 */}
        <div className="node-content">
          {/* 根据节点类型显示不同内容 */}
        </div>
        
        {/* 输出端口 */}
        {data.outputs.map(output => (
          <Handle
            key={output.id}
            type="source"
            position={Position.Right}
            id={output.id}
          />
        ))}
      </div>
      
      {/* 状态指示器 */}
      {data.status && (
        <div className={`node-status ${data.status}`}>
          {/* 状态图标 */}
        </div>
      )}
    </div>
  );
};
```

### 4.2 节点注册系统

```typescript
// client/src/nodes/registry.ts

export class NodeRegistry {
  private static nodeTypes: Map<string, NodeTypeDefinition> = new Map();
  
  static register(definition: NodeTypeDefinition) {
    this.nodeTypes.set(definition.type, definition);
  }
  
  static get(type: string): NodeTypeDefinition | undefined {
    return this.nodeTypes.get(type);
  }
  
  static getAll(): NodeTypeDefinition[] {
    return Array.from(this.nodeTypes.values());
  }
  
  static getByCategory(category: string): NodeTypeDefinition[] {
    return this.getAll().filter(node => node.category === category);
  }
}

// 注册所有节点类型
NodeRegistry.register(textInputNodeDefinition);
NodeRegistry.register(imageInputNodeDefinition);
NodeRegistry.register(textOutputNodeDefinition);
// ... 其他节点
```

## 5. 节点扩展机制

### 5.1 自定义节点接口

```typescript
export interface CustomNodeDefinition extends NodeTypeDefinition {
  // 前端组件
  component?: React.ComponentType<any>;
  
  // 后端处理器
  processor?: typeof BaseNodeProcessor;
  
  // 验证函数
  validator?: (data: BaseNodeData) => boolean;
}
```

### 5.2 插件系统 (未来扩展)

```typescript
export interface NodePlugin {
  name: string;
  version: string;
  nodes: CustomNodeDefinition[];
  
  install(): void;
  uninstall(): void;
}
```

---
**最后更新**: 2026-02-11
