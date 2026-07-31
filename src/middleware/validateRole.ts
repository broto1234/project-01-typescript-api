import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { Role } from "../types/user.types";

const validateRole = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { role } = req.body;

  const validRoles: Role[] = ["USER", "ADMIN"];

  if (!role || !validRoles.includes(role)) {
    throw new AppError(
      "Role must be either USER or ADMIN",
      400
    );
  }

  next();
};

export default validateRole;