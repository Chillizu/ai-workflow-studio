import { Router, Request, Response } from 'express';
import { WorkflowService } from '../services/workflowService';
import { ExecutionService } from '../services/executionService';
import { WorkflowEngine } from '../engine/engine';
import { z } from 'zod';

const router = Router();

// 验证schema
const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  nodes: z.array(z.any()),
  edges: z.array(z.any())
});

/**
 * 获取所有工作流
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const workflowService: WorkflowService = req.app.locals.workflowService;
    const workflows = await workflowService.getAll();
    res.json(workflows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取单个工作流
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflowService: WorkflowService = req.app.locals.workflowService;
    const workflow = await workflowService.getById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: '工作流不存在' });
    }
    
    return res.json(workflow);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 创建工作流
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createWorkflowSchema.parse(req.body);
    const workflowService: WorkflowService = req.app.locals.workflowService;
    const workflow = await workflowService.create(data);
    return res.status(201).json(workflow);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: '验证失败', details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 更新工作流
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const workflowService: WorkflowService = req.app.locals.workflowService;
    const workflow = await workflowService.update(req.params.id, req.body);
    
    if (!workflow) {
      return res.status(404).json({ error: '工作流不存在' });
    }
    
    return res.json(workflow);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 删除工作流
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const workflowService: WorkflowService = req.app.locals.workflowService;
    const success = await workflowService.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: '工作流不存在' });
    }
    
    return res.json({ message: '工作流已删除' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 执行工作流
 */
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const workflowService: WorkflowService = req.app.locals.workflowService;
    const executionService: ExecutionService = req.app.locals.executionService;
    const workflowEngine: WorkflowEngine = req.app.locals.workflowEngine;
    
    const workflow = await workflowService.getById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: '工作流不存在' });
    }
    
    // 异步执行工作流
    const startTime = new Date();
    const result = await workflowEngine.execute(workflow);
    const endTime = new Date();
    
    // 保存执行记录
    await executionService.save({
      id: result.executionId,
      workflowId: workflow.id,
      status: result.status === 'completed' ? 'completed' : 'failed',
      startTime,
      endTime,
      nodeResults: result.results || {},
      error: result.errors?.join(', ')
    });
    
    return res.json(result);
    
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
