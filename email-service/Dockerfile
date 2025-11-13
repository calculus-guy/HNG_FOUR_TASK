# Development Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 4003

# Start in development mode
CMD ["npm", "run", "start:dev"]