import dotenv from "dotenv";

dotenv.config({
  path: ".env.test",
});

// Mock email sending in tests
jest.mock("../src/services/email.service", () => ({
  sendPasswordResetEmail: jest.fn()
    .mockResolvedValue(undefined),
    
  sendVerificationEmail: jest
    .fn()
    .mockResolvedValue(undefined),
}));

import prisma from "../src/lib/prisma";

beforeEach(async () => {
  jest.clearAllMocks();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});