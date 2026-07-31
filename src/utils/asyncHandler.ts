// For async functions
// Removing try/catch from controllers - This works, but imagine 50 controllers.

import { Request, Response, NextFunction } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;


const asyncHandler = (
  fn: AsyncController                       //Give me any async controller function.
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    Promise.resolve(fn(req, res, next))     //captures the promise.
      .catch(next);                         // sends the error to Global Error Middleware: 'errorHandler'
  };
};

export default asyncHandler;

// ---- Workflow of asyncHandler and errorHandler ----

// Controller
//     |
//     ▼
// Error happens
//     |
//     ▼
// Async Handler
//     |
//     ▼
// Global Error Middleware
