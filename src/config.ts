export interface Config {
  botToken: string;
  allowlist: number[];
  /** 구독 OAuth 토큰(CLAUDE_CODE_OAUTH_TOKEN)이 있으면 true. */
  aiEnabled: boolean;
  /** Claude 호출 시 Agent SDK에 넘기는 모델. */
  aiModel: string;
  /** 메모리 파일을 저장할 디렉토리(상대경로면 프로젝트 루트 기준). */
  memoryDir: string;
  /** 이 시간(분) 넘게 대화가 없으면 새 세션을 시작한다. */
  sessionTtlMin: number;
}

export function loadConfig(): Config {
  const allowlist = (process.env.ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));

  const sessionTtlMin = Number(process.env.SESSION_TTL_MIN ?? "180");

  return {
    botToken: process.env.BOT_TOKEN ?? "",
    allowlist,
    aiEnabled: Boolean(process.env.CLAUDE_CODE_OAUTH_TOKEN),
    aiModel: process.env.AI_MODEL ?? "claude-sonnet-4-6",
    memoryDir: process.env.MEMORY_DIR ?? ".memory",
    sessionTtlMin: Number.isFinite(sessionTtlMin) && sessionTtlMin > 0 ? sessionTtlMin : 180,
  };
}
