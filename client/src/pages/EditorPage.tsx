import { useState, useCallback, useRef } from 'react';
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

const EditorContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
        data: { label: `${type} 节点` },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const handleSave = () => {
    console.log('保存工作流', { nodes, edges });
  };

  const handleExecute = () => {
    console.log('执行工作流', { nodes, edges });
  };

  const handleExport = () => {
    const workflow = { nodes, edges };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
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
            const workflow = JSON.parse(event.target?.result as string);
            setNodes(workflow.nodes || []);
            setEdges(workflow.edges || []);
          } catch (error) {
            console.error('导入失败:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

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
              nodeColor="#4a4a4a"
            />
          </ReactFlow>
        </div>
        {selectedNode && (
          <div className="w-80 border-l border-dark-border bg-dark-surface">
            <PropertiesPanel node={selectedNode} />
          </div>
        )}
      </div>
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
