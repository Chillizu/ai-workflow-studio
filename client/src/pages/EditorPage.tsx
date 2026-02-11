/**
 * 工作流编辑器页面
 * 可视化编辑工作流，支持保存、执行和实时状态更新
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MainLayout, Sidebar } from '../components/layout';
import { NodePanel } from '../components/editor/NodePanel';
import { PropertiesPanel } from '../components/editor/PropertiesPanel';
import { nodeTypes } from '../components/nodes';
import { useWorkflowStore } from '../store/workflowStore';
import { useExecutionStore } from '../store/executionStore';
import { socketService } from '../services/socketService';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Badge } from 'antd';

const EditorContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const {
    currentWorkflow,
    loading,
    saving,
    executing,
    loadWorkflow,
    saveWorkflow,
    executeWorkflow,
    importWorkflow,
    exportWorkflow,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
  } = useWorkflowStore();

  const {
    nodeStatus,
    startExecution,
    clearCurrentExecution,
  } = useExecutionStore();

  // 加载工作流
  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id);
    }
  }, [id, loadWorkflow]);

  // 同步store中的nodes和edges到ReactFlow
  useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.nodes as Node[]);
      setEdges(currentWorkflow.edges as any[]);
    }
  }, [currentWorkflow, setNodes, setEdges]);

  // 连接WebSocket
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // 同步ReactFlow的nodes和edges到store
  useEffect(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
  }, [nodes, edges, setStoreNodes, setStoreEdges]);

  // 更新节点状态显示
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const status = nodeStatus.get(node.id);
        if (status) {
          return {
            ...node,
            data: {
              ...node.data,
              status: status.status,
              result: status.result,
              error: status.error,
            },
          };
        }
        return node;
      })
    );
  }, [nodeStatus, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type} 节点`,
          inputs: [],
          outputs: [],
          config: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const handleSave = async () => {
    try {
      await saveWorkflow();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleExecute = async () => {
    try {
      clearCurrentExecution();
      const executionId = await executeWorkflow();
      startExecution(executionId);
    } catch (error) {
      console.error('执行失败:', error);
    }
  };

  const handleExport = () => {
    const data = exportWorkflow();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name || 'workflow'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            importWorkflow(data);
            setNodes(data.nodes || []);
            setEdges(data.edges || []);
          } catch (error) {
            console.error('导入失败:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 渲染节点状态徽章
  const renderNodeWithStatus = (node: Node) => {
    const status = nodeStatus.get(node.id);
    if (!status) return null;

    let color = 'default';
    if (status.status === 'running') color = 'processing';
    if (status.status === 'completed') color = 'success';
    if (status.status === 'failed') color = 'error';

    return (
      <Badge
        status={color as any}
        text={status.status}
        style={{ position: 'absolute', top: -20, left: 0 }}
      />
    );
  };

  return (
    <MainLayout
      headerProps={{
        onSave: handleSave,
        onExecute: handleExecute,
        onExport: handleExport,
        onImport: handleImport,
        saving,
        executing,
      }}
      sidebar={
        <Sidebar width={280}>
          <NodePanel />
        </Sidebar>
      }
    >
      <Spin spinning={loading} tip="加载中...">
        <div className="flex h-full" ref={reactFlowWrapper}>
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-dark-bg"
            >
              <Background color="#2a2a2a" gap={16} />
              <Controls className="bg-dark-surface border-dark-border" />
              <MiniMap
                className="bg-dark-surface border-dark-border"
                nodeColor={(node) => {
                  const status = nodeStatus.get(node.id);
                  if (status?.status === 'running') return '#1890ff';
                  if (status?.status === 'completed') return '#52c41a';
                  if (status?.status === 'failed') return '#ff4d4f';
                  return '#4a4a4a';
                }}
              />
            </ReactFlow>
          </div>
          {selectedNode && (
            <div className="w-80 border-l border-dark-border bg-dark-surface">
              <PropertiesPanel node={selectedNode} />
            </div>
          )}
        </div>
      </Spin>
    </MainLayout>
  );
};

export const EditorPage = () => {
  return (
    <ReactFlowProvider>
      <EditorContent />
    </ReactFlowProvider>
  );
};
