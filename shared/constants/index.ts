/**
 * 节点类型常量
 */
export const NODE_TYPES = {
  // 输入节点
  TEXT_INPUT: 'textInput',
  IMAGE_INPUT: 'imageInput',
  NUMBER_INPUT: 'numberInput',
  
  // 处理节点
  AI_IMAGE_GENERATION: 'aiImageGeneration',
  TEXT_MERGE: 'textMerge',
  TEXT_TEMPLATE: 'textTemplate',
  IMAGE_RESIZE: 'imageResize',
  IMAGE_FILTER: 'imageFilter',
  
  // 输出节点
  IMAGE_OUTPUT: 'imageOutput',
  TEXT_OUTPUT: 'textOutput',
  FILE_DOWNLOAD: 'fileDownload',
  
  // 逻辑节点
  CONDITIONAL: 'conditional',
  LOOP: 'loop'
} as const;

/**
 * API类型常量
 */
export const API_TYPES = {
  OPENAI: 'openai',
  STABLE_DIFFUSION: 'stable-diffusion',
  CUSTOM: 'custom'
} as const;

/**
 * 执行状态常量
 */
export const EXECUTION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;
