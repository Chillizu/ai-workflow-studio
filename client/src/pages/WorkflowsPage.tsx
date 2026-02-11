/**
 * 工作流列表页面
 * 显示所有工作流，支持创建、编辑、删除、执行
 */

import { useEffect, useState } from 'react';
import { Card, Button, Empty, Input, Modal, Form, Spin, Popconfirm, Space, Tag } from 'antd';
import { Plus, Play, Edit, Trash2, Search, Download, Upload } from 'lucide-react';
import { MainLayout } from '../components/layout';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import type { Workflow } from '../../../shared/types';

export const WorkflowsPage = () => {
  const navigate = useNavigate();
  const {
    workflows,
    loading,
    loadWorkflows,
    createWorkflow,
    deleteWorkflow,
    executeWorkflow,
    importWorkflow,
    exportWorkflow,
  } = useWorkflowStore();

  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 加载工作流列表
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // 创建工作流
  const handleCreate = async (values: { name: string; description: string }) => {
    try {
      const workflow = await createWorkflow(values.name, values.description);
      setCreateModalVisible(false);
      form.resetFields();
      navigate(`/editor/${workflow.id}`);
    } catch (error) {
      console.error('创建工作流失败:', error);
    }
  };

  // 编辑工作流
  const handleEdit = (workflow: Workflow) => {
    navigate(`/editor/${workflow.id}`);
  };

  // 删除工作流
  const handleDelete = async (id: string) => {
    try {
      await deleteWorkflow(id);
    } catch (error) {
      console.error('删除工作流失败:', error);
    }
  };

  // 执行工作流
  const handleExecute = async (id: string) => {
    try {
      const executionId = await executeWorkflow(id);
      navigate(`/executions/${executionId}`);
    } catch (error) {
      console.error('执行工作流失败:', error);
    }
  };

  // 导出工作流
  const handleExport = (workflow: Workflow) => {
    const data = {
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入工作流
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
          } catch (error) {
            console.error('导入工作流失败:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 过滤工作流
  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchText.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">工作流列表</h1>
          <Space>
            <Button
              icon={<Upload size={16} />}
              onClick={handleImport}
              className="flex items-center gap-2"
            >
              导入
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setCreateModalVisible(true)}
              className="flex items-center gap-2"
            >
              新建工作流
            </Button>
          </Space>
        </div>

        {/* 搜索框 */}
        <div className="mb-4">
          <Input
            placeholder="搜索工作流..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* 工作流列表 */}
        <Spin spinning={loading}>
          {filteredWorkflows.length === 0 ? (
            <Card className="bg-dark-surface border-dark-border">
              <Empty
                description="暂无工作流"
                className="text-gray-400"
              >
                <Button type="primary" onClick={() => setCreateModalVisible(true)}>
                  创建第一个工作流
                </Button>
              </Empty>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkflows.map((workflow) => (
                <Card
                  key={workflow.id}
                  className="bg-dark-surface border-dark-border hover:border-primary transition-colors cursor-pointer"
                  onClick={() => handleEdit(workflow)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {workflow.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {workflow.description || '暂无描述'}
                      </p>
                      <div className="flex gap-2 mb-4">
                        <Tag color="blue">{workflow.nodes.length} 个节点</Tag>
                        <Tag color="green">{workflow.edges.length} 个连接</Tag>
                      </div>
                      <p className="text-xs text-gray-500">
                        更新于 {new Date(workflow.updatedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="primary"
                        size="small"
                        icon={<Play size={14} />}
                        onClick={() => handleExecute(workflow.id)}
                        className="flex-1"
                      >
                        执行
                      </Button>
                      <Button
                        size="small"
                        icon={<Edit size={14} />}
                        onClick={() => handleEdit(workflow)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        icon={<Download size={14} />}
                        onClick={() => handleExport(workflow)}
                      >
                        导出
                      </Button>
                      <Popconfirm
                        title="确定删除此工作流吗？"
                        onConfirm={() => handleDelete(workflow.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          size="small"
                          danger
                          icon={<Trash2 size={14} />}
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Spin>

        {/* 创建工作流对话框 */}
        <Modal
          title="创建新工作流"
          open={createModalVisible}
          onCancel={() => {
            setCreateModalVisible(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          okText="创建"
          cancelText="取消"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
          >
            <Form.Item
              name="name"
              label="工作流名称"
              rules={[{ required: true, message: '请输入工作流名称' }]}
            >
              <Input placeholder="输入工作流名称" />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea
                placeholder="输入工作流描述（可选）"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};
