# Use the official Node.js 22 LTS image
FROM node:22-alpine

# Create the application directory
WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Generate the Prisma Client
RUN npx prisma generate

# Build the TypeScript project
RUN npm run build

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
