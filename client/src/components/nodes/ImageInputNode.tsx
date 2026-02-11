import { Handle, Position } from '@xyflow/react';
import { Image } from 'lucide-react';

interface ImageInputNodeProps {
  data: {
    label: string;
    imageUrl?: string;
  };
}

export const ImageInputNode: React.FC<ImageInputNodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-dark-surface border-2 border-purple-500 rounded-lg shadow-lg min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-purple-500/20 rounded">
          <Image size={16} className="text-purple-500" />
        </div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      
      <div className="text-sm text-gray-400">
        {data.imageUrl ? '已选择图片' : '图片输入节点'}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
};
