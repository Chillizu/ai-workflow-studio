import { Form, Input, Select, Card, InputNumber, Divider, Switch } from 'antd';
import type { Node } from '@xyflow/react';
import { useEffect, useState } from 'react';
import * as configApi from '../../services/configApi';
import type { APIConfig } from '../../../../shared/types';
import { Settings, Info, Hash, Type } from 'lucide-react';

interface PropertiesPanelProps {
  node: Node;
  onUpdate?: (node: Node) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onUpdate }) => {
  const [form] = Form.useForm();
  const [apiConfigs, setApiConfigs] = useState<APIConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | undefined>(
    node.data?.config?.apiConfigId
  );
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Load API configs
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

  // Update form when node changes
  useEffect(() => {
    form.setFieldsValue({
      label: node.data?.label,
      ...node.data?.config, // Flatten config for form
    });
    setSelectedConfigId(node.data?.config?.apiConfigId);
  }, [node, form]);

  // Load models when config changes
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

  const handleValuesChange = (_: any, allValues: any) => {
    if (!onUpdate) return;

    const { label, ...configValues } = allValues;
    
    // Construct the updated node
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        label: label,
        config: {
            ...node.data.config,
            ...configValues,
            apiConfigId: selectedConfigId || configValues.apiConfigId, // Ensure config ID is captured if it was set separately
        },
      },
    };
    
    onUpdate(updatedNode);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
          <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm font-medium">
             <Info size={14} /> 基础信息
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID</span>
              <span className="text-gray-300 font-mono truncate max-w-[120px]" title={node.id}>{node.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">类型</span>
              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{node.type}</span>
            </div>
          </div>
        </div>

        <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
            initialValues={{
                label: node.data?.label,
                ...node.data?.config
            }}
        >
            <Form.Item label="节点名称" name="label">
                <Input prefix={<Type size={16} className="text-gray-500" />} placeholder="输入节点名称" />
            </Form.Item>

            {/* Dynamic Fields based on Node Type */}
            {node.type === 'textInput' && (
                <Form.Item label="默认文本" name="defaultText">
                    <Input.TextArea rows={4} placeholder="输入默认文本内容..." />
                </Form.Item>
            )}

            {node.type === 'aiImage' && (
                <div className="space-y-4">
                    <Divider className="border-dark-border"><span className="text-gray-500 text-xs">生成参数</span></Divider>
                    
                    <Form.Item label="API 配置" name="apiConfigId">
                        <Select
                            placeholder="选择 API 配置"
                            onChange={setSelectedConfigId}
                            options={apiConfigs.map(c => ({ label: c.name, value: c.id }))}
                        />
                    </Form.Item>

                    {selectedConfigId && (
                        <>
                            <Form.Item label="模型" name="model">
                                <Select
                                    placeholder="选择模型"
                                    loading={loadingModels}
                                    options={availableModels.map(m => ({ label: m, value: m }))}
                                />
                            </Form.Item>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item label="宽度" name="width">
                                    <InputNumber className="w-full" min={256} max={2048} step={64} />
                                </Form.Item>
                                <Form.Item label="高度" name="height">
                                    <InputNumber className="w-full" min={256} max={2048} step={64} />
                                </Form.Item>
                            </div>

                            <Form.Item label="采样步数" name="steps">
                                <InputNumber className="w-full" min={1} max={150} />
                            </Form.Item>

                            <Form.Item label="提示词相关性 (CFG)" name="cfgScale">
                                <InputNumber className="w-full" min={1} max={20} step={0.5} />
                            </Form.Item>

                            <Form.Item label="随机种子" name="seed" help="设置为 -1 使用随机种子">
                                <InputNumber className="w-full" min={-1} placeholder="-1" prefix={<Hash size={14} className="text-gray-500"/>} />
                            </Form.Item>
                        </>
                    )}
                </div>
            )}
            
            {/* Add more node type configurations here as needed */}
        </Form>
      </div>
    </div>
  );
};
