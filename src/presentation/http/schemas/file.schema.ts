import z from "zod";

export const fileUploadSchema = z.object({
  parentId: z.string().optional(),
  name: z.string().trim().min(1).max(255).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const fileUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: z.string().optional(),
});

export const fileListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "page must be a positive integer",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "limit must be a positive integer",
    }),
  parentId: z.string().optional(),
  search: z.string().optional(),
});

export type FileUploadSchema = z.infer<typeof fileUploadSchema>;
export type FileUpdateSchema = z.infer<typeof fileUpdateSchema>;
export type FileListQuerySchema = z.infer<typeof fileListQuerySchema>;
