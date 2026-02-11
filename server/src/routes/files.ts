import { Router, Request, Response } from 'express';
import { FileService } from '../services/fileService';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * 上传文件
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    const fileService: FileService = req.app.locals.fileService;
    const fileUrl = await fileService.saveFile(req.file);
    
    return res.json({
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 获取文件信息
 */
router.get('/:filename', (req: Request, res: Response) => {
  try {
    const fileService: FileService = req.app.locals.fileService;
    const filePath = fileService.getFilePath(req.params.filename);
    return res.sendFile(filePath);
  } catch (error: any) {
    return res.status(404).json({ error: '文件不存在' });
  }
});

export default router;
