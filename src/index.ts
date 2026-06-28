#!/usr/bin/env bun
import { Bot } from "grammy";
import { loadConfig } from "./config.ts";
import { chat } from "./llm/chat.ts";
import type { Context } from "grammy";

const config = loadConfig();

if (!config.botToken) {
  console.error("BOT_TOKEN이 비어 있습니다. .env.example을 .env로 복사해 설정하세요.");
  process.exit(1);
}

const bot = new Bot(config.botToken);

// --- 미들웨어: allowlist ---------------------------------------------------
bot.use(async (ctx, next) => {
  if (config.allowlist.length === 0) return next(); // 개발: 전원 통과
  const id = ctx.from?.id;
  if (id && config.allowlist.includes(id)) return next();
  await ctx.reply("죄송해요, 허용된 사용자가 아니에요.");
});

/** 사용자 텍스트를 Claude에 보내고 답변을 돌려준다. */
async function handleMessage(ctx: Context, text: string) {
  if (!text.trim()) return ctx.reply("메시지를 입력해 주세요.");
  if (!config.aiEnabled) {
    return ctx.reply("AI가 꺼져 있어요. CLAUDE_CODE_OAUTH_TOKEN을 설정해 주세요.");
  }
  const note = await ctx.reply("🧠 생각하는 중…");
  try {
    const reply = await chat({ message: text, model: config.aiModel });
    await ctx.api.editMessageText(note.chat.id, note.message_id, reply);
    console.log(`Claude 응답 완료 (${reply.length}자)`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await ctx.api.editMessageText(note.chat.id, note.message_id, `⚠️ 답변을 만들지 못했어요: ${msg}`);
    console.error("chat 실패:", e);
  }
}

// 모든 텍스트 메시지를 Claude에게 보낸다. (커맨드는 아직 없음 — /로 시작하면 무시)
bot.on("message:text", (ctx) => {
  if (ctx.message.text.startsWith("/")) return;
  return handleMessage(ctx, ctx.message.text);
});

bot.catch((err) => console.error("봇 에러:", err));

console.log("봇 시작 중 (롱폴링)…");
bot.start();
