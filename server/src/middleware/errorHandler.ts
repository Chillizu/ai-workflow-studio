import { Request, Response, NextFunction } from 'express';

/**
 * 错误处理中间件
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('错误:', err);
  
  // Multer错误
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: '文件上传错误',
      message: err.message
    });
  }
  
  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '验证错误',
      message: err.message
    });
  }
  
  // 默认错误
  return res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '发生了一个错误'
  });
};

/**
 * 404处理中间件
 */
export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    error: '未找到',
    message: `路由 ${req.method} ${req.path} 不存在`
  });
};
