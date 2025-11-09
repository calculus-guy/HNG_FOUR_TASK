# Team Task Distribution Checklist

## 🎯 Assignment: Stage 4 Backend Task - Distributed Notification System
**Deadline**: Wednesday, November 12, 2025, 11:59 PM WAT

---

## 📋 What's Already Done ✅

- [x] Project structure set up
- [x] Docker Compose configuration
- [x] Environment variables template
- [x] API Gateway (100% complete)
- [x] Shared utilities (circuit breaker, retry, etc.)
- [x] gRPC Protocol Buffer definitions
- [x] RabbitMQ message queue setup
- [x] CI/CD GitHub Actions workflow
- [x] Complete documentation
- [x] Response format standardization

---

## 👥 Team of 4 - Suggested Task Distribution

### **Person 1: User Service** 🔵
**Estimated Time**: 8-10 hours

#### Tasks:
- [ ] **Setup** (2 hours)
  - [ ] Copy package.json from API Gateway and install dependencies
  - [ ] Copy tsconfig.json, Dockerfile
  - [ ] Copy shared utilities (filters, interceptors)
  - [ ] Set up environment configuration

- [ ] **Database** (2 hours)
  - [ ] Install TypeORM or Prisma
  - [ ] Create User entity (id, name, email, fcm_token, preferences, created_at, updated_at)
  - [ ] Create database migrations
  - [ ] Set up PostgreSQL connection

- [ ] **REST API** (2 hours)
  - [ ] Create UserController
  - [ ] POST /api/v1/users - Create user
  - [ ] GET /api/v1/users/:id - Get user by ID
  - [ ] PATCH /api/v1/users/:id/preferences - Update preferences
  - [ ] Add validation (class-validator)

- [ ] **gRPC Server** (2 hours)
  - [ ] Implement gRPC server (port 50051)
  - [ ] Implement GetUserById RPC method
  - [ ] Test gRPC connection

- [ ] **Testing** (1 hour)
  - [ ] Test REST endpoints
  - [ ] Test gRPC endpoints
  - [ ] Test with API Gateway

- [ ] **Health Check** (30 min)
  - [ ] Add /health endpoint
  - [ ] Check database connection

**Files to Create**:
```
user-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── user.module.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── services/
│   │   └── user.service.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-preferences.dto.ts
│   ├── database/
│   │   └── postgres.provider.ts
│   └── grpc/
│       └── user-grpc.controller.ts
```

---

### **Person 2: Template Service** 🟢
**Estimated Time**: 8-10 hours

#### Tasks:
- [ ] **Setup** (2 hours)
  - [ ] Copy package.json from API Gateway and install dependencies
  - [ ] Copy tsconfig.json, Dockerfile
  - [ ] Copy shared utilities
  - [ ] Set up environment configuration

- [ ] **Database** (2 hours)
  - [ ] Install TypeORM or Prisma
  - [ ] Create Template entity (id, name, subject, body, version, language, created_at, updated_at)
  - [ ] Create database migrations
  - [ ] Set up PostgreSQL connection

- [ ] **REST API** (2 hours)
  - [ ] Create TemplateController
  - [ ] POST /api/v1/templates - Create template
  - [ ] GET /api/v1/templates/:id - Get template
  - [ ] GET /api/v1/templates - List templates (with pagination)
  - [ ] Add validation

- [ ] **gRPC Server** (2 hours)
  - [ ] Implement gRPC server (port 50052)
  - [ ] Implement GetTemplateById RPC method
  - [ ] Test gRPC connection

- [ ] **Template Versioning** (1 hour)
  - [ ] Implement version increment on update
  - [ ] Keep version history

- [ ] **Testing** (1 hour)
  - [ ] Test REST endpoints
  - [ ] Test gRPC endpoints
  - [ ] Test with API Gateway

- [ ] **Health Check** (30 min)
  - [ ] Add /health endpoint
  - [ ] Check database connection

**Files to Create**:
```
template-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── template.module.ts
│   ├── controllers/
│   │   └── template.controller.ts
│   ├── services/
│   │   └── template.service.ts
│   ├── entities/
│   │   └── template.entity.ts
│   ├── dto/
│   │   ├── create-template.dto.ts
│   │   └── list-templates.dto.ts
│   ├── database/
│   │   └── postgres.provider.ts
│   └── grpc/
│       └── template-grpc.controller.ts
```

---

### **Person 3: Email Service** 🟡
**Estimated Time**: 8-10 hours

#### Tasks:
- [ ] **Setup** (2 hours)
  - [ ] Copy package.json and add nodemailer
  - [ ] Install handlebars for template rendering
  - [ ] Copy shared utilities (circuit breaker, retry)
  - [ ] Set up environment configuration

- [ ] **RabbitMQ Consumer** (3 hours)
  - [ ] Create EmailConsumer class
  - [ ] Connect to RabbitMQ
  - [ ] Listen to `email.queue`
  - [ ] Parse notification messages
  - [ ] Handle acknowledgments

- [ ] **Email Sending** (2 hours)
  - [ ] Set up Nodemailer with SMTP (Mailtrap)
  - [ ] Create EmailService
  - [ ] Implement template rendering (replace {{variables}})
  - [ ] Send emails with subject and body

- [ ] **Retry Logic** (2 hours)
  - [ ] Integrate circuit breaker
  - [ ] Implement retry with exponential backoff (max 3 attempts)
  - [ ] On final failure, send to Dead Letter Queue
  - [ ] Log all attempts with correlation IDs

- [ ] **Testing** (1 hour)
  - [ ] Test with Mailtrap
  - [ ] Test retry mechanism
  - [ ] Test DLQ on failures

- [ ] **Health Check** (30 min)
  - [ ] Add /health endpoint
  - [ ] Check RabbitMQ connection
  - [ ] Check SMTP connection

**Files to Create**:
```
email-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── consumer/
│   │   └── email.consumer.ts
│   ├── services/
│   │   ├── email.service.ts
│   │   └── template-renderer.service.ts
│   ├── queues/
│   │   └── rabbitmq.provider.ts
│   └── templates/
│       └── (HTML email templates)
```

**Dependencies to Add**:
```json
{
  "nodemailer": "^6.9.7",
  "handlebars": "^4.7.8",
  "@types/nodemailer": "^6.4.14"
}
```

---

### **Person 4: Push Service** 🟣
**Estimated Time**: 8-10 hours

#### Tasks:
- [ ] **Setup** (2 hours)
  - [ ] Copy package.json and add firebase-admin
  - [ ] Get FCM credentials from Firebase Console
  - [ ] Copy shared utilities (circuit breaker, retry)
  - [ ] Set up environment configuration

- [ ] **RabbitMQ Consumer** (3 hours)
  - [ ] Create PushConsumer class
  - [ ] Connect to RabbitMQ
  - [ ] Listen to `push.queue`
  - [ ] Parse notification messages
  - [ ] Handle acknowledgments

- [ ] **Push Notification** (2 hours)
  - [ ] Initialize Firebase Admin SDK
  - [ ] Create PushService
  - [ ] Validate FCM tokens
  - [ ] Send push notifications with title, body, data

- [ ] **Retry Logic** (2 hours)
  - [ ] Integrate circuit breaker
  - [ ] Implement retry with exponential backoff (max 3 attempts)
  - [ ] Handle invalid tokens (don't retry)
  - [ ] On final failure, send to Dead Letter Queue
  - [ ] Log all attempts with correlation IDs

- [ ] **Testing** (1 hour)
  - [ ] Test with Firebase test tokens
  - [ ] Test retry mechanism
  - [ ] Test DLQ on failures

- [ ] **Health Check** (30 min)
  - [ ] Add /health endpoint
  - [ ] Check RabbitMQ connection
  - [ ] Check FCM connection

**Files to Create**:
```
push-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── consumer/
│   │   └── push.consumer.ts
│   ├── services/
│   │   └── push.service.ts
│   ├── queues/
│   │   └── rabbitmq.provider.ts
│   └── utils/
│       └── fcm.ts
```

**Dependencies to Add**:
```json
{
  "firebase-admin": "^12.0.0"
}
```

**FCM Setup**:
1. Go to Firebase Console
2. Create/select project
3. Go to Project Settings → Service Accounts
4. Generate new private key (JSON)
5. Set `FCM_SERVER_KEY` in .env

---

## 🤝 Shared Responsibilities (Everyone)

### Day 1 (Now - This Weekend):
- [ ] **Daily Standup** (15 min)
  - Share what you completed
  - Share blockers
  - Ask for help

- [ ] **Code Review** (30 min/day)
  - Review each other's PRs
  - Ensure code quality
  - Check naming conventions (snake_case)

- [ ] **Integration Testing** (Friday)
  - Test complete flow: API Gateway → User → Template → Queue → Email/Push
  - Fix any integration issues

### Day 2 (Nov 11-12):
- [ ] **Deployment** (Monday)
  - Set up GitHub secrets
  - Test CI/CD pipeline
  - Deploy to server

- [ ] **Load Testing** (Tuesday)
  - Test 1000+ notifications/min
  - Monitor performance
  - Fix bottlenecks

- [ ] **Documentation** (Tuesday)
  - Update README
  - Document API endpoints
  - Prepare presentation

- [ ] **Final Testing** (Wednesday Morning)
  - End-to-end testing
  - Fix critical bugs
  - Practice Q&A session

---

## 📦 Installation Steps (Everyone Runs First)

```powershell
# 1. Install dependencies for your service
cd your-service-name
npm install

# 2. Copy environment file
cd ..
Copy-Item .env.example .env

# 3. Edit .env with your credentials
# Add database URLs, SMTP, FCM keys

# 4. Test locally
docker-compose up -d postgres rabbitmq redis
cd your-service-name
npm run start:dev

# 5. Test your endpoints
curl http://localhost:YOUR_PORT/health
```

---

## 🧪 Testing Checklist (Everyone)

### Unit Tests:
- [ ] Service logic tests
- [ ] Controller tests
- [ ] Utility function tests

### Integration Tests:
- [ ] Database operations
- [ ] RabbitMQ publishing/consuming
- [ ] gRPC communication
- [ ] External API calls

### Manual Tests:
- [ ] Health check endpoint
- [ ] Happy path scenarios
- [ ] Error scenarios
- [ ] Retry mechanism
- [ ] Rate limiting

---

## 🚨 Common Pitfalls to Avoid

1. **Don't use Express.js** - Use NestJS or Fastify
2. **Use snake_case** for API responses (not camelCase)
3. **Write descriptive commit messages** - Each bad commit loses points
4. **Test locally before pushing** - Don't break CI/CD
5. **Report ghost teammates early** - Talk to mentors
6. **Use correlation IDs** - Track requests across services
7. **Handle errors properly** - Don't let services crash
8. **Document as you go** - Update README for your service

---

## 📊 Progress Tracking

### Daily Check-ins (5 PM WAT):
Each person reports in team chat:
```
Day X Progress:
✅ Completed: [list tasks]
🔄 In Progress: [current task]
🚫 Blockers: [issues]
📅 Tomorrow: [planned tasks]
```

### GitHub Project Board:
Create columns:
- **To Do** - Unstarted tasks
- **In Progress** - Currently working
- **Review** - Awaiting code review
- **Done** - Completed and merged

---

## 🏆 Definition of Done

A task is "Done" when:
- [ ] Code is written and tested
- [ ] Code follows NestJS best practices
- [ ] Response format uses snake_case
- [ ] Error handling is implemented
- [ ] Commit messages are descriptive
- [ ] Code is reviewed by at least 1 teammate
- [ ] Tests pass locally
- [ ] CI/CD pipeline passes
- [ ] Documentation is updated

---

## 📞 Communication Channels

1. **Daily Standups**: Google Meet (15 min)
2. **Code Review**: GitHub Pull Requests
3. **Blockers**: Slack/WhatsApp → Tag whole team
4. **Questions**: Mentor channel (don't wait!)

---

## 🎯 Success Criteria (from Assignment)

- [ ] **5 Services**: All functional
- [ ] **1000+ req/min**: Load test passes
- [ ] **<100ms response**: API Gateway is fast
- [ ] **99.5% delivery**: With retries
- [ ] **Horizontal scaling**: Docker containers scale
- [ ] **Low latency**: gRPC communication works
- [ ] **Snake case**: All responses formatted correctly
- [ ] **Circuit breaker**: Prevents cascading failures
- [ ] **Retries**: Exponential backoff implemented
- [ ] **DLQ**: Failed messages handled
- [ ] **Health checks**: All services monitored
- [ ] **CI/CD**: Automated deployment works
- [ ] **Documentation**: Complete and clear

---

## 📝 Submission Checklist

Before using `/submit` command:

- [ ] All services running
- [ ] docker-compose up works
- [ ] Health checks passing
- [ ] API documentation complete
- [ ] GitHub CI/CD green
- [ ] README updated
- [ ] Each teammate can explain the code
- [ ] Load test passes (1000+ req/min)
- [ ] System design diagram created
- [ ] Presentation prepared

---

## 💪 Motivation

**Remember**:
- You have a **complete API Gateway** as reference
- All **shared utilities** are ready to use
- **Complete documentation** is available
- You're **allowed to use AI** (LLMs)
- **3 days** is enough time if you work smart

**Deadline**: Wednesday, Nov 12, 11:59 PM WAT

**You've got this! Let's build something amazing! 🚀**

---

## ❓ Quick Help

**Stuck?** Check these first:
1. IMPLEMENTATION_GUIDE.md
2. PROJECT_SUMMARY.md
3. api-gateway/ code (as reference)
4. NestJS documentation
5. Ask in team chat
6. Contact mentors

**Pro Tips**:
- Start simple, add features incrementally
- Test each component individually
- Use Postman/Thunder Client for API testing
- Use RabbitMQ Management UI to debug queues
- Check Docker logs: `docker-compose logs service-name`

---

**Last Updated**: November 9, 2025
**Team Members**: [Add your names]
**Project**: Distributed Notification System
