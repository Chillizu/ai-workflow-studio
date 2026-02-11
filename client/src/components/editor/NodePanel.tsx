import { Card, Tooltip } from 'antd';
import {
  Type,
  Image,
  FileText,
  ImageIcon,
  Merge,
  Sparkles,
  GripVertical
} from 'lucide-react';

const nodeTypes = [
  {
    type: 'textInput',
    label: '文本输入',
    icon: Type,
    color: '#3b82f6', // blue-500
    description: '输入静态文本内容',
  },
  {
    type: 'imageInput',
    label: '图片输入',
    icon: Image,
    color: '#8b5cf6', // violet-500
    description: '上传或输入图片URL',
  },
  {
    type: 'textOutput',
    label: '文本输出',
    icon: FileText,
    color: '#10b981', // emerald-500
    description: '显示处理后的文本结果',
  },
  {
    type: 'imageOutput',
    label: '图片输出',
    icon: ImageIcon,
    color: '#f59e0b', // amber-500
    description: '显示生成的图片结果',
  },
  {
    type: 'textMerge',
    label: '文本合并',
    icon: Merge,
    color: '#6366f1', // indigo-500
    description: '将多个文本输入合并为一个',
  },
  {
    type: 'aiImage',
    label: 'AI生图',
    icon: Sparkles,
    color: '#ec4899', // pink-500
    description: '使用AI模型生成图片',
  },
];

export const NodePanel = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">组件库</h3>
        <div className="grid grid-cols-1 gap-3">
          {nodeTypes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                className="group relative flex items-center gap-3 p-3 rounded-lg bg-dark-bg border border-dark-border cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-md transition-all duration-200"
              >
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-md bg-opacity-20 transition-colors"
                  style={{ backgroundColor: `${node.color}20`, color: node.color }}
                >
                  <Icon size={20} />
                </div>
                
                <div className="flex-1">
                   <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">{node.label}</div>
                   <div className="text-xs text-gray-500 truncate">{node.description}</div>
                </div>

                <div className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                   <GripVertical size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
