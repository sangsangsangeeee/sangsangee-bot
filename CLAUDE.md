# telegram-bot

텔레그램으로 받은 메시지를 Claude(사용자의 구독)에 보내고 답변을 돌려주는
Bun + grammY 채팅봇. 기능은 하나씩 붙여 나간다.

## Layout
- `src/index.ts` — grammY 엔트리 + allowlist 미들웨어 + 텍스트 핸들러(커맨드 없음).
- `src/config.ts` — 환경변수(BOT_TOKEN, ALLOWLIST, CLAUDE_CODE_OAUTH_TOKEN, AI_MODEL).
- `src/llm/chat.ts` — Claude Agent SDK 호출(메시지 → 답변 텍스트). 텍스트 전용, 도구 미부여.

## Auth
Claude 호출은 사용자 구독의 OAuth 토큰(`CLAUDE_CODE_OAUTH_TOKEN`)에 의존한다(API key 아님).
`claude setup-token`으로 발급한다. `ANTHROPIC_API_KEY`는 설정하지 않는다 — 우선순위가 높아 API로 과금된다.

## Run
```bash
bun install
cp .env.example .env        # BOT_TOKEN, CLAUDE_CODE_OAUTH_TOKEN 설정
bun run dev                 # 롱폴링 봇(watch)
bun run start               # 롱폴링 봇
```

## Roadmap
- 기능은 하나씩 추가한다. 현재는 봇 내부 구조·룰을 정리하는 단계.
- (예정 기능은 정해지는 대로 여기에 채운다.)

## 작성 언어
문서·로그 작성 규칙은 @.claude/rules/language.md 를 따른다.

## 커밋 규칙
커밋 컨벤션은 @.claude/rules/commits.md 를 따른다.
