import prisma from "../lib/prisma";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "../utils/passwordReset";
import { env } from "../config/env";

export const forgotPasswordService = async (
  email: string
): Promise<string> => {
  
  // 1. Find user by email
  const user = await prisma.user.findUnique({
  where: { email },
  });

  // 2. If user doesn't exist
  if (!user) {
    return "If an account exists, a password reset link has been sent.";
  }

  // 3. Generate reset token
  const resetToken = generatePasswordResetToken();

  // 4. Hash the token
  const tokenHash = hashPasswordResetToken(resetToken);

  // 5. Create expiresAt (2 hours)
  const expiresAt = new Date(
  Date.now() + env.passwordResetExpiresHours *
    1000 *
      60 *
      60
  );

  // 6. Revoke/delete old unused tokens first
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  // 7. Create new token to Prisma
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      expiresAt,
      userId: user.id,
    },
  });

  // 8. Send email with reset link (this is a placeholder, implement actual email sending)
  return `http://localhost:5173/reset-password?token=${resetToken}`;
}