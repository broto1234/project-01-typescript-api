// Create a reusable Prisma Client instance that can be imported and used throughout your application.

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client"; // 1. Import the 'generated Prisma Client from your project'.
import { PrismaPg } from "@prisma/adapter-pg";

// 2. Create a Prisma Client instance with the PostgreSQL adapter and connection string from the environment variable.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

//3. This creates a Prisma Client that can communicate with your 'database'.
const prisma = new PrismaClient({
  adapter,
});

// 4. Export the Prisma Client instance for use in other parts of your application. EX. services, controllers, etc.
export default prisma;