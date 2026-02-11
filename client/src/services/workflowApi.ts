/**
 * 工作流API服务
 * 封装所有工作流相关的API调用
 */

import apiClient from './api';
import type { Workflow, BaseNode, Edge } from '../../../shared/types';

// 创建工作流的请求数据
export interface CreateWorkflowData {
  name: string;
  description: string;
  nodes?: BaseNode[];
  edges?: Edge[];
}

// 更新工作流的请求数据
export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  nodes?: BaseNode[];
  edges?: Edge[];
}

/**
 * 获取工作流列表
 */
export const getWorkflows = async (): Promise<Workflow[]> => {
  const response = await apiClient.get<Workflow[]>('/api/workflows');
  return response.data;
};

/**
 * 获取工作流详情
 */
export const getWorkflow = async (id: string): Promise<Workflow> => {
  const response = await apiClient.get<Workflow>(`/api/workflows/${id}`);
  return response.data;
};

/**
 * 创建工作流
 */
export const createWorkflow = async (data: CreateWorkflowData): Promise<Workflow> => {
  const response = await apiClient.post<Workflow>('/api/workflows', data);
  return response.data;
};

/**
 * 更新工作流
 */
export const updateWorkflow = async (id: string, data: UpdateWorkflowData): Promise<Workflow> => {
  const response = await apiClient.put<Workflow>(`/api/workflows/${id}`, data);
  return response.data;
};

/**
 * 删除工作流
 */
export const deleteWorkflow = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/workflows/${id}`);
};

/**
 * 执行工作流
 */
export const executeWorkflow = async (id: string): Promise<{ executionId: string }> => {
  const response = await apiClient.post<{ executionId: string }>(`/api/workflows/${id}/execute`);
  return response.data;
};
