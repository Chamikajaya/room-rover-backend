# Use a smaller base image for building the application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Use a lighter base image for the final stage
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy prisma schema and generated client
COPY prisma ./prisma/
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist

# Copy the .env file
COPY .env .env

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client again in the final stage
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]