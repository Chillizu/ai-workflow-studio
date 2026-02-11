import { Workflow, BaseNode, Edge } from '../../../shared/types';
import { ValidationError, NodeDataType } from '../types';
import { ProcessorRegistry } from './registry';

/**
 * 工作流验证器
 */
export class WorkflowValidator {
  constructor(private processorRegistry: ProcessorRegistry) {}
  
  /**
   * 验证工作流
   */
  validate(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 1. 检查节点配置
    errors.push(...this.validateNodeConfigs(workflow.nodes));
    
    // 2. 检查连接有效性
    errors.push(...this.validateConnections(workflow.nodes, workflow.edges));
    
    // 3. 检查必需输入
    errors.push(...this.validateRequiredInputs(workflow.nodes, workflow.edges));
    
    // 4. 检查循环依赖
    errors.push(...this.validateCircularDependencies(workflow.nodes, workflow.edges));
    
    return errors;
  }
  
  /**
   * 验证节点配置
   */
  private validateNodeConfigs(nodes: BaseNode[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const node of nodes) {
      const processor = this.processorRegistry.get(node.type);
      if (!processor) {
        errors.push({
          type: 'invalid_config',
          nodeId: node.id,
          message: `未知的节点类型: ${node.type}`
        });
      }
    }
    
    return errors;
  }
  
  /**
   * 验证连接有效性
   */
  private validateConnections(nodes: BaseNode[], edges: Edge[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    for (const edge of edges) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (!sourceNode || !targetNode) {
        continue;
      }
      
      // 检查输出端口
      const sourceOutput = sourceNode.data.outputs.find(
        o => o.id === edge.sourceHandle
      );
      if (!sourceOutput) {
        errors.push({
          type: 'invalid_connection',
          nodeId: edge.source,
          message: `无效的输出端口: ${edge.sourceHandle}`
        });
      }
      
      // 检查输入端口
      const targetInput = targetNode.data.inputs.find(
        i => i.id === edge.targetHandle
      );
      if (!targetInput) {
        errors.push({
          type: 'invalid_connection',
          nodeId: edge.target,
          message: `无效的输入端口: ${edge.targetHandle}`
        });
      }
      
      // 检查类型兼容性
      if (sourceOutput && targetInput) {
        if (!this.isTypeCompatible(sourceOutput.type, targetInput.type)) {
          errors.push({
            type: 'invalid_connection',
            nodeId: edge.target,
            message: `类型不兼容: ${sourceOutput.type} -> ${targetInput.type}`
          });
        }
      }
    }
    
    return errors;
  }
  
  /**
   * 验证必需输入
   */
  private validateRequiredInputs(nodes: BaseNode[], edges: Edge[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const connectedInputs = new Set(
      edges.map(e => `${e.target}:${e.targetHandle}`)
    );
    
    for (const node of nodes) {
      for (const input of node.data.inputs) {
        if (input.required) {
          const key = `${node.id}:${input.id}`;
          if (!connectedInputs.has(key)) {
            errors.push({
              type: 'missing_input',
              nodeId: node.id,
              message: `缺少必需输入: ${input.name}`
            });
          }
        }
      }
    }
    
    return errors;
  }
  
  /**
   * 验证循环依赖
   */
  private validateCircularDependencies(nodes: BaseNode[], edges: Edge[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const graph = this.buildGraph(nodes, edges);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          errors.push({
            type: 'circular_dependency',
            nodeId: node.id,
            message: '检测到循环依赖'
          });
          break;
        }
      }
    }
    
    return errors;
  }
  
  /**
   * 检查类型兼容性
   */
  private isTypeCompatible(sourceType: NodeDataType, targetType: NodeDataType): boolean {
    if (targetType === 'any') return true;
    if (sourceType === targetType) return true;
    return false;
  }
  
  /**
   * 构建依赖图
   */
  private buildGraph(nodes: BaseNode[], edges: Edge[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    for (const node of nodes) {
      graph.set(node.id, []);
    }
    
    for (const edge of edges) {
      const neighbors = graph.get(edge.source) || [];
      neighbors.push(edge.target);
      graph.set(edge.source, neighbors);
    }
    
    return graph;
  }
}
