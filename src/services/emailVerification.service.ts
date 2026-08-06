import prisma from "../lib/prisma";

import { env } from "../config/env";

import {
  generateToken,
  hashToken,
} from "../utils/token";

import { sendVerificationEmail } from "./email.service";

export const createEmailVerification = async (
  userId: number,
  email: string
): Promise<void> => {

  //Generate the token
  const verificationToken = generateToken();

  //Hash the token
  const tokenHash = hashToken(verificationToken);

  //Create the expiration date
  const expiresAt = new Date(
    Date.now() +
      env.passwordResetExpiresHours *
        1000 *
        60 *
        60
  );

  //Remove any old unused verification tokens
  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
      usedAt: null,
    },
  });

  // Create the new verification token
  await prisma.emailVerificationToken.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

  // Build the verification link
  const verificationLink =
  `${env.frontendUrl}/verify-email?token=${verificationToken}`;


  // Send the verification email
  await sendVerificationEmail(
    email,
    verificationLink
  );
};


export const verifyEmailService = async (
  token: string
): Promise<void> => {

  // Hash the incoming token
  const tokenHash = hashToken(token);

  // Find the verification token in the database
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
  });


  //Check if it exists
  if (!verificationToken) {
    throw new Error("Invalid or expired verification token");
  }
  
  //Check if token was already used
  if (verificationToken.usedAt) {
    throw new Error("Email already verified");
  }

  // Check if the token has expired
  if (verificationToken.expiresAt < new Date()) {
    throw new Error("Verification token has expired");
  }
  
  // Update the user's email verification status
  await prisma.user.update({
    where: {
      id: verificationToken.userId,
    },
    data: {
      emailVerifiedAt: new Date(),
    },
  });

  // Mark the token as used
  await prisma.emailVerificationToken.update({
    where: {
      id: verificationToken.id,
    },
    data: {
      usedAt: new Date(),
    },
  });

};