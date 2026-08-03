import dotenv from "dotenv";

dotenv.config({
  path: ".env.test",
});

import prisma from "../src/lib/prisma";

beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});