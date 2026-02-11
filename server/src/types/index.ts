/**
 * 节点执行上下文
 */
export interface NodeExecutionContext {
  nodeId: string;
  inputs: Record<string, any>;
  config: Record<string, any>;
  workflowId: string;
  executionId: string;
}

/**
 * 节点执行结果
 */
export interface NodeExecutionResult {
  outputs: Record<string, any>;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * 节点状态
 */
export type NodeStatus = 'pending' | 'running' | 'success' | 'error';

/**
 * 验证错误
 */
export interface ValidationError {
  type: 'missing_input' | 'invalid_connection' | 'circular_dependency' | 'invalid_config';
  nodeId: string;
  message: string;
}

/**
 * 执行结果
 */
export interface ExecutionResult {
  executionId: string;
  status: 'completed' | 'failed' | 'cancelled';
  results?: Record<string, any>;
  errors?: string[];
}

/**
 * 节点数据类型
 */
export type NodeDataType = 'text' | 'image' | 'number' | 'boolean' | 'any';
