/**
 * 加密工具
 * 用于加密和解密敏感信息（如API密钥）
 */

import crypto from 'crypto';

// 加密算法
const ALGORITHM = 'aes-256-cbc';
// 加密密钥（应该从环境变量读取，这里使用默认值）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-me!!';
// 确保密钥长度为32字节
const KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

/**
 * 加密文本
 */
export function encrypt(text: string): string {
  if (!text) return text;

  try {
    // 生成随机IV
    const iv = crypto.randomBytes(16);
    // 创建加密器
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    // 加密
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // 返回IV和加密文本（用:分隔）
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败');
  }
}

/**
 * 解密文本
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  try {
    // 分离IV和加密文本
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('无效的加密格式');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    // 创建解密器
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    // 解密
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('解密失败');
  }
}

/**
 * 生成随机密钥
 */
export function generateKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 哈希文本（用于密码等）
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}
