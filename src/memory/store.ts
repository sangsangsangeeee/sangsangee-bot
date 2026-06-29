import { join, isAbsolute, resolve } from "node:path";
import { z } from "zod";

/**
 * 단기 메모리: 대화 세션 포인터.
 * SDK가 대화 이력 자체를 ~/.claude에 보관하므로, 우리는 "어느 세션을
 * 이어갈지"를 가리키는 sessionId와 마지막 활동 시각만 저장한다.
 */
const SessionState = z.object({
  sessionId: z.string().nullable(),
  lastActiveAt: z.string(), // ISO 타임스탬프
});
export type SessionState = z.infer<typeof SessionState>;

/** memoryDir(상대경로면 프로젝트 루트 기준)을 절대경로로 정규화한다. */
function memoryRoot(memoryDir: string): string {
  // store.ts는 src/memory/에 있으므로 프로젝트 루트는 두 단계 위.
  const projectRoot = resolve(import.meta.dir, "..", "..");
  return isAbsolute(memoryDir) ? memoryDir : resolve(projectRoot, memoryDir);
}

function sessionPath(memoryDir: string, key: string): string {
  return join(memoryRoot(memoryDir), `session.${key}.json`);
}

/** 저장된 세션 상태를 읽는다. 없거나 깨졌으면 null 세션으로 시작. */
export async function readSession(memoryDir: string, key = "default"): Promise<SessionState> {
  const fallback: SessionState = { sessionId: null, lastActiveAt: new Date(0).toISOString() };
  const file = Bun.file(sessionPath(memoryDir, key));
  if (!(await file.exists())) return fallback;
  try {
    return SessionState.parse(JSON.parse(await file.text()));
  } catch (e) {
    console.error("세션 파일 파싱 실패, 새 세션으로 시작:", e);
    return fallback;
  }
}

/** 세션 상태를 저장한다(디렉토리는 Bun.write가 자동 생성). */
export async function writeSession(
  memoryDir: string,
  state: SessionState,
  key = "default",
): Promise<void> {
  await Bun.write(sessionPath(memoryDir, key), JSON.stringify(state, null, 2));
}

/**
 * lastActiveAt이 ttlMin분 이내면 세션이 "신선"하다고 본다.
 * 너무 오래 비었으면 옛 맥락을 끌고 오지 않도록 새 세션을 시작한다.
 */
export function isSessionFresh(state: SessionState, ttlMin: number): boolean {
  if (!state.sessionId) return false;
  const last = Date.parse(state.lastActiveAt);
  if (Number.isNaN(last)) return false;
  return Date.now() - last <= ttlMin * 60_000;
}
