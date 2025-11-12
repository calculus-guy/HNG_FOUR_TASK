import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQProvider } from '../queues/rabbitmq.provider';
import { EmailService } from '../services/email.service';
import { TemplateService } from '../services/template.service';
import { RedisService } from '../services/redis.service';
import { EmailMessage, EmailRequest, EmailResult } from '../interface/email.interface';
import { logger } from '../utils/logger';
import * as Handlebars from 'handlebars';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class EmailConsumer implements OnModuleInit, OnModuleDestroy {
  private consumerRunning = false;

  constructor(
    private configService: ConfigService,
    private rabbitMQProvider: RabbitMQProvider,
    private emailService: EmailService,
    private templateService: TemplateService,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  async onModuleDestroy() {
    await this.stop();
  }

  async start(): Promise<void> {
    if (this.consumerRunning) {
      logger.warn('Email consumer is already running');
      return;
    }

    try {
      await this.rabbitMQProvider.waitForConnection();
      await this.setupConsumer();
      this.consumerRunning = true;
      
      logger.info('Email consumer started successfully');
    } catch (error) {
      logger.error('Failed to start email consumer', error);
      throw error;
    }
  }

  private async setupConsumer(): Promise<void> {
    const channel = this.rabbitMQProvider.getChannel();
    const queueConfig = this.configService.get('email.rabbitmq');

    if (!queueConfig) {
      throw new Error('RabbitMQ queue configuration not found');
    }

    await channel.consume(
      queueConfig.queue,
      async (msg) => {
        if (msg) {
          await this.processMessage(msg);
        }
      },
      { noAck: false }
    );

    logger.info(`Email consumer listening on queue: ${queueConfig.queue}`);
  }

  private async processMessage(msg: ConsumeMessage): Promise<void> {
    const correlationId = msg.properties.messageId || 'unknown';
    const channel = this.rabbitMQProvider.getChannel();
    
    try {
      const emailMessage: EmailMessage = JSON.parse(msg.content.toString());
      
      // Check for duplicate processing
      if (await this.checkDuplicate(emailMessage.correlation_id)) {
        logger.warn('Duplicate message detected, acknowledging and skipping', {
          correlationId: emailMessage.correlation_id,
        });
        await channel.ack(msg);
        return;
      }

      logger.info('Processing email message', {
        correlationId,
        userId: emailMessage.user_id,
        templateId: emailMessage.template_id,
      });

      // Report processing status
      await this.reportStatus(emailMessage.correlation_id, 'processing');

      // Process the email with retry logic
      const result = await this.processEmailWithRetry(emailMessage);

      if (result.success) {
        await channel.ack(msg);
        
        // Mark as processed to prevent duplicates
        await this.markAsProcessed(emailMessage.correlation_id);
        
        // Report success status
        await this.reportStatus(emailMessage.correlation_id, 'delivered', {
          messageId: result.messageId,
        });
        
        logger.info('Email processed successfully', {
          correlationId,
          messageId: result.messageId,
        });
      } else {
        await channel.nack(msg, false, false);
        
        await this.reportStatus(emailMessage.correlation_id, 'failed', {
          error: result.error,
          final_attempt: true,
        });
        
        logger.error('Email processing failed, sent to DLQ via nack', {
          correlationId,
          error: result.error,
        });
      }
    } catch (error) {
      logger.error('Failed to process email message', {
        correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      await this.reportStatus(correlationId, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      await channel.nack(msg, false, false);
    }
  }

  private async processEmailWithRetry(
    emailMessage: EmailMessage,
    attempt = 1
  ): Promise<EmailResult> {
    try {
      const template = this.templateService.compileTemplate(
        emailMessage.template_data.body,
        emailMessage.template_id
      );

      const renderedBody = this.templateService.renderTemplate(
        template,
        emailMessage.context
      );

      const subjectTemplate = Handlebars.compile(emailMessage.template_data.subject);
      const renderedSubject = this.templateService.renderTemplate(
        subjectTemplate,
        emailMessage.context
      );

      const emailRequest: EmailRequest = {
        to: emailMessage.user_data.email,
        subject: renderedSubject,
        html: renderedBody,
        correlationId: emailMessage.correlation_id,
      };

      return await this.emailService.sendEmail(emailRequest);

    } catch (error) {
      const retryConfig = this.configService.get('email.retry');
      
      if (attempt >= retryConfig.maxAttempts) {
        return {
          success: false,
          error: `Failed after ${attempt} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          correlationId: emailMessage.correlation_id,
        };
      }

      const backoffTime = Math.pow(retryConfig.backoffMultiplier, attempt - 1) * 1000;
      logger.warn(`Retrying email send attempt ${attempt}`, {
        correlationId: emailMessage.correlation_id,
        backoffTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return this.processEmailWithRetry(emailMessage, attempt + 1);
    }
  }

  // Idempotency: Check if message was already processed
  async checkDuplicate(requestId: string): Promise<boolean> {
    try {
      const processed = await this.redisService.exists(`processed:${requestId}`);
      return processed;
    } catch (error) {
      logger.warn('Failed to check duplicate', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false; 
    }
  }

  // Idempotency: Mark message as processed
  async markAsProcessed(requestId: string): Promise<void> {
    try {
      await this.redisService.set(`processed:${requestId}`, 'true', 86400);
    } catch (error) {
      logger.warn('Failed to mark message as processed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async reportStatus(notificationId: string, status: string, additionalData?: any): Promise<void> {
    try {
      const statusPayload = {
        notification_id: notificationId,
        status: status,
        timestamp: new Date().toISOString(),
        service: 'email-service',
        ...additionalData,
      };
      logger.info('Status report', statusPayload);

    } catch (error) {
      logger.warn('Failed to report status', {
        notificationId,
        status,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async stop(): Promise<void> {
    if (!this.consumerRunning) {
      return;
    }
    this.consumerRunning = false;
    logger.info('Email consumer stopped');
  }

  isRunning(): boolean {
    return this.consumerRunning;
  }
}