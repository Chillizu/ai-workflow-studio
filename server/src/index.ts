import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { EventEmitter } from 'events';

// 导入服务
import { WorkflowService } from './services/workflowService';
import { ExecutionService } from './services/executionService';
import { FileService } from './services/fileService';

// 导入引擎
import { createProcessorRegistry } from './engine/registry';
import { WorkflowEngine } from './engine/engine';

// 导入路由
import workflowsRouter from './routes/workflows';
import executionsRouter from './routes/executions';
import nodesRouter from './routes/nodes';
import filesRouter from './routes/files';
import configsRouter from './routes/configs';

// 导入中间件
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

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

// 初始化服务
const workflowService = new WorkflowService();
const executionService = new ExecutionService();
const fileService = new FileService();

// 初始化引擎
const eventEmitter = new EventEmitter();
const processorRegistry = createProcessorRegistry();
const workflowEngine = new WorkflowEngine(processorRegistry, eventEmitter);

// 将服务和引擎挂载到app.locals
app.locals.workflowService = workflowService;
app.locals.executionService = executionService;
app.locals.fileService = fileService;
app.locals.workflowEngine = workflowEngine;

// 初始化数据目录
async function initServices() {
  await workflowService.init();
  await executionService.init();
  await fileService.init();
  console.log('✅ 服务初始化完成');
}

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
    version: '1.0.0',
    endpoints: {
      workflows: '/api/workflows',
      executions: '/api/executions',
      nodes: '/api/nodes',
      files: '/api/files',
      configs: '/api/configs'
    }
  });
});

// 注册路由
app.use('/api/workflows', workflowsRouter);
app.use('/api/executions', executionsRouter);
app.use('/api/nodes', nodesRouter);
app.use('/api/files', filesRouter);
app.use('/api/configs', configsRouter);

// WebSocket事件处理
io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id);
  
  // 客户端加入执行房间
  socket.on('join:execution', (executionId: string) => {
    socket.join(executionId);
    console.log(`客户端 ${socket.id} 加入执行房间: ${executionId}`);
  });
  
  // 客户端离开执行房间
  socket.on('leave:execution', (executionId: string) => {
    socket.leave(executionId);
    console.log(`客户端 ${socket.id} 离开执行房间: ${executionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('客户端已断开:', socket.id);
  });
});

// 设置执行引擎事件监听
eventEmitter.on('execution:started', (data) => {
  io.to(data.executionId).emit('execution:started', data);
});

eventEmitter.on('node:progress', (data) => {
  io.to(data.executionId).emit('node:progress', data);
});

eventEmitter.on('execution:progress', (data) => {
  io.to(data.executionId).emit('execution:progress', data);
});

eventEmitter.on('execution:completed', (data) => {
  io.to(data.executionId).emit('execution:completed', data);
});

eventEmitter.on('execution:failed', (data) => {
  io.to(data.executionId).emit('execution:failed', data);
});

eventEmitter.on('execution:cancelled', (data) => {
  io.to(data.executionId).emit('execution:cancelled', data);
});

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
initServices().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📡 WebSocket服务已启动`);
    console.log(`📁 数据目录已初始化`);
  });
});

export { app, io };
