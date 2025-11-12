export const logger = {
  info(message: string, meta?: any) {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      service: 'email-service',
      message,
      ...meta,
    }));
  },

  error(message: string, error?: any, meta?: any) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      service: 'email-service',
      message,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...meta,
    }));
  },

  warn(message: string, meta?: any) {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      service: 'email-service',
      message,
      ...meta,
    }));
  },

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        level: 'debug',
        timestamp: new Date().toISOString(),
        service: 'email-service',
        message,
        ...meta,
      }));
    }
  },
};