
import {
  Request,
  Response,
  NextFunction,
} from "express";
import { z } from "zod";

const validateQuery = <T extends z.ZodType>(
  schema: T
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

   // Zod validates the incoming query and returns the parsed data.    
    const result = schema.safeParse(req.query);


    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: result.error.issues,
      });

      return;
    }

    // Store the validated data for the controller.
    res.locals.query = result.data;  //Express already provides res.locals specifically for passing request-specific data between middleware and later handlers.

    next();
  };
};

export default validateQuery;

//------
//Body validation
//
//schema.parse(req.body);
//
//➡️ Relies on Express/global error handler.
//
//Query validation
//
//schema.safeParse(req.query);
//
//➡️ Handles the error directly inside the middleware.