import bcrypt from "bcrypt";

import prisma from "../lib/prisma";
import AppError from "../utils/AppError";

import { hashPasswordResetToken } from "../utils/passwordReset";

import { env } from "../config/env";

export const resetPassword = async (
  token: string,
  password: string
): Promise<void> => {
  // hash token - Hash the incoming token
  const tokenHash =
  hashPasswordResetToken(token);

  // find token
  const storedToken =
  await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  // validate
  if (!storedToken) {
    throw new AppError(
      "Invalid or expired password reset token",
      400
    );
  }

  if (storedToken.usedAt) {
    throw new AppError(
      "Password reset token has already been used",
      400
    );
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError(
      "Password reset token has expired",
      400
    );
  }

  // hash the new password
  const hashedPassword = await bcrypt.hash(
    password,
    env.bcryptSaltRounds
  );


  // A transaction ensures:everything succeeds, or everything is rolled back.
  // tx is a special Prisma client that's tied to the current transaction.
  // replace prisma with tx:
  // await prisma.$transaction(async (tx) => {
    // update user's password
    await prisma.user.update({
      where: {
        id: storedToken.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // revoke all refresh tokens - If the password changes because of a reset, all existing sessions should become invalid.
    await prisma.refreshToken.updateMany({
      where: {
        userId: storedToken.user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Mark token used - the token can't be reused.
    await prisma.passwordResetToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    });
  // });
}