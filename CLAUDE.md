# telegram-bot

텔레그램으로 제품 요구사항을 수집해 검증된 스펙을 meta-repo의 `specs/inbox/`에
써넣는 Bun + grammY 봇.

## Contract
이 봇은 meta-repo에 대한 **producer**다. 항상 `status: draft|submitted` 스펙만
쓴다. 타깃 스키마는 `meta-repo/specs/spec.schema.json`에 있고, zod 미러는
`src/spec/schema.ts`다(둘을 항상 동기화 유지).

## Layout
- `src/index.ts` — grammY 엔트리 + 커맨드(`/start`, `/help`, `/new`).
- `src/config.ts` — 환경변수(BOT_TOKEN, SPECS_DIR, ALLOWLIST, GIT_COMMIT).
- `src/spec/` — `schema.ts`(zod), `builder.ts`(입력 → 스펙 + 마크다운),
  `writer.ts`(inbox에 쓰기 + 선택적 git commit).
- `src/bot/` — 커맨드/대화/미들웨어(A-1+에서 채움).

## Run
```bash
bun install
cp .env.example .env        # BOT_TOKEN 설정
bun run dev                 # 롱폴링 봇
# 토큰이 없다면? contract를 엔드투엔드로 검증:
bun run spec:demo           # 데모 스펙 1개를 meta-repo inbox에 기록
```

## Roadmap
- A-1: 멀티턴 요구사항 수집(planning → design → constraints)
- A-2: 전체 zod 검증 + 제출 전 확인 단계
- A-3: `/status`, allowlist 하드닝
- A-4: 자유 텍스트 대화를 스펙으로 구조화하는 Claude API

## 작성 언어
문서·로그 작성 규칙은 @.claude/rules/language.md 를 따른다.

## 커밋 규칙
커밋 컨벤션은 @.claude/rules/commits.md 를 따른다.
