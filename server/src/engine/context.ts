import { Workflow } from '../../../shared/types';
import { NodeStatus } from '../types';

/**
 * 执行上下文
 * 管理工作流执行过程中的状态和数据
 */
export class ExecutionContext {
  private nodeResults: Map<string, any> = new Map();
  private nodeStatus: Map<string, NodeStatus> = new Map();
  
  constructor(
    public readonly executionId: string,
    public readonly workflowId: string,
    public readonly workflow: Workflow
  ) {}
  
  /**
   * 设置节点结果
   */
  setNodeResult(nodeId: string, outputs: Record<string, any>) {
    this.nodeResults.set(nodeId, outputs);
  }
  
  /**
   * 获取节点结果
   */
  getNodeResult(nodeId: string): Record<string, any> | undefined {
    return this.nodeResults.get(nodeId);
  }
  
  /**
   * 设置节点状态
   */
  setNodeStatus(nodeId: string, status: NodeStatus) {
    this.nodeStatus.set(nodeId, status);
  }
  
  /**
   * 获取节点状态
   */
  getNodeStatus(nodeId: string): NodeStatus | undefined {
    return this.nodeStatus.get(nodeId);
  }
  
  /**
   * 获取节点输入
   * 从连接的边获取输入数据
   */
  getNodeInputs(nodeId: string): Record<string, any> {
    const node = this.workflow.nodes.find(n => n.id === nodeId);
    if (!node) return {};
    
    const inputs: Record<string, any> = {};
    
    // 从连接的边获取输入
    const incomingEdges = this.workflow.edges.filter(e => e.target === nodeId);
    
    for (const edge of incomingEdges) {
      const sourceResult = this.nodeResults.get(edge.source);
      if (sourceResult) {
        const value = sourceResult[edge.sourceHandle];
        inputs[edge.targetHandle] = value;
      }
    }
    
    return inputs;
  }
  
  /**
   * 获取所有结果
   */
  getAllResults(): Record<string, any> {
    return Object.fromEntries(this.nodeResults);
  }
  
  /**
   * 获取所有状态
   */
  getAllStatus(): Record<string, NodeStatus> {
    return Object.fromEntries(this.nodeStatus);
  }
}
