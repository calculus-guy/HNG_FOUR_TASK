# 📄 Template Service - Distributed Notification System

The Template Service is a critical microservice within the Distributed Notification System, responsible for the persistent storage, management, and versioning of all notification templates (for both email and push notifications). It provides **low-latency template retrieval** via **gRPC** for the Email and Push services.

## 🚀 Key Features

* **Template Storage and Management:** CRUD operations for notification templates.
* **Versioning:** Maintains a full history of template changes in the `template_versions` table.
* **Multi-Protocol API:** Exposes templates via:
    * **gRPC** (Port 50052): For high-speed retrieval by Email/Push services.
    * **REST** (Port 3002): For management and administration (e.g., creating/updating templates).
* **Database Isolation:** Uses a dedicated PostgreSQL database.
* **Health Check:** Provides a `/api/v1/templates/health` endpoint for monitoring.
* **Technologies:** NestJS, TypeScript, PostgreSQL, TypeORM, gRPC.

## ⚙️ Setup and Installation

### Prerequisites

* Node.js (LTS version)
* Docker and Docker Compose (For PostgreSQL and RabbitMQ setup)

### Local Development Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/calculus-guy/HNG_FOUR_TASK.git
    cd template-service
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Ensure your main `.env` file (or copy the example) is configured. The service requires the `DATABASE_URL_TEMPLATE` variable.

    ```bash
    # Example .env entry
    DATABASE_URL_TEMPLATE=postgresql://user:password@localhost:5432/template_db
    PORT_HTTP=3002
    PORT_GRPC=50052
    ```

4.  **Start Dependencies (PostgreSQL):**
    Start the necessary infrastructure using Docker Compose (typically run from the project root):
    ```bash
    cd ..
    docker-compose up -d postgres rabbitmq redis
    ```

5.  **Run Migrations:**
    ***NOTE:** Database tables must be created before running the service. If using TypeORM, run your migration command here:*
    ```bash
    # Placeholder: Replace with your actual migration command
    npm run typeorm:migrate
    ```

6.  **Start the Service:**
    The service will start both the HTTP (REST) and gRPC servers concurrently.
    ```bash
    npm run start:dev
    ```

## 🔌 API Endpoints

The service uses **snake\_case** for all request/response fields.

### Health Check

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/templates/health` | Status check for the service and its database connection. |

### REST Endpoints (Management)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/templates` | Creates a new template. |
| `GET` | `/api/v1/templates/:id` | Retrieves a template by its UUID. |
| `PATCH`| `/api/v1/templates/:id` | Updates template content (body/subject) and **creates a new version**. |

### gRPC Endpoints (Internal Low-Latency)

| Service/Method | Port | Description |
| :--- | :--- | :--- |
| `TemplateService.GetTemplate` | `50052` | Retrieves a template object by `template_id` or `template_code`. |