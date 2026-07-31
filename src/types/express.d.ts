// TypeScript doesn't know that 'req.userId' exists yet, so we need to extend the Express Request interface to include it. This is done in a declaration file (express.d.ts) which is automatically included by TypeScript.
//The .d.ts file is specifically used to augment existing library types like Express.

// For -- req.userId = decoded.userId;

import { Role } from "./user.types";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: Role;
    }
  }
}

export {};