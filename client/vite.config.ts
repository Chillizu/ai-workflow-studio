import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 构建优化配置
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          // React相关库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI库
          'ui-vendor': ['antd', 'lucide-react'],
          // React Flow
          'flow-vendor': ['@xyflow/react'],
          // 状态管理
          'state-vendor': ['zustand'],
        },
        // 优化chunk文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除console
        drop_console: true,
        drop_debugger: true,
      },
    },
    // chunk大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 生成sourcemap（可选，生产环境可关闭）
    sourcemap: false,
  },
  
  // 开发服务器优化
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/pages/EditorPage.tsx',
        './src/store/workflowStore.ts',
      ],
    },
  },
  
  // 依赖优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@xyflow/react',
      'zustand',
    ],
  },
})
