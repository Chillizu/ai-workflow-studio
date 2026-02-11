import { Card, Form, Input, Button, Select, Space } from 'antd';
import { MainLayout } from '../components/layout';

export const APISettingsPage = () => {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('API配置:', values);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">API配置</h1>
        
        <Card className="bg-dark-surface border-dark-border max-w-2xl">
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
              <Input placeholder="输入API端点URL" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  保存配置
                </Button>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};
