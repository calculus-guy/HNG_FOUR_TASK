export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  meta?: PaginationMeta;
}

export interface PushNotificationMessage {
  user_id: string;
  push_token: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  click_action?: string;
  request_id: string;
  priority?: number;
  metadata?: Record<string, any>;
  retry_count?: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}
