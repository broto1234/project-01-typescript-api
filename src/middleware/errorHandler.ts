// Global error handling middleware - architecture instead of writing duplicate error handling in every controller.

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";
import AppError from "../utils/AppError";

// Global error handling middleware
const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {

  //1. Handle custom application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  //2. Handle Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {

    // Duplicate unique field
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
      return;
    }

    // Record not found
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
  }

  // 3. Prisma validation errors - means the server sent invalid data to Prisma.
  if (
    err instanceof Prisma.PrismaClientValidationError
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid data provided",
    });
    return;
  }

  //-----------
  // // 4. Handle JWT expiration errors
  // if (err instanceof jwt.TokenExpiredError) {
  //   res.status(401).json({
  //     success: false,
  //     message: "Token has expired",
  //   });
  //   return;
  // }

  // // 5. Handle JWT validation errors
  // if (err instanceof jwt.JsonWebTokenError) {
  //   res.status(401).json({
  //     success: false,
  //     message: "Invalid token",
  //   });
  //   return;
  // }
  //-----------

  // 6. Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  //7. Handle unexpected errors
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;


// Golbal error flow becomes:
//Error
// │
// ├── AppError
// │      └── Custom status/message
// │
// ├── Prisma P2002
// │      └── 409
// │
// ├── Prisma P2025
// │      └── 404
// │
// ├── Prisma Validation
// │      └── 400
// │
// ├── JWT Expired
// │      └── 401
// │
// ├── JWT Invalid
// │      └── 401
// │
// └── Unknown Error
//        └── 500