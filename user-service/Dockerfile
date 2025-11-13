FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client with dummy URL (will use real one at runtime)
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/temp"
RUN npx prisma generate

# Copy source files
COPY . .

# Expose port
EXPOSE 4000

# Start in development mode
CMD ["npm", "run", "start:dev"]