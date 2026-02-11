/**
 * API配置页面
 * 管理API配置，支持添加、编辑、删除、测试连接
 */

import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, Space, Table, Modal, Popconfirm, message, Spin, Tag, Tooltip } from 'antd';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Key, Server, Zap, Globe } from 'lucide-react';
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
      render: (text: string, record: APIConfig) => (
         <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${record.type === 'openai' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
               <Globe size={16} />
            </div>
            <span className="font-medium text-white">{text}</span>
         </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          openai: { label: 'OpenAI', color: 'green' },
          openrouter: { label: 'OpenRouter', color: 'blue' },
          'openai-compatible': { label: 'OpenAI Compatible', color: 'purple' },
          custom: { label: 'Custom', color: 'orange' },
        };
        const config = typeMap[type] || { label: type, color: 'default' };
        return <Tag color={config.color} className="border-none">{config.label}</Tag>;
      },
    },
    {
      title: 'API密钥',
      dataIndex: 'hasApiKey',
      key: 'hasApiKey',
      render: (hasApiKey: boolean) =>
        hasApiKey ? (
          <Tooltip title="已配置">
             <Key size={16} className="text-emerald-500" />
          </Tooltip>
        ) : (
          <Tooltip title="未配置">
             <Key size={16} className="text-gray-600" />
          </Tooltip>
        ),
    },
    {
      title: 'API端点',
      dataIndex: 'baseURL',
      key: 'baseURL',
      ellipsis: true,
      render: (url: string) => <span className="text-gray-400 font-mono text-xs">{url}</span>
    },
    {
      title: '默认模型',
      dataIndex: 'defaultModel',
      key: 'defaultModel',
      render: (model: string) => model ? <Tag className="bg-dark-bg border-dark-border text-gray-300">{model}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: APIConfig) => (
        <Space>
          <Button
            size="small"
            icon={<Zap size={14} />}
            onClick={() => handleTestConnection(record.id)}
            loading={testingId === record.id}
            className="text-yellow-500 border-yellow-500/20 hover:text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10"
          >
            测试
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
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-2xl font-bold text-white mb-1">API 服务配置</h1>
             <p className="text-gray-400">管理 LLM 服务提供商的连接设置</p>
          </div>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            添加配置
          </Button>
        </div>

        <Card className="bg-dark-surface border-dark-border shadow-md">
          <Table
            columns={columns}
            dataSource={configs}
            rowKey="id"
            pagination={false}
            loading={loading}
            className="ant-table-custom"
          />
        </Card>

        {/* 创建/编辑对话框 */}
        <Modal
          title={editingConfig ? '编辑 API 配置' : '添加 API 配置'}
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
          centered
        >
          <Form form={form} layout="vertical" onFinish={handleSave} className="pt-4">
            <div className="grid grid-cols-2 gap-4">
               <Form.Item
                 label="API 类型"
                 name="type"
                 rules={[{ required: true, message: '请选择API类型' }]}
                 initialValue="openai"
               >
                 <Select placeholder="选择API类型" onChange={handleTypeChange}>
                   <Select.Option value="openai">OpenAI</Select.Option>
                   <Select.Option value="openrouter">OpenRouter</Select.Option>
                   <Select.Option value="openai-compatible">OpenAI Compatible</Select.Option>
                   <Select.Option value="custom">Custom</Select.Option>
                 </Select>
               </Form.Item>

               <Form.Item
                 label="配置名称"
                 name="name"
                 rules={[{ required: true, message: '请输入配置名称' }]}
               >
                 <Input placeholder="例如: Production OpenAI" />
               </Form.Item>
            </div>

            <Form.Item
              label="API 端点 (Base URL)"
              name="baseURL"
              rules={[{ required: true, message: '请输入API端点' }]}
              help={<span className="text-xs text-gray-500">API 服务的根地址</span>}
            >
              <Input prefix={<Server size={14} className="text-gray-400"/>} placeholder="https://api.openai.com/v1" />
            </Form.Item>

            <Form.Item
              label="API 密钥"
              name="apiKey"
              rules={[
                {
                  required: !editingConfig && (selectedType === 'openai' || selectedType === 'openrouter'),
                  message: '请输入API密钥',
                },
              ]}
              help={<span className="text-xs text-gray-500">密钥将安全加密存储</span>}
            >
              <Input.Password
                prefix={<Key size={14} className="text-gray-400"/>}
                placeholder={editingConfig ? '留空保持不变' : 'sk-...'}
              />
            </Form.Item>

            <Form.Item label="默认模型" name="defaultModel">
              <Input placeholder="例如: gpt-4-turbo" />
            </Form.Item>

            <div className="grid grid-cols-3 gap-4">
               <Form.Item label="超时 (ms)" name="timeout">
                 <Input type="number" placeholder="60000" />
               </Form.Item>

               <Form.Item label="重试次数" name="maxRetries">
                 <Input type="number" placeholder="3" />
               </Form.Item>

               <Form.Item label="速率限制 (/min)" name="rateLimitPerMinute">
                 <Input type="number" placeholder="60" />
               </Form.Item>
            </div>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};
