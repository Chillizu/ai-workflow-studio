import { Handle, Position, NodeProps } from '@xyflow/react';
import { Type } from 'lucide-react';
import { memo } from 'react';

interface TextInputNodeData {
  label: string;
  value?: string;
  [key: string]: unknown;
}

export const TextInputNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as TextInputNodeData;
  return (
    <div className={`px-4 py-3 bg-dark-surface border-2 rounded-lg shadow-lg min-w-[200px] transition-colors ${selected ? 'border-primary shadow-glow-sm' : 'border-blue-500/50 hover:border-blue-500'}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/10 rounded-md">
          <Type size={18} className="text-blue-500" />
        </div>
        <div className="font-semibold text-white">{nodeData.label}</div>
      </div>
      
      <div className="text-sm text-gray-400 line-clamp-2">
        {nodeData.value || <span className="italic opacity-50">等待输入...</span>}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />
    </div>
  );
});
