import nodemailer from "nodemailer";

import { env } from "../config/env";

export const transporter = nodemailer.createTransport({
  host: env.mailHost,
  port: env.mailPort,
  secure: false,
  auth: {
    user: env.mailUser,
    pass: env.mailPassword,
  },
});

export const verifyEmailConnection =
  async (): Promise<void> => {
    await transporter.verify();
};


//knows how to send an email.
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  
  await transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    html,
  });
};

//knows what a password reset email looks like
export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string
): Promise<void> => {
  const subject = "Reset your password";

  const html = `
    <h2>Password Reset Request</h2>

    <p>You requested to reset your password.</p>

    <p>
      <a href="${resetLink}">
        Reset Password
      </a>
    </p>

    <p>This link expires in 2 hours.</p>

    <p>If you didn't request this, you can safely ignore this email.</p>
  `;

  await sendEmail(
    email,
    subject,
    html
  );
};


//knows what a verification email looks like
export const sendVerificationEmail = async (
  email: string,
  verificationLink: string
): Promise<void> => {
  const subject = "Verify your email address";

  const html = `
    <h2>Welcome!</h2>

    <p>Thanks for creating your account.</p>

    <p>Please verify your email address by clicking the link below:</p>

    <p>
      <a href="${verificationLink}">
        Verify Email
      </a>
    </p>

    <p>This link expires in 2 hours.</p>

    <p>If you didn't create this account, you can safely ignore this email.</p>
  `;

  await sendEmail(
    email,
    subject,
    html
  );
};