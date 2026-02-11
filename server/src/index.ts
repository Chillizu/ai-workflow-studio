import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { EventEmitter } from 'events';

// 导入服务
import { WorkflowService } from './services/workflowService';
import { ExecutionService } from './services/executionService';
import { FileService } from './services/fileService';
import { configService } from './services/configService';

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

// 导入配置
import { env } from './config/env';

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

const PORT = env.PORT;

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
app.locals.configService = configService;
app.locals.workflowEngine = workflowEngine;

// 初始化数据目录
async function initServices() {
  await workflowService.init();
  await executionService.init();
  await fileService.init();
  await configService.init();
  console.log('✅ 服务初始化完成');
}

// 中间件
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 缓存控制中间件
app.use((req, res, next) => {
  // 静态资源设置长期缓存
  if (req.path.startsWith('/uploads/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年
  }
  // API响应设置短期缓存
  else if (req.path.startsWith('/api/')) {
    // GET请求可以缓存
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=60'); // 1分钟
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
  next();
});

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 健康检查
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'AI工作流系统后端服务运行中' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', environment: env.NODE_ENV, timestamp: new Date().toISOString() });
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

// 生产环境静态文件服务
if (env.NODE_ENV === 'production') {
  // 指向前端构建目录
  // 在Docker环境中，我们通常会将前端构建产物复制到服务器的public目录或特定目录
  // 这里假设是在 monorepo 结构中运行，或者 Dockerfile 会保持这种结构
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  
  app.use(express.static(clientBuildPath));
  
  // 所有非API请求返回前端index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
initServices().then(() => {
  httpServer.listen(Number(PORT), env.HOST, () => {
    console.log(`🚀 服务器运行在 http://${env.HOST}:${PORT}`);
    console.log(`📡 WebSocket服务已启动`);
    console.log(`📁 数据目录已初始化`);
  });
});

export { app, io };
