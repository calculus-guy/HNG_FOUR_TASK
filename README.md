# Distributed Notification System API

## Overview
This project is a high-performance, distributed notification system built with NestJS and TypeScript. It utilizes a microservices architecture with RabbitMQ for asynchronous message queuing to deliver notifications via multiple channels like email and push notifications.

## Features
- **Microservices Architecture**: The system is decoupled into independent services (API Gateway, Users, Templates, Email, Push) for improved scalability and maintainability.
- **Asynchronous Processing**: Leverages RabbitMQ to handle notification requests asynchronously, ensuring high throughput and resilience.
- **Multi-channel Delivery**: Natively supports sending notifications via Email and Push (FCM), with a design that allows for easy extension to other channels.
- **Containerized**: Fully containerized with Docker and orchestrated with Docker Compose for consistent development and deployment environments.
- **Template Management**: Includes a dedicated service for creating, managing, and retrieving notification templates.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/calculus-guy/HNG_FOUR_TASK.git
    cd HNG_FOUR_TASK.git
    ```

2.  **Create Environment File**:
    Create a `.env` file in the root directory by copying the example file.
    ```bash
    cp .env.example .env
    ```
    Then, populate the `.env` file with the necessary credentials (see Environment Variables section).

3.  **Build and Run with Docker Compose**:
    This command will build the images for each service and start the containers.
    ```bash
    docker-compose up --build
    ```
    The API Gateway will be available at `http://localhost:3000`.

### Environment Variables
Populate your `.env` file with the following variables. These are crucial for the system's operation.

```ini
# RabbitMQ Connection
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# API Gateway Port
API_GATEWAY_PORT=3000

# User Service
USER_SERVICE_DATABASE_URL=postgres://user:password@postgres:5432/user_db
USER_SERVICE_PORT=3001

# Template Service
TEMPLATE_SERVICE_DATABASE_URL=postgres://user:password@postgres:5432/template_db
TEMPLATE_SERVICE_PORT=3002

# Email Service (e.g with Mailtrap )
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password
EMAIL_FROM="No Reply <noreply@example.com>"

# Push Service (Firebase Cloud Messaging)
FCM_SERVER_KEY=your_fcm_server_key
```

## API Documentation

### Base URL
`http://localhost:3000/api/v1`

### Endpoints

---

#### `POST /users`
Creates a new user in the system.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "fcmToken": "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1..."
}
```

**Response**:
```json
{
  "id": "c1f7a4f0-40e1-4b1a-8fc3-2e7a3b8d6f9e",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "fcmToken": "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...",
  "createdAt": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
- `400 Bad Request`: If required fields are missing or email is invalid.
- `409 Conflict`: If a user with the given email already exists.

---

#### `GET /users/{id}`
Retrieves a user by their unique ID.

**Request**:
Path parameter `id` is required.

**Response**:
```json
{
  "id": "c1f7a4f0-40e1-4b1a-8fc3-2e7a3b8d6f9e",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "fcmToken": "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...",
  "createdAt": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
- `404 Not Found`: If no user with the specified ID exists.

---

#### `POST /templates`
Creates a new notification template.

**Request**:
```json
{
  "name": "welcome-email",
  "subject": "Welcome to Our Service, {{name}}!",
  "body": "<h1>Hi {{name}},</h1><p>Thank you for joining us.</p>"
}
```

**Response**:
```json
{
  "id": "a2b3c4d5-e6f7-4a8b-9c1d-0e9f8a7b6c5d",
  "name": "welcome-email",
  "subject": "Welcome to Our Service, {{name}}!",
  "body": "<h1>Hi {{name}},</h1><p>Thank you for joining us.</p>",
  "createdAt": "2023-10-27T10:05:00.000Z"
}
```

**Errors**:
- `400 Bad Request`: If required fields (`name`, `body`) are missing.

---

#### `POST /notifications/send`
Sends a notification to a specified user. The system determines the channel (email or push) based on the `channel` field.

**Request**:
```json
{
  "userId": "c1f7a4f0-40e1-4b1a-8fc3-2e7a3b8d6f9e",
  "channel": "email",
  "templateId": "a2b3c4d5-e6f7-4a8b-9c1d-0e9f8a7b6c5d",
  "context": {
    "name": "John Doe"
  }
}
```

**Response**:
```json
{
  "message": "Notification request received and is being processed."
}
```

**Errors**:
- `400 Bad Request`: If required fields are missing or the channel is unsupported.
- `404 Not Found`: If the specified `userId` or `templateId` does not exist.
- `500 Internal Server Error`: If the message fails to be queued.

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)