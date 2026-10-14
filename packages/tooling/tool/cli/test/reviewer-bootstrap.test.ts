import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";

const bootstrapUrl = new URL("../scripts/CreateReviewerApp.ts", import.meta.url).href;

describe("reviewer manifest bootstrap", () => {
  for (const writeExit of [0, 17]) {
    it.effect(`passes the complete template through a real pipe and handles write exit ${writeExit}`, () =>
      Effect.sync(() => {
        const directory = mkdtempSync(join(tmpdir(), "reviewer-bootstrap-test-"));
        try {
          // A large public placeholder catches both missing input and incomplete flushing.
          // No real key, credentials, conversion, or vault mutation is involved.
          writeFileSync(
            join(directory, "op"),
            `#!/usr/bin/env bun
import { fstatSync } from "node:fs";
if (!fstatSync(0).isFIFO()) process.exit(80);
const input = JSON.parse(await new Response(Bun.stdin.stream()).text());
if (input.category !== "API_CREDENTIAL" || input.title !== "beep-reviewer GitHub App") process.exit(81);
if (input.fields.length !== 4) process.exit(82);
if (input.fields.find(field => field.id === "private_key")?.value !== "placeholder-only".repeat(4096)) process.exit(83);
if (process.argv.slice(2).join(" ") !== "item create --vault BEEP_SECRETS -") process.exit(84);
process.exit(${writeExit});
`,
            { mode: 0o700 }
          );
          writeFileSync(join(directory, "op-doctor"), "#!/bin/sh\nexit 0\n", { mode: 0o700 });
          const harness = `
globalThis.fetch = async () => new Response(JSON.stringify({
  id: 123, client_id: "fixture-client", pem: "placeholder-only".repeat(4096)
}), { status: 201, headers: { "content-type": "application/json" } });
Bun.serve = options => {
  queueMicrotask(async () => {
    try {
      const page = await options.fetch(new Request("http://localhost:8787/"));
      const state = (await page.text()).match(/state=([^"&]+)/)?.[1];
      if (!state) process.exit(85);
      const callback = await options.fetch(new Request("http://localhost:8787/callback?code=fixture-code&state=" + state));
      const text = await callback.text();
      if (callback.status !== ${writeExit === 0 ? 200 : 500}) process.exit(86);
      if (text.includes("placeholder-only") || text.includes("fixture-client")) process.exit(87);
      const replay = await options.fetch(new Request("http://localhost:8787/callback?code=fixture-code&state=" + state));
      if (replay.status !== 400) process.exit(88);
      process.exit(0);
    } catch { process.exit(89); }
  });
  return { port: 8787 };
};
await import(${JSON.stringify(bootstrapUrl)});
`;
          const child = spawnSync("bun", ["--eval", harness], {
            env: { ...process.env, PATH: `${directory}:${process.env.PATH}` },
            encoding: "utf8",
            timeout: 15_000,
          });
          expect(child.error).toBeUndefined();
          expect(child.status).toBe(0);
          expect(child.stdout).not.toContain("placeholder-only");
          expect(child.stderr).not.toContain("placeholder-only");
          if (writeExit !== 0) expect(child.stderr).toContain("1Password item creation exited 17");
        } finally {
          rmSync(directory, { recursive: true, force: true });
        }
      })
    );
  }
});
