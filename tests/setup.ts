import dotenv from "dotenv";

dotenv.config({
  path: ".env.test",
});

// Mock email sending in tests
jest.mock("../src/services/email.service", () => ({
  sendPasswordResetEmail: jest.fn()
    .mockResolvedValue(undefined),
}));

import prisma from "../src/lib/prisma";

beforeEach(async () => {
  jest.clearAllMocks();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});