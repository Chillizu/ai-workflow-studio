/**
 * 简单的内存缓存工具
 * 支持TTL（生存时间）和LRU（最近最少使用）策略
 */

interface CacheEntry<T> {
  value: T;
  expireAt: number;
  lastAccessed: number;
}

export class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;

  /**
   * @param maxSize 最大缓存条目数
   * @param defaultTTL 默认TTL（毫秒），0表示永不过期
   */
  constructor(maxSize: number = 1000, defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 自定义TTL（毫秒），不传则使用默认值
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const effectiveTTL = ttl !== undefined ? ttl : this.defaultTTL;
    const expireAt = effectiveTTL > 0 ? now + effectiveTTL : Infinity;

    // 如果缓存已满，删除最久未访问的条目
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expireAt,
      lastAccessed: now,
    });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回undefined
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (entry.expireAt < now) {
      this.cache.delete(key);
      return undefined;
    }

    // 更新最后访问时间
    entry.lastAccessed = now;
    return entry.value;
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清理所有过期的缓存条目
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expireAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * 驱逐最近最少使用的条目（LRU策略）
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 获取或设置缓存（如果不存在则调用factory函数生成）
   * @param key 缓存键
   * @param factory 生成缓存值的函数
   * @param ttl 自定义TTL
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}

/**
 * 创建一个带有自动清理的缓存实例
 * @param maxSize 最大缓存条目数
 * @param defaultTTL 默认TTL（毫秒）
 * @param cleanInterval 自动清理间隔（毫秒），0表示不自动清理
 */
export function createCache<T>(
  maxSize: number = 1000,
  defaultTTL: number = 5 * 60 * 1000,
  cleanInterval: number = 60 * 1000
): MemoryCache<T> {
  const cache = new MemoryCache<T>(maxSize, defaultTTL);

  if (cleanInterval > 0) {
    setInterval(() => {
      const cleaned = cache.cleanExpired();
      if (cleaned > 0) {
        console.log(`[Cache] Cleaned ${cleaned} expired entries`);
      }
    }, cleanInterval);
  }

  return cache;
}
