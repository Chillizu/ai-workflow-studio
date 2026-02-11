import { BaseNode, Edge } from '../../../shared/types';

/**
 * 拓扑排序器
 * 使用Kahn算法确定节点执行顺序
 */
export class TopologicalSorter {
  /**
   * 对节点进行拓扑排序
   */
  sort(nodes: BaseNode[], edges: Edge[]): string[] {
    const graph = this.buildGraph(nodes, edges);
    const inDegree = this.calculateInDegree(nodes, edges);
    const queue: string[] = [];
    const result: string[] = [];
    
    // 找到所有入度为0的节点（起始节点）
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }
    
    // Kahn算法
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);
      
      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        const degree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, degree);
        
        if (degree === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    return result;
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
  
  /**
   * 计算入度
   */
  private calculateInDegree(nodes: BaseNode[], edges: Edge[]): Map<string, number> {
    const inDegree = new Map<string, number>();
    
    for (const node of nodes) {
      inDegree.set(node.id, 0);
    }
    
    for (const edge of edges) {
      const degree = inDegree.get(edge.target)! + 1;
      inDegree.set(edge.target, degree);
    }
    
    return inDegree;
  }
}
