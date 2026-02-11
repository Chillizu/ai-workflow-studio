/**
 * Zustand Store 选择器
 * 使用浅比较优化，避免不必要的重渲染
 */

import { useWorkflowStore } from './workflowStore';
import { useExecutionStore } from './executionStore';
import { shallow } from 'zustand/shallow';

// ============ Workflow Store 选择器 ============

/**
 * 仅选择节点和边（用于React Flow）
 */
export const useWorkflowNodes = () =>
  useWorkflowStore(
    (state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    }),
    shallow
  );

/**
 * 仅选择选中的节点
 */
export const useSelectedNode = () =>
  useWorkflowStore(
    (state) => ({
      selectedNode: state.selectedNode,
      setSelectedNode: state.setSelectedNode,
      updateNode: state.updateNode,
    }),
    shallow
  );

/**
 * 仅选择工作流列表
 */
export const useWorkflowList = () =>
  useWorkflowStore(
    (state) => ({
      workflows: state.workflows,
      loading: state.loading,
      loadWorkflows: state.loadWorkflows,
      deleteWorkflow: state.deleteWorkflow,
    }),
    shallow
  );

/**
 * 仅选择当前工作流
 */
export const useCurrentWorkflow = () =>
  useWorkflowStore(
    (state) => ({
      currentWorkflow: state.currentWorkflow,
      loading: state.loading,
      saving: state.saving,
      loadWorkflow: state.loadWorkflow,
      saveWorkflow: state.saveWorkflow,
    }),
    shallow
  );

/**
 * 仅选择工作流操作
 */
export const useWorkflowActions = () =>
  useWorkflowStore(
    (state) => ({
      addNode: state.addNode,
      updateNode: state.updateNode,
      deleteNode: state.deleteNode,
      createWorkflow: state.createWorkflow,
      executeWorkflow: state.executeWorkflow,
      newWorkflow: state.newWorkflow,
      importWorkflow: state.importWorkflow,
      exportWorkflow: state.exportWorkflow,
    }),
    shallow
  );

/**
 * 仅选择执行状态
 */
export const useWorkflowExecuting = () =>
  useWorkflowStore((state) => state.executing);

// ============ Execution Store 选择器 ============

/**
 * 仅选择执行列表
 */
export const useExecutionList = () =>
  useExecutionStore(
    (state) => ({
      executions: state.executions,
      loading: state.loading,
      loadExecutions: state.loadExecutions,
      loadExecutionsByWorkflow: state.loadExecutionsByWorkflow,
    }),
    shallow
  );

/**
 * 仅选择当前执行
 */
export const useCurrentExecution = () =>
  useExecutionStore(
    (state) => ({
      currentExecution: state.currentExecution,
      loading: state.loading,
      loadExecution: state.loadExecution,
      clearCurrentExecution: state.clearCurrentExecution,
    }),
    shallow
  );

/**
 * 仅选择实时执行状态
 */
export const useExecutionStatus = () =>
  useExecutionStore(
    (state) => ({
      executionStatus: state.executionStatus,
      nodeStatus: state.nodeStatus,
      startExecution: state.startExecution,
    }),
    shallow
  );

/**
 * 选择特定节点的状态
 */
export const useNodeStatus = (nodeId: string) =>
  useExecutionStore((state) => state.nodeStatus.get(nodeId));
