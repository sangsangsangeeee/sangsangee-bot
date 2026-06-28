import { specSchema, type ProjectSpec } from "./schema.ts";

/** 자유 텍스트 제목을 kebab-case slug로 변환한다. */
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
  now: string; // ISO 타임스탬프 — 외부에서 주입, 여기서 생성하지 않음
}

/**
 * 수집한 대화 입력을 검증된 draft 스펙으로 만든다.
 * (A-1/A-2에서 멀티턴 흐름으로 채우고, A-0에서는 제목만 넘긴다.)
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

/** 스펙에서 사람이 읽는 spec.md를 렌더링한다. */
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
