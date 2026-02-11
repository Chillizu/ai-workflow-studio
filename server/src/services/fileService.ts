import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

/**
 * 文件服务
 * 负责文件的上传和管理
 * 包含自动清理过期文件的功能
 */
export class FileService {
  private uploadDir: string;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private fileMaxAge: number = 7 * 24 * 60 * 60 * 1000; // 7天
  
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'server', 'uploads');
  }
  
  /**
   * 初始化上传目录并启动自动清理
   */
  async init() {
    await fs.mkdir(this.uploadDir, { recursive: true });
    
    // 启动定期清理任务（每天执行一次）
    this.startCleanupTask();
    
    // 初始化时立即执行一次清理
    await this.cleanupOldFiles();
  }
  
  /**
   * 启动定期清理任务
   */
  private startCleanupTask() {
    // 每24小时执行一次清理
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupOldFiles();
    }, 24 * 60 * 60 * 1000);
  }
  
  /**
   * 停止清理任务
   */
  stopCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * 清理过期文件
   */
  async cleanupOldFiles(): Promise<number> {
    try {
      const files = await fs.readdir(this.uploadDir);
      const now = Date.now();
      let cleaned = 0;
      
      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        
        try {
          const stats = await fs.stat(filePath);
          const fileAge = now - stats.mtimeMs;
          
          // 如果文件超过最大保留时间，删除它
          if (fileAge > this.fileMaxAge) {
            await fs.unlink(filePath);
            cleaned++;
            console.log(`[FileService] 清理过期文件: ${file}`);
          }
        } catch (error) {
          console.error(`[FileService] 检查文件失败: ${file}`, error);
        }
      }
      
      if (cleaned > 0) {
        console.log(`[FileService] 清理了 ${cleaned} 个过期文件`);
      }
      
      return cleaned;
    } catch (error) {
      console.error('[FileService] 清理文件失败:', error);
      return 0;
    }
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
  
  /**
   * 获取上传目录的统计信息
   */
  async getStats(): Promise<{ totalFiles: number; totalSize: number }> {
    try {
      const files = await fs.readdir(this.uploadDir);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        try {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        } catch (error) {
          // 忽略单个文件的错误
        }
      }
      
      return {
        totalFiles: files.length,
        totalSize,
      };
    } catch (error) {
      return {
        totalFiles: 0,
        totalSize: 0,
      };
    }
  }
}
