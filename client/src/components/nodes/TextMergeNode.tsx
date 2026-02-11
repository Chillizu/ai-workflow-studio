import { Handle, Position, NodeProps } from '@xyflow/react';
import { Merge } from 'lucide-react';
import { memo } from 'react';

interface TextMergeNodeData {
  label: string;
  [key: string]: unknown;
}

export const TextMergeNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as TextMergeNodeData;
  return (
    <div className={`px-4 py-3 bg-dark-surface border-2 rounded-lg shadow-lg min-w-[200px] transition-colors ${selected ? 'border-primary shadow-glow-sm' : 'border-indigo-500/50 hover:border-indigo-500'}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="input1"
        style={{ top: '30%' }}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input2"
        style={{ top: '70%' }}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-500/10 rounded-md">
          <Merge size={18} className="text-indigo-500" />
        </div>
        <div className="font-semibold text-white">{nodeData.label}</div>
      </div>
      
      <div className="text-sm text-gray-400 text-center py-2">
        合并输入的文本
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />
    </div>
  );
});
