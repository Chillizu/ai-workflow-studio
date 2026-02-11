/**
 * API配置页面
 * 管理API配置，支持添加、编辑、删除、测试连接
 */

import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, Space, Table, Modal, Popconfirm, message, Spin, Tag } from 'antd';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { MainLayout } from '../components/layout';
import * as configApi from '../services/configApi';
import type { APIConfig } from '../../../shared/types';

export const APISettingsPage = () => {
  const [form] = Form.useForm();
  const [configs, setConfigs] = useState<APIConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<APIConfig | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('openai');

  // 加载配置列表
  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await configApi.getAPIConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('加载配置失败:', error);
      message.error('加载配置失败');
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
    } catch (error: any) {
      console.error('保存配置失败:', error);
      message.error(error.response?.data?.error || '保存配置失败');
    }
  };

  // 编辑配置
  const handleEdit = (config: APIConfig) => {
    setEditingConfig(config);
    setSelectedType(config.type);
    form.setFieldsValue({
      name: config.name,
      type: config.type,
      baseURL: config.baseURL,
      apiKey: '', // 不显示已保存的密钥
      defaultModel: config.defaultModel,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      rateLimitPerMinute: config.rateLimitPerMinute,
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
      message.error('删除配置失败');
    }
  };

  // 测试连接
  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const result = await configApi.testAPIConnection(id);
      if (result.success) {
        message.success('连接测试成功');
      } else {
        message.error(`连接测试失败: ${result.message}`);
      }
    } catch (error: any) {
      console.error('测试连接失败:', error);
      message.error(error.response?.data?.message || '测试连接失败');
    } finally {
      setTestingId(null);
    }
  };

  // 打开创建对话框
  const handleCreate = () => {
    setEditingConfig(null);
    setSelectedType('openai');
    form.resetFields();
    setModalVisible(true);
  };

  // 类型改变时更新baseURL
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const defaultBaseURLs: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      openrouter: 'https://openrouter.ai/api/v1',
      'openai-compatible': '',
      custom: '',
    };
    form.setFieldValue('baseURL', defaultBaseURLs[type] || '');
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
        const typeMap: Record<string, { label: string; color: string }> = {
          openai: { label: 'OpenAI', color: 'green' },
          openrouter: { label: 'OpenRouter', color: 'blue' },
          'openai-compatible': { label: 'OpenAI兼容', color: 'purple' },
          custom: { label: '自定义', color: 'orange' },
        };
        const config = typeMap[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'API密钥',
      dataIndex: 'hasApiKey',
      key: 'hasApiKey',
      render: (hasApiKey: boolean) =>
        hasApiKey ? (
          <Tag color="green" icon={<CheckCircle size={14} />}>
            已配置
          </Tag>
        ) : (
          <Tag color="red" icon={<XCircle size={14} />}>
            未配置
          </Tag>
        ),
    },
    {
      title: 'API端点',
      dataIndex: 'baseURL',
      key: 'baseURL',
      ellipsis: true,
    },
    {
      title: '默认模型',
      dataIndex: 'defaultModel',
      key: 'defaultModel',
      render: (model: string) => model || '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: APIConfig) => (
        <Space>
          <Button
            size="small"
            onClick={() => handleTestConnection(record.id)}
            loading={testingId === record.id}
          >
            测试连接
          </Button>
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
            <Button size="small" danger icon={<Trash2 size={14} />}>
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
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="API类型"
              name="type"
              rules={[{ required: true, message: '请选择API类型' }]}
              initialValue="openai"
            >
              <Select placeholder="选择API类型" onChange={handleTypeChange}>
                <Select.Option value="openai">OpenAI</Select.Option>
                <Select.Option value="openrouter">OpenRouter</Select.Option>
                <Select.Option value="openai-compatible">OpenAI兼容</Select.Option>
                <Select.Option value="custom">自定义</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="配置名称"
              name="name"
              rules={[{ required: true, message: '请输入配置名称' }]}
            >
              <Input placeholder="例如: 我的OpenAI配置" />
            </Form.Item>

            <Form.Item
              label="API端点 (baseURL)"
              name="baseURL"
              rules={[{ required: true, message: '请输入API端点' }]}
            >
              <Input placeholder="https://api.openai.com/v1" />
            </Form.Item>

            <Form.Item
              label="API密钥"
              name="apiKey"
              rules={[
                {
                  required: !editingConfig && (selectedType === 'openai' || selectedType === 'openrouter'),
                  message: '请输入API密钥',
                },
              ]}
            >
              <Input.Password
                placeholder={editingConfig ? '留空表示不修改' : '输入API密钥'}
              />
            </Form.Item>

            <Form.Item label="默认模型" name="defaultModel">
              <Input placeholder="例如: dall-e-3" />
            </Form.Item>

            <Form.Item label="超时时间 (毫秒)" name="timeout">
              <Input type="number" placeholder="60000" />
            </Form.Item>

            <Form.Item label="最大重试次数" name="maxRetries">
              <Input type="number" placeholder="3" />
            </Form.Item>

            <Form.Item label="每分钟请求限制" name="rateLimitPerMinute">
              <Input type="number" placeholder="60" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};
