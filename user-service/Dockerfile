
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/node_modules ./node_modules 
COPY --from=builder /app/prisma ./prisma
COPY .env .
COPY src/modules/auth/entities/ ./src/modules/auth/entities/

EXPOSE 8080

CMD ["node", "dist/main.js"]