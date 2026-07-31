// The JWT carries the user's identity and role.

import jwt from "jsonwebtoken";
import { Role } from "../types/user.types";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

interface JwtPayload {
  userId: number;
  role: Role;
}

export const generateToken = (userId: number, role: Role): string => {
  return jwt.sign(
    { userId,        // user's identity
      role           // user's role
     },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};