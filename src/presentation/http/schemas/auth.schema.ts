import z from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(500),
  password: z.string().min(6).max(255),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email().max(500),
  password: z.string().min(6).max(255),
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
