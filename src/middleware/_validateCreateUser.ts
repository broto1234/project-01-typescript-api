import { Request, Response, NextFunction } from "express";
import { CreateUser } from "../types/user.types";
import isValidEmail from "../utils/isValidEmail";

const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  const newUser: CreateUser = req.body;
  const { name, email } = newUser;

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

  // 2. Check for undefined fields
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    name.trim() === "" ||
    email.trim() === ""
  ) {
    res.status(400).json({
      success: false,
      message: "Name and email are required.",
    });
    return;
  }

  // 3. Validate email format
  if (!isValidEmail(email.trim())) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
    return;
  }

  //4. input normalization/sanitization: trim whitespace from name and email, the request body itself is modified before passing to the controller
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase(); // Normalize email to lowercase for consistency

  
  next();
};

export default validateCreateUser;

// ------ workflow of validateCreateUser middleware ------
//POST /users
//      ↓
//validateCreateUser
//      ↓
//Only name + email
//      ↓
//createUser
//      ↓
//Prisma