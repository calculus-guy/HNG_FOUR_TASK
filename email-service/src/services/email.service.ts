import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { FastifyRedis } from '@fastify/redis';
import * as nodemailer from 'nodemailer';
import CircuitBreaker from 'opossum';
import { ConfigService } from '@nestjs/config';
import { EmailRequest, EmailResult, CircuitBreakerState } from '../interface/email.interface';
import { logger } from '../utils/logger';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter!: nodemailer.Transporter;
  private circuitBreaker!: CircuitBreaker<[EmailRequest], EmailResult>;
  private state: CircuitBreakerState = {
    state: 'CLOSED',
    failures: 0,
  };

  constructor(
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private redis: any,
  ) {}

  async onModuleInit() {
    await this.initializeTransporter();
    this.initializeCircuitBreaker();
  }

  private async initializeTransporter(): Promise<void> {
    const smtpConfig = this.configService.get('email.smtp');

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
    });

    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');

      try {
        if (this.redis) {
          await this.redis.set('email-service:smtp-health', 'healthy', 'EX', 60);
        }
      } catch (err) {
        logger.warn('Unable to write smtp health to redis', err);
      }
    } catch (error) {
      logger.error('SMTP connection verification failed - continuing in degraded mode', error);
      
      try {
        if (this.redis) {
          await this.redis.set('email-service:smtp-health', 'unhealthy', 'EX', 60);
        }
      } catch (err) {
        logger.warn('Unable to write smtp health to redis', err);
      }
    }
  }

  private initializeCircuitBreaker(): void {
    const circuitBreakerConfig = this.configService.get('email.circuitBreaker') || { resetTimeout: 30000 };

    this.circuitBreaker = new CircuitBreaker<[EmailRequest], EmailResult>(
      this.sendEmailInternal.bind(this),
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: circuitBreakerConfig.resetTimeout,
      }
    );

    this.setupCircuitBreakerEvents();
  }

  private setupCircuitBreakerEvents(): void {
    this.circuitBreaker.on('open', () => {
      this.state.state = 'OPEN';
      logger.warn('Circuit breaker opened', {
        failures: this.state.failures,
      });

      try {
        if (this.redis) {
          this.redis.set('email-service:circuit-breaker', 'OPEN', 'EX', 30);
        }
      } catch (err) {
        logger.warn('Unable to write circuit-breaker state to redis', err);
      }
    });

    this.circuitBreaker.on('halfOpen', () => {
      this.state.state = 'HALF_OPEN';
      logger.info('Circuit breaker half-open - testing recovery');
      try {
        if (this.redis) {
          this.redis.set('email-service:circuit-breaker', 'HALF_OPEN', 'EX', 30);
        }
      } catch (err) {
        logger.warn('Unable to write circuit-breaker state to redis', err);
      }
    });

    this.circuitBreaker.on('close', () => {
      this.state.state = 'CLOSED';
      this.state.failures = 0;
      logger.info('Circuit breaker closed - service recovered');
      try {
        if (this.redis) {
          this.redis.set('email-service:circuit-breaker', 'CLOSED', 'EX', 30);
        }
      } catch (err) {
        logger.warn('Unable to write circuit-breaker state to redis', err);
      }
    });

    this.circuitBreaker.on('failure', (error: any) => {
      this.state.failures++;
      logger.error('Circuit breaker recorded failure', {
        failureCount: this.state.failures,
        error: error?.message ?? error,
      });
    });
  }

  private async sendEmailInternal(request: EmailRequest): Promise<EmailResult> {
    try {
      const smtpConfig = this.configService.get('email.smtp');

      const mailOptions = {
        from: smtpConfig.from,
        to: request.to,
        subject: request.subject,
        html: request.html,
        headers: {
          'X-Correlation-ID': request.correlationId,
        },
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        correlationId: request.correlationId,
        messageId: info.messageId,
        to: request.to,
      });
      try {
        if (this.redis) {
          await this.redis.incr('email-service:emails-sent');
          await this.redis.expire('email-service:emails-sent', 86400); // 24 hours
        }
      } catch (err) {
        logger.warn('Unable to update redis metrics for emails-sent', err);
      }

      return {
        success: true,
        messageId: info.messageId,
        correlationId: request.correlationId,
      };
    } catch (error: any) {
      logger.error('Failed to send email', {
        correlationId: request.correlationId,
        to: request.to,
        error: error instanceof Error ? error.message : error,
      });

      try {
        if (this.redis) {
          await this.redis.incr('email-service:emails-failed');
          await this.redis.expire('email-service:emails-failed', 86400);
        }
      } catch (err) {
        logger.warn('Unable to update redis metrics for emails-failed', err);
      }

      throw error;
    }
  }

  async sendEmail(request: EmailRequest): Promise<EmailResult> {
    if (!this.circuitBreaker) {
      logger.warn('Circuit breaker not initialized, attempting direct send');
      try {
        return await this.sendEmailInternal(request);
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
          correlationId: request.correlationId,
        };
      }
    }

    if ((this.circuitBreaker as any).opened) {
      logger.warn('Email rejected - circuit breaker open', {
        correlationId: request.correlationId,
      });

      return {
        success: false,
        error: 'Service temporarily unavailable',
        correlationId: request.correlationId,
      };
    }

    try {
      const result = await this.circuitBreaker.fire(request);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        correlationId: request.correlationId,
      };
    }
  }

  getCircuitBreakerState(): CircuitBreakerState {
    return { ...this.state };
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const isConnected = await this.transporter.verify();
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        details: {
          circuitBreaker: this.state,
          smtp: {
            host: this.configService.get('email.smtp.host'),
            port: this.configService.get('email.smtp.port'),
          },
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        details: {
          error: error?.message ?? error,
          circuitBreaker: this.state,
        },
      };
    }
  }
}