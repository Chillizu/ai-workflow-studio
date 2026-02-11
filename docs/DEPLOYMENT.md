# 部署指南

本文档详细介绍了 AI 工作流系统的多种部署方案，包括 Docker 部署、传统 Node.js 部署和云平台部署。

## 环境变量配置

在部署前，请确保正确配置环境变量。你可以复制 `.env.example` 为 `.env` 并修改相应的值。

```bash
cp .env.example .env
```

### 关键变量说明

| 变量名 | 描述 | 默认值 | 必填 |
|--------|------|--------|------|
| `NODE_ENV` | 环境模式 (development/production) | development | 是 |
| `PORT` | 服务端口 | 3000 | 否 |
| `HOST` | 监听地址 | 0.0.0.0 | 否 |
| `CLIENT_URL` | 前端访问地址 (CORS配置) | http://localhost:5173 | 否 |
| `ENCRYPTION_KEY` | 数据加密密钥 (32字符以上) | (必须设置) | 是 |
| `UPLOAD_DIR` | 上传文件存储目录 | ./uploads | 否 |
| `DATA_DIR` | 数据存储目录 | ./data | 否 |
| `VITE_API_URL` | 前端API请求地址 | /api | 否 |

---

## 方案一：Docker 部署 (推荐)

使用 Docker Compose 可以快速启动完整的服务环境。

### 前置要求

- Docker Engine 19.03+
- Docker Compose 1.25+

### 部署步骤

1. **构建并启动服务**

   ```bash
   docker-compose up -d --build
   ```

2. **查看日志**

   ```bash
   docker-compose logs -f
   ```

3. **停止服务**

   ```bash
   docker-compose down
   ```

### 数据持久化

默认配置下，上传的文件和数据会挂载到宿主机的 `./uploads` 和 `./data` 目录。

---

## 方案二：传统 Node.js 部署 (PM2 + Nginx)

适用于传统的云服务器环境（如 CentOS, Ubuntu）。

### 前置要求

- Node.js 18+
- NPM 9+
- PM2 (`npm install -g pm2`)
- Nginx

### 部署步骤

1. **安装依赖**

   ```bash
   npm run install:all
   ```

2. **构建项目**

   ```bash
   npm run build
   ```
   此命令会同时构建前端和后端。

3. **启动服务 (使用 PM2)**

   ```bash
   cd server
   pm2 start dist/index.js --name "ai-workflow-server"
   ```

4. **配置 Nginx 反向代理**

   创建 Nginx 配置文件 `/etc/nginx/conf.d/ai-workflow.conf`：

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # 增加上传文件大小限制
       client_max_body_size 50M;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

5. **重启 Nginx**

   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 方案三：云平台部署

### Railway / Render

本项目支持基于 `Dockerfile` 的云平台部署。

1. **连接仓库**
   在 Railway 或 Render 中连接你的 GitHub 仓库。

2. **配置环境变量**
   在平台设置中添加环境变量（参考 `.env.example`）。
   注意生成一个安全的 `ENCRYPTION_KEY`。

3. **部署**
   平台会自动检测 `Dockerfile` 并开始构建。
   
   *注意：由于这是一个 Monorepo，构建过程可能需要较多内存，建议选择至少 1GB 内存的实例。*

---

## 健康检查

后端服务提供了健康检查端点，用于监控服务状态。

- **GET** `/health` - 基础健康检查
- **GET** `/api/health` - 详细环境信息

示例响应：
```json
{
  "status": "ok",
  "message": "AI工作流系统后端服务运行中"
}
```
