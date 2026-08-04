import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().trim()
      .min(2, {
        error: "Name must be at least 2 characters long",
      })
      .max(50, {
        error: "Name must not exceed 50 characters",
      })
      .optional(),

    email: z
      .email({
        error: "Invalid email address",
      })
      .optional(),
  })
  .strict()                    // It means unknown fields are rejected. Ex. "password": "newpassword" or "role": "ADMIN" will be rejected. They are not part of the schema and will be rejected.
  .refine(                     // This checks that at least one field is provided. Ex. {} will fail.
    (data) =>
      data.name !== undefined ||
      data.email !== undefined,
    {
      error: "At least one field must be provided",
    }
  );
export type UpdateUser = z.infer<typeof updateUserSchema>;



// 'coerce' is used to convert the 'input value'/'URL query parameter' to a number, even if it's provided as a string. For example, if the user provides "1" as a string, it will be converted to the number 1.

export const userListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),

  search: z
    .string()
    .trim()
    .optional(),

  role: z
    .enum(["USER", "ADMIN"])
    .optional(),

  sortBy: z
    .enum(["id", "name", "email", "createdAt"])
    .default("id"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("asc"),
});


// Zod can generate TypeScript type, no need to manually define the type (Ex. UserListQuery).

// Create the 'UserListQuery' type automatically from 'Zod schema'. Using 'z.infer' to infer the type from the schema. This ensures that the TypeScript type and the Zod schema are always in sync, reducing the risk of mismatches between validation and type definitions.
export type UserListQuery = z.infer< typeof userListQuerySchema >;