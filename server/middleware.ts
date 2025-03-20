import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Middleware to validate request body against a Zod schema
 */
export function zValidate(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error).message;
        return res.status(400).json({ message: validationError });
      }
      return res.status(400).json({ message: "Invalid request data" });
    }
  };
}
