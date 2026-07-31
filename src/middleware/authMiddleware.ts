//It will:
//
//Read the Authorization header.
//Check for Bearer <token>.
//Verify the JWT.
//Extract userId.
//Attach the user ID to the request.
//Call next().
// Then we'll protect a route, for example: userRouter.get( "/", authMiddleware, asyncHandler(getUsers));

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";
import { Role } from "../types/user.types";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

interface JwtPayload {
  userId: number;
  role: Role;
}

// Type guard to check if a value is of type Role
const isValidRole = (
  role: unknown
): role is Role => {
  return role === "USER" || role === "ADMIN";
};


const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {

  const authHeader = req.headers.authorization;  // Bearer eyJhbGciOiJIUzI1Ni...

  if (!authHeader) {
    throw new AppError("Authentication required", 401);
  }

  const [scheme, token] = authHeader.split(" "); //scheme -> "Bearer" token -> "eyJhbGciOiJIUzI1Ni..."

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Invalid authorization format", 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;  // decoded -> { userId: 1, iat: 1690000000, exp: 1690003600 }

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "number" ||
      !isValidRole(decoded.role)
    ) {
      throw new AppError("Invalid token", 401);
    }

    // Attach the user ID to the request object
    req.userId = decoded.userId;    //Create: 'src/types/express.d.ts' to let TypeScript know that 'req.userId' exists.
    req.userRole = decoded.role;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid or expired token", 401);
  }
};

export default authMiddleware;