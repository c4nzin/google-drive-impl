import z from "zod";

export const fileUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: z.string().optional(),
});

export type FileUpdateSchema = z.infer<typeof fileUpdateSchema>;
