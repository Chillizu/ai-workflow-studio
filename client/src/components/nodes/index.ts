import { TextInputNode } from './TextInputNode';
import { ImageInputNode } from './ImageInputNode';
import { TextOutputNode } from './TextOutputNode';
import { ImageOutputNode } from './ImageOutputNode';
import { TextMergeNode } from './TextMergeNode';
import { AIImageNode } from './AIImageNode';

export const nodeTypes = {
  textInput: TextInputNode,
  imageInput: ImageInputNode,
  textOutput: TextOutputNode,
  imageOutput: ImageOutputNode,
  textMerge: TextMergeNode,
  aiImage: AIImageNode,
};

export {
  TextInputNode,
  ImageInputNode,
  TextOutputNode,
  ImageOutputNode,
  TextMergeNode,
  AIImageNode,
};
