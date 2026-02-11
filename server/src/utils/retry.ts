/**
 * 重试机制工具
 * 实现指数退避重试策略
 */

export interface RetryOptions {
  maxRetries: number;
  initialDelay: number; // 初始延迟（毫秒）
  maxDelay: number; // 最大延迟（毫秒）
  backoffMultiplier: number; // 退避倍数
  retryableErrors?: string[]; // 可重试的错误类型
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

/**
 * 延迟函数
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 计算退避延迟
 */
const calculateBackoff = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number => {
  const backoff = initialDelay * Math.pow(multiplier, attempt);
  // 添加随机抖动（±25%）以避免雷鸣群效应
  const jitter = backoff * 0.25 * (Math.random() * 2 - 1);
  return Math.min(backoff + jitter, maxDelay);
};

/**
 * 判断错误是否可重试
 */
const isRetryableError = (error: any, retryableErrors?: string[]): boolean => {
  if (!error) return false;

  // 如果指定了可重试错误类型，检查是否匹配
  if (retryableErrors && retryableErrors.length > 0) {
    return retryableErrors.includes(error.type || error.code || error.name);
  }

  // 默认可重试的错误
  const defaultRetryable = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'RATE_LIMIT_ERROR',
    'API_ERROR',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNABORTED',
  ];

  const errorType = error.type || error.code || error.name;
  if (defaultRetryable.includes(errorType)) {
    return true;
  }

  // 检查HTTP状态码
  if (error.response?.status) {
    const status = error.response.status;
    // 429 (Too Many Requests) 和 5xx 错误可重试
    return status === 429 || status >= 500;
  }

  // 检查是否明确标记为可重试
  if (error.retryable === true) {
    return true;
  }

  return false;
};

/**
 * 带重试的异步函数执行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === opts.maxRetries) {
        throw error;
      }

      // 检查错误是否可重试
      if (!isRetryableError(error, opts.retryableErrors)) {
        throw error;
      }

      // 计算退避延迟
      const backoffDelay = calculateBackoff(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      console.log(
        `重试 ${attempt + 1}/${opts.maxRetries}，等待 ${Math.round(backoffDelay)}ms...`,
        (error as any).message || error
      );

      // 等待后重试
      await delay(backoffDelay);
    }
  }

  // 理论上不会到达这里，但为了类型安全
  throw lastError;
}

/**
 * 重试装饰器（用于类方法）
 */
export function Retry(options: Partial<RetryOptions> = {}) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}
