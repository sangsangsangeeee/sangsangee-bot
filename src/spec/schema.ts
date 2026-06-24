import { z } from "zod";

/**
 * Mirror of meta-repo/specs/spec.schema.json. Keep these in sync — this is the
 * one contract both repos share. (A later step can codegen this from the JSON
 * Schema; for the skeleton we maintain it by hand.)
 */
export const specSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case"),
  title: z.string().min(1),
  type: z.enum(["web", "api", "cli", "lib", "bot", "other"]),
  summary: z.string().min(1),
  requirements: z.array(z.string()).default([]),
  design: z
    .object({
      notes: z.string().optional(),
      references: z.array(z.string()).optional(),
    })
    .default({}),
  constraints: z.array(z.string()).default([]),
  status: z.enum(["draft", "submitted", "approved", "building", "done"]),
  source: z.object({
    channel: z.enum(["telegram", "manual", "other"]),
    user: z.string().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type ProjectSpec = z.infer<typeof specSchema>;
