//This middleware will check:
//1. No unexpected fields are sent.(Ex. age, address, phone, etc. for updateUser. Only name and email are allowed.)
//2. At least one field is provided.
//3.a: name, if provided, is a non-empty string.
//3.b: email, if provided, is a non-empty string.
// we DON't want: {}- because there is nothing to update.
//4. If email is provided, it must be a valid email format.
// 5. Trimming - input normalization

import { Request, Response, NextFunction } from "express";
import isValidEmail from "../utils/isValidEmail";

const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  const { name, email } = req.body ?? {};

  const allowedFields = ["name", "email"];

  const fields = Object.keys(req.body ?? {});

  //1. Check for unexpected fields  
  const hasInvalidField = fields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasInvalidField) {
    res.status(400).json({
      success: false,
      message: "Only name and email can be updated.",
    });
    return;
  }

  //2. Check for undefined fields
  if (name === undefined && email === undefined) {
    res.status(400).json({
      success: false,
      message: "At least one field is required to update.",
    });
    return;
  }
  
  //3.a + 3.b: Validate that name is a non-empty string
  if (
    (name !== undefined &&
      (typeof name !== "string" || name.trim() === "")) ||
    (email !== undefined &&
      (typeof email !== "string" || email.trim() === ""))
  ) {
    res.status(400).json({
      success: false,
      message: "Name and email must be non-empty strings.",
    });
    return;
  }

  //4. Validate email format if email is provided
  if (email !== undefined && !isValidEmail(email.trim())) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
    return;
  }

  //5. input normalization/sanitization: trim whitespace from name and email, the request body itself is modified before passing to the controller
  if (name !== undefined) {
    req.body.name = name.trim();
  }
  if (email !== undefined) {
    req.body.email = email.trim().toLowerCase(); // Normalize email to lowercase for consistency
  }

  next();
};

export default validateUpdateUser;

// ------ workflow of validateUpdateUser middleware ------

// PUT /users/:id
//       ↓
// validateUserId
//       ↓
// validateUpdateUser
//       ↓
// Only name + email
//       ↓
// updateUser
//       ↓
// Prisma

// Example of input normalization/sanitization:

//{
//  "name": "  Satyobroto  "
//}
//
//becomes:
//
//{
//  "name": "Satyobroto"
//}