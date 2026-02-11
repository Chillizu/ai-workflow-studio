/**
 * 工作流Store
 * 管理工作流状态和操作
 */

import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { Workflow } from '../../../shared/types';
import * as workflowApi from '../services/workflowApi';
import { message } from 'antd';

interface WorkflowState {
  // 当前编辑器状态
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  
  // 工作流列表
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  
  // 加载状态
  loading: boolean;
  saving: boolean;
  executing: boolean;
  
  // 编辑器操作
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  
  // API操作
  loadWorkflows: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  createWorkflow: (name: string, description: string) => Promise<Workflow>;
  saveWorkflow: () => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  executeWorkflow: (id?: string) => Promise<string>;
  
  // 工作流操作
  newWorkflow: () => void;
  importWorkflow: (data: any) => void;
  exportWorkflow: () => any;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // 初始状态
  nodes: [],
  edges: [],
  selectedNode: null,
  workflows: [],
  currentWorkflow: null,
  loading: false,
  saving: false,
  executing: false,

  // 编辑器操作
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  
  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),
  
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })),
    
  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    })),

  // API操作
  loadWorkflows: async () => {
    set({ loading: true });
    try {
      const workflows = await workflowApi.getWorkflows();
      set({ workflows, loading: false });
    } catch (error) {
      console.error('加载工作流列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  loadWorkflow: async (id: string) => {
    set({ loading: true });
    try {
      const workflow = await workflowApi.getWorkflow(id);
      set({
        currentWorkflow: workflow,
        nodes: workflow.nodes as Node[],
        edges: workflow.edges as Edge[],
        loading: false,
      });
      message.success('工作流加载成功');
    } catch (error) {
      console.error('加载工作流失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createWorkflow: async (name: string, description: string) => {
    set({ saving: true });
    try {
      const workflow = await workflowApi.createWorkflow({
        name,
        description,
        nodes: [],
        edges: [],
      });
      set((state) => ({
        workflows: [...state.workflows, workflow],
        currentWorkflow: workflow,
        saving: false,
      }));
      message.success('工作流创建成功');
      return workflow;
    } catch (error) {
      console.error('创建工作流失败:', error);
      set({ saving: false });
      throw error;
    }
  },

  saveWorkflow: async () => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow) {
      message.error('没有当前工作流');
      return;
    }

    set({ saving: true });
    try {
      const updated = await workflowApi.updateWorkflow(currentWorkflow.id, {
        nodes: nodes as any[],
        edges: edges as any[],
      });
      set((state) => ({
        currentWorkflow: updated,
        workflows: state.workflows.map((w) =>
          w.id === updated.id ? updated : w
        ),
        saving: false,
      }));
      message.success('工作流保存成功');
    } catch (error) {
      console.error('保存工作流失败:', error);
      set({ saving: false });
      throw error;
    }
  },

  deleteWorkflow: async (id: string) => {
    try {
      await workflowApi.deleteWorkflow(id);
      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
        currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
      }));
      message.success('工作流删除成功');
    } catch (error) {
      console.error('删除工作流失败:', error);
      throw error;
    }
  },

  executeWorkflow: async (id?: string) => {
    const workflowId = id || get().currentWorkflow?.id;
    if (!workflowId) {
      message.error('没有可执行的工作流');
      throw new Error('No workflow to execute');
    }

    set({ executing: true });
    try {
      const { executionId } = await workflowApi.executeWorkflow(workflowId);
      set({ executing: false });
      message.success('工作流开始执行');
      return executionId;
    } catch (error) {
      console.error('执行工作流失败:', error);
      set({ executing: false });
      throw error;
    }
  },

  // 工作流操作
  newWorkflow: () => {
    set({
      currentWorkflow: null,
      nodes: [],
      edges: [],
      selectedNode: null,
    });
  },

  importWorkflow: (data: any) => {
    try {
      set({
        nodes: data.nodes || [],
        edges: data.edges || [],
        selectedNode: null,
      });
      message.success('工作流导入成功');
    } catch (error) {
      console.error('导入工作流失败:', error);
      message.error('导入工作流失败');
    }
  },

  exportWorkflow: () => {
    const { currentWorkflow, nodes, edges } = get();
    return {
      name: currentWorkflow?.name || '未命名工作流',
      description: currentWorkflow?.description || '',
      nodes,
      edges,
    };
  },
}));
