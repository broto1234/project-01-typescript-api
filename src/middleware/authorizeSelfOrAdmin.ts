import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const authorizeSelfOrAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.userId || !req.userRole) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  const requestedUserId = Number(req.params.id);

  if (req.userRole === "ADMIN") {
    next();
    return;
  }

  if (req.userId !== requestedUserId) {
    throw new AppError(
      "You can only manage your own account",
      403
    );
  }

  next();
};

export default authorizeSelfOrAdmin;