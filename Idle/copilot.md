# Copilot Context - AI工作流系统开发

## 项目概述
AI生图工作流系统 - 一个基于Node.js的可视化工作流编辑器，用于创建和执行AI图像生成工作流。

## 当前进度

### 阶段1：项目初始化和架构设计 ✅
- 项目结构搭建完成
- 技术栈选型完成
- 架构设计文档完成

### 阶段2：前端核心功能开发 ✅
**完成时间**: 2026-02-11

#### 已完成功能
1. **依赖安装和配置**
   - React Flow (@xyflow/react) - 工作流画布
   - Ant Design (antd) - UI组件库
   - Tailwind CSS - 样式框架
   - React Router (react-router-dom) - 路由管理
   - Zustand - 状态管理
   - 其他依赖: axios, socket.io-client, lucide-react

2. **基础布局组件**
   - [`Header`](client/src/components/layout/Header.tsx) - 顶部导航栏，包含菜单和工具栏按钮
   - [`Sidebar`](client/src/components/layout/Sidebar.tsx) - 侧边栏容器
   - [`MainLayout`](client/src/components/layout/MainLayout.tsx) - 主布局组件

3. **路由系统**
   - `/workflows` - 工作流列表页面
   - `/editor/:id` - 工作流编辑器页面
   - `/executions` - 执行历史页面
   - `/settings/apis` - API配置页面

4. **工作流编辑器核心**
   - React Flow画布集成
   - 拖拽节点功能
   - 节点连接功能
   - 节点选择和属性编辑
   - 工作流导入/导出功能

5. **节点系统**
   实现了6种基础节点类型：
   - [`TextInputNode`](client/src/components/nodes/TextInputNode.tsx) - 文本输入节点
   - [`ImageInputNode`](client/src/components/nodes/ImageInputNode.tsx) - 图片输入节点
   - [`TextOutputNode`](client/src/components/nodes/TextOutputNode.tsx) - 文本输出节点
   - [`ImageOutputNode`](client/src/components/nodes/ImageOutputNode.tsx) - 图片输出节点
   - [`TextMergeNode`](client/src/components/nodes/TextMergeNode.tsx) - 文本合并节点
   - [`AIImageNode`](client/src/components/nodes/AIImageNode.tsx) - AI生图节点

6. **编辑器组件**
   - [`NodePanel`](client/src/components/editor/NodePanel.tsx) - 节点面板，显示可拖拽的节点列表
   - [`PropertiesPanel`](client/src/components/editor/PropertiesPanel.tsx) - 属性面板，编辑选中节点的配置

7. **状态管理**
   - [`workflowStore`](client/src/store/workflowStore.ts) - Zustand store，管理工作流状态

8. **UI设计**
   - 深色主题为主
   - 现代简洁的设计风格
   - 流畅的动画和过渡效果
   - 响应式布局

#### Git提交
- Commit: `b0cf818` - "feat: 实现前端核心功能 - 工作流编辑器和基础UI"
- 分支: master

### 阶段3：后端核心功能开发 ✅ (刚完成)
**完成时间**: 2026-02-11

#### 已完成功能

1. **后端依赖安装**
   - multer - 文件上传中间件
   - sharp - 图片处理库
   - zod - 数据验证
   - uuid - 唯一ID生成
   - socket.io - WebSocket实时通信

2. **工作流执行引擎**
   - [`validator.ts`](server/src/engine/validator.ts) - 工作流验证器（节点配置、连接、依赖、循环检测）
   - [`sorter.ts`](server/src/engine/sorter.ts) - 拓扑排序器（Kahn算法）
   - [`context.ts`](server/src/engine/context.ts) - 执行上下文（状态管理、结果存储）
   - [`executor.ts`](server/src/engine/executor.ts) - 节点执行器（单节点执行、错误处理）
   - [`engine.ts`](server/src/engine/engine.ts) - 工作流引擎（协调执行流程、WebSocket通知）
   - [`registry.ts`](server/src/engine/registry.ts) - 处理器注册表

3. **节点处理器系统**
   - [`base.ts`](server/src/nodes/base.ts) - 抽象基类NodeProcessor
   - 文本处理器 ([`text.ts`](server/src/nodes/processors/text.ts)):
     * TextInputProcessor - 文本输入
     * TextOutputProcessor - 文本输出
     * TextMergeProcessor - 文本合并
     * TextTemplateProcessor - 文本模板
   - 图片处理器 ([`image.ts`](server/src/nodes/processors/image.ts)):
     * ImageInputProcessor - 图片输入
     * ImageOutputProcessor - 图片输出
     * ImageResizeProcessor - 图片调整大小（使用Sharp）
   - AI处理器 ([`ai.ts`](server/src/nodes/processors/ai.ts)):
     * AIImageGenerationProcessor - AI生图（占位实现）

4. **API路由**
   - [`workflows.ts`](server/src/routes/workflows.ts) - 工作流CRUD和执行
     * GET /api/workflows - 获取工作流列表
     * GET /api/workflows/:id - 获取工作流详情
     * POST /api/workflows - 创建工作流
     * PUT /api/workflows/:id - 更新工作流
     * DELETE /api/workflows/:id - 删除工作流
     * POST /api/workflows/:id/execute - 执行工作流
   - [`executions.ts`](server/src/routes/executions.ts) - 执行记录
     * GET /api/executions - 获取所有执行记录
     * GET /api/executions/:id - 获取执行记录详情
     * GET /api/executions/:id/results - 获取执行结果
   - [`nodes.ts`](server/src/routes/nodes.ts) - 节点类型定义
     * GET /api/nodes/types - 获取所有节点类型
     * GET /api/nodes/types/:type - 获取节点类型详情
   - [`files.ts`](server/src/routes/files.ts) - 文件管理
     * POST /api/files/upload - 上传文件
     * GET /api/files/:filename - 获取文件
   - [`configs.ts`](server/src/routes/configs.ts) - API配置管理
     * GET /api/configs/apis - 获取API配置列表
     * POST /api/configs/apis - 添加API配置
     * PUT /api/configs/apis/:id - 更新API配置
     * DELETE /api/configs/apis/:id - 删除API配置

5. **服务层**
   - [`workflowService.ts`](server/src/services/workflowService.ts) - 工作流CRUD（文件系统存储）
   - [`executionService.ts`](server/src/services/executionService.ts) - 执行记录管理
   - [`fileService.ts`](server/src/services/fileService.ts) - 文件上传和管理

6. **中间件**
   - [`upload.ts`](server/src/middleware/upload.ts) - Multer文件上传配置
   - [`errorHandler.ts`](server/src/middleware/errorHandler.ts) - 错误处理和404处理

7. **类型定义**
   - [`types/index.ts`](server/src/types/index.ts) - 执行引擎相关类型定义

8. **服务器配置**
   - [`index.ts`](server/src/index.ts) - Express服务器、Socket.io集成、路由注册

#### 技术特点
- TypeScript严格模式
- 完善的错误处理和验证
- 事件驱动架构（EventEmitter）
- WebSocket实时通知
- 文件系统存储（JSON格式）
- 模块化设计
- 依赖注入模式

#### Git提交
- Commit: `cbc8de4` - "feat: 实现后端核心功能 - API路由、执行引擎和节点处理器"
- 分支: master
- 新增文件: 22个
- 代码行数: +1900行

#### 服务器状态
✅ 服务器成功启动在 http://localhost:3000
✅ WebSocket服务已启动
✅ 数据目录已初始化

## 下一步计划

### 阶段4：AI API集成
1. 实现OpenAI DALL-E集成
2. 实现Stable Diffusion集成
3. 实现API密钥管理
4. 实现请求限流和错误重试

### 阶段4：前后端集成
1. 连接前端和后端API
2. 实现实时执行状态更新
3. 实现错误处理和用户反馈

### 阶段5：AI API集成
1. 实现OpenAI DALL-E集成
2. 实现Stable Diffusion集成
3. 实现API密钥管理
4. 实现请求限流和错误重试

### 阶段6：测试和优化
1. 单元测试
2. 集成测试
3. 性能优化
4. UI/UX优化

## 技术栈

### 前端
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.3.1
- React Flow (@xyflow/react)
- Ant Design
- Tailwind CSS
- React Router
- Zustand
- Axios
- Socket.io Client
- Lucide React (图标)

### 后端
- Node.js
- Express 4.21.2
- TypeScript 5.7.3
- Socket.io 4.8.1
- Multer 1.4.5-lts.1 (文件上传)
- Sharp 0.33.5 (图片处理)
- Zod 3.24.1 (数据验证)
- UUID 11.0.5 (唯一ID生成)

## 项目结构
```
NodeAPI/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/    # 组件
│   │   │   ├── editor/   # 编辑器组件
│   │   │   ├── layout/   # 布局组件
│   │   │   └── nodes/    # 节点组件
│   │   ├── pages/        # 页面
│   │   ├── store/        # 状态管理
│   │   └── App.tsx       # 主应用
│   ├── tailwind.config.js
│   └── package.json
├── server/                # 后端代码
│   ├── src/
│   │   ├── engine/       # 执行引擎
│   │   ├── nodes/        # 节点处理器
│   │   ├── routes/       # API路由
│   │   ├── services/     # 业务服务
│   │   ├── middleware/   # 中间件
│   │   ├── types/        # 类型定义
│   │   └── index.ts      # 服务器入口
│   ├── data/             # 数据存储目录
│   ├── uploads/          # 文件上传目录
│   └── package.json
├── shared/                # 共享类型和常量
│   ├── types/
│   └── constants/
├── plans/                 # 设计文档
└── Idle/
    └── copilot.md        # 本文件
```

## 重要提示

### 给其他客户端AI的说明
1. **项目上下文**: 这是一个AI工作流系统，前端已基本完成，后端待开发
2. **当前状态**: 前端核心功能已实现并提交到git
3. **工作方式**: 请在继续工作时更新此文件，保持上下文同步
4. **代码规范**: 使用TypeScript严格模式，遵循项目现有代码风格
5. **提交规范**: 使用语义化提交信息（feat/fix/docs/style/refactor等）

### 关键文件
- [`/shared/types/index.ts`](../shared/types/index.ts) - 共享类型定义
- [`/shared/constants/index.ts`](../shared/constants/index.ts) - 共享常量
- [`/plans/architecture.md`](../plans/architecture.md) - 系统架构设计
- [`/plans/node-system.md`](../plans/node-system.md) - 节点系统设计
- [`/plans/execution-engine.md`](../plans/execution-engine.md) - 执行引擎设计
- [`/server/src/index.ts`](../server/src/index.ts) - 后端服务器入口
- [`/server/src/engine/engine.ts`](../server/src/engine/engine.ts) - 工作流执行引擎

## 已知问题
- 无

## 待优化项
1. 前端代码分割和懒加载（构建时有大文件警告）
2. 节点属性面板的实时更新
3. 工作流验证逻辑增强
4. 错误边界和错误处理
5. 国际化支持
6. API端点的单元测试
7. 执行引擎的性能优化
8. 文件上传的进度显示

## 联系方式
- 项目路径: `d:/Code/NodeAPI`
- Git分支: master
- 最后更新: 2026-02-11
