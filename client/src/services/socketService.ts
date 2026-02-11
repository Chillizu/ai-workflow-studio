/**
 * WebSocket服务
 * 使用Socket.io实现实时通信
 */

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

// 执行事件数据
export interface ExecutionEvent {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  nodeId?: string;
  nodeStatus?: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  progress?: number;
}

// 事件监听器类型
type EventListener = (data: ExecutionEvent) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, EventListener[]> = new Map();

  /**
   * 连接到Socket.io服务器
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket已连接');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket已断开');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket错误:', error);
    });

    // 监听执行事件
    this.socket.on('execution:start', (data: ExecutionEvent) => {
      this.emit('execution:start', data);
    });

    this.socket.on('execution:progress', (data: ExecutionEvent) => {
      this.emit('execution:progress', data);
    });

    this.socket.on('execution:complete', (data: ExecutionEvent) => {
      this.emit('execution:complete', data);
    });

    this.socket.on('execution:error', (data: ExecutionEvent) => {
      this.emit('execution:error', data);
    });

    this.socket.on('node:start', (data: ExecutionEvent) => {
      this.emit('node:start', data);
    });

    this.socket.on('node:complete', (data: ExecutionEvent) => {
      this.emit('node:complete', data);
    });

    this.socket.on('node:error', (data: ExecutionEvent) => {
      this.emit('node:error', data);
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * 监听事件
   */
  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: EventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: ExecutionEvent): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * 订阅执行
   */
  subscribeToExecution(executionId: string): void {
    if (this.socket) {
      this.socket.emit('subscribe:execution', { executionId });
    }
  }

  /**
   * 取消订阅执行
   */
  unsubscribeFromExecution(executionId: string): void {
    if (this.socket) {
      this.socket.emit('unsubscribe:execution', { executionId });
    }
  }
}

// 导出单例
export const socketService = new SocketService();
