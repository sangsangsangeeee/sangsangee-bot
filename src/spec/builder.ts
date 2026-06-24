import { specSchema, type ProjectSpec } from "./schema.ts";

/** kebab-case a free-text title into a slug. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "untitled";
}

export interface DraftInput {
  title: string;
  type?: ProjectSpec["type"];
  summary?: string;
  requirements?: string[];
  designNotes?: string;
  constraints?: string[];
  user?: string;
  now: string; // ISO timestamp — passed in, never generated here
}

/**
 * Turn collected conversation input into a validated draft spec.
 * (A-1/A-2 will feed this from a multi-turn flow; A-0 feeds it a title.)
 */
export function buildSpec(input: DraftInput): ProjectSpec {
  const slug = slugify(input.title);
  const draft = {
    id: `${input.now.slice(0, 10)}-${slug}`,
    slug,
    title: input.title,
    type: input.type ?? "other",
    summary: input.summary ?? input.title,
    requirements: input.requirements ?? [],
    design: input.designNotes ? { notes: input.designNotes } : {},
    constraints: input.constraints ?? [],
    status: "draft" as const,
    source: { channel: "telegram" as const, user: input.user },
    createdAt: input.now,
  };
  return specSchema.parse(draft);
}

/** Render the human-readable spec.md from a spec. */
export function renderMarkdown(spec: ProjectSpec): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push(`id: ${spec.id}`);
  lines.push(`slug: ${spec.slug}`);
  lines.push(`title: ${spec.title}`);
  lines.push(`type: ${spec.type}`);
  lines.push(`status: ${spec.status}`);
  lines.push("---", "");
  lines.push(`# ${spec.title}`, "");
  lines.push(spec.summary, "");
  if (spec.requirements.length) {
    lines.push("## Requirements");
    for (const r of spec.requirements) lines.push(`- ${r}`);
    lines.push("");
  }
  if (spec.design.notes) {
    lines.push("## Design", spec.design.notes, "");
  }
  if (spec.constraints.length) {
    lines.push("## Constraints");
    for (const c of spec.constraints) lines.push(`- ${c}`);
    lines.push("");
  }
  return lines.join("\n");
}
