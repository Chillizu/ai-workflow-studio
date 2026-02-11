import { Router, Request, Response } from 'express';
import { ExecutionService } from '../services/executionService';

const router = Router();

/**
 * 获取所有执行记录
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const executionService: ExecutionService = req.app.locals.executionService;
    const executions = await executionService.getAll();
    return res.json(executions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 获取单个执行记录
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const executionService: ExecutionService = req.app.locals.executionService;
    const execution = await executionService.getById(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: '执行记录不存在' });
    }
    
    return res.json(execution);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 获取执行结果
 */
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const executionService: ExecutionService = req.app.locals.executionService;
    const execution = await executionService.getById(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: '执行记录不存在' });
    }
    
    return res.json({
      executionId: execution.id,
      status: execution.status,
      results: execution.nodeResults,
      error: execution.error
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
