import { Router, Request, Response } from 'express';
import { configService } from '../services/configService';
import { CreateAPIConfigParams, UpdateAPIConfigParams } from '../models/apiConfig';

const router = Router();

/**
 * 获取所有API配置
 */
router.get('/apis', async (_req: Request, res: Response) => {
  try {
    const configs = await configService.getAll();
    // 返回安全的JSON（不包含敏感信息）
    const safeConfigs = configs.map(config => config.toSafeJSON());
    return res.json(safeConfigs);
  } catch (error: any) {
    console.error('获取API配置失败:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 根据ID获取API配置
 */
router.get('/apis/:id', async (req: Request, res: Response) => {
  try {
    const config = await configService.getById(req.params.id);
    if (!config) {
      return res.status(404).json({ error: 'API配置不存在' });
    }
    return res.json(config.toSafeJSON());
  } catch (error: any) {
    console.error('获取API配置失败:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 创建API配置
 */
router.post('/apis', async (req: Request, res: Response) => {
  try {
    const params: CreateAPIConfigParams = req.body;
    const config = await configService.create(params);
    return res.status(201).json(config.toSafeJSON());
  } catch (error: any) {
    console.error('创建API配置失败:', error);
    return res.status(400).json({ error: error.message });
  }
});

/**
 * 更新API配置
 */
router.put('/apis/:id', async (req: Request, res: Response) => {
  try {
    const params: UpdateAPIConfigParams = req.body;
    const config = await configService.update(req.params.id, params);
    return res.json(config.toSafeJSON());
  } catch (error: any) {
    console.error('更新API配置失败:', error);
    const status = error.message.includes('不存在') ? 404 : 400;
    return res.status(status).json({ error: error.message });
  }
});

/**
 * 删除API配置
 */
router.delete('/apis/:id', async (req: Request, res: Response) => {
  try {
    const success = await configService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'API配置不存在' });
    }
    return res.json({ message: 'API配置已删除' });
  } catch (error: any) {
    console.error('删除API配置失败:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 测试API连接
 */
router.post('/apis/:id/test', async (req: Request, res: Response) => {
  try {
    const result = await configService.testConnection(req.params.id);
    return res.json(result);
  } catch (error: any) {
    console.error('测试连接失败:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * 获取可用模型列表
 */
router.get('/apis/:id/models', async (req: Request, res: Response) => {
  try {
    const models = await configService.getAvailableModels(req.params.id);
    return res.json({ models });
  } catch (error: any) {
    console.error('获取模型列表失败:', error);
    const status = error.message.includes('不存在') ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
});

export default router;
