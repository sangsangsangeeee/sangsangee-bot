import { query } from "@anthropic-ai/claude-agent-sdk";

export interface ChatInput {
  /** 사용자가 보낸 메시지(언어 무관). */
  message: string;
  /** 사용할 Claude 모델. */
  model: string;
}

/**
 * 사용자의 메시지를 Claude(사용자의 구독)에 그대로 보내고, 답변 텍스트를 받는다.
 *
 * 인증: 환경의 CLAUDE_CODE_OAUTH_TOKEN에 의존한다(API key 없음).
 * 텍스트 전용 — file/bash 도구는 부여하지 않는다.
 */
export async function chat(input: ChatInput): Promise<string> {
  let resultText = "";
  for await (const message of query({
    prompt: input.message,
    options: {
      model: input.model,
      allowedTools: [], // 도구 없음 — 순수 텍스트 대화
      permissionMode: "bypassPermissions",
      maxTurns: 1,
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      resultText = message.result;
    }
  }

  if (!resultText) throw new Error("Claude가 응답을 반환하지 않았습니다");
  return resultText;
}
