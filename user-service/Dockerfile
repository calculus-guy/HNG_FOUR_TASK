FROM node:20-alpine AS builder
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci

# copy rest
COPY . .

# generate prisma client
RUN npx prisma generate

# build
RUN npm run build

# production image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --production

# copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
