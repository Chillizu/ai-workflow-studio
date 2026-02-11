import { Card } from 'antd';
import {
  Type,
  Image,
  FileText,
  ImageIcon,
  Merge,
  Sparkles,
} from 'lucide-react';

const nodeTypes = [
  {
    type: 'textInput',
    label: '文本输入',
    icon: Type,
    color: '#3b82f6',
  },
  {
    type: 'imageInput',
    label: '图片输入',
    icon: Image,
    color: '#8b5cf6',
  },
  {
    type: 'textOutput',
    label: '文本输出',
    icon: FileText,
    color: '#10b981',
  },
  {
    type: 'imageOutput',
    label: '图片输出',
    icon: ImageIcon,
    color: '#f59e0b',
  },
  {
    type: 'textMerge',
    label: '文本合并',
    icon: Merge,
    color: '#6366f1',
  },
  {
    type: 'aiImage',
    label: 'AI生图',
    icon: Sparkles,
    color: '#ec4899',
  },
];

export const NodePanel = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">节点面板</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <Card
              key={node.type}
              className="cursor-move hover:shadow-lg transition-shadow bg-dark-hover border-dark-border"
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded"
                  style={{ backgroundColor: `${node.color}20` }}
                >
                  <Icon size={20} style={{ color: node.color }} />
                </div>
                <span className="text-white font-medium">{node.label}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
