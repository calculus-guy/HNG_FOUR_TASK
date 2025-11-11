// src/services/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { RedisOptions } from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>("REDIS_HOST", "localhost");
    const port = this.configService.get<number>("REDIS_PORT", 6379);
    this.redis = new Redis(port, host, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 2000),
      connectTimeout: 10000,
      lazyConnect: true,
    });
    await this.redis.connect();
    this.logger.log("✅ Redis connected");
  }

  async onModuleDestroy() {
    if (this.redis) await this.redis.quit();
    this.logger.log("🔌 Redis connection closed");
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) await this.redis.setex(key, ttl, value);
    else await this.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  async checkIdempotency(key: string): Promise<boolean> {
    return (await this.exists(key)) === true;
  }

  async setIdempotency(key: string, ttlSeconds: number): Promise<void> {
    await this.set(key, "1", ttlSeconds);
  }

  async ping(): Promise<boolean> {
    try {
      return (await this.redis.ping()) === "PONG";
    } catch {
      return false;
    }
  }
}
