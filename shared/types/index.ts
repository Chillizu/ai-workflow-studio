/**
 * 节点基础接口
 */
export interface BaseNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    inputs: NodeInput[];
    outputs: NodeOutput[];
    config: Record<string, any>;
  };
}

/**
 * 节点输入接口
 */
export interface NodeInput {
  id: string;
  name: string;
  type: 'text' | 'image' | 'number' | 'any';
  required: boolean;
}

/**
 * 节点输出接口
 */
export interface NodeOutput {
  id: string;
  name: string;
  type: 'text' | 'image' | 'number' | 'any';
}

/**
 * 边连接接口
 */
export interface Edge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

/**
 * 工作流接口
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: BaseNode[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 执行记录接口
 */
export interface ExecutionRecord {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  nodeResults: Record<string, any>;
  error?: string;
}

/**
 * API配置接口
 */
export interface APIConfig {
  id: string;
  name: string;
  type: 'openai' | 'stable-diffusion' | 'custom';
  apiKey?: string;
  endpoint?: string;
  config: Record<string, any>;
}
