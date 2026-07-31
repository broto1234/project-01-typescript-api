import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { CreateUser } from "../types/user.types";

// POST /register → Register user
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  
  const data: CreateUser = req.body;

  const user = await authService.registerUser(data);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};

// POST /login → Login user
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {

  const { email, password } = req.body;

  const result = await authService.loginUser(
    email,
    password
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
};

// GET /me → Get current user
export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await authService.getCurrentUser(
    req.userId!    // The ! is TypeScript's non-null assertion operator. It tells TypeScript: "I know this value is not undefined here."
  );

  res.status(200).json({
    success: true,
    user,
  });
};


export const refresh = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;

  const result =
    await authService.refreshAccessToken(
      refreshToken
    );

  res.status(200).json({
    success: true,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
};


export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;

  await authService.logoutUser(
    refreshToken
  );

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};