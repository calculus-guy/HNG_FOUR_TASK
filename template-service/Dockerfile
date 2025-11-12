# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Build the project 
RUN npm run build

# Expose ports
EXPOSE 3002 50052

# Start the service
CMD ["node", "dist/main.js"]
