// the ID coming from the HTTP request.  From - req.params.id

// To stop invalid IDs before they reach your controllers or services.
// Invalid text (../users/abc)
// negative numbers (../users/-1) 
// zero (../users/0)
// Decimal numbers (../users/1.5)
// ../users/-1, ../users/0, ../users/1.5, ../users/abc - will be rejected with a 400 Bad Request response.


import { Request, Response, NextFunction } from "express";

const validateUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  const id = Number(req.params.id);
 
  if (!Number.isInteger(id) || id <= 0) {     // Is it an integer?  Or Is it greater than 0?
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
    return;
  }

  next();
};

export default validateUserId;