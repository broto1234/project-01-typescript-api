import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters"),

  email: z
    .email({
      error: "Invalid email address",
    }),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export type CreateUser = z.infer<typeof registerSchema>;


export const loginSchema = z.object({
  email: z.email({
    error: "Invalid email address",
  }),

  password: z
    .string()
    .min(1, {
      error: "Password is required",
    }),
});

export type LoginUser = z.infer<typeof loginSchema>;


export const forgotPasswordSchema = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
});
export type ForgotPasswordUser = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, {
      error: "Token is required",
    }),

  password: z
    .string()
    .min(8, {
      error: "Password must be at least 8 characters long",
    }),
});
export type ResetPasswordUser = z.infer<typeof resetPasswordSchema>;

export const resendVerificationSchema = z.object({
  email: z
    .email("Please provide a valid email address"),
});
export type ResendVerificationUser = z.infer<typeof resendVerificationSchema>;