/**
 * 节点API服务
 * 封装所有节点相关的API调用
 */

import apiClient from './api';

// 节点类型定义
export interface NodeTypeDefinition {
  type: string;
  name: string;
  category: 'input' | 'output' | 'processor' | 'ai';
  description: string;
  inputs: Array<{
    id: string;
    name: string;
    type: 'text' | 'image' | 'number' | 'any';
    required: boolean;
  }>;
  outputs: Array<{
    id: string;
    name: string;
    type: 'text' | 'image' | 'number' | 'any';
  }>;
  config: Record<string, any>;
}

/**
 * 获取节点类型列表
 */
export const getNodeTypes = async (): Promise<NodeTypeDefinition[]> => {
  const response = await apiClient.get<NodeTypeDefinition[]>('/api/nodes/types');
  return response.data;
};
