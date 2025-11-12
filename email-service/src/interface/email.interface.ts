export interface EmailMessage {
  correlation_id: string;
  user_id: string;
  template_id: string;
  channel: 'email';
  context: Record<string, any>;
  user_data: {
    id: string;
    name: string;
    email: string;
    email_enabled: boolean;
  };
  template_data: {
    id: string;
    name: string;
    subject: string;
    body: string;
    version: number;
    language: string;
  };
}

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  correlationId: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  correlationId: string;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailureTime?: number;
}