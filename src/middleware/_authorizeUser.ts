import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const authorizeUser = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const targetUserId = Number(req.params.id);

  if (req.userId !== targetUserId) {
    throw new AppError(
      "You are not authorized to access this user",
      403
    );
  }

  next();
};

export default authorizeUser;