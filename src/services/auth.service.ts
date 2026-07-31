import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { PublicUser, LoginResponse, CreateUser, RefreshTokenResponse } from "../types/user.types";
import AppError from "../utils/AppError";
import { generateToken } from "../utils/jwt";
import { generateRefreshToken, hashRefreshToken } from "../utils/refreshToken";

// for registerUser, we will hash the password before saving it to the database.
export const registerUser = async (
  data: CreateUser
): Promise<PublicUser> => {

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  //...publicUser, which collects all the remaining properties except password.
  const { password: _password, ...publicUser } = user;

  return publicUser;
};


// for loginUser, we will compare the hashed password with the provided password using bcrypt.compare().
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const { password: _password, ...publicUser } = user;

  // Generate short-lived access token
  const accessToken = generateToken(
    user.id,
    user.role
  );

  // Generate random refresh token
  const refreshToken = generateRefreshToken();

  // Hash the refresh token before storing it in the database
  const tokenHash = hashRefreshToken(refreshToken);

  // Refresh token expires in 7 days
  const expiresAt = new Date(
    Date.now() +
      7 * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt
    },
  });

  return { 
    user: publicUser, 
    accessToken,
    refreshToken,
  };
};


// for getCurrentUser, we will retrieve the user from the database using the provided userId.
export const getCurrentUser = async (
  userId: number
): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,         // ID comes from the JWT- the server reads the authenticated identity from the verified JWT.
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { password: _password, ...publicUser } = user;

  return publicUser;
};


// 
export const refreshAccessToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {

  const tokenHash = hashRefreshToken(
    refreshToken
  );

  const storedToken =
    await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

  if (!storedToken) {
    throw new AppError(
      "Invalid refresh token",
      401
    );
  }

  if (storedToken.revokedAt) {
    throw new AppError(
      "Refresh token has been revoked",
      401
    );
  }

  if (
    storedToken.expiresAt < new Date()
  ) {
    throw new AppError(
      "Refresh token has expired",
      401
    );
  }

  // Generate new access token
  const accessToken = generateToken(
    storedToken.user.id,
    storedToken.user.role
  );

  // Generate new refresh token
  const newRefreshToken =
    generateRefreshToken();

  // Hash new refresh token
  const newTokenHash =
    hashRefreshToken(
      newRefreshToken
    );

  // New refresh token expires in 7 days
  const expiresAt = new Date(
    Date.now() +
      7 * 24 * 60 * 60 * 1000
  );

  // Revoke old refresh token
  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      tokenHash: newTokenHash,
      userId: storedToken.user.id,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};


// for logoutUser, we will revoke the refresh token by setting its revokedAt field to the current date and time.
export const logoutUser = async (
  refreshToken: string
): Promise<void> => {
  const tokenHash = hashRefreshToken(
    refreshToken
  );

  const storedToken =
    await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });

  if (!storedToken) {
    throw new AppError(
      "Invalid refresh token",
      401
    );
  }

  if (storedToken.revokedAt) {
    throw new AppError(
      "Refresh token has already been revoked",
      401
    );
  }

  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};