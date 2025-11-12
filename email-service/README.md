Comprehensive README.md
markdown
# Email Service

A microservice for handling email notifications in a distributed notification system. Built with NestJS, Redis, and RabbitMQ.

## Features

- 📧 Send HTML emails with templating
- 🔄 RabbitMQ message queue integration
- 💾 Redis for caching and metrics
- ⚡ Circuit breaker pattern for fault tolerance
- 🔍 Health checks and metrics
- 📚 Swagger API documentation
- 🐳 Docker containerization

## Architecture
┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ RabbitMQ │ │ Email Service │ │ Redis │
│ │ │ │ │ │
│ email.queue ───┼───▶│ Consumer ───────┼───▶│ Cache & Metrics│
│ │ │ Template Engine │ │ │
│ │ │ Email Sender │ │ │
└─────────────────┘ └──────────────────┘ └─────────────────┘
│
▼
┌─────────────┐
│ SMTP │
│ Server │
└─────────────┘

text

## Prerequisites

- Node.js 18+
- Redis
- RabbitMQ
- SMTP server (Mailtrap for development)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository>
cd email-service
npm install
2. Environment Configuration
Copy .env file and update the values:

bash
cp .env.example .env
Update the following variables in .env:

env
# Server Configuration
PORT=3003
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@localhost:5672
EMAIL_QUEUE=email.queue
EXCHANGE_NAME=notifications.direct

# SMTP Configuration (Mailtrap for development)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
SMTP_FROM=noreply@notifications.com

# Circuit Breaker Configuration
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT=30000

# Retry Configuration
RETRY_MAX_ATTEMPTS=3
RETRY_BACKOFF_MULTIPLIER=2
3. Start Dependencies with Docker
bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:alpine

# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
4. Run the Service
bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm start
API Endpoints
Health Check
text
GET /health
Check service health and dependencies status.

Metrics
text
GET /metrics
Get service performance metrics.

Swagger Documentation
text
GET /api/docs
Interactive API documentation.

Message Format
Email messages should be published to RabbitMQ in the following format:

json
{
  "correlation_id": "uuid",
  "user_id": "user123",
  "template_id": "welcome_email",
  "channel": "email",
  "context": {
    "name": "John Doe",
    "email": "john@example.com",
    "activationLink": "https://example.com/activate"
  },
  "user_data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "email_enabled": true
  },
  "template_data": {
    "id": "welcome_email",
    "name": "Welcome Email",
    "subject": "Welcome to Our Service, {{name}}!",
    "body": "<h1>Welcome {{name}}!</h1><p>Your email: {{email}}</p>",
    "version": 1,
    "language": "en"
  }
}
Template System
The service uses Handlebars for templating. Templates can be:

Inline: Provided in the message template_data.body

File-based: Loaded from src/templates/ directory

Example Template Usage
javascript
// Inline template
const templateData = {
  subject: "Welcome {{name}}!",
  body: "<h1>Hello {{name}}</h1><p>Welcome to our service.</p>"
};

// Context for rendering
const context = {
  name: "John Doe",
  email: "john@example.com"
};
Configuration
Environment Variables
Variable	Description	Default
PORT	Service port	3003
REDIS_HOST	Redis host	localhost
REDIS_PORT	Redis port	6379
RABBITMQ_URL	RabbitMQ connection URL	amqp://guest:guest@localhost:5672
EMAIL_QUEUE	Queue name for emails	email.queue
EXCHANGE_NAME	RabbitMQ exchange	notifications.direct
SMTP_HOST	SMTP server host	smtp.mailtrap.io
SMTP_PORT	SMTP server port	2525
SMTP_USER	SMTP username	-
SMTP_PASS	SMTP password	-
SMTP_FROM	Sender email address	noreply@notifications.com
Circuit Breaker
The service includes a circuit breaker to prevent cascading failures:

Failure Threshold: Number of failures before opening (default: 5)

Reset Timeout: Time before attempting to close (default: 30000ms)

Retry Logic
Max Attempts: Maximum retry attempts (default: 3)

Backoff Multiplier: Exponential backoff multiplier (default: 2)

Monitoring
Health Check Response
json
{
  "status": "healthy",
  "service": "email-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "redis": { "status": "healthy" },
    "smtp": { "status": "healthy" },
    "rabbitmq": { "status": "healthy" },
    "consumer": { "status": "healthy" }
  }
}
Metrics Response
json
{
  "processed": 150,
  "failed": 5,
  "queue_length": 10,
  "circuit_breaker": "CLOSED",
  "emails_sent": 145,
  "emails_failed": 5,
  "template_cache_size": 3
}
Docker Deployment
Build Image
bash
docker build -t email-service .
Run Container
bash
docker run -d \
  --name email-service \
  -p 3003:3003 \
  --env-file .env \
  --link redis:redis \
  --link rabbitmq:rabbitmq \
  email-service
Docker Compose
yaml
version: '3.8'
services:
  email-service:
    build: .
    ports:
      - "3003:3003"
    environment:
      - REDIS_HOST=redis
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - redis
      - rabbitmq

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
Development
Project Structure
text
src/
├── config/           # Configuration files
├── controllers/      # HTTP controllers
├── consumer/         # RabbitMQ consumer
├── interface/        # TypeScript interfaces
├── queues/           # RabbitMQ provider
├── services/         # Business logic services
├── templates/        # Email templates
├── utils/            # Utilities and logger
└── main.ts          # Application entry point
Running Tests
bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
Code Style
The project uses:

TypeScript for type safety

ESLint for code linting

Prettier for code formatting

Troubleshooting
Common Issues
RabbitMQ Connection Failed

Check if RabbitMQ is running: docker ps | grep rabbitmq

Verify credentials in .env

Check connection URL format

Redis Connection Failed

Verify Redis is running: docker ps | grep redis

Check host and port configuration

SMTP Connection Failed

Verify SMTP credentials

Check firewall settings

Test SMTP connection manually

Queue Messages Not Processing

Check consumer status at /health

Verify queue binding in RabbitMQ management UI

Check message format matches expected schema

Logs
The service uses structured JSON logging. Key log events:

RabbitMQ connected successfully - Successful queue connection

Email sent successfully - Successful email delivery

Circuit breaker opened - Circuit breaker activated

Failed to send email - Email delivery failure

Contributing
Fork the repository

Create a feature branch

Make your changes

Add tests

Submit a pull request

License
[Your License Here]

text

## Summary of Changes Made

1. **Fixed RabbitMQ credentials** from `admin:password` to `guest:guest`
2. **Added connection retry logic** to handle startup timing issues
3. **Improved error handling** with better logging and recovery
4. **Added connection waiting** in the consumer to ensure RabbitMQ is ready
5. **Enhanced documentation** with comprehensive setup and troubleshooting guide

After applying these fixes, your email service should start successfully and connect to both Redis and RabbitMQ!