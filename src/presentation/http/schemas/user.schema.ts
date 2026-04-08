import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email().max(500),
  password: z.string().min(6).max(255),
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
});

export const userUpdateSchema = userSchema.partial();

export type UserSchema = z.infer<typeof userSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
