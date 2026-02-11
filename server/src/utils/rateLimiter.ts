/**
 * 请求限流器
 * 使用令牌桶算法实现请求限流
 */

export interface RateLimiterOptions {
  maxTokens: number; // 桶容量（最大令牌数）
  refillRate: number; // 令牌补充速率（令牌/秒）
  refillInterval?: number; // 补充间隔（毫秒）
}

/**
 * 令牌桶限流器
 */
export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private refillInterval: number;
  private lastRefillTime: number;
  private refillTimer?: NodeJS.Timeout;

  constructor(options: RateLimiterOptions) {
    this.maxTokens = options.maxTokens;
    this.refillRate = options.refillRate;
    this.refillInterval = options.refillInterval || 1000; // 默认每秒补充
    this.tokens = this.maxTokens; // 初始时桶是满的
    this.lastRefillTime = Date.now();

    // 启动定时补充
    this.startRefill();
  }

  /**
   * 启动令牌补充
   */
  private startRefill(): void {
    this.refillTimer = setInterval(() => {
      this.refill();
    }, this.refillInterval);
  }

  /**
   * 补充令牌
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefillTime) / 1000; // 转换为秒
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  /**
   * 尝试消费令牌
   * @param tokens 需要消费的令牌数
   * @returns 是否成功消费
   */
  tryConsume(tokens: number = 1): boolean {
    this.refill(); // 先补充令牌

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  /**
   * 等待直到可以消费令牌
   * @param tokens 需要消费的令牌数
   * @param timeout 超时时间（毫秒），0表示无限等待
   * @returns Promise，成功时resolve，超时时reject
   */
  async waitForToken(tokens: number = 1, timeout: number = 0): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        // 检查超时
        if (timeout > 0 && Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error('等待令牌超时'));
          return;
        }

        // 尝试消费令牌
        if (this.tryConsume(tokens)) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100); // 每100ms检查一次
    });
  }

  /**
   * 获取当前可用令牌数
   */
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * 重置限流器
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefillTime = Date.now();
  }

  /**
   * 停止限流器
   */
  stop(): void {
    if (this.refillTimer) {
      clearInterval(this.refillTimer);
      this.refillTimer = undefined;
    }
  }
}

/**
 * 限流器管理器
 * 管理多个限流器实例
 */
export class RateLimiterManager {
  private limiters: Map<string, RateLimiter> = new Map();

  /**
   * 获取或创建限流器
   */
  getLimiter(key: string, options: RateLimiterOptions): RateLimiter {
    if (!this.limiters.has(key)) {
      this.limiters.set(key, new RateLimiter(options));
    }
    return this.limiters.get(key)!;
  }

  /**
   * 移除限流器
   */
  removeLimiter(key: string): void {
    const limiter = this.limiters.get(key);
    if (limiter) {
      limiter.stop();
      this.limiters.delete(key);
    }
  }

  /**
   * 清空所有限流器
   */
  clear(): void {
    this.limiters.forEach(limiter => limiter.stop());
    this.limiters.clear();
  }
}

// 全局限流器管理器实例
export const rateLimiterManager = new RateLimiterManager();
