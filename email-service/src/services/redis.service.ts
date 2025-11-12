import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '../utils/logger';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private redis: any,
  ) {}

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.redis) {
      logger.warn('Redis client not available - skipping set operation');
      return;
    }
    
    try {
      if (ttl) {
        await this.redis.setEx(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      logger.warn('Redis set operation failed', { error: errorMessage });
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.redis) {
      logger.warn('Redis client not available - skipping get operation');
      return null;
    }
    
    try {
      return await this.redis.get(key);
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      logger.warn('Redis get operation failed', { error: errorMessage });
      return null;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.redis) {
      logger.warn('Redis client not available - skipping incr operation');
      return 0;
    }
    
    try {
      return await this.redis.incr(key);
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      logger.warn('Redis incr operation failed', { error: errorMessage });
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.redis) {
      logger.warn('Redis client not available - skipping expire operation');
      return;
    }
    
    try {
      await this.redis.expire(key, seconds);
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      logger.warn('Redis expire operation failed', { error: errorMessage });
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      logger.warn('Redis client not available - skipping exists operation');
      return false;
    }
    
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      logger.warn('Redis exists operation failed', { error: errorMessage });
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.redis) {
      logger.warn('Redis client not available for health check');
      return false;
    }
    
    try {
      await this.redis.ping();
      return true;
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      logger.error('Redis health check failed', { error: errorMessage });
      return false;
    }
  }

  async getMetrics(): Promise<any> {
    if (!this.redis) {
      logger.warn('Redis client not available for metrics');
      return {};
    }
    
    try {
      const emailsSent = await this.get('email-service:emails-sent') || '0';
      const emailsFailed = await this.get('email-service:emails-failed') || '0';
      const circuitBreakerState = await this.get('email-service:circuit-breaker') || 'UNKNOWN';
      
      return {
        emails_sent: parseInt(emailsSent),
        emails_failed: parseInt(emailsFailed),
        circuit_breaker_state: circuitBreakerState,
      };
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      logger.error('Failed to get Redis metrics', { error: errorMessage });
      return {};
    }
  }
}