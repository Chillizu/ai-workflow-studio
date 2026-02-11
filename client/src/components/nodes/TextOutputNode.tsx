import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';

interface TextOutputNodeProps {
  data: {
    label: string;
    value?: string;
  };
}

export const TextOutputNode: React.FC<TextOutputNodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-dark-surface border-2 border-green-500 rounded-lg shadow-lg min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-green-500/20 rounded">
          <FileText size={16} className="text-green-500" />
        </div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      
      <div className="text-sm text-gray-400">
        {data.value || '文本输出节点'}
      </div>
    </div>
  );
};
