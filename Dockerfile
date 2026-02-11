# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制包配置文件
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# 安装所有依赖
RUN npm run install:all

# 复制源代码
COPY . .

# 构建所有项目
RUN npm run build

# 生产环境运行阶段
FROM node:18-alpine

WORKDIR /app

# 复制package.json
COPY package.json ./
COPY server/package.json ./server/

# 只安装生产依赖
# 注意：这里我们需要安装server的依赖，可能需要一些调整以避免安装devDependencies
# 简单起见，我们先复制构建好的node_modules，或者重新安装生产依赖
# 为了优化镜像大小，最好重新安装只包含生产依赖的node_modules

WORKDIR /app/server
COPY server/package.json ./
RUN npm install --production

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared ./shared

# 创建必要的目录
RUN mkdir -p server/uploads server/data

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "start:prod"]
