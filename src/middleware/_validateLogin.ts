// Use bcrypt.compare() to verify the password.

import { Request, Response, NextFunction } from "express";
import isValidEmail from "../utils/isValidEmail";

const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  
  const { email, password } = req.body ?? {};

  // Only allow email and password
  const allowedFields = ["email", "password"];

  const fields = Object.keys(req.body ?? {});

  const hasInvalidField = fields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasInvalidField) {
    res.status(400).json({
      success: false,
      message: "Only email and password are allowed.",
    });
    return;
  }

  // Check required fields and types
  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
    return;
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Check empty values
  if (
    normalizedEmail === "" ||
    password.trim() === ""
  ) {
    res.status(400).json({
      success: false,
      message: "Email and password cannot be empty.",
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

  // Update request body with normalized email
  req.body.email = normalizedEmail;

  next();
};

export default validateLogin;