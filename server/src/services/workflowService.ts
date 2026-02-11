import { Workflow } from '../../../shared/types';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { createCache, MemoryCache } from '../utils/cache';

/**
 * 工作流服务
 * 负责工作流的CRUD操作
 * 使用内存缓存优化读取性能
 */
export class WorkflowService {
  private dataDir: string;
  private cache: MemoryCache<Workflow>;
  private listCache: MemoryCache<Workflow[]>;
  
  constructor() {
    this.dataDir = path.join(process.cwd(), 'server', 'data', 'workflows');
    // 单个工作流缓存：最多500个，TTL 5分钟
    this.cache = createCache<Workflow>(500, 5 * 60 * 1000);
    // 列表缓存：最多10个，TTL 1分钟
    this.listCache = createCache<Workflow[]>(10, 60 * 1000);
  }
  
  /**
   * 初始化数据目录
   */
  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }
  
  /**
   * 获取所有工作流（带缓存）
   */
  async getAll(): Promise<Workflow[]> {
    return this.listCache.getOrSet('all', async () => {
      try {
        const files = await fs.readdir(this.dataDir);
        const workflows: Workflow[] = [];
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(this.dataDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const workflow = JSON.parse(content);
            workflows.push(workflow);
            // 同时更新单个工作流缓存
            this.cache.set(workflow.id, workflow);
          }
        }
        
        return workflows;
      } catch (error) {
        return [];
      }
    });
  }
  
  /**
   * 根据ID获取工作流（带缓存）
   */
  async getById(id: string): Promise<Workflow | null> {
    return this.cache.getOrSet(id, async () => {
      try {
        const filePath = path.join(this.dataDir, `${id}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      } catch (error) {
        return null;
      }
    });
  }
  
  /**
   * 创建工作流（清除缓存）
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
    
    // 更新缓存
    this.cache.set(newWorkflow.id, newWorkflow);
    // 清除列表缓存
    this.listCache.clear();
    
    return newWorkflow;
  }
  
  /**
   * 更新工作流（更新缓存）
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
    
    // 更新缓存
    this.cache.set(id, updated);
    // 清除列表缓存
    this.listCache.clear();
    
    return updated;
  }
  
  /**
   * 删除工作流（清除缓存）
   */
  async delete(id: string): Promise<boolean> {
    try {
      const filePath = path.join(this.dataDir, `${id}.json`);
      await fs.unlink(filePath);
      
      // 清除缓存
      this.cache.delete(id);
      this.listCache.clear();
      
      return true;
    } catch (error) {
      return false;
    }
  }
}
