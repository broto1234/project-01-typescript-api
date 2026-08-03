
# ==========================
# Stage 1: Build
# ==========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build


# ==========================
# Stage 2: Production
# ==========================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev


COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

COPY --from=builder /app/prisma ./prisma


EXPOSE 3000

CMD ["node", "dist/src/server.js"]

# --------- Dockerfile for the TypeScript API -----------
# # Use the official Node.js 22 LTS image
# FROM node:22-alpine

# # Create the application directory
# WORKDIR /app

# # Copy package files first (better Docker layer caching)
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the project
# COPY . .

# # Generate the Prisma Client
# RUN npx prisma generate

# # Build the TypeScript project
# RUN npm run build

# # Expose the application's port
# EXPOSE 3000

# # Start the application
# CMD ["npm", "start"]
