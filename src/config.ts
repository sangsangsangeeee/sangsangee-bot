import { resolve } from "node:path";

export interface Config {
  botToken: string;
  specsDir: string;
  allowlist: number[];
  gitCommit: boolean;
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
    specsDir: resolve(process.env.SPECS_DIR ?? "../meta-repo/specs"),
    allowlist,
    gitCommit: (process.env.GIT_COMMIT ?? "false").toLowerCase() === "true",
  };
}
