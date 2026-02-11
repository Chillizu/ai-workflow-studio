# 技术选型和依赖清单

## 前端依赖 (client/)

### 核心框架
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```

### 工作流编辑器
```json
{
  "reactflow": "^11.10.0"
}
```

### 状态管理
```json
{
  "zustand": "^4.4.0"
}
```
或者
```json
{
  "@reduxjs/toolkit": "^1.9.0",
  "react-redux": "^8.1.0"
}
```

### UI组件库 (二选一)
```json
{
  "antd": "^5.10.0"
}
```
或者
```json
{
  "@mui/material": "^5.14.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0"
}
```

### 路由
```json
{
  "react-router-dom": "^6.16.0"
}
```

### HTTP客户端
```json
{
  "axios": "^1.5.0"
}
```

### WebSocket
```json
{
  "socket.io-client": "^4.7.0"
}
```

### 样式
```json
{
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### 工具库
```json
{
  "lodash": "^4.17.21",
  "@types/lodash": "^4.14.0",
  "dayjs": "^1.11.0",
  "uuid": "^9.0.0",
  "@types/uuid": "^9.0.0"
}
```

### 图标
```json
{
  "lucide-react": "^0.290.0"
}
```
或者
```json
{
  "@ant-design/icons": "^5.2.0"
}
```

### 构建工具
```json
{
  "vite": "^4.5.0",
  "@vitejs/plugin-react": "^4.1.0"
}
```

### 开发工具
```json
{
  "eslint": "^8.50.0",
  "prettier": "^3.0.0",
  "@typescript-eslint/eslint-plugin": "^6.7.0",
  "@typescript-eslint/parser": "^6.7.0"
}
```

## 后端依赖 (server/)

### 核心框架
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "@types/express": "^4.17.0"
}
```

### WebSocket
```json
{
  "socket.io": "^4.7.0"
}
```

### 文件处理
```json
{
  "multer": "^1.4.5-lts.1",
  "@types/multer": "^1.4.0",
  "sharp": "^0.32.0"
}
```

### HTTP客户端
```json
{
  "axios": "^1.5.0"
}
```

### 工具库
```json
{
  "lodash": "^4.17.21",
  "@types/lodash": "^4.14.0",
  "uuid": "^9.0.0",
  "@types/uuid": "^9.0.0",
  "dayjs": "^1.11.0"
}
```

### 数据存储 (可选)
```json
{
  "better-sqlite3": "^9.0.0",
  "@types/better-sqlite3": "^7.6.0"
}
```

### 任务队列 (可选)
```json
{
  "bull": "^4.11.0",
  "@types/bull": "^4.10.0",
  "redis": "^4.6.0"
}
```

### 中间件
```json
{
  "cors": "^2.8.5",
  "@types/cors": "^2.8.0",
  "helmet": "^7.0.0",
  "compression": "^1.7.4",
  "@types/compression": "^1.7.0",
  "morgan": "^1.10.0",
  "@types/morgan": "^1.9.0"
}
```

### 验证
```json
{
  "zod": "^3.22.0"
}
```

### 环境变量
```json
{
  "dotenv": "^16.3.0"
}
```

### 开发工具
```json
{
  "nodemon": "^3.0.0",
  "ts-node": "^10.9.0",
  "eslint": "^8.50.0",
  "prettier": "^3.0.0",
  "@typescript-eslint/eslint-plugin": "^6.7.0",
  "@typescript-eslint/parser": "^6.7.0"
}
```

## Monorepo工具 (根目录)

```json
{
  "concurrently": "^8.2.0",
  "npm-run-all": "^4.1.5"
}
```

## 推荐的技术选型组合

### 方案A: 轻量级方案
- **前端**: React + Vite + Zustand + Ant Design + Tailwind CSS
- **后端**: Express + TypeScript + 文件系统存储
- **优点**: 简单、快速、易于部署
- **适合**: 个人使用、快速原型

### 方案B: 完整方案
- **前端**: React + Vite + Redux Toolkit + Material-UI + Tailwind CSS
- **后端**: Express + TypeScript + SQLite + Bull队列
- **优点**: 功能完整、可扩展性强
- **适合**: 生产环境、多用户场景

## 推荐使用方案A (轻量级方案)

基于你的需求（个人使用、简易好用），推荐使用方案A：

### 前端核心依赖
- React 18 + TypeScript
- Vite (构建工具)
- React Flow (工作流编辑器)
- Zustand (状态管理)
- Ant Design (UI组件)
- Tailwind CSS (样式)
- Axios (HTTP)
- Socket.io-client (实时通信)

### 后端核心依赖
- Express + TypeScript
- Socket.io (实时通信)
- Multer + Sharp (文件处理)
- Axios (调用AI API)
- 文件系统存储 (简单直接)

## AI API集成

### OpenAI DALL-E
- 官方SDK: `openai` (^4.0.0)
- 文档: https://platform.openai.com/docs/api-reference

### Stable Diffusion
- 自托管: Automatic1111 WebUI API
- 云服务: Stability AI API
- 文档: https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API

### 自定义API
- 支持任何符合REST API规范的服务
- 用户可配置请求格式和响应解析

## 开发环境要求

- Node.js: >= 18.0.0
- npm: >= 9.0.0 或 pnpm >= 8.0.0
- 操作系统: Windows/macOS/Linux

## 可选增强功能

### 图片处理增强
```json
{
  "jimp": "^0.22.0"  // 更多图片处理功能
}
```

### 代码编辑器 (用于高级用户自定义节点)
```json
{
  "@monaco-editor/react": "^4.6.0"
}
```

### 拖拽增强
```json
{
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0"
}
```

### 图表可视化 (执行统计)
```json
{
  "recharts": "^2.9.0"
}
```

---
**最后更新**: 2026-02-11
