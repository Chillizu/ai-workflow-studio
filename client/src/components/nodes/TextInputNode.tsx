import { Handle, Position } from '@xyflow/react';
import { Type } from 'lucide-react';

interface TextInputNodeProps {
  data: {
    label: string;
    value?: string;
  };
}

export const TextInputNode: React.FC<TextInputNodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-dark-surface border-2 border-blue-500 rounded-lg shadow-lg min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-500/20 rounded">
          <Type size={16} className="text-blue-500" />
        </div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      
      <div className="text-sm text-gray-400">
        {data.value || '文本输入节点'}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};
