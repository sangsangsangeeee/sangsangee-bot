import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderMarkdown } from "./builder.ts";
import type { ProjectSpec } from "./schema.ts";
import type { Config } from "../config.ts";

export interface WriteResult {
  dir: string;
  committed: boolean;
}

/**
 * Write a spec into `${specsDir}/inbox/<slug>/` as spec.json + spec.md.
 * Optionally git-commits it inside the meta-repo.
 */
export async function writeSpec(spec: ProjectSpec, config: Config): Promise<WriteResult> {
  const dir = join(config.specsDir, "inbox", spec.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "spec.json"), JSON.stringify(spec, null, 2) + "\n");
  await writeFile(join(dir, "spec.md"), renderMarkdown(spec));

  let committed = false;
  if (config.gitCommit) {
    committed = await commit(config.specsDir, spec.slug);
  }
  return { dir, committed };
}

async function commit(specsDir: string, slug: string): Promise<boolean> {
  const rel = join("inbox", slug);
  const add = Bun.spawn(["git", "add", rel], { cwd: specsDir, stdout: "ignore", stderr: "ignore" });
  if ((await add.exited) !== 0) return false;
  const msg = `spec(inbox): add ${slug}`;
  const ci = Bun.spawn(["git", "commit", "-m", msg], { cwd: specsDir, stdout: "ignore", stderr: "ignore" });
  return (await ci.exited) === 0;
}
