import { Handle, Position, NodeProps } from '@xyflow/react';
import { Sparkles, Settings2 } from 'lucide-react';
import { memo } from 'react';

interface AIImageNodeData {
  label: string;
  model?: string;
  size?: string;
  [key: string]: unknown;
}

export const AIImageNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as AIImageNodeData;
  return (
    <div className={`px-4 py-3 bg-dark-surface border-2 rounded-lg shadow-lg min-w-[220px] transition-colors ${selected ? 'border-primary shadow-glow-sm' : 'border-pink-500/50 hover:border-pink-500'}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-pink-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-pink-500/10 rounded-md">
          <Sparkles size={18} className="text-pink-500" />
        </div>
        <div className="font-semibold text-white">{nodeData.label}</div>
      </div>
      
      <div className="space-y-2 bg-dark-bg/50 p-2 rounded-md border border-dark-border/50">
        <div className="flex items-center gap-2 text-xs text-gray-400">
           <Settings2 size={12} />
           <span className="truncate">{nodeData.model || '默认模型'}</span>
        </div>
        {nodeData.size && (
          <div className="text-xs text-gray-500 font-mono bg-dark-surfaceHighlight/50 px-1.5 py-0.5 rounded w-fit">
            {nodeData.size}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-pink-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />
    </div>
  );
});
