# Copilot Context - AI工作流系统开发

## 项目概述
AI生图工作流系统 - 一个基于Node.js的可视化工作流编辑器，用于创建和执行AI图像生成工作流。

## 当前进度

### 阶段1：项目初始化和架构设计 ✅
- 项目结构搭建完成
- 技术栈选型完成
- 架构设计文档完成

### 阶段2：前端核心功能开发 ✅ (刚完成)
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

## 下一步计划

### 阶段3：后端API开发
1. 实现工作流CRUD API
2. 实现节点执行引擎
3. 实现API配置管理
4. 实现执行历史记录

### 阶段4：前后端集成
1. 连接前端和后端API
2. 实现实时执行状态更新
3. 实现错误处理和用户反馈

### 阶段5：测试和优化
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
- Express
- TypeScript
- (待实现)

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
│   └── src/
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

## 已知问题
- 无

## 待优化项
1. 代码分割和懒加载（构建时有大文件警告）
2. 节点属性面板的实时更新
3. 工作流验证逻辑
4. 错误边界和错误处理
5. 国际化支持

## 联系方式
- 项目路径: `d:/Code/NodeAPI`
- Git分支: master
- 最后更新: 2026-02-11
