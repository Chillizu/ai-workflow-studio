/**
 * 工作流编辑器页面
 * 可视化编辑工作流，支持保存、执行和实时状态更新
 * 性能优化：useMemo, useCallback, React Flow配置优化
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  Panel,
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
import { Spin, Drawer, Button } from 'antd';
import { Settings2, X } from 'lucide-react';

const EditorContent = () => {
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [showProperties, setShowProperties] = useState(false);

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

  // Load workflow
  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id);
    }
  }, [id, loadWorkflow]);

  // Sync store -> ReactFlow
  useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.nodes as Node[]);
      setEdges(currentWorkflow.edges as any[]);
    }
  }, [currentWorkflow, setNodes, setEdges]);

  // WebSocket
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Sync ReactFlow -> store
  useEffect(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
  }, [nodes, edges, setStoreNodes, setStoreEdges]);

  // Update node status from execution store
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
    setShowProperties(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowProperties(false);
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

  // 使用useCallback优化事件处理函数
  const handleSave = useCallback(async () => {
    try {
      await saveWorkflow();
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, [saveWorkflow]);

  const handleExecute = useCallback(async () => {
    try {
      clearCurrentExecution();
      const executionId = await executeWorkflow();
      startExecution(executionId);
    } catch (error) {
      console.error('执行失败:', error);
    }
  }, [clearCurrentExecution, executeWorkflow, startExecution]);

  const handleExport = useCallback(() => {
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
  }, [exportWorkflow]);

  const handleImport = useCallback(() => {
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
  }, [importWorkflow, setNodes, setEdges]);

  const onNodeUpdate = useCallback((updatedNode: Node) => {
    setNodes((nds) => nds.map((node) => (node.id === updatedNode.id ? updatedNode : node)));
    setSelectedNode(updatedNode);
  }, [setNodes]);

  // 使用useMemo优化MiniMap的nodeColor函数
  const minimapNodeColor = useCallback((node: Node) => {
    const status = nodeStatus.get(node.id);
    if (status?.status === 'running') return '#6366f1';
    if (status?.status === 'completed') return '#10b981';
    if (status?.status === 'failed') return '#ef4444';
    return '#64748b';
  }, [nodeStatus]);

  // React Flow性能优化配置
  const proOptions = useMemo(() => ({ hideAttribution: true }), []);
  const defaultEdgeOptions = useMemo(() => ({
    animated: false,
    style: { stroke: '#64748b' }
  }), []);

  return (
    <MainLayout
      headerProps={{
        onSave: handleSave,
        onExecute: handleExecute,
        onExport: handleExport,
        onImport: handleImport,
      }}
      sidebar={
        <Sidebar width={280}>
          <NodePanel />
        </Sidebar>
      }
    >
      <Spin spinning={loading} tip="加载中..." wrapperClassName="h-full">
        <div className="flex h-full relative" ref={reactFlowWrapper}>
          <div className="flex-1 h-full relative">
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
              defaultEdgeOptions={defaultEdgeOptions}
              proOptions={proOptions}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={4}
              className="bg-dark-bg"
              // 性能优化选项
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              selectNodesOnDrag={false}
            >
              <Background color="#334155" gap={20} size={1} />
              <Controls className="bg-dark-surface border-dark-border shadow-lg" />
              <MiniMap
                className="!bg-dark-surface !border-dark-border shadow-lg m-4"
                nodeColor={minimapNodeColor}
                maskColor="rgba(15, 23, 42, 0.7)"
                pannable
                zoomable
              />
              <Panel position="top-right" className="m-4">
                 {/* Optional: Add overlay controls here */}
              </Panel>
            </ReactFlow>
          </div>

          {/* Properties Panel - Desktop: Sidebar, Mobile: Drawer */}
          <div className={`hidden lg:block w-80 border-l border-dark-border bg-dark-surface transition-all duration-300 ${showProperties ? 'mr-0' : '-mr-80'}`}>
             <div className="flex justify-between items-center p-4 border-b border-dark-border">
                <h3 className="font-semibold text-white flex items-center gap-2">
                   <Settings2 size={16} /> 属性设置
                </h3>
                <Button type="text" size="small" icon={<X size={16} />} onClick={() => setShowProperties(false)} />
             </div>
             {selectedNode ? (
                <PropertiesPanel node={selectedNode} onUpdate={onNodeUpdate} />
             ) : (
                <div className="p-8 text-center text-gray-500">
                   请选择一个节点以编辑属性
                </div>
             )}
          </div>

          <Drawer
            title="属性设置"
            placement="right"
            onClose={() => setShowProperties(false)}
            open={showProperties}
            className="lg:hidden"
            width={320}
          >
             {selectedNode ? (
                <PropertiesPanel node={selectedNode} onUpdate={onNodeUpdate} />
             ) : (
                <div className="p-8 text-center text-gray-500">
                   请选择一个节点以编辑属性
                </div>
             )}
          </Drawer>
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
