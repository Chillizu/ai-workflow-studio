import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';
import { memo } from 'react';

interface TextOutputNodeData {
  label: string;
  value?: string;
  [key: string]: unknown;
}

export const TextOutputNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as TextOutputNodeData;
  return (
    <div className={`px-4 py-3 bg-dark-surface border-2 rounded-lg shadow-lg min-w-[200px] transition-colors ${selected ? 'border-primary shadow-glow-sm' : 'border-emerald-500/50 hover:border-emerald-500'}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-500/10 rounded-md">
          <FileText size={18} className="text-emerald-500" />
        </div>
        <div className="font-semibold text-white">{nodeData.label}</div>
      </div>
      
      <div className="bg-dark-bg/50 rounded-md border border-dark-border/50 p-2 min-h-[60px] max-h-[150px] overflow-y-auto custom-scrollbar">
         {nodeData.value ? (
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{nodeData.value}</p>
         ) : (
            <div className="text-gray-500 text-xs text-center pt-2">
               等待输出结果...
            </div>
         )}
      </div>
    </div>
  );
});
