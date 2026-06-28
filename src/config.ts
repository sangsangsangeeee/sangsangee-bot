export interface Config {
  botToken: string;
  allowlist: number[];
  /** 구독 OAuth 토큰(CLAUDE_CODE_OAUTH_TOKEN)이 있으면 true. */
  aiEnabled: boolean;
  /** Claude 호출 시 Agent SDK에 넘기는 모델. */
  aiModel: string;
}

export function loadConfig(): Config {
  const allowlist = (process.env.ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));

  return {
    botToken: process.env.BOT_TOKEN ?? "",
    allowlist,
    aiEnabled: Boolean(process.env.CLAUDE_CODE_OAUTH_TOKEN),
    aiModel: process.env.AI_MODEL ?? "claude-sonnet-4-6",
  };
}
