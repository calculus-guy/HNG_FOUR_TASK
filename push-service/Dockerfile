# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY package*.json ./


RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"


ENTRYPOINT ["dumb-init", "--"]


CMD ["node", "dist/main.js"]