/**
 * API配置页面
 * 管理API配置，支持添加、编辑、删除
 */

import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, Space, Table, Modal, Popconfirm, message, Spin } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { MainLayout } from '../components/layout';
import * as configApi from '../services/configApi';
import type { APIConfig } from '../../../shared/types';

export const APISettingsPage = () => {
  const [form] = Form.useForm();
  const [configs, setConfigs] = useState<APIConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<APIConfig | null>(null);

  // 加载配置列表
  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await configApi.getAPIConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('加载配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  // 创建或更新配置
  const handleSave = async (values: any) => {
    try {
      if (editingConfig) {
        await configApi.updateAPIConfig(editingConfig.id, values);
        message.success('配置更新成功');
      } else {
        await configApi.createAPIConfig(values);
        message.success('配置创建成功');
      }
      setModalVisible(false);
      setEditingConfig(null);
      form.resetFields();
      loadConfigs();
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  };

  // 编辑配置
  const handleEdit = (config: APIConfig) => {
    setEditingConfig(config);
    form.setFieldsValue({
      name: config.name,
      type: config.type,
      apiKey: config.apiKey,
      endpoint: config.endpoint,
    });
    setModalVisible(true);
  };

  // 删除配置
  const handleDelete = async (id: string) => {
    try {
      await configApi.deleteAPIConfig(id);
      message.success('配置删除成功');
      loadConfigs();
    } catch (error) {
      console.error('删除配置失败:', error);
    }
  };

  // 打开创建对话框
  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          openai: 'OpenAI',
          'stable-diffusion': 'Stable Diffusion',
          custom: '自定义',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (key: string) => (key ? '••••••••' : '-'),
    },
    {
      title: 'API端点',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (endpoint: string) => endpoint || '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: APIConfig) => (
        <Space>
          <Button
            size="small"
            icon={<Edit size={14} />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此配置吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<Trash2 size={14} />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">API配置</h1>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            添加配置
          </Button>
        </div>

        <Card className="bg-dark-surface border-dark-border">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={configs}
              rowKey="id"
              pagination={false}
            />
          </Spin>
        </Card>

        {/* 创建/编辑对话框 */}
        <Modal
          title={editingConfig ? '编辑API配置' : '添加API配置'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingConfig(null);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          okText="保存"
          cancelText="取消"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              label="API类型"
              name="type"
              rules={[{ required: true, message: '请选择API类型' }]}
            >
              <Select placeholder="选择API类型">
                <Select.Option value="openai">OpenAI</Select.Option>
                <Select.Option value="stable-diffusion">Stable Diffusion</Select.Option>
                <Select.Option value="custom">自定义</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="API名称"
              name="name"
              rules={[{ required: true, message: '请输入API名称' }]}
            >
              <Input placeholder="输入API名称" />
            </Form.Item>

            <Form.Item
              label="API Key"
              name="apiKey"
            >
              <Input.Password placeholder="输入API Key" />
            </Form.Item>

            <Form.Item
              label="API端点"
              name="endpoint"
            >
              <Input placeholder="输入API端点URL（可选）" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};
