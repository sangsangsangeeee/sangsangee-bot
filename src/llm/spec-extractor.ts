import { query } from "@anthropic-ai/claude-agent-sdk";
import { specSchema, type ProjectSpec } from "../spec/schema.ts";
import { slugify } from "../spec/builder.ts";

export interface ExtractInput {
  /** 사용자의 자유 형식 요구사항 텍스트(언어 무관). */
  conversation: string;
  user?: string;
  now: string; // ISO 타임스탬프 — 외부에서 주입, 여기서 생성하지 않음
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
 * Agent SDK(사용자의 Claude 구독)를 돌려 자유 텍스트를 draft 스펙으로 구조화한
 * 뒤, 공유 schema로 검증한다.
 *
 * 인증: 환경의 CLAUDE_CODE_OAUTH_TOKEN에 의존한다(API key 없음).
 * 텍스트 전용 — file/bash 도구는 부여하지 않는다.
 */
export async function extractSpec(input: ExtractInput): Promise<ProjectSpec> {
  let resultText = "";
  for await (const message of query({
    prompt: `User requirement:\n${input.conversation}`,
    options: {
      model: input.model,
      systemPrompt: SYSTEM,
      allowedTools: [], // 도구 없음 — 순수 텍스트 변환
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

/** 모델 응답에서 첫 {...} 블록을 뽑아 파싱한다. */
function parseJsonObject(text: string): Record<string, any> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error(`모델 출력에 JSON 객체가 없습니다: ${text.slice(0, 200)}`);
  return JSON.parse(text.slice(start, end + 1));
}
