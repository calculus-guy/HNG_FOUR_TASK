# Development Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose ports
EXPOSE 4002 50052

# Start in development mode with hot reload
CMD ["npm", "run", "start:dev"]
