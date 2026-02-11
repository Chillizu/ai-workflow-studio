import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

/**
 * 文件服务
 * 负责文件的上传和管理
 */
export class FileService {
  private uploadDir: string;
  
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'server', 'uploads');
  }
  
  /**
   * 初始化上传目录
   */
  async init() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }
  
  /**
   * 保存上传的文件
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileId = uuid();
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    
    await fs.writeFile(filePath, file.buffer);
    
    return `/uploads/${filename}`;
  }
  
  /**
   * 获取文件路径
   */
  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }
  
  /**
   * 删除文件
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
}
