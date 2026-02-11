import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { Workflow, BaseNode, Edge } from '../../../shared/types';
import { ExecutionResult } from '../types';
import { WorkflowValidator } from './validator';
import { ExecutionContext } from './context';
import { NodeExecutor } from './executor';
import { ProcessorRegistry } from './registry';

/**
 * 工作流执行引擎
 * 协调整个工作流的执行流程
 * 支持并行执行无依赖关系的节点
 */
export class WorkflowEngine {
  private validator: WorkflowValidator;
  private executor: NodeExecutor;
  private eventEmitter: EventEmitter;
  
  constructor(
    processorRegistry: ProcessorRegistry,
    eventEmitter: EventEmitter
  ) {
    this.validator = new WorkflowValidator(processorRegistry);
    this.executor = new NodeExecutor(processorRegistry, eventEmitter);
    this.eventEmitter = eventEmitter;
  }
  
  /**
   * 将节点分组为执行层级（同一层级的节点可以并行执行）
   */
  private groupNodesByLevel(nodes: BaseNode[], edges: Edge[]): string[][] {
    const levels: string[][] = [];
    const inDegree = new Map<string, number>();
    const dependencies = new Map<string, Set<string>>();
    
    // 初始化入度和依赖关系
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      dependencies.set(node.id, new Set());
    });
    
    // 计算入度
    edges.forEach(edge => {
      const current = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, current + 1);
      dependencies.get(edge.target)?.add(edge.source);
    });
    
    // 使用BFS分层
    const processed = new Set<string>();
    
    while (processed.size < nodes.length) {
      const currentLevel: string[] = [];
      
      // 找出所有入度为0的节点（当前层级）
      for (const [nodeId, degree] of inDegree.entries()) {
        if (degree === 0 && !processed.has(nodeId)) {
          currentLevel.push(nodeId);
        }
      }
      
      if (currentLevel.length === 0) {
        // 如果没有找到入度为0的节点，说明有循环依赖
        break;
      }
      
      levels.push(currentLevel);
      
      // 标记为已处理，并减少依赖节点的入度
      currentLevel.forEach(nodeId => {
        processed.add(nodeId);
        inDegree.set(nodeId, -1); // 标记为已处理
        
        // 减少所有依赖此节点的节点的入度
        edges.forEach(edge => {
          if (edge.source === nodeId) {
            const targetDegree = inDegree.get(edge.target) || 0;
            inDegree.set(edge.target, targetDegree - 1);
          }
        });
      });
    }
    
    return levels;
  }
  
  /**
   * 执行工作流（支持并行执行）
   */
  async execute(workflow: Workflow): Promise<ExecutionResult> {
    const executionId = uuid();
    
    try {
      // 1. 验证工作流
      const errors = this.validator.validate(workflow);
      if (errors.length > 0) {
        return {
          executionId,
          status: 'failed',
          errors: errors.map(e => e.message)
        };
      }
      
      // 2. 将节点分组为执行层级
      const levels = this.groupNodesByLevel(workflow.nodes, workflow.edges);
      const totalNodes = workflow.nodes.length;
      
      // 3. 创建执行上下文
      const context = new ExecutionContext(
        executionId,
        workflow.id,
        workflow
      );
      
      // 4. 发送开始事件
      this.eventEmitter.emit('execution:started', {
        executionId,
        workflowId: workflow.id,
        totalNodes
      });
      
      // 5. 按层级并行执行节点
      let completedNodes = 0;
      
      for (const level of levels) {
        // 并行执行同一层级的所有节点
        await Promise.all(
          level.map(nodeId => this.executor.execute(nodeId, context))
        );
        
        completedNodes += level.length;
        
        // 发送进度更新
        this.eventEmitter.emit('execution:progress', {
          executionId,
          progress: (completedNodes / totalNodes) * 100,
          completedNodes,
          totalNodes
        });
      }
      
      // 6. 执行完成
      const results = context.getAllResults();
      
      this.eventEmitter.emit('execution:completed', {
        executionId,
        results
      });
      
      return {
        executionId,
        status: 'completed',
        results
      };
      
    } catch (error: any) {
      // 执行失败
      this.eventEmitter.emit('execution:failed', {
        executionId,
        error: error.message
      });
      
      return {
        executionId,
        status: 'failed',
        errors: [error.message]
      };
    }
  }
  
  /**
   * 取消执行（未来实现）
   */
  async cancel(executionId: string): Promise<void> {
    this.eventEmitter.emit('execution:cancelled', { executionId });
  }
}
