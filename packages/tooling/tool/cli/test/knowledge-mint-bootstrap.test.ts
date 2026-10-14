import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";

const bootstrapUrl = new URL("../scripts/CreateKnowledgeMintApp.ts", import.meta.url).href;
const PLACEHOLDER = "placeholder-only".repeat(4096);

// A fake `op` that accepts only a real pipe carrying the complete template.
// No real key, conversion, or vault mutation is involved.
const fakeOp = (exitCode: number) => `#!/usr/bin/env bun
import { fstatSync } from "node:fs";
if (!fstatSync(0).isFIFO()) process.exit(80);
const input = JSON.parse(await new Response(Bun.stdin.stream()).text());
if (input.category !== "API_CREDENTIAL" || input.title !== "beep-knowledge-mint GitHub App") process.exit(81);
const field = (id) => input.fields.find((entry) => entry.id === id);
if (input.fields.length !== 5) process.exit(82);
if (field("private_key")?.type !== "CONCEALED" || field("private_key")?.value !== "${PLACEHOLDER}") process.exit(83);
if (field("slug")?.value !== "beep-knowledge-mint-2" || field("client_id")?.value !== "fixture-client") process.exit(84);
if (field("app_id")?.value !== "123" || field("installation_id")?.value !== "") process.exit(85);
if (process.argv.slice(2).join(" ") !== "item create --vault BEEP_SECRETS -") process.exit(86);
process.exit(${exitCode});
`;

const harness = (conversionStatus: number, expectedStatus: number, expectedText: string) => `
globalThis.fetch = async () => new Response(JSON.stringify({
  id: 123, slug: "beep-knowledge-mint-2", client_id: "fixture-client", pem: "${PLACEHOLDER}"
}), { status: ${conversionStatus}, headers: { "content-type": "application/json" } });
const { makeKnowledgeMintHandler } = await import(${JSON.stringify(bootstrapUrl)});
const handle = makeKnowledgeMintHandler("fixture-state", JSON.stringify({ name: "beep-knowledge-mint" }));
const get = (url) => handle(new Request(url));
if ((await get("http://evil.example:8787/")).status !== 400) process.exit(90);
const form = await (await get("http://localhost:8787/")).text();
if (!form.includes("organizations/beep-effect/settings/apps/new?state=fixture-state")) process.exit(91);
if ((await get("http://localhost:8787/callback?code=fixture-code&state=wrong")).status !== 400) process.exit(92);
const callback = await get("http://127.0.0.1:8787/callback?code=fixture-code&state=fixture-state");
const text = await callback.text();
if (callback.status !== ${expectedStatus}) process.exit(93);
if (!text.includes(${JSON.stringify(expectedText)})) process.exit(94);
if (text.includes("placeholder-only") || text.includes("fixture-client")) process.exit(95);
if ((await get("http://localhost:8787/callback?code=fixture-code&state=fixture-state")).status !== 400) process.exit(96);
process.exit(0);
`;

const run = (opExit: number, conversionStatus: number, expectedStatus: number, expectedText: string) => {
  const directory = mkdtempSync(join(tmpdir(), "knowledge-mint-bootstrap-test-"));
  try {
    writeFileSync(join(directory, "op"), fakeOp(opExit), { mode: 0o700 });
    return spawnSync("bun", ["--eval", harness(conversionStatus, expectedStatus, expectedText)], {
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}` },
      encoding: "utf8",
      timeout: 15_000,
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

const expectNoSecret = (child: ReturnType<typeof spawnSync>) => {
  expect(child.error).toBeUndefined();
  expect(child.status).toBe(0);
  expect(`${child.stdout}${child.stderr}`).not.toContain("placeholder-only");
};

describe("knowledge mint manifest bootstrap", () => {
  it.effect("stores the full template through a real pipe and reports only the slug", () =>
    Effect.sync(() => {
      const child = run(0, 201, 200, "Stored in 1Password");
      expectNoSecret(child);
      expect(child.stdout).toContain("App beep-knowledge-mint-2 (app_id 123)");
    })
  );

  it.effect("reports a failed vault write by exit code and forbids a reload", () =>
    Effect.sync(() => {
      const child = run(17, 201, 500, "Do not reload this page");
      expectNoSecret(child);
      expect(child.stderr).toContain("1Password item creation exited 17");
    })
  );

  it.effect("stores nothing when the manifest conversion is refused", () =>
    Effect.sync(() => {
      const child = run(99, 422, 500, "returned HTTP 422");
      expectNoSecret(child);
      expect(child.stderr).toContain("Manifest conversion returned HTTP 422; nothing was stored.");
    })
  );
});
