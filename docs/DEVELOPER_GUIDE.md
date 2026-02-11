# 开发者指南

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 开发环境设置](#2-开发环境设置)
- [3. 架构设计](#3-架构设计)
- [4. 核心模块说明](#4-核心模块说明)
- [5. API文档](#5-api文档)
- [6. 扩展开发](#6-扩展开发)
- [7. 测试指南](#7-测试指南)
- [8. 贡献指南](#8-贡献指南)

---

## 1. 项目概述

### 1.1 项目简介

这是一个基于Node.js的可视化AI工作流编排系统，允许用户通过拖拽方式创建、配置和执行AI图像生成工作流。系统采用前后端分离架构，支持多种AI服务提供商。

### 1.2 技术栈

#### 前端技术栈
- **React 19** - UI框架
- **TypeScript** - 类型安全
- **React Flow** - 工作流可视化编辑器
- **Zustand** - 状态管理
- **Ant Design** - UI组件库
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具
- **Socket.io Client** - 实时通信

#### 后端技术栈
- **Node.js** - 运行时环境
- **Express** - Web框架
- **TypeScript** - 类型安全
- **Socket.io** - WebSocket服务
- **Multer** - 文件上传处理
- **Sharp** - 图像处理
- **Zod** - 运行时数据验证
- **UUID** - 唯一标识符生成

#### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Nodemon** - 开发热重载
- **npm workspaces** - Monorepo管理

### 1.3 目录结构

```
NodeAPI/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   │   ├── editor/    # 编辑器组件
│   │   │   ├── layout/    # 布局组件
│   │   │   └── nodes/     # 节点组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── store/         # 状态管理
│   │   └── main.tsx       # 入口文件
│   ├── public/            # 静态资源
│   └── vite.config.ts     # Vite配置
├── server/                # 后端应用
│   ├── src/
│   │   ├── adapters/      # API适配器
│   │   ├── controllers/   # 控制器
│   │   ├── engine/        # 执行引擎
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── nodes/         # 节点处理器
│   │   ├── routes/        # 路由定义
│   │   ├── services/      # 业务逻辑
│   │   ├── types/         # 类型定义
│   │   ├── utils/         # 工具函数
│   │   └── index.ts       # 入口文件
│   └── server/            # 数据存储目录
│       ├── workflows/     # 工作流数据
│       ├── configs/       # 配置数据
│       ├── executions/    # 执行历史
│       └── uploads/       # 上传文件
├── shared/                # 共享代码
│   ├── types/             # 共享类型定义
│   └── constants/         # 共享常量
├── docs/                  # 文档
├── plans/                 # 设计文档
└── package.json           # 根配置文件
```

### 1.4 设计理念

#### 模块化设计
- **关注点分离**：前端、后端、共享代码分离
- **可插拔架构**：节点处理器、API适配器均可扩展
- **单一职责**：每个模块专注于特定功能

#### 可扩展性
- **处理器注册系统**：动态注册新的节点类型
- **适配器工厂模式**：轻松添加新的AI服务提供商
- **事件驱动架构**：解耦组件间的通信

#### 性能优化
- **并行执行**：同一层级的节点并行处理
- **智能缓存**：API响应缓存和文件缓存
- **流式处理**：大文件上传和下载

#### 用户体验
- **实时反馈**：WebSocket推送执行进度
- **直观编辑**：可视化拖拽编辑器
- **错误处理**：详细的错误信息和日志

---

## 2. 开发环境设置

### 2.1 前置要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: Windows、macOS、Linux
- **编辑器**: 推荐 VS Code

### 2.2 克隆和安装

```bash
# 克隆仓库
git clone <repository-url>
cd NodeAPI

# 安装所有依赖（包括子项目）
npm run install:all

# 或分别安装
npm install              # 根目录依赖
cd client && npm install # 前端依赖
cd ../server && npm install # 后端依赖
```

### 2.3 开发服务器启动

#### 启动完整应用
```bash
# 从根目录同时启动前后端
npm run dev
```

#### 分别启动
```bash
# 启动后端服务器（端口3000）
cd server
npm run dev

# 启动前端开发服务器（端口5173）
cd client
npm run dev
```

### 2.4 环境变量配置

创建环境变量文件（可选）：

**server/.env**
```env
PORT=3000
NODE_ENV=development
```

### 2.5 构建和部署

#### 开发构建
```bash
npm run build
```

#### 生产构建
```bash
# 构建前端
cd client
npm run build

# 构建后端
cd ../server
npm run build
```

#### 生产部署
```bash
# 启动生产服务器
cd server
npm start
```

### 2.6 常用开发命令

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 清理构建产物
npm run clean
```

---

## 3. 架构设计

### 3.1 前端架构

#### 技术选型
- **React Flow**: 提供可视化节点编辑能力
- **Zustand**: 轻量级状态管理，避免Redux的复杂性
- **Ant Design**: 完整的UI组件库，提升开发效率

#### 组件层次
```
App
├── MainLayout
│   ├── Header（顶部导航）
│   ├── Sidebar（侧边栏）
│   └── Content（主内容区）
│       ├── EditorPage（工作流编辑器）
│       │   ├── NodePanel（节点面板）
│       │   ├── PropertiesPanel（属性面板）
│       │   └── ReactFlowCanvas（画布）
│       ├── WorkflowsPage（工作流列表）
│       ├── APISettingsPage（API设置）
│       └── ExecutionsPage（执行历史）
```

#### 状态管理
使用Zustand进行状态管理，主要状态包括：

**workflowStore**
```typescript
{
  workflow: Workflow | null,      // 当前工作流
  selectedNode: string | null,    // 选中的节点
  setWorkflow: (workflow) => void,
  addNode: (node) => void,
  updateNode: (id, data) => void,
  deleteNode: (id) => void,
  addEdge: (edge) => void,
  deleteEdge: (id) => void
}
```

**executionStore**
```typescript
{
  executions: Execution[],        // 执行历史
  currentExecution: Execution | null,
  isExecuting: boolean,
  progress: number,
  addExecution: (execution) => void,
  updateExecutionStatus: (id, status) => void
}
```

#### 数据流设计
1. **用户操作** → React组件事件处理
2. **组件事件** → Zustand Action
3. **Action** → API调用（通过services层）
4. **API响应** → 更新Store状态
5. **状态变化** → 触发组件重新渲染

### 3.2 后端架构

#### 分层架构
```
Routes（路由层）
    ↓
Controllers（控制器层）
    ↓
Services（业务逻辑层）
    ↓
Models/Utils（数据访问层）
```

#### 核心模块
- **Routes**: 定义HTTP端点和请求处理
- **Services**: 实现业务逻辑（工作流管理、执行管理等）
- **Engine**: 工作流执行引擎
- **Adapters**: AI服务API适配器
- **Middleware**: 中间件（错误处理、文件上传等）

#### 事件驱动架构
使用EventEmitter实现组件间的解耦通信：

```typescript
// 执行事件
execution:started  → 执行开始
execution:progress → 执行进度更新
execution:completed → 执行完成
execution:failed   → 执行失败
execution:cancelled → 执行取消

// 节点事件
node:started   → 节点开始执行
node:completed → 节点执行完成
node:failed    → 节点执行失败
```

### 3.3 数据流设计

#### 工作流创建流程
```
用户在编辑器中创建工作流
    ↓
前端保存到workflowStore
    ↓
调用POST /api/workflows
    ↓
后端验证数据（Zod）
    ↓
WorkflowService.create()
    ↓
保存到文件系统
    ↓
返回工作流ID
```

#### 工作流执行流程
```
用户点击执行按钮
    ↓
调用POST /api/workflows/:id/execute
    ↓
WorkflowEngine.execute()
    ↓
1. 验证工作流（Validator）
2. 拓扑排序节点（Sorter）
3. 创建执行上下文（Context）
4. 按层级并行执行节点（Executor）
    ↓
发送实时进度（WebSocket）
    ↓
保存执行结果（ExecutionService）
    ↓
返回执行结果
```

---

## 4. 核心模块说明

### 4.1 工作流执行引擎

**位置**: `server/src/engine/engine.ts`

#### WorkflowEngine类
核心职责：协调整个工作流的执行流程

**关键方法**:

##### `execute(workflow: Workflow)`
执行工作流的主方法

```typescript
async execute(workflow: Workflow): Promise<ExecutionResult> {
  const executionId = uuid();
  
  // 1. 验证工作流
  const errors = this.validator.validate(workflow);
  if (errors.length > 0) {
    return { executionId, status: 'failed', errors };
  }
  
  // 2. 分组节点为执行层级（拓扑排序）
  const levels = this.groupNodesByLevel(workflow.nodes, workflow.edges);
  
  // 3. 创建执行上下文
  const context = new ExecutionContext(executionId, workflow.id, workflow);
  
  // 4. 发送开始事件
  this.eventEmitter.emit('execution:started', { executionId, workflowId });
  
  // 5. 按层级并行执行节点
  for (const level of levels) {
    await Promise.all(
      level.map(nodeId => this.executor.execute(nodeId, context))
    );
  }
  
  // 6. 返回结果
  return { executionId, status: 'completed', results: context.getAllResults() };
}
```

##### `groupNodesByLevel(nodes, edges)`
使用BFS算法将节点分组为执行层级，同一层级的节点可以并行执行

**算法流程**:
1. 计算每个节点的入度（依赖数量）
2. 找出所有入度为0的节点作为第一层
3. 执行完第一层后，减少依赖节点的入度
4. 重复步骤2-3，直到所有节点分组完成

```typescript
private groupNodesByLevel(nodes: BaseNode[], edges: Edge[]): string[][] {
  const levels: string[][] = [];
  const inDegree = new Map<string, number>();
  
  // 初始化入度
  nodes.forEach(node => inDegree.set(node.id, 0));
  edges.forEach(edge => {
    const current = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, current + 1);
  });
  
  // BFS分层
  const processed = new Set<string>();
  while (processed.size < nodes.length) {
    const currentLevel: string[] = [];
    
    // 找出入度为0的节点
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0 && !processed.has(nodeId)) {
        currentLevel.push(nodeId);
      }
    }
    
    if (currentLevel.length === 0) break; // 循环依赖
    
    levels.push(currentLevel);
    
    // 更新入度
    currentLevel.forEach(nodeId => {
      processed.add(nodeId);
      inDegree.set(nodeId, -1);
      edges.forEach(edge => {
        if (edge.source === nodeId) {
          const targetDegree = inDegree.get(edge.target) || 0;
          inDegree.set(edge.target, targetDegree - 1);
        }
      });
    });
  }
  
  return levels;
}
```

### 4.2 节点处理器系统

**位置**: `server/src/nodes/processors/`

#### 处理器架构
所有节点处理器继承自`NodeProcessor`基类：

```typescript
abstract class NodeProcessor {
  abstract process(node: BaseNode, context: ExecutionContext): Promise<any>;
  protected getInputValue(context: ExecutionContext, inputName: string): any;
}
```

#### 文本处理器
**位置**: `server/src/nodes/processors/text.ts`

##### TextInputProcessor
处理文本输入节点，直接返回配置的文本内容

```typescript
class TextInputProcessor extends NodeProcessor {
  async process(node: TextInputNode, context: ExecutionContext) {
    const text = node.data.text || '';
    return { text };
  }
}
```

##### TextMergeProcessor
合并多个文本输入

```typescript
class TextMergeProcessor extends NodeProcessor {
  async process(node: TextMergeNode, context: ExecutionContext) {
    const input1 = this.getInputValue(context, 'text1') || '';
    const input2 = this.getInputValue(context, 'text2') || '';
    const separator = node.data.separator || ' ';
    
    const mergedText = [input1, input2]
      .filter(Boolean)
      .join(separator);
    
    return { text: mergedText };
  }
}
```

#### 图像处理器
**位置**: `server/src/nodes/processors/image.ts`

##### ImageInputProcessor
处理图像输入节点，验证文件存在性

```typescript
class ImageInputProcessor extends NodeProcessor {
  async process(node: ImageInputNode, context: ExecutionContext) {
    const filePath = node.data.filePath;
    
    if (!filePath) {
      throw new Error('未指定图片文件');
    }
    
    // 验证文件存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }
    
    return { imagePath: filePath };
  }
}
```

#### AI处理器
**位置**: `server/src/nodes/processors/ai.ts`

##### AIImageProcessor
调用AI API生成图像

```typescript
class AIImageProcessor extends NodeProcessor {
  async process(node: AIImageNode, context: ExecutionContext) {
    // 1. 获取输入提示词
    const prompt = this.getInputValue(context, 'prompt') || node.data.prompt;
    
    // 2. 获取API配置
    const configService = context.getService('configService');
    const config = await configService.getByProvider(node.data.provider);
    
    // 3. 创建适配器
    const adapter = AdapterFactory.create(config);
    
    // 4. 调用API生成图像
    const result = await adapter.generateImage({
      prompt,
      model: node.data.model,
      size: node.data.size,
      quality: node.data.quality
    });
    
    // 5. 保存图像到本地
    const imagePath = await this.saveImage(result.imageUrl);
    
    return { imagePath, imageUrl: result.imageUrl };
  }
}
```

### 4.3 API适配器架构

**位置**: `server/src/adapters/`

#### 基类接口
```typescript
interface AIAdapter {
  generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult>;
  validateConfig(): boolean;
}
```

#### OpenAI兼容适配器
**位置**: `server/src/adapters/openai-compatible.ts`

```typescript
class OpenAICompatibleAdapter implements AIAdapter {
  constructor(private config: APIConfig) {}
  
  async generateImage(params: ImageGenerationParams) {
    const response = await axios.post(
      `${this.config.baseUrl}/images/generations`,
      {
        model: params.model,
        prompt: params.prompt,
        size: params.size,
        quality: params.quality,
        n: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      imageUrl: response.data.data[0].url,
      revisedPrompt: response.data.data[0].revised_prompt
    };
  }
}
```

#### 适配器工厂
**位置**: `server/src/adapters/factory.ts`

```typescript
class AdapterFactory {
  static create(config: APIConfig): AIAdapter {
    switch (config.provider) {
      case 'openai':
        return new OpenAICompatibleAdapter(config);
      case 'openrouter':
        return new OpenAICompatibleAdapter({
          ...config,
          baseUrl: 'https://openrouter.ai/api/v1'
        });
      default:
        throw new Error(`不支持的提供商: ${config.provider}`);
    }
  }
}
```

### 4.4 缓存系统

**位置**: `server/src/utils/cache.ts`

#### LRU缓存实现
```typescript
class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  
  constructor(
    private maxSize: number = 100,
    private ttl: number = 3600000 // 1小时
  ) {}
  
  set(key: string, value: T): void {
    // 如果缓存满了，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }
}
```

### 4.5 文件管理

**位置**: `server/src/services/fileService.ts`

#### FileService类
负责文件上传、下载和管理

**关键方法**:

##### `saveUploadedFile(file: Express.Multer.File)`
保存上传的文件

```typescript
async saveUploadedFile(file: Express.Multer.File): Promise<string> {
  const ext = path.extname(file.originalname);
  const filename = `${uuid()}${ext}`;
  const filepath = path.join(this.uploadsDir, filename);
  
  await fs.promises.rename(file.path, filepath);
  
  return filepath;
}
```

##### `downloadImage(url: string)`
从URL下载图像

```typescript
async downloadImage(url: string): Promise<string> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);
  
  // 使用Sharp优化图像
  const optimized = await sharp(buffer)
    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
  
  const filename = `${uuid()}.jpg`;
  const filepath = path.join(this.uploadsDir, filename);
  
  await fs.promises.writeFile(filepath, optimized);
  
  return filepath;
}
```

---

## 5. API文档

### 5.1 RESTful API端点

#### 工作流API

##### GET /api/workflows
获取所有工作流列表

**响应**:
```json
[
  {
    "id": "workflow-uuid",
    "name": "我的工作流",
    "description": "描述",
    "nodes": [...],
    "edges": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

##### GET /api/workflows/:id
获取单个工作流详情

**参数**:
- `id`: 工作流ID

**响应**:
```json
{
  "id": "workflow-uuid",
  "name": "我的工作流",
  "description": "描述",
  "nodes": [...],
  "edges": [...]
}
```

##### POST /api/workflows
创建新工作流

**请求体**:
```json
{
  "name": "工作流名称",
  "description": "可选描述",
  "nodes": [],
  "edges": []
}
```

**响应**: `201 Created`
```json
{
  "id": "workflow-uuid",
  "name": "工作流名称",
  ...
}
```

##### PUT /api/workflows/:id
更新工作流

**参数**:
- `id`: 工作流ID

**请求体**:
```json
{
  "name": "新名称",
  "nodes": [...],
  "edges": [...]
}
```

**响应**: `200 OK`

##### DELETE /api/workflows/:id
删除工作流

**参数**:
- `id`: 工作流ID

**响应**: `200 OK`
```json
{
  "message": "工作流已删除"
}
```

##### POST /api/workflows/:id/execute
执行工作流

**参数**:
- `id`: 工作流ID

**响应**: `200 OK`
```json
{
  "executionId": "execution-uuid",
  "status": "completed",
  "results": {
    "node1": { "text": "结果" },
    "node2": { "imagePath": "/path/to/image.png" }
  }
}
```

#### API配置API

##### GET /api/configs
获取所有API配置

**响应**:
```json
[
  {
    "id": "config-uuid",
    "provider": "openai",
    "name": "OpenAI配置",
    "apiKey": "sk-***encrypted***",
    "baseUrl": "https://api.openai.com/v1",
    "models": ["dall-e-3"]
  }
]
```

##### POST /api/configs
创建API配置

**请求体**:
```json
{
  "provider": "openai",
  "name": "我的OpenAI",
  "apiKey": "sk-xxxxxxxx",
  "baseUrl": "https://api.openai.com/v1",
  "models": ["dall-e-3"]
}
```

**响应**: `201 Created`

##### PUT /api/configs/:id
更新API配置

##### DELETE /api/configs/:id
删除API配置

#### 执行历史API

##### GET /api/executions
获取执行历史列表

**查询参数**:
- `workflowId`: (可选) 按工作流ID过滤
- `limit`: (可选) 限制返回数量

**响应**:
```json
[
  {
    "id": "execution-uuid",
    "workflowId": "workflow-uuid",
    "status": "completed",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-01T00:01:00.000Z",
    "nodeResults": {...}
  }
]
```

##### GET /api/executions/:id
获取单个执行记录详情

#### 文件API

##### POST /api/files/upload
上传文件

**请求**:
- Content-Type: multipart/form-data
- Field: `file`

**响应**:
```json
{
  "filePath": "/path/to/uploaded/file.png",
  "filename": "uuid.png"
}
```

##### GET /api/files/:filename
下载文件

**参数**:
- `filename`: 文件名

**响应**: 文件流

#### 节点类型API

##### GET /api/nodes/types
获取所有支持的节点类型

**响应**:
```json
[
  {
    "type": "textInput",
    "label": "文本输入",
    "category": "input",
    "inputs": [],
    "outputs": ["text"]
  },
  {
    "type": "aiImage",
    "label": "AI生图",
    "category": "ai",
    "inputs": ["prompt"],
    "outputs": ["image"]
  }
]
```

### 5.2 WebSocket事件

#### 连接
```javascript
const socket = io('http://localhost:3000');
```

#### 服务器事件

##### execution:started
工作流执行开始
```json
{
  "executionId": "uuid",
  "workflowId": "uuid",
  "totalNodes": 5
}
```

##### execution:progress
执行进度更新
```json
{
  "executionId": "uuid",
  "progress": 60,
  "completedNodes": 3,
  "totalNodes": 5
}
```

##### execution:completed
执行完成
```json
{
  "executionId": "uuid",
  "results": {...}
}
```

##### execution:failed
执行失败
```json
{
  "executionId": "uuid",
  "error": "错误信息"
}
```

##### node:started
节点开始执行
```json
{
  "executionId": "uuid",
  "nodeId": "node-uuid",
  "nodeType": "aiImage"
}
```

##### node:completed
节点执行完成
```json
{
  "executionId": "uuid",
  "nodeId": "node-uuid",
  "result": {...}
}
```

##### node:failed
节点执行失败
```json
{
  "executionId": "uuid",
  "nodeId": "node-uuid",
  "error": "错误信息"
}
```

### 5.3 错误处理

#### 错误响应格式
```json
{
  "error": "错误消息",
  "details": [
    {
      "field": "name",
      "message": "名称不能为空"
    }
  ]
}
```

#### HTTP状态码
- `200 OK` - 请求成功
- `201 Created` - 资源创建成功
- `400 Bad Request` - 请求参数错误
- `404 Not Found` - 资源不存在
- `500 Internal Server Error` - 服务器内部错误

---

## 6. 扩展开发

### 6.1 添加新节点类型

#### 步骤1: 定义节点类型
在`shared/types/index.ts`中添加类型定义：

```typescript
export interface MyCustomNode extends BaseNode {
  type: 'myCustom';
  data: {
    customParam: string;
    anotherParam: number;
  };
}
```

#### 步骤2: 创建节点处理器
在`server/src/nodes/processors/`中创建处理器：

```typescript
// custom.ts
import { NodeProcessor } from '../base';
import { MyCustomNode } from '../../../shared/types';
import { ExecutionContext } from '../../engine/context';

export class MyCustomProcessor extends NodeProcessor {
  async process(node: MyCustomNode, context: ExecutionContext): Promise<any> {
    // 1. 获取输入
    const input = this.getInputValue(context, 'inputName');
    
    // 2. 处理逻辑
    const result = await this.doCustomProcessing(node.data, input);
    
    // 3. 返回输出
    return { outputName: result };
  }
  
  private async doCustomProcessing(data: any, input: any) {
    // 自定义处理逻辑
    return `Processed: ${input} with ${data.customParam}`;
  }
}
```

#### 步骤3: 注册处理器
在`server/src/engine/registry.ts`中注册：

```typescript
import { MyCustomProcessor } from '../nodes/processors/custom';

// 在createDefaultRegistry函数中
registry.register('myCustom', new MyCustomProcessor());
```

#### 步骤4: 创建前端组件
在`client/src/components/nodes/`中创建React组件：

```typescript
// MyCustomNode.tsx
import React from 'react';
import { Handle, Position } from 'reactflow';

export const MyCustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input" />
      
      <div className="node-header">
        <span>自定义节点</span>
      </div>
      
      <div className="node-body">
        <input
          value={data.customParam}
          onChange={(e) => data.onChange({ customParam: e.target.value })}
          placeholder="自定义参数"
        />
      </div>
      
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};
```

#### 步骤5: 注册前端组件
在`client/src/components/nodes/index.ts`中导出：

```typescript
export const nodeTypes = {
  textInput: TextInputNode,
  myCustom: MyCustomNode, // 添加这行
  // ... 其他节点
};
```

### 6.2 添加新的AI适配器

#### 步骤1: 创建适配器类
在`server/src/adapters/`中创建新适配器：

```typescript
// my-ai-adapter.ts
import { AIAdapter } from './base';
import { APIConfig } from '../models/apiConfig';
import { ImageGenerationParams, ImageGenerationResult } from '../types';
import axios from 'axios';

export class MyAIAdapter implements AIAdapter {
  constructor(private config: APIConfig) {}
  
  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    // 1. 构建API请求
    const response = await axios.post(
      `${this.config.baseUrl}/generate`,
      {
        prompt: params.prompt,
        model: params.model,
        // 适配特定API的参数格式
      },
      {
        headers: {
          'X-API-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 2. 解析响应
    return {
      imageUrl: response.data.image_url,
      revisedPrompt: response.data.modified_prompt
    };
  }
  
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.baseUrl);
  }
}
```

#### 步骤2: 更新适配器工厂
在`server/src/adapters/factory.ts`中添加：

```typescript
import { MyAIAdapter } from './my-ai-adapter';

class AdapterFactory {
  static create(config: APIConfig): AIAdapter {
    switch (config.provider) {
      case 'openai':
        return new OpenAICompatibleAdapter(config);
      case 'myai':
        return new MyAIAdapter(config); // 添加这行
      default:
        throw new Error(`不支持的提供商: ${config.provider}`);
    }
  }
}
```

#### 步骤3: 更新前端配置
在前端添加新提供商选项：

```typescript
// APISettingsPage.tsx
const providers = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'myai', label: 'My AI Provider' }, // 添加这行
];
```

### 6.3 自定义中间件

#### 创建中间件
在`server/src/middleware/`中创建：

```typescript
// customMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const customMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 在请求处理前执行
  console.log(`请求: ${req.method} ${req.path}`);
  
  // 继续处理
  next();
  
  // 或者返回错误
  // res.status(400).json({ error: '自定义错误' });
};
```

#### 应用中间件
在`server/src/index.ts`中使用：

```typescript
import { customMiddleware } from './middleware/customMiddleware';

// 全局中间件
app.use(customMiddleware);

// 或路由级中间件
app.use('/api/workflows', customMiddleware, workflowRouter);
```

### 6.4 插件系统（规划中）

未来计划实现插件系统，允许：
- 动态加载节点处理器
- 扩展API适配器
- 自定义UI组件
- 添加新的执行策略

---

## 7. 测试指南

### 7.1 单元测试

#### 安装测试框架
```bash
npm install --save-dev jest @types/jest ts-jest
```

#### 配置Jest
创建`jest.config.js`：

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

#### 编写测试
```typescript
// __tests__/engine.test.ts
import { WorkflowEngine } from '../engine/engine';
import { ProcessorRegistry } from '../engine/registry';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;
  
  beforeEach(() => {
    const registry = new ProcessorRegistry();
    const eventEmitter = new EventEmitter();
    engine = new WorkflowEngine(registry, eventEmitter);
  });
  
  test('should execute workflow successfully', async () => {
    const workflow = {
      id: 'test-workflow',
      name: 'Test',
      nodes: [
        { id: 'node1', type: 'textInput', data: { text: 'Hello' } }
      ],
      edges: []
    };
    
    const result = await engine.execute(workflow);
    
    expect(result.status).toBe('completed');
    expect(result.results.node1.text).toBe('Hello');
  });
});
```

### 7.2 集成测试

#### API测试
```typescript
// __tests__/api/workflows.test.ts
import request from 'supertest';
import app from '../index';

describe('Workflow API', () => {
  test('GET /api/workflows should return all workflows', async () => {
    const response = await request(app)
      .get('/api/workflows')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });
  
  test('POST /api/workflows should create workflow', async () => {
    const workflow = {
      name: 'Test Workflow',
      nodes: [],
      edges: []
    };
    
    const response = await request(app)
      .post('/api/workflows')
      .send(workflow)
      .expect(201);
    
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Test Workflow');
  });
});
```

### 7.3 E2E测试

#### 使用Playwright
```bash
npm install --save-dev @playwright/test
```

#### 编写E2E测试
```typescript
// e2e/workflow.spec.ts
import { test, expect } from '@playwright/test';

test('create and execute workflow', async ({ page }) => {
  // 1. 打开编辑器
  await page.goto('http://localhost:5173/editor');
  
  // 2. 添加文本输入节点
  await page.click('[data-node-type="textInput"]');
  
  // 3. 配置节点
  await page.fill('input[name="text"]', 'Hello World');
  
  // 4. 保存工作流
  await page.click('button:has-text("保存")');
  
  // 5. 执行工作流
  await page.click('button:has-text("执行")');
  
  // 6. 验证结果
  await expect(page.locator('.execution-result')).toContainText('Hello World');
});
```

### 7.4 性能测试

#### 使用autocannon进行负载测试
```bash
npm install --save-dev autocannon
```

#### 运行性能测试
```bash
autocannon -c 10 -d 30 http://localhost:3000/api/workflows
```

---

## 8. 贡献指南

### 8.1 代码规范

#### TypeScript规范
- 使用TypeScript严格模式
- 所有函数必须有类型注解
- 避免使用`any`类型
- 使用接口定义数据结构

#### 命名规范
- 类名: PascalCase (如 `WorkflowEngine`)
- 函数/变量: camelCase (如 `executeWorkflow`)
- 常量: UPPER_SNAKE_CASE (如 `MAX_RETRIES`)
- 文件名: kebab-case (如 `workflow-engine.ts`)

#### 代码格式
使用Prettier自动格式化：

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

#### 注释规范
```typescript
/**
 * 执行工作流
 * @param workflow - 要执行的工作流对象
 * @returns Promise<ExecutionResult> 执行结果
 * @throws {ValidationError} 当工作流验证失败时
 */
async function executeWorkflow(workflow: Workflow): Promise<ExecutionResult> {
  // 实现
}
```

### 8.2 Git工作流

#### 分支策略
- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支
- `hotfix/*` - 紧急修复分支

#### 提交消息规范
使用Conventional Commits格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型**:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(engine): 添加并行执行支持

- 实现拓扑排序算法
- 支持同层级节点并行执行
- 添加执行进度事件

Closes #123
```

### 8.3 Pull Request流程

#### 1. Fork仓库
```bash
git clone https://github.com/yourusername/NodeAPI.git
cd NodeAPI
git remote add upstream https://github.com/original/NodeAPI.git
```

#### 2. 创建功能分支
```bash
git checkout -b feature/my-new-feature develop
```

#### 3. 开发和测试
```bash
# 进行开发
# ...

# 运行测试
npm test

# 运行代码检查
npm run lint
```

#### 4. 提交更改
```bash
git add .
git commit -m "feat: 添加新功能"
```

#### 5. 同步上游
```bash
git fetch upstream
git rebase upstream/develop
```

#### 6. 推送到Fork
```bash
git push origin feature/my-new-feature
```

#### 7. 创建Pull Request
- 访问GitHub仓库
- 点击"New Pull Request"
- 填写PR描述，说明：
  - 更改内容
  - 测试情况
  - 相关Issue

#### 8. 代码审查
- 响应审查意见
- 进行必要的修改
- 更新PR

### 8.4 问题报告

#### Bug报告模板
```markdown
### 问题描述
简要描述遇到的问题

### 复现步骤
1. 打开...
2. 点击...
3. 看到错误...

### 期望行为
应该发生什么

### 实际行为
实际发生了什么

### 环境信息
- OS: Windows 11
- Node.js: 18.0.0
- 浏览器: Chrome 120

### 截图
如有必要，添加截图

### 额外信息
其他相关信息
```

#### 功能请求模板
```markdown
### 功能描述
描述建议的功能

### 使用场景
这个功能解决什么问题？

### 建议实现
如何实现这个功能？

### 替代方案
考虑过哪些替代方案？

### 其他信息
相关资料或参考
```

---

## 附录

### A. 常用命令参考

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建项目
npm start                # 启动生产服务器

# 测试
npm test                 # 运行测试
npm run test:watch       # 监视模式运行测试
npm run test:coverage    # 生成覆盖率报告

# 代码质量
npm run lint             # 代码检查
npm run format           # 格式化代码
npm run type-check       # 类型检查

# 清理
npm run clean            # 清理构建产物
```

### B. 资源链接

- [React Flow文档](https://reactflow.dev/)
- [Zustand文档](https://github.com/pmndrs/zustand)
- [Express文档](https://expressjs.com/)
- [TypeScript文档](https://www.typescriptlang.org/)
- [Ant Design文档](https://ant.design/)

### C. 许可证

MIT License - 详见LICENSE文件

---

**文档版本**: 1.0.0  
**最后更新**: 2024年1月  
**维护者**: 开发团队
