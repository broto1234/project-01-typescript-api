// Used to validate the 'request body' Ex. req.body (NOT for req.query) against a given Zod schema. 

import {
  Request,
  Response,
  NextFunction,
} from "express";
import { z } from "zod";

const validate = (
  schema: z.ZodType
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    
    const body = schema.parse(req.body);

    res.locals.body = body;   //store the parsed result - using the validated and transformed data, not the raw request.

    next();
  };
};

export default validate;