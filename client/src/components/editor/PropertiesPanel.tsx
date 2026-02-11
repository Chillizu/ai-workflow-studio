import { Form, Input, Select, Card, InputNumber } from 'antd';
import type { Node } from '@xyflow/react';
import { useEffect, useState } from 'react';
import * as configApi from '../../services/configApi';
import type { APIConfig } from '../../../../shared/types';

interface PropertiesPanelProps {
  node: Node;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node }) => {
  const [apiConfigs, setApiConfigs] = useState<APIConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | undefined>(
    node.data?.config?.apiConfigId
  );
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // 加载API配置列表
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const configs = await configApi.getAPIConfigs();
        setApiConfigs(configs);
      } catch (error) {
        console.error('加载API配置失败:', error);
      }
    };
    loadConfigs();
  }, []);

  // 当选择配置时，加载可用模型
  useEffect(() => {
    const loadModels = async () => {
      if (!selectedConfigId) {
        setAvailableModels([]);
        return;
      }

      setLoadingModels(true);
      try {
        const models = await configApi.getAvailableModels(selectedConfigId);
        setAvailableModels(models);
      } catch (error) {
        console.error('加载模型列表失败:', error);
        setAvailableModels([]);
      } finally {
        setLoadingModels(false);
      }
    };
    loadModels();
  }, [selectedConfigId]);

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
            <Form.Item label={<span className="text-white">API配置</span>}>
              <Select
                placeholder="选择API配置"
                value={selectedConfigId}
                onChange={setSelectedConfigId}
              >
                {apiConfigs.map(config => (
                  <Select.Option key={config.id} value={config.id}>
                    {config.name} ({config.type})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedConfigId && (
              <>
                <Form.Item label={<span className="text-white">模型</span>}>
                  <Select
                    placeholder="选择模型"
                    loading={loadingModels}
                    defaultValue={node.data?.config?.model}
                  >
                    {availableModels.map(model => (
                      <Select.Option key={model} value={model}>
                        {model}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={<span className="text-white">图片宽度</span>}>
                  <InputNumber
                    min={256}
                    max={2048}
                    step={64}
                    defaultValue={node.data?.config?.width || 1024}
                    placeholder="1024"
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item label={<span className="text-white">图片高度</span>}>
                  <InputNumber
                    min={256}
                    max={2048}
                    step={64}
                    defaultValue={node.data?.config?.height || 1024}
                    placeholder="1024"
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item label={<span className="text-white">采样步数</span>}>
                  <InputNumber
                    min={1}
                    max={150}
                    defaultValue={node.data?.config?.steps || 30}
                    placeholder="30"
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item label={<span className="text-white">CFG Scale</span>}>
                  <InputNumber
                    min={1}
                    max={20}
                    step={0.5}
                    defaultValue={node.data?.config?.cfgScale || 7}
                    placeholder="7"
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item label={<span className="text-white">随机种子</span>}>
                  <InputNumber
                    min={-1}
                    max={2147483647}
                    defaultValue={node.data?.config?.seed || -1}
                    placeholder="-1 (随机)"
                    className="w-full"
                  />
                </Form.Item>
              </>
            )}
          </>
        )}
      </Form>
    </div>
  );
};
