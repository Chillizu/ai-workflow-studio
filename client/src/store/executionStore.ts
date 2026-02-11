/**
 * 执行Store
 * 管理工作流执行状态
 */

import { create } from 'zustand';
import type { ExecutionRecord } from '../../../shared/types';
import * as executionApi from '../services/executionApi';
import { socketService, ExecutionEvent } from '../services/socketService';
import { message } from 'antd';

interface ExecutionState {
  // 执行记录
  executions: ExecutionRecord[];
  currentExecution: ExecutionRecord | null;
  
  // 实时执行状态
  executionStatus: Map<string, ExecutionRecord>;
  nodeStatus: Map<string, { status: string; result?: any; error?: string }>;
  
  // 加载状态
  loading: boolean;
  
  // API操作
  loadExecutions: () => Promise<void>;
  loadExecution: (id: string) => Promise<void>;
  loadExecutionsByWorkflow: (workflowId: string) => Promise<void>;
  
  // 实时更新
  startExecution: (executionId: string) => void;
  updateExecutionStatus: (event: ExecutionEvent) => void;
  updateNodeStatus: (event: ExecutionEvent) => void;
  
  // 清理
  clearCurrentExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  // 初始状态
  executions: [],
  currentExecution: null,
  executionStatus: new Map(),
  nodeStatus: new Map(),
  loading: false,

  // API操作
  loadExecutions: async () => {
    set({ loading: true });
    try {
      const executions = await executionApi.getExecutions();
      set({ executions, loading: false });
    } catch (error) {
      console.error('加载执行历史失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  loadExecution: async (id: string) => {
    set({ loading: true });
    try {
      const execution = await executionApi.getExecution(id);
      set({ currentExecution: execution, loading: false });
    } catch (error) {
      console.error('加载执行详情失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  loadExecutionsByWorkflow: async (workflowId: string) => {
    set({ loading: true });
    try {
      const executions = await executionApi.getExecutionsByWorkflow(workflowId);
      set({ executions, loading: false });
    } catch (error) {
      console.error('加载工作流执行历史失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  // 实时更新
  startExecution: (executionId: string) => {
    // 订阅执行事件
    socketService.subscribeToExecution(executionId);
    
    // 监听执行事件
    const handleExecutionStart = (event: ExecutionEvent) => {
      if (event.executionId === executionId) {
        get().updateExecutionStatus(event);
      }
    };
    
    const handleExecutionProgress = (event: ExecutionEvent) => {
      if (event.executionId === executionId) {
        get().updateExecutionStatus(event);
      }
    };
    
    const handleExecutionComplete = (event: ExecutionEvent) => {
      if (event.executionId === executionId) {
        get().updateExecutionStatus(event);
        message.success('工作流执行完成');
        socketService.unsubscribeFromExecution(executionId);
      }
    };
    
    const handleExecutionError = (event: ExecutionEvent) => {
      if (event.executionId === executionId) {
        get().updateExecutionStatus(event);
        message.error(`工作流执行失败: ${event.error}`);
        socketService.unsubscribeFromExecution(executionId);
      }
    };
    
    const handleNodeStart = (event: ExecutionEvent) => {
      if (event.executionId === executionId) {
        get().updateNodeStatus(event);
      }
    };
    
    const handleNodeComplete = (event: ExecutionEvent) => {
      if (event.executionId === executionId) {
        get().updateNodeStatus(event);
      }
    };
    
    const handleNodeError = (event: ExecutionEvent) => {
      if (event.executionId === executionId) {
        get().updateNodeStatus(event);
      }
    };
    
    socketService.on('execution:start', handleExecutionStart);
    socketService.on('execution:progress', handleExecutionProgress);
    socketService.on('execution:complete', handleExecutionComplete);
    socketService.on('execution:error', handleExecutionError);
    socketService.on('node:start', handleNodeStart);
    socketService.on('node:complete', handleNodeComplete);
    socketService.on('node:error', handleNodeError);
  },

  updateExecutionStatus: (event: ExecutionEvent) => {
    set((state) => {
      const newStatus = new Map(state.executionStatus);
      const existing = newStatus.get(event.executionId);
      
      newStatus.set(event.executionId, {
        ...existing,
        id: event.executionId,
        status: event.status,
        error: event.error,
      } as ExecutionRecord);
      
      return { executionStatus: newStatus };
    });
  },

  updateNodeStatus: (event: ExecutionEvent) => {
    if (!event.nodeId) return;
    
    set((state) => {
      const newStatus = new Map(state.nodeStatus);
      newStatus.set(event.nodeId!, {
        status: event.nodeStatus || 'pending',
        result: event.result,
        error: event.error,
      });
      
      return { nodeStatus: newStatus };
    });
  },

  clearCurrentExecution: () => {
    set({
      currentExecution: null,
      nodeStatus: new Map(),
    });
  },
}));
