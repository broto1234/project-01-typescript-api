// ------ Authorization -------
// It will:
// Check if the user has the required role(s) to access a route.
// If the user does not have the required role(s), it will throw an error.
// If the user has the required role(s), it will call next() to proceed to the next middleware or route handler.

import { Request, Response, NextFunction } from "express";
import { Role } from "../types/user.types";
import AppError from "../utils/AppError";

const authorizeRoles = (
  ...allowedRoles: Role[]
) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.userRole) {
      throw new AppError("Authentication required", 401);
    }

    if (!allowedRoles.includes(req.userRole)) {
      throw new AppError("Access denied", 403);
    }

    next();
  };
};

export default authorizeRoles;