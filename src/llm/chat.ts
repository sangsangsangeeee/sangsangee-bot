import { query } from "@anthropic-ai/claude-agent-sdk";

export interface ChatInput {
  /** 사용자가 보낸 메시지(언어 무관). */
  message: string;
  /** 사용할 Claude 모델. */
  model: string;
  /** 이전 세션 ID. 있으면 그 대화 맥락을 이어간다. */
  resume?: string;
}

export interface ChatResult {
  /** Claude의 답변 텍스트. */
  text: string;
  /** 이번 대화의 세션 ID. 다음 호출에 resume으로 넘겨 맥락을 잇는다. */
  sessionId: string | null;
}

/**
 * 사용자의 메시지를 Claude(사용자의 구독)에 보내고, 답변과 세션 ID를 받는다.
 * resume을 주면 이전 대화 맥락을 이어간다(SDK가 ~/.claude에 세션을 보관).
 *
 * 인증: 환경의 CLAUDE_CODE_OAUTH_TOKEN에 의존한다(API key 없음).
 * 텍스트 전용 — file/bash 도구는 부여하지 않는다.
 */
export async function chat(input: ChatInput): Promise<ChatResult> {
  let resultText = "";
  let sessionId: string | null = null;

  for await (const message of query({
    prompt: input.message,
    options: {
      model: input.model,
      allowedTools: [], // 도구 없음 — 순수 텍스트 대화
      permissionMode: "bypassPermissions",
      maxTurns: 1,
      ...(input.resume ? { resume: input.resume } : {}),
    },
  })) {
    // init 메시지에서 세션 ID를 가장 빨리 얻는다.
    if (message.type === "system" && message.subtype === "init") {
      sessionId = message.session_id;
    }
    if (message.type === "result" && message.subtype === "success") {
      resultText = message.result;
      sessionId = message.session_id ?? sessionId;
    }
  }

  if (!resultText) throw new Error("Claude가 응답을 반환하지 않았습니다");
  return { text: resultText, sessionId };
}
