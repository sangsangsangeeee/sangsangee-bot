import { z } from "zod";

/**
 * meta-repo/specs/spec.schema.json의 미러. 항상 동기화 유지 — 두 repo가 공유하는
 * 하나의 contract다. (이후 단계에서 JSON Schema로부터 codegen 가능. skeleton
 * 단계에서는 수동으로 관리한다.)
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
