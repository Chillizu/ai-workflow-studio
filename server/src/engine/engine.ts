import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { Workflow } from '../../../shared/types';
import { ExecutionResult } from '../types';
import { WorkflowValidator } from './validator';
import { TopologicalSorter } from './sorter';
import { ExecutionContext } from './context';
import { NodeExecutor } from './executor';
import { ProcessorRegistry } from './registry';

/**
 * 工作流执行引擎
 * 协调整个工作流的执行流程
 */
export class WorkflowEngine {
  private validator: WorkflowValidator;
  private sorter: TopologicalSorter;
  private executor: NodeExecutor;
  private eventEmitter: EventEmitter;
  
  constructor(
    processorRegistry: ProcessorRegistry,
    eventEmitter: EventEmitter
  ) {
    this.validator = new WorkflowValidator(processorRegistry);
    this.sorter = new TopologicalSorter();
    this.executor = new NodeExecutor(processorRegistry, eventEmitter);
    this.eventEmitter = eventEmitter;
  }
  
  /**
   * 执行工作流
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
      
      // 2. 拓扑排序
      const executionOrder = this.sorter.sort(workflow.nodes, workflow.edges);
      
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
        totalNodes: executionOrder.length
      });
      
      // 5. 按顺序执行节点
      for (let i = 0; i < executionOrder.length; i++) {
        const nodeId = executionOrder[i];
        
        await this.executor.execute(nodeId, context);
        
        // 发送进度更新
        this.eventEmitter.emit('execution:progress', {
          executionId,
          progress: ((i + 1) / executionOrder.length) * 100,
          completedNodes: i + 1,
          totalNodes: executionOrder.length
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
