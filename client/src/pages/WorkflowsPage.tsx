/**
 * 工作流列表页面 (Dashboard)
 * 显示所有工作流，支持创建、编辑、删除、执行
 */

import { useEffect, useState } from 'react';
import { Card, Button, Empty, Input, Modal, Form, Spin, Popconfirm, Space, Tag, Tooltip, Row, Col } from 'antd';
import { Plus, Play, Edit, Trash2, Search, Download, Upload, Zap, MoreHorizontal, Calendar, Activity } from 'lucide-react';
import { MainLayout } from '../components/layout';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import type { Workflow } from '../../../shared/types';
// import dayjs from 'dayjs'; // Removed dependency

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
    // exportWorkflow, // Assuming export is handled by parent or we add it back
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
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteWorkflow(id);
    } catch (error) {
      console.error('删除工作流失败:', error);
    }
  };

  // 执行工作流
  const handleExecute = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const executionId = await executeWorkflow(id);
      navigate(`/executions/${executionId}`);
    } catch (error) {
      console.error('执行工作流失败:', error);
    }
  };

  // 导出工作流
  const handleExport = (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
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
      <div className="p-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">工作流控制台</h1>
            <p className="text-gray-400 mt-1">管理和编排你的 AI 工作流任务</p>
          </div>
          <Space wrap size="middle">
             {/* Test All Endpoints Action */}
             <Button 
                icon={<Zap size={16} />} 
                className="border-primary text-primary hover:text-primary-hover hover:border-primary-hover"
                onClick={() => console.log('Test All Endpoints')} // Placeholder functionality
              >
                测试所有接口
              </Button>
            <Button
              icon={<Upload size={16} />}
              onClick={handleImport}
            >
              导入
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setCreateModalVisible(true)}
              className="bg-primary hover:bg-primary-hover border-none shadow-lg shadow-primary/20"
            >
              新建工作流
            </Button>
          </Space>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            size="large"
            placeholder="搜索工作流名称或描述..."
            prefix={<Search size={18} className="text-gray-500 mr-2" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md bg-dark-surface border-dark-border hover:border-primary focus:border-primary"
            allowClear
          />
        </div>

        {/* Workflow Grid */}
        <Spin spinning={loading}>
          {filteredWorkflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-dark-surface rounded-2xl border border-dashed border-dark-border">
              <div className="w-16 h-16 bg-dark-surfaceHighlight rounded-full flex items-center justify-center mb-4">
                <Activity size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无工作流</h3>
              <p className="text-gray-400 mb-6 max-w-md text-center">开始创建你的第一个 AI 工作流，或者导入现有的配置。</p>
              <Button type="primary" size="large" onClick={() => setCreateModalVisible(true)} icon={<Plus size={16} />}>
                立即创建
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="group relative bg-dark-surface rounded-xl border border-dark-border overflow-hidden hover:border-primary/50 hover:shadow-glow-sm transition-all duration-300 cursor-pointer flex flex-col h-full"
                  onClick={() => handleEdit(workflow)}
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Activity size={24} />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button 
                            type="text" 
                            size="small" 
                            icon={<MoreHorizontal size={16} className="text-gray-400" />}
                            onClick={(e) => e.stopPropagation()}
                          />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors truncate">
                      {workflow.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                      {workflow.description || '暂无描述...'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Tag color="geekblue" className="mr-0 bg-opacity-20 border-none">{workflow.nodes.length} 节点</Tag>
                      <Tag color="cyan" className="mr-0 bg-opacity-20 border-none">{workflow.edges.length} 连接</Tag>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-dark-surfaceHighlight/30 border-t border-dark-border flex justify-between items-center text-xs text-gray-500">
                     <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(workflow.updatedAt).toLocaleString('zh-CN')}
                     </span>
                     
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="执行">
                          <Button
                            type="text"
                            size="small"
                            icon={<Play size={14} className="text-green-500" />}
                            onClick={(e) => handleExecute(workflow.id, e)}
                            className="hover:bg-green-500/10"
                          />
                        </Tooltip>
                        <Tooltip title="编辑">
                          <Button
                            type="text"
                            size="small"
                            icon={<Edit size={14} className="text-blue-500" />}
                            onClick={() => handleEdit(workflow)}
                            className="hover:bg-blue-500/10"
                          />
                        </Tooltip>
                        <Tooltip title="导出">
                          <Button
                            type="text"
                            size="small"
                            icon={<Download size={14} className="text-orange-500" />}
                            onClick={(e) => handleExport(workflow, e)}
                            className="hover:bg-orange-500/10"
                          />
                        </Tooltip>
                        <Tooltip title="删除">
                          <Popconfirm
                            title="确定删除此工作流吗？"
                            onConfirm={(e) => e && handleDelete(workflow.id, e as unknown as React.MouseEvent)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<Trash2 size={14} />}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                            />
                          </Popconfirm>
                        </Tooltip>
                     </div>
                  </div>
                </div>
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
          centered
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
              <Input placeholder="例如：AI 图像生成流水线" />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea
                placeholder="简要描述该工作流的功能..."
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};
