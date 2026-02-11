/**
 * 执行API服务
 * 封装所有执行相关的API调用
 */

import apiClient from './api';
import type { ExecutionRecord } from '../../../shared/types';

/**
 * 获取执行历史列表
 */
export const getExecutions = async (): Promise<ExecutionRecord[]> => {
  const response = await apiClient.get<ExecutionRecord[]>('/api/executions');
  return response.data;
};

/**
 * 获取执行详情
 */
export const getExecution = async (id: string): Promise<ExecutionRecord> => {
  const response = await apiClient.get<ExecutionRecord>(`/api/executions/${id}`);
  return response.data;
};

/**
 * 根据工作流ID获取执行历史
 */
export const getExecutionsByWorkflow = async (workflowId: string): Promise<ExecutionRecord[]> => {
  const response = await apiClient.get<ExecutionRecord[]>(`/api/executions?workflowId=${workflowId}`);
  return response.data;
};
