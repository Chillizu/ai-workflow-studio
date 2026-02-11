import { NodeExecutionContext, NodeExecutionResult } from '../types';

/**
 * 节点处理器基类
 */
export abstract class BaseNodeProcessor {
  abstract type: string;
  
  /**
   * 执行节点逻辑
   */
  abstract execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;
  
  /**
   * 验证节点配置
   */
  validate(_context: NodeExecutionContext): boolean {
    return true;
  }
}
