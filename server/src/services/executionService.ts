import { ExecutionRecord } from '../../../shared/types';
import fs from 'fs/promises';
import path from 'path';

/**
 * 执行记录服务
 * 负责执行记录的管理
 */
export class ExecutionService {
  private dataDir: string;
  
  constructor() {
    this.dataDir = path.join(process.cwd(), 'server', 'data', 'executions');
  }
  
  /**
   * 初始化数据目录
   */
  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }
  
  /**
   * 保存执行记录
   */
  async save(execution: ExecutionRecord): Promise<void> {
    const filePath = path.join(this.dataDir, `${execution.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(execution, null, 2));
  }
  
  /**
   * 根据ID获取执行记录
   */
  async getById(id: string): Promise<ExecutionRecord | null> {
    try {
      const filePath = path.join(this.dataDir, `${id}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 获取工作流的所有执行记录
   */
  async getByWorkflowId(workflowId: string): Promise<ExecutionRecord[]> {
    try {
      const files = await fs.readdir(this.dataDir);
      const executions: ExecutionRecord[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const execution = JSON.parse(content);
          
          if (execution.workflowId === workflowId) {
            executions.push(execution);
          }
        }
      }
      
      // 按开始时间倒序排序
      return executions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      return [];
    }
  }
  
  /**
   * 获取所有执行记录
   */
  async getAll(): Promise<ExecutionRecord[]> {
    try {
      const files = await fs.readdir(this.dataDir);
      const executions: ExecutionRecord[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          executions.push(JSON.parse(content));
        }
      }
      
      // 按开始时间倒序排序
      return executions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      return [];
    }
  }
  
  /**
   * 更新执行记录
   */
  async update(id: string, updates: Partial<ExecutionRecord>): Promise<ExecutionRecord | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }
    
    const updated = {
      ...existing,
      ...updates
    };
    
    await this.save(updated);
    return updated;
  }
}
