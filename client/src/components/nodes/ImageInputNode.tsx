import { Handle, Position, NodeProps } from '@xyflow/react';
import { Image as ImageIcon } from 'lucide-react';
import { memo } from 'react';

interface ImageInputNodeData {
  label: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export const ImageInputNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as ImageInputNodeData;
  return (
    <div className={`px-4 py-3 bg-dark-surface border-2 rounded-lg shadow-lg min-w-[200px] transition-colors ${selected ? 'border-primary shadow-glow-sm' : 'border-purple-500/50 hover:border-purple-500'}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-500/10 rounded-md">
          <ImageIcon size={18} className="text-purple-500" />
        </div>
        <div className="font-semibold text-white">{nodeData.label}</div>
      </div>
      
      <div className="bg-dark-bg/50 rounded-md border border-dark-border/50 overflow-hidden flex items-center justify-center h-[120px] w-full">
         {nodeData.imageUrl ? (
            <img src={nodeData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
         ) : (
            <div className="text-gray-500 text-xs text-center p-4">
               未选择图片
            </div>
         )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />
    </div>
  );
});
