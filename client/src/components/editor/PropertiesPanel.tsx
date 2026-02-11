import { Form, Input, Select, Card } from 'antd';
import type { Node } from '@xyflow/react';

interface PropertiesPanelProps {
  node: Node;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold text-white mb-4">节点属性</h3>
      
      <Card className="bg-dark-hover border-dark-border mb-4">
        <div className="space-y-2">
          <div>
            <span className="text-gray-400 text-sm">节点ID:</span>
            <p className="text-white font-mono text-sm">{node.id}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">节点类型:</span>
            <p className="text-white">{node.type || 'default'}</p>
          </div>
        </div>
      </Card>

      <Form layout="vertical">
        <Form.Item label={<span className="text-white">标签</span>}>
          <Input
            defaultValue={node.data?.label as string}
            placeholder="输入节点标签"
          />
        </Form.Item>

        {node.type === 'textInput' && (
          <Form.Item label={<span className="text-white">默认文本</span>}>
            <Input.TextArea
              rows={4}
              placeholder="输入默认文本"
            />
          </Form.Item>
        )}

        {node.type === 'aiImage' && (
          <>
            <Form.Item label={<span className="text-white">模型</span>}>
              <Select placeholder="选择模型">
                <Select.Option value="dall-e-3">DALL-E 3</Select.Option>
                <Select.Option value="stable-diffusion">Stable Diffusion</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-white">图片尺寸</span>}>
              <Select placeholder="选择尺寸">
                <Select.Option value="1024x1024">1024x1024</Select.Option>
                <Select.Option value="1024x1792">1024x1792</Select.Option>
                <Select.Option value="1792x1024">1792x1024</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </div>
  );
};
