# Push Notification Service# Push Notification Service<p align="center">



A microservice for handling push notifications using Firebase Cloud Messaging (FCM) and RabbitMQ message queuing.  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>



## FeaturesA microservice for handling push notifications using Firebase Cloud Messaging (FCM) and RabbitMQ message queuing.</p>



- ✅ **FCM Integration**: Send push notifications via Firebase Cloud Messaging

- ✅ **Circuit Breaker Pattern**: Prevents cascading failures when FCM service is down

- ✅ **Message Queue Integration**: Async processing via RabbitMQ## Features[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

- ✅ **Retry Mechanism**: Exponential backoff retry for failed notifications

- ✅ **Idempotency**: Prevents duplicate notification sending[circleci-url]: https://circleci.com/gh/nestjs/nest

- ✅ **Health Checks**: Comprehensive health monitoring endpoints

- ✅ **API Documentation**: Interactive Swagger/OpenAPI documentation- ✅ **FCM Integration**: Send push notifications via Firebase Cloud Messaging

- ✅ **Docker Support**: Production-ready containerization

- ✅ **TypeScript**: Full type safety- ✅ **Circuit Breaker Pattern**: Prevents cascading failures when FCM service is down  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>



## Architecture- ✅ **Message Queue Integration**: Async processing via RabbitMQ    <p align="center">



This service is part of a distributed notification system that includes:- ✅ **Retry Mechanism**: Exponential backoff retry for failed notifications<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>



- **API Gateway**: Routes notification requests to appropriate queues- ✅ **Idempotency**: Prevents duplicate notification sending<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

- **User Service**: Manages user data and push tokens

- **Email Service**: Handles email notifications- ✅ **Health Checks**: Comprehensive health monitoring endpoints<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

- **Push Service** (this service): Handles push notifications

- **Template Service**: Manages notification templates- ✅ **API Documentation**: Interactive Swagger/OpenAPI documentation<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>



## Prerequisites- ✅ **Docker Support**: Production-ready containerization<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>



- Node.js 20+- ✅ **TypeScript**: Full type safety<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>

- RabbitMQ 3.x

- Firebase project with Cloud Messaging enabled<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>



## Firebase Setup## Architecture  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>



**⚠️ Important**: This service requires Firebase **Admin SDK** credentials (server-side), NOT the web app config!    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>



### Quick Setup:This service is part of a distributed notification system that includes:  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>



1. Go to [Firebase Service Accounts](https://console.firebase.google.com/project/push-service-2a2ab/settings/serviceaccounts/adminsdk)</p>

2. Click "Generate New Private Key"

3. Download the JSON file- **API Gateway**: Routes notification requests to appropriate queues  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

4. Extract `project_id`, `client_email`, and `private_key` to your `.env` file

- **User Service**: Manages user data and push tokens  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

📖 **Detailed Instructions**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete guide

- **Email Service**: Handles email notifications

**Project Details:**

- Project ID: `push-service-2a2ab`- **Push Service** (this service): Handles push notifications## Description

- App ID: `1:834550147223:web:ba819b5f1a4ec176a3a1d2`

- Messaging Sender ID: `834550147223`- **Template Service**: Manages notification templates



## Installation[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.



```bash## Prerequisites

# Install dependencies

npm install## Project setup



# Copy environment file- Node.js 20+

cp .env.example .env

- RabbitMQ 3.x```bash

# Edit .env with your Firebase Admin SDK credentials

# See FIREBASE_SETUP.md for detailed instructions- Firebase project with Cloud Messaging enabled$ npm install

```

```

## Environment Variables

## Firebase Setup

Create a `.env` file with the following variables:

## Compile and run the project

```env

# Application1. Go to [Firebase Console](https://console.firebase.google.com/)

NODE_ENV=development

PORT=30032. Create a new project or select an existing one```bash



# RabbitMQ3. Navigate to Project Settings > Service Accounts# development

RABBITMQ_URL=amqp://localhost:5672

4. Click "Generate New Private Key" to download the service account JSON$ npm run start

# Firebase Admin SDK (get from service account JSON)

FIREBASE_PROJECT_ID=push-service-2a2ab5. Extract the following values for your `.env` file:

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@push-service-2a2ab.iam.gserviceaccount.com

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"   - `projectId`# watch mode

```

   - `client_email`$ npm run start:dev

**Note**: Keep the `\n` characters in the private key!

   - `private_key`

## Running the Service

# production mode

### Development

## Installation$ npm run start:prod

```bash

# Start in development mode```

npm run start:dev

```bash

# Build the project

npm run build# Install dependencies## Run tests



# Start in production modenpm install

npm run start:prod

``````bash



### Docker# Copy environment file# unit tests



```bashcp .env.example .env$ npm run test

# Build Docker image

docker build -t push-service .



# Run container# Edit .env with your configuration# e2e tests

docker run -p 3003:3003 --env-file .env push-service

```# Add Firebase credentials from the downloaded service account JSON$ npm run test:e2e



## API Endpoints```



### Health Checks# test coverage



- `GET /health` - Overall health status## Environment Variables$ npm run test:cov

- `GET /health/ready` - Readiness probe

- `GET /health/live` - Liveness probe```



### DocumentationCreate a `.env` file with the following variables:



- `GET /api/docs` - Interactive Swagger UI documentation## Deployment



## Message Queue Integration```env



### Consuming Messages# ApplicationWhen you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.



The service automatically consumes messages from the `push.queue` RabbitMQ queue. Messages should have the following format:NODE_ENV=development



```jsonPORT=3003If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

{

  "user_id": "123e4567-e89b-12d3-a456-426614174000",

  "push_token": "fcm-device-token",

  "title": "Notification Title",# RabbitMQ```bash

  "body": "Notification body text",

  "icon": "https://example.com/icon.png",RABBITMQ_URL=amqp://localhost:5672$ npm install -g @nestjs/mau

  "image": "https://example.com/image.png",

  "click_action": "https://example.com/target",$ mau deploy

  "request_id": "req-123e4567-e89b-12d3-a456-426614174000",

  "priority": 5,# Firebase```

  "metadata": {

    "campaign_id": "summer-2024"FIREBASE_PROJECT_ID=your-project-id

  }

}FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.comWith Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

```

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\n-----END PRIVATE KEY-----\n"

### Queue Configuration

```## Resources

- **Exchange**: `notifications.direct`

- **Queues**:

  - `push.queue`: Primary queue for push notifications

  - `failed.queue`: Dead letter queue for failed messages## Running the ServiceCheck out a few resources that may come in handy when working with NestJS:



### Retry Logic



- **Max Retries**: 3### Development- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

- **Backoff Strategy**: Exponential (2^retry_count seconds)

- **Dead Letter Queue**: Failed messages after max retries- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).



## Circuit Breaker```bash- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).



The service implements a circuit breaker pattern to handle FCM service failures:# Start in development mode- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.



- **States**: CLOSED → OPEN → HALF_OPEN → CLOSEDnpm run start:dev- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

- **Failure Threshold**: 5 consecutive failures

- **Timeout**: 60 seconds- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).

- **Half-Open Test Calls**: 3

# Build the project- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).

### Circuit Breaker Behavior

npm run build- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

1. **CLOSED**: Normal operation

2. **OPEN**: Service failures detected, requests rejected immediately

3. **HALF_OPEN**: Testing if service recovered, limited requests allowed

4. **CLOSED**: Service recovered, normal operation resumed# Start in production mode## Support



## Idempotencynpm run start:prod



The service ensures idempotent operation using `request_id`:```Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).



- Duplicate requests with the same `request_id` are detected and ignored

- Request IDs are stored in memory for 1 hour

- Prevents duplicate notifications even if the same message is processed multiple times### Docker## Stay in touch



## Monitoring



### Health Check Response```bash- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)



```json# Build Docker image- Website - [https://nestjs.com](https://nestjs.com/)

{

  "status": "healthy",docker build -t push-service .- Twitter - [@nestframework](https://twitter.com/nestframework)

  "timestamp": "2024-11-11T10:30:00.000Z",

  "services": {

    "rabbitmq": {

      "connected": true,# Run container## License

      "status": "up"

    },docker run -p 3003:3003 --env-file .env push-service

    "fcm": {

      "circuit_breaker": "CLOSED",```Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

      "failures": 0

    }

  }## API Endpoints

}

```### Health Checks



### Metrics to Monitor- `GET /health` - Overall health status

- `GET /health/ready` - Readiness probe

- Queue message rate- `GET /health/live` - Liveness probe

- Circuit breaker state

- Success/failure rates### Documentation

- Response times

- Queue lengths- `GET /api/docs` - Interactive Swagger UI documentation



## Error Handling## Message Queue Integration



### Retry Strategy### Consuming Messages



Messages are retried with exponential backoff:The service automatically consumes messages from the `push.queue` RabbitMQ queue. Messages should have the following format:



- Retry 1: after 2 seconds```json

- Retry 2: after 4 seconds{

- Retry 3: after 8 seconds  "user_id": "123e4567-e89b-12d3-a456-426614174000",

- After 3 retries: moved to dead letter queue  "push_token": "fcm-device-token",

  "title": "Notification Title",

### Common Errors  "body": "Notification body text",

  "icon": "https://example.com/icon.png",

| Error | Cause | Solution |  "image": "https://example.com/image.png",

|-------|-------|----------|  "click_action": "https://example.com/target",

| Invalid token | Device token is invalid | Validate and update token in user service |  "request_id": "req-123e4567-e89b-12d3-a456-426614174000",

| Connection refused | RabbitMQ not available | Check RabbitMQ server and connection string |  "priority": 5,

| Circuit breaker open | FCM service failing | Wait for timeout, check FCM service status |  "metadata": {

| Authentication failed | Invalid Firebase credentials | Verify `.env` configuration (see FIREBASE_SETUP.md) |    "campaign_id": "summer-2024"

  }

## Project Structure}

```

```

push-service/### Queue Configuration

├── src/

│   ├── consumer/- **Exchange**: `notifications.direct`

│   │   └── push.consumer.ts      # RabbitMQ message consumer- **Queues**:

│   ├── controllers/  - `push.queue`: Primary queue for push notifications

│   │   └── health.controller.ts  # Health check endpoints  - `failed.queue`: Dead letter queue for failed messages

│   ├── dto/

│   │   └── notification.dto.ts   # Data transfer objects### Retry Logic

│   ├── interfaces/

│   │   └── response.interface.ts # TypeScript interfaces- **Max Retries**: 3

│   ├── queues/- **Backoff Strategy**: Exponential (2^retry_count seconds)

│   │   └── rabbitmq.provider.ts  # RabbitMQ connection management- **Dead Letter Queue**: Failed messages after max retries

│   ├── services/

│   │   └── push.service.ts       # Push notification logic## Circuit Breaker

│   ├── app.module.ts             # Main application module

│   └── main.ts                   # Application entry pointThe service implements a circuit breaker pattern to handle FCM service failures:

├── utils/

│   └── fcm.ts                    # Firebase Cloud Messaging utilities- **States**: CLOSED → OPEN → HALF_OPEN → CLOSED

├── Dockerfile                     # Docker configuration- **Failure Threshold**: 5 consecutive failures

├── .env.example                   # Environment variables template- **Timeout**: 60 seconds

├── FIREBASE_SETUP.md             # Firebase configuration guide- **Half-Open Test Calls**: 3

├── QUICKSTART.md                 # 5-minute setup guide

└── README.md                     # This file## Performance Targets

```

- ✅ Process 1,000+ notifications per minute

## Performance Targets- ✅ 99.5% delivery success rate

- ✅ Horizontal scaling supported

- ✅ Process 1,000+ notifications per minute

- ✅ 99.5% delivery success rate## License

- ✅ API response < 100ms

- ✅ Horizontal scaling supportedUNLICENSED


## Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide.

## Firebase Configuration

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase Admin SDK setup instructions.

## Security

- Non-root Docker user
- Environment variable validation
- Input validation with class-validator
- CORS enabled (configure as needed)
- Service account credentials secured

## Contributing

1. Follow snake_case naming convention for API endpoints and request/response fields
2. Add tests for new features
3. Update API documentation
4. Follow TypeScript best practices

## License

UNLICENSED

## Support

For issues and questions:
- Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase configuration help
- Check [QUICKSTART.md](./QUICKSTART.md) for setup help
- Review the Swagger documentation at `/api/docs`
- Check health endpoints at `/health`
- Review service logs for detailed error messages
