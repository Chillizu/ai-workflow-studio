import { EventEmitter } from 'events';
import { ExecutionContext } from './context';
import { ProcessorRegistry } from './registry';
import { NodeExecutionContext, NodeStatus } from '../types';

/**
 * 节点执行器
 * 负责执行单个节点
 */
export class NodeExecutor {
  constructor(
    private processorRegistry: ProcessorRegistry,
    private eventEmitter: EventEmitter
  ) {}
  
  /**
   * 执行节点
   */
  async execute(nodeId: string, context: ExecutionContext): Promise<void> {
    const node = context.workflow.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`节点不存在: ${nodeId}`);
    }
    
    try {
      // 更新状态为运行中
      context.setNodeStatus(nodeId, 'running');
      this.emitProgress(context, nodeId, 'running');
      
      // 获取节点处理器
      const processor = this.processorRegistry.get(node.type);
      if (!processor) {
        throw new Error(`未找到节点处理器: ${node.type}`);
      }
      
      // 获取输入
      const inputs = context.getNodeInputs(nodeId);
      
      // 执行节点
      const executionContext: NodeExecutionContext = {
        nodeId,
        inputs,
        config: node.data.config,
        workflowId: context.workflowId,
        executionId: context.executionId
      };
      
      const result = await processor.execute(executionContext);
      
      // 保存结果
      context.setNodeResult(nodeId, result.outputs);
      context.setNodeStatus(nodeId, 'success');
      this.emitProgress(context, nodeId, 'success', result.outputs);
      
    } catch (error: any) {
      // 错误处理
      context.setNodeStatus(nodeId, 'error');
      this.emitProgress(context, nodeId, 'error', undefined, error.message);
      throw error;
    }
  }
  
  /**
   * 发送进度事件
   */
  private emitProgress(
    context: ExecutionContext,
    nodeId: string,
    status: NodeStatus,
    outputs?: any,
    error?: string
  ) {
    this.eventEmitter.emit('node:progress', {
      executionId: context.executionId,
      nodeId,
      status,
      outputs,
      error
    });
  }
}
