# ----------------------------------------------------
# Stage 1: Build Stage
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native Node addons (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

# Install dependencies based on package-lock.json
COPY package*.json ./
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to JavaScript (/dist)
RUN npm run build

# Remove development dependencies to keep the image lightweight
RUN npm prune --production

# ----------------------------------------------------
# Stage 2: Production Stage
# ----------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy production node_modules and package configuration
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Run container as non-root user for security
USER node

# Expose default application port
EXPOSE 5000

# Start production server
CMD ["node", "dist/server.js"]
