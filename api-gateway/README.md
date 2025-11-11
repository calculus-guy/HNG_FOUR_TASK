# api-gateway README
API Gateway Service
📋 Overview
The API Gateway is the main entry point for the Distributed Notification System, handling all incoming notification requests, validating them, and routing to appropriate services via RabbitMQ.

🏗️ Architecture
text
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Client Apps   │ ──────────────→ │   API Gateway   │
│                 │                 │   (Port 3000)   │
└─────────────────┘                 └────────┬────────┘
                                             │
                    ┌─────────────────┬──────┼──────┬─────────────────┐
                    │                 │      │      │                 │
                    ▼                 ▼      ▼      ▼                 ▼
             ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
             │ User Service│   │ Template    │   │  RabbitMQ   │
             │ (gRPC 50051)│   │ Service     │   │ (Port 5672) │
             │             │   │ (gRPC 50052)│   │             │
             └─────────────┘   └─────────────┘   └─────────────┘
🚀 Features
Request Validation - Comprehensive input validation using class-validator
Rate Limiting - 100 requests per minute per IP address
Idempotency - Prevent duplicate notifications with Redis-based idempotency keys
gRPC Communication - Low-latency communication with internal services
RabbitMQ Integration - Asynchronous message publishing for notifications
Health Checks - Service health monitoring endpoints
CORS Enabled - Cross-origin resource sharing support
Structured Logging - Comprehensive request/response logging

📦 Installation
Prerequisites
Node.js 18+
Redis
RabbitMQ
PostgreSQL (for user and template services)

Environment Setup
Clone the repository:

bash
git clone <repository-url>
cd services/api-gateway
Install dependencies:

bash
npm install
Create environment file:

bash
cp .env.example .env
Configure environment variables in .env:

env
NODE_ENV=development
PORT=3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ Configuration
RABBITMQ_URL=amqp://admin:password@localhost:5672

# gRPC Services
USER_SERVICE_URL=localhost:50051
TEMPLATE_SERVICE_URL=localhost:50052

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Idempotency
IDEMPOTENCY_TTL=86400
Development
bash
# Start in development mode
npm run start:dev

# Build the project
npm run build

# Start production
npm start
🛠️ API Endpoints
Send Notification
http
POST /api/v1/notifications/send
Content-Type: application/json
X-Idempotency-Key: optional-unique-key
Request Body:

json
{
  "user_id": "uuid-string",
  "template_id": "uuid-string", 
  "channel": "email|push",
  "context": {
    "name": "John Doe",
    "order_id": "12345"
  },
  "correlation_id": "optional-correlation-id"
}
Success Response (202 Accepted):

json
{
  "success": true,
  "message": "Notification queued successfully",
  "data": {
    "correlation_id": "generated-uuid",
    "status": "queued",
    "queued_at": "2024-01-01T00:00:00.000Z"
  }
}
Error Response (400 Bad Request):

json
{
  "success": false,
  "error": "Error message description",
  "message": "Notification processing failed"
}
Health Check
http
GET /api/v1/health
Response:

json
{
  "success": true,
  "message": "API Gateway is healthy",
  "data": {
    "service": "api-gateway",
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
🔧 Configuration
Rate Limiting
Maximum Requests: 100 per minute per IP
Storage: Redis
Key Format: ratelimit:{timestamp}
Idempotency
Storage: Redis
TTL: 24 hours (86400 seconds)
Key Format: idempotency:{user_id}:{template_id}:{channel}
Circuit Breaker
Failure Threshold: 5 consecutive failures
Reset Timeout: 30 seconds
States: CLOSED → OPEN → HALF-OPEN

🔒 Security Features
Input Validation - Comprehensive request validation
Rate Limiting - DDoS protection
CORS - Configurable cross-origin policies
HTTPS/TLS - Secure communication (production)
gRPC Encryption - Secure internal service communication

🚦 Performance
Response Time: < 50ms (Gateway processing)
Throughput: 1000+ requests per minute
Concurrent Connections: Horizontal scaling support
🧪 Testing
bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
📊 Monitoring
Health Checks
Endpoint: /api/v1/health
Checks: Redis connection, RabbitMQ connection, gRPC services
Logging
Structured JSON logging
Correlation ID tracking
Request/response logging
Metrics
Request rate
Error rate
Response times
Queue lengths

🔄 Integration Points
Internal Services
User Service (gRPC:50051) - User data and preferences
Template Service (gRPC:50052) - Notification templates
RabbitMQ (AMQP:5672) - Message queue for notifications
External Dependencies
Redis - Caching, rate limiting, idempotency
PostgreSQL - User and template databases (via gRPC)

🚨 Error Handling
Common Error Scenarios
Rate Limit Exceeded - HTTP 429 Too Many Requests
Invalid Request - HTTP 400 Bad Request
Duplicate Request - HTTP 400 with idempotency error
Service Unavailable - HTTP 503 Service Unavailable
Internal Error - HTTP 500 Internal Server Error
Circuit Breaker Patterns
Prevents cascading failures
Automatic retry with exponential backoff

🤝 Contributing
Follow the commit message conventions
Write comprehensive tests
Update documentation
Ensure all checks pas
Commit Message Format
text
feat: add rate limiting implementation
fix: resolve idempotency key collision
docs: update API documentation
test: add notification service tests
📝 License
This project is part of the Distributed Notification System.

🆘 Support
For issues and questions:
Check the documentation
Review existing issues
Create a new issue with detailed description