// NO trimming password because if we trim 'passwords', we are changing what the user entered.
// 'my password' is not same 'mypassword' after trimming, so we should not trim it.

import { Request, Response, NextFunction } from "express";
import isValidEmail from "../utils/isValidEmail";

const validateRegisterUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body ?? {};

  // Only allow name, email, and password
  const allowedFields = ["name", "email", "password"];

  const fields = Object.keys(req.body ?? {});

  const hasInvalidField = fields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasInvalidField) {
    res.status(400).json({
      success: false,
      message: "Only name, email, and password are allowed.",
    });
    return;
  }

  // Check required fields and types
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    res.status(400).json({
      success: false,
      message: "Name, email, and password are required.",
    });
    return;
  }

  // Trim name and email
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // Check empty values
  if (
    trimmedName === "" ||
    normalizedEmail === "" ||
    password.trim() === ""
  ) {
    res.status(400).json({
      success: false,
      message: "Name, email, and password cannot be empty.",
    });
    return;
  }

  // Validate email
  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
    return;
  }

  // Validate password length
  if (password.length < 8) {
    res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
    return;
  }

  // Replace request body with normalized data
  req.body.name = trimmedName;
  req.body.email = normalizedEmail;

  next();
};

export default validateRegisterUser;