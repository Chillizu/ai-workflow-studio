/**
 * 文件API服务
 * 封装所有文件相关的API调用
 */

import apiClient from './api';

// 文件上传响应
export interface UploadResponse {
  filename: string;
  path: string;
  url: string;
}

/**
 * 上传文件
 */
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/api/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 获取文件URL
 */
export const getFileUrl = (filename: string): string => {
  return `${apiClient.defaults.baseURL}/uploads/${filename}`;
};
