import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// 加载环境变量
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 健康检查
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'AI工作流系统后端服务运行中' });
});

// API路由
app.get('/api', (_req: Request, res: Response) => {
  res.json({ 
    message: 'AI工作流系统 API',
    version: '1.0.0'
  });
});

// WebSocket连接
io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('客户端已断开:', socket.id);
  });
});

// 错误处理
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 WebSocket服务已启动`);
});

export { app, io };
