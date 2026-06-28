# TODO

## 로드맵
- [x] A-4: 자유 텍스트 대화를 스펙으로 구조화하는 Claude API
- [ ] A-1: 멀티턴 요구사항 수집(planning → design → constraints)
- [ ] A-2: 전체 zod 검증 + 제출 전 확인 단계
- [ ] A-3: `/status` 커맨드, allowlist 하드닝

## 알려진 이슈
- [ ] `ALLOWLIST`가 비어 있어 누구나 봇 사용 가능 — 운영 전 설정 필요 (A-3).
- [ ] 스펙 스키마 수동 동기화(`src/spec/schema.ts` ↔ `meta-repo/specs/spec.schema.json`)
      — JSON Schema에서 zod codegen 검토.
- [ ] 봇 프로세스가 터미널 종료 시 SIGHUP으로 죽음 — 프로세스 매니저/백그라운드 실행 필요.

## 완료
- [x] 봇의 텔레그램 사용자 응답(`ctx.reply`)과 `src` 설명 주석을 한글로 통일.
