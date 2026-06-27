import { query } from "@anthropic-ai/claude-agent-sdk";
import { specSchema, type ProjectSpec } from "../spec/schema.ts";
import { slugify } from "../spec/builder.ts";

export interface ExtractInput {
  /** Free-form requirement text from the user (any language). */
  conversation: string;
  user?: string;
  now: string; // ISO timestamp — passed in, never generated here
  model: string;
}

const SYSTEM = `You convert a user's free-form product idea (in any language) into a structured project spec.
Reply with ONE JSON object and nothing else — no prose, no markdown code fences. Shape:
{
  "title": "short product title",
  "type": "web" | "api" | "cli" | "lib" | "bot" | "other",
  "summary": "one short paragraph",
  "requirements": ["concrete, testable requirement", ...],
  "design": { "notes": "design/UX notes, or omit" },
  "constraints": ["stack / deadline / other constraints", ...]
}
Infer reasonable defaults when the input is sparse, but keep it minimal and faithful to what the user asked.`;

/**
 * Run the Agent SDK (on the user's Claude subscription) to structure free text
 * into a draft spec, then validate it against the shared schema.
 *
 * Auth: relies on CLAUDE_CODE_OAUTH_TOKEN in the environment (no API key).
 * Text-only — no file/bash tools are granted.
 */
export async function extractSpec(input: ExtractInput): Promise<ProjectSpec> {
  let resultText = "";
  for await (const message of query({
    prompt: `User requirement:\n${input.conversation}`,
    options: {
      model: input.model,
      systemPrompt: SYSTEM,
      allowedTools: [], // no tools — pure text transformation
      permissionMode: "bypassPermissions",
      maxTurns: 1,
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      resultText = message.result;
    }
  }

  if (!resultText) throw new Error("Agent SDK가 결과를 반환하지 않았습니다");

  const parsed = parseJsonObject(resultText);
  const slug = slugify(String(parsed.title ?? input.conversation.slice(0, 40)));

  return specSchema.parse({
    id: `${input.now.slice(0, 10)}-${slug}`,
    slug,
    title: parsed.title ?? "Untitled",
    type: parsed.type ?? "other",
    summary: parsed.summary ?? parsed.title ?? input.conversation,
    requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
    design: parsed.design && typeof parsed.design === "object" ? parsed.design : {},
    constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
    status: "draft",
    source: { channel: "telegram", user: input.user },
    createdAt: input.now,
  });
}

/** Pull the first {...} block out of the model's reply and parse it. */
function parseJsonObject(text: string): Record<string, any> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error(`모델 출력에 JSON 객체가 없습니다: ${text.slice(0, 200)}`);
  return JSON.parse(text.slice(start, end + 1));
}
