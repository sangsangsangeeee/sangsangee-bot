# TODO

봇 정체성: **텔레그램 ↔ Claude 범용 채팅봇**. 기능은 하나씩 추가한다.
현재는 봇 내부 구조·룰을 정리하는 단계.

## 로드맵
- [ ] (다음 기능 미정 — 정해지는 대로 채운다.)

## 알려진 이슈
- [ ] `ALLOWLIST`가 비어 있으면 누구나 봇 사용 가능 — 운영 전 설정 필요.
- [ ] 봇 프로세스가 터미널 종료 시 SIGHUP으로 죽음 — 프로세스 매니저/백그라운드 실행 필요.
- [ ] 텔레그램 메시지 길이 제한(4096자) — Claude 답변이 길면 분할/잘림 처리 필요.

## 미정 (결정 대기)
- [ ] 멀티턴 대화 컨텍스트 유지 여부 — 현재 `chat()`은 매 메시지 단발(`maxTurns: 1`).
      대화 맥락을 이어가려면 사용자별 히스토리 저장이 필요하다.

## 완료
- [x] 봇을 범용 Claude 채팅봇으로 재정의 — 스펙 수집/meta-repo producer 기능 제거
      (`src/spec/` 삭제, `/new`·`/spec`·`--demo-spec` 제거, config의 `specsDir`·
      `gitCommit` 제거). 현재 구조: `src/index.ts` → `src/llm/chat.ts` → 텔레그램 답장.
- [x] CLAUDE.md·`.env.example`을 새 구조에 맞게 갱신.
- [x] 봇의 텔레그램 사용자 응답(`ctx.reply`)과 `src` 설명 주석을 한글로 통일.

## 폐기된 항목 (스펙 수집 봇 시절)
- [~] A-1 멀티턴 요구사항 수집 / A-2 zod 검증·확인 단계 / A-3 `/status`·allowlist 하드닝 /
      A-4 자유 텍스트 → 스펙 구조화 — 봇 방향 전환으로 폐기.
- [~] 스펙 스키마 수동 동기화(`src/spec/schema.ts` ↔ `meta-repo/specs/spec.schema.json`)
      — `src/spec/` 제거로 해당 없음.
