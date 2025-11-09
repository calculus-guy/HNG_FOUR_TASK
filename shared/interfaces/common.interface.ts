export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface NotificationMessage {
  id: string;
  user_id: string;
  channel: "email" | "push";
  template_id: string;
  context: Record<string, any>;
  correlation_id: string;
  retry_count?: number;
  created_at: Date;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  fcm_token?: string;
  preferences?: NotificationPreferences;
  created_at: Date;
  updated_at?: Date;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  quiet_hours?: {
    start: string;
    end: string;
  };
}

export interface TemplateData {
  id: string;
  name: string;
  subject?: string;
  body: string;
  version: number;
  language?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface CircuitBreakerConfig {
  timeout: number;
  errorThreshold: number;
  resetTimeout: number;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
}

export enum QueueNames {
  EMAIL = "email.queue",
  PUSH = "push.queue",
  FAILED = "failed.queue",
  RETRY = "retry.queue",
}

export enum ExchangeNames {
  NOTIFICATIONS = "notifications.direct",
}

export enum RoutingKeys {
  EMAIL = "notification.email",
  PUSH = "notification.push",
  FAILED = "notification.failed",
  RETRY = "notification.retry",
}
