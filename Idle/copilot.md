# AI生图工作流系统 - 项目上下文文档

## 项目概述
创建一个类似ComfyUI/Mulan.pro的AI生图工作流软件，但更简易和灵活。

## 核心需求
- **技术栈**: React + React Flow (前端) + Node.js + Express (后端)
- **部署方式**: Web应用
- **目标用户**: 个人使用
- **AI支持**: 支持多种AI API（OpenAI DALL-E、Stable Diffusion等），可使用自定义API

## 核心功能
1. 可视化工作流编辑器（节点拖拽、连接）
2. 多种节点类型：
   - 图片输入节点
   - AI生图节点
   - 文本节点
   - 图片输出节点
   - 文本输入节点
   - 文本输出节点
   - 文本合并节点
   - 其他基础功能节点
3. 工作流执行引擎
4. API配置管理（支持自定义API）

## 设计理念
- 比ComfyUI更简易：更直观的UI，更少的配置
- 比Mulan.pro更灵活：支持自定义API，更开放的节点系统

## 技术选型（已确定）
### 前端
- React 18 + TypeScript
- Vite（构建工具）
- React Flow（工作流编辑器）
- Zustand（状态管理）
- Ant Design（UI组件库）
- Tailwind CSS（样式）
- Axios（HTTP客户端）
- Socket.io-client（实时通信）

### 后端
- Node.js 18+ + Express + TypeScript
- Socket.io（实时通信）
- Multer + Sharp（文件处理）
- Axios（调用AI API）
- 文件系统存储（简单直接）

## 项目结构
```
ai-workflow/
├── client/          # 前端项目（React + Vite）
├── server/          # 后端项目（Express + TypeScript）
├── shared/          # 前后端共享代码（类型定义等）
├── plans/           # 项目规划文档
└── Idle/            # 协作上下文
```

## 核心设计文档
1. [`/plans/architecture.md`] - 系统架构设计
2. [`/plans/tech-stack.md`] - 技术栈和依赖清单
3. [`/plans/node-system.md`] - 节点系统详细设计
4. [`/plans/execution-engine.md`] - 工作流执行引擎设计

## 当前状态
- ✅ 架构设计完成
- ✅ 技术选型确定
- ✅ 节点系统设计完成
- ✅ 执行引擎设计完成
- ✅ 项目基础搭建完成（阶段1）
- ⏳ 待开始：前端核心功能开发（阶段2）

## 开发阶段规划
1. **阶段1**: 项目基础搭建（初始化、配置）
2. **阶段2**: 前端核心功能（编辑器、节点）
3. **阶段3**: 后端核心功能（API、执行引擎）
4. **阶段4**: AI集成（API适配器）
5. **阶段5**: 功能完善（保存、历史、配置）
6. **阶段6**: 优化测试
7. **阶段7**: 文档和部署

详细待办事项见 Todo List（57项任务）

## 关键技术点
1. **工作流编辑器**: 使用React Flow实现节点拖拽和连接
2. **执行引擎**: 拓扑排序 + 节点调度器 + 数据流管理
3. **实时通信**: WebSocket实时更新执行状态
4. **节点系统**: 可扩展的节点类型和处理器
5. **API代理**: 统一不同AI服务的接口

## 下一步行动
1. 开始阶段2：前端核心功能开发
2. 实现React Flow工作流编辑器基础界面
3. 创建基础节点组件
4. 实现节点拖拽和连接功能

## 阶段1完成情况（2026-02-11）
### 已完成
- ✅ 创建项目目录结构（client/、server/、shared/）
- ✅ 使用Vite初始化前端项目（React 18 + TypeScript）
- ✅ 创建后端项目结构（Express + TypeScript）
- ✅ 配置共享类型定义目录（shared/types/、shared/constants/）
- ✅ 创建monorepo根配置（package.json with workspaces）
- ✅ 配置并发启动脚本（concurrently）
- ✅ 配置TypeScript严格模式
- ✅ 配置ESLint和Prettier
- ✅ 创建后端基础服务器（Express + Socket.io）
- ✅ 测试前后端启动成功

### 项目结构
```
ai-workflow/
├── client/                    # 前端项目（Vite + React + TS）
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── server/                    # 后端项目（Express + TS）
│   ├── src/
│   │   ├── index.ts          # 入口文件（已实现基础服务器）
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── nodes/
│   │   ├── engine/
│   │   ├── adapters/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
│   ├── uploads/
│   ├── data/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   └── .env
├── shared/                    # 共享代码
│   ├── types/
│   │   └── index.ts          # 共享类型定义
│   ├── constants/
│   │   └── index.ts          # 共享常量
│   └── package.json
├── plans/                     # 项目规划文档
├── Idle/                      # 协作上下文
├── package.json              # 根package.json（monorepo配置）
├── .prettierrc
└── .gitignore
```

### 启动方式
- 根目录运行 `npm run dev` - 并发启动前后端
- 前端：http://localhost:5173
- 后端：http://localhost:3000
- WebSocket已启用

### 技术配置
- TypeScript严格模式已启用
- ESLint和Prettier已配置
- Monorepo使用npm workspaces
- 并发启动使用concurrently

---
**最后更新**: 2026-02-11 19:03 (UTC+8)
**更新者**: Code Mode
**状态**: 阶段1完成，准备开始阶段2

**注意事项**:
- 所有AI协作者请在完成工作后更新此文档
- 每次完成小阶段后，请更新当前状态和下一步行动
- 跨客户端协作时，请详细记录进度和上下文
- 本文档是项目的核心协作文档，请保持更新
