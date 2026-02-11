import { Handle, Position } from '@xyflow/react';
import { Sparkles } from 'lucide-react';

interface AIImageNodeProps {
  data: {
    label: string;
    model?: string;
    size?: string;
  };
}

export const AIImageNode: React.FC<AIImageNodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-dark-surface border-2 border-pink-500 rounded-lg shadow-lg min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-pink-500"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-pink-500/20 rounded">
          <Sparkles size={16} className="text-pink-500" />
        </div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      
      <div className="text-sm text-gray-400">
        {data.model || 'AI生图节点'}
      </div>
      {data.size && (
        <div className="text-xs text-gray-500 mt-1">
          {data.size}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-pink-500"
      />
    </div>
  );
};
