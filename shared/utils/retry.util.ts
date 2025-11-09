import { Logger } from "@nestjs/common";

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

export class RetryHandler {
  private static readonly logger = new Logger(RetryHandler.name);

  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 1000,
      backoffMultiplier = 2,
      shouldRetry = () => true,
    } = options;

    let lastError: any;
    let currentDelay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts || !shouldRetry(error)) {
          this.logger.error(
            `All ${maxAttempts} retry attempts failed: ${error.message}`
          );
          throw error;
        }

        this.logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${currentDelay}ms...`
        );

        await this.delay(currentDelay);
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError;
  }

  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static calculateBackoff(
    attempt: number,
    baseDelay: number = 1000,
    multiplier: number = 2,
    maxDelay: number = 30000
  ): number {
    const delay = Math.min(
      baseDelay * Math.pow(multiplier, attempt - 1),
      maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }
}
