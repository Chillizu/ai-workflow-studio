/**
 * 配置API服务
 * 封装所有API配置相关的API调用
 */

import apiClient from './api';
import type { APIConfig } from '../../../shared/types';

// 创建API配置的请求数据
export interface CreateAPIConfigData {
  name: string;
  type: 'openai' | 'openrouter' | 'openai-compatible' | 'custom';
  baseURL?: string;
  apiKey?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitPerMinute?: number;
  config?: Record<string, any>;
}

// 更新API配置的请求数据
export interface UpdateAPIConfigData {
  name?: string;
  type?: 'openai' | 'openrouter' | 'openai-compatible' | 'custom';
  baseURL?: string;
  apiKey?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitPerMinute?: number;
  config?: Record<string, any>;
}

/**
 * 获取API配置列表
 */
export const getAPIConfigs = async (): Promise<APIConfig[]> => {
  const response = await apiClient.get<APIConfig[]>('/api/configs/apis');
  return response.data;
};

/**
 * 获取API配置详情
 */
export const getAPIConfig = async (id: string): Promise<APIConfig> => {
  const response = await apiClient.get<APIConfig>(`/api/configs/apis/${id}`);
  return response.data;
};

/**
 * 创建API配置
 */
export const createAPIConfig = async (data: CreateAPIConfigData): Promise<APIConfig> => {
  const response = await apiClient.post<APIConfig>('/api/configs/apis', data);
  return response.data;
};

/**
 * 更新API配置
 */
export const updateAPIConfig = async (id: string, data: UpdateAPIConfigData): Promise<APIConfig> => {
  const response = await apiClient.put<APIConfig>(`/api/configs/apis/${id}`, data);
  return response.data;
};

/**
 * 删除API配置
 */
export const deleteAPIConfig = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/configs/apis/${id}`);
};

/**
 * 测试API连接
 */
export const testAPIConnection = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/api/configs/apis/${id}/test`
  );
  return response.data;
};

/**
 * 获取可用模型列表
 */
export const getAvailableModels = async (id: string): Promise<string[]> => {
  const response = await apiClient.get<{ models: string[] }>(`/api/configs/apis/${id}/models`);
  return response.data.models;
};
