import { Handle, Position } from '@xyflow/react';
import { Merge } from 'lucide-react';

interface TextMergeNodeProps {
  data: {
    label: string;
  };
}

export const TextMergeNode: React.FC<TextMergeNodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-dark-surface border-2 border-indigo-500 rounded-lg shadow-lg min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        id="input1"
        style={{ top: '30%' }}
        className="w-3 h-3 bg-indigo-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input2"
        style={{ top: '70%' }}
        className="w-3 h-3 bg-indigo-500"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-indigo-500/20 rounded">
          <Merge size={16} className="text-indigo-500" />
        </div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      
      <div className="text-sm text-gray-400">
        文本合并节点
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-indigo-500"
      />
    </div>
  );
};
