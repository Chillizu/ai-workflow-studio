import { Handle, Position, NodeProps } from '@xyflow/react';
import { Image as ImageIcon, Download } from 'lucide-react';
import { memo } from 'react';
import { Button } from 'antd';

interface ImageOutputNodeData {
  label: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export const ImageOutputNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as ImageOutputNodeData;
  return (
    <div className={`px-4 py-3 bg-dark-surface border-2 rounded-lg shadow-lg min-w-[200px] transition-colors ${selected ? 'border-primary shadow-glow-sm' : 'border-amber-500/50 hover:border-amber-500'}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-dark-surface hover:!w-4 hover:!h-4 transition-all"
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-500/10 rounded-md">
          <ImageIcon size={18} className="text-amber-500" />
        </div>
        <div className="font-semibold text-white">{nodeData.label}</div>
      </div>
      
      <div className="bg-dark-bg/50 rounded-md border border-dark-border/50 overflow-hidden flex items-center justify-center h-[150px] w-full relative group">
         {nodeData.imageUrl ? (
            <>
                <img src={nodeData.imageUrl} alt="Result" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={nodeData.imageUrl} download target="_blank" rel="noreferrer">
                        <Button type="primary" shape="circle" icon={<Download size={16} />} />
                    </a>
                </div>
            </>
         ) : (
            <div className="text-gray-500 text-xs text-center p-4">
               等待生成结果...
            </div>
         )}
      </div>
    </div>
  );
});
