import { Workflow } from '../../../shared/types';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

/**
 * 工作流服务
 * 负责工作流的CRUD操作
 */
export class WorkflowService {
  private dataDir: string;
  
  constructor() {
    this.dataDir = path.join(process.cwd(), 'server', 'data', 'workflows');
  }
  
  /**
   * 初始化数据目录
   */
  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }
  
  /**
   * 获取所有工作流
   */
  async getAll(): Promise<Workflow[]> {
    try {
      const files = await fs.readdir(this.dataDir);
      const workflows: Workflow[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          workflows.push(JSON.parse(content));
        }
      }
      
      return workflows;
    } catch (error) {
      return [];
    }
  }
  
  /**
   * 根据ID获取工作流
   */
  async getById(id: string): Promise<Workflow | null> {
    try {
      const filePath = path.join(this.dataDir, `${id}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 创建工作流
   */
  async create(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflow,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const filePath = path.join(this.dataDir, `${newWorkflow.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(newWorkflow, null, 2));
    
    return newWorkflow;
  }
  
  /**
   * 更新工作流
   */
  async update(id: string, workflow: Partial<Workflow>): Promise<Workflow | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }
    
    const updated: Workflow = {
      ...existing,
      ...workflow,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    };
    
    const filePath = path.join(this.dataDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    
    return updated;
  }
  
  /**
   * 删除工作流
   */
  async delete(id: string): Promise<boolean> {
    try {
      const filePath = path.join(this.dataDir, `${id}.json`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
}
