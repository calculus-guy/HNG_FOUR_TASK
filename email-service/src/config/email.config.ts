import { registerAs } from '@nestjs/config';

export default registerAs('email', () => {
  const getInt = (value: string | undefined, defaultValue: number): number => {
    if (!value) return defaultValue;
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const getString = (value: string | undefined, defaultValue: string): string => {
    return value || defaultValue;
  };

  return {
    port: getInt(process.env.PORT, 3003),
    redis: {
      host: getString(process.env.REDIS_HOST, 'localhost'),
      port: getInt(process.env.REDIS_PORT, 6379),
    },
    rabbitmq: {
      url: getString(process.env.RABBITMQ_URL, 'amqp://admin:password@localhost:5672'),
      queue: getString(process.env.EMAIL_QUEUE, 'email.queue'),
      exchange: getString(process.env.EXCHANGE_NAME, 'notifications.direct'),
    },
    smtp: {
      host: getString(process.env.SMTP_HOST, 'smtp.mailtrap.io'),
      port: getInt(process.env.SMTP_PORT, 2525),
      secure: false,
      auth: {
        user: getString(process.env.SMTP_USER, 'your-mailtrap-user'),
        pass: getString(process.env.SMTP_PASS, 'your-mailtrap-pass'),
      },
      from: getString(process.env.SMTP_FROM, 'noreply@notifications.com'),
    },
    circuitBreaker: {
      failureThreshold: getInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD, 5),
      resetTimeout: getInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT, 30000),
    },
    retry: {
      maxAttempts: getInt(process.env.RETRY_MAX_ATTEMPTS, 3),
      backoffMultiplier: getInt(process.env.RETRY_BACKOFF_MULTIPLIER, 2),
    },
  };
});