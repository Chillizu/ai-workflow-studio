/**
 * 配置API服务
 * 封装所有API配置相关的API调用
 */

import apiClient from './api';
import type { APIConfig } from '../../../shared/types';

// 创建API配置的请求数据
export interface CreateAPIConfigData {
  name: string;
  type: 'openai' | 'stable-diffusion' | 'custom';
  apiKey?: string;
  endpoint?: string;
  config?: Record<string, any>;
}

// 更新API配置的请求数据
export interface UpdateAPIConfigData {
  name?: string;
  apiKey?: string;
  endpoint?: string;
  config?: Record<string, any>;
}

/**
 * 获取API配置列表
 */
export const getAPIConfigs = async (): Promise<APIConfig[]> => {
  const response = await apiClient.get<APIConfig[]>('/api/configs');
  return response.data;
};

/**
 * 获取API配置详情
 */
export const getAPIConfig = async (id: string): Promise<APIConfig> => {
  const response = await apiClient.get<APIConfig>(`/api/configs/${id}`);
  return response.data;
};

/**
 * 创建API配置
 */
export const createAPIConfig = async (data: CreateAPIConfigData): Promise<APIConfig> => {
  const response = await apiClient.post<APIConfig>('/api/configs', data);
  return response.data;
};

/**
 * 更新API配置
 */
export const updateAPIConfig = async (id: string, data: UpdateAPIConfigData): Promise<APIConfig> => {
  const response = await apiClient.put<APIConfig>(`/api/configs/${id}`, data);
  return response.data;
};

/**
 * 删除API配置
 */
export const deleteAPIConfig = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/configs/${id}`);
};
