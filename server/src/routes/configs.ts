import { Router, Request, Response } from 'express';
import { APIConfig } from '../../../shared/types';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

const router = Router();

const configDir = path.join(process.cwd(), 'server', 'data', 'configs');

// 初始化配置目录
async function initConfigDir() {
  await fs.mkdir(configDir, { recursive: true });
}

initConfigDir();

/**
 * 获取所有API配置
 */
router.get('/apis', async (_req: Request, res: Response) => {
  try {
    const files = await fs.readdir(configDir);
    const configs: APIConfig[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(configDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        configs.push(JSON.parse(content));
      }
    }
    
    return res.json(configs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 添加API配置
 */
router.post('/apis', async (req: Request, res: Response) => {
  try {
    const config: APIConfig = {
      ...req.body,
      id: uuid()
    };
    
    const filePath = path.join(configDir, `${config.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(config, null, 2));
    
    return res.status(201).json(config);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 更新API配置
 */
router.put('/apis/:id', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(configDir, `${req.params.id}.json`);
    
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'API配置不存在' });
    }
    
    const config: APIConfig = {
      ...req.body,
      id: req.params.id
    };
    
    await fs.writeFile(filePath, JSON.stringify(config, null, 2));
    return res.json(config);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 删除API配置
 */
router.delete('/apis/:id', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(configDir, `${req.params.id}.json`);
    await fs.unlink(filePath);
    return res.json({ message: 'API配置已删除' });
  } catch (error: any) {
    return res.status(404).json({ error: 'API配置不存在' });
  }
});

export default router;
