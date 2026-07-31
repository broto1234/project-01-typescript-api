// Add input validation
// If someone sends:
// {}
// then:
// const { refreshToken } = req.body;
// will produce:
// refreshToken === undefined
// We should validate this before reaching the service.

import {
  Request,
  Response,
  NextFunction,
} from "express";

import AppError from "../utils/AppError";

const validateRefreshToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { refreshToken } = req.body;

  if (
    !refreshToken ||
    typeof refreshToken !== "string"
  ) {
    throw new AppError(
      "Refresh token is required",
      400
    );
  }

  next();
};

export default validateRefreshToken;