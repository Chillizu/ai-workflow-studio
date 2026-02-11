import { Handle, Position } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';

interface ImageOutputNodeProps {
  data: {
    label: string;
    imageUrl?: string;
  };
}

export const ImageOutputNode: React.FC<ImageOutputNodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-dark-surface border-2 border-orange-500 rounded-lg shadow-lg min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-orange-500/20 rounded">
          <ImageIcon size={16} className="text-orange-500" />
        </div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      
      <div className="text-sm text-gray-400">
        {data.imageUrl ? '已生成图片' : '图片输出节点'}
      </div>
    </div>
  );
};
