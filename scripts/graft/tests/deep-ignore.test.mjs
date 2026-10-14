// fallow-ignore-file unused-file -- Standalone Node regression for the repository's Graft dist patch; run with `node --test scripts/graft/tests/deep-ignore.test.mjs`.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";

const patch = readFileSync(new URL("../patches/0.21.1/util-deep-ignore.patch", import.meta.url), "utf8");
const source = patch
  .split("\n")
  .slice(3)
  .filter((line) => line.startsWith("+"))
  .map((line) => line.slice(1))
  .join("\n");
const directory = mkdtempSync(join(tmpdir(), "beep-graft-ignore-test-"));
writeFileSync(join(directory, "package.json"), '{"type":"module"}\n');
writeFileSync(join(directory, "id.js"), 'export const contentHash = () => "fixture";\n');
writeFileSync(join(directory, "deep-ignore.js"), source);

try {
  const { compileDeepIgnore } = await import(pathToFileURL(join(directory, "deep-ignore.js")).href);

  test("glob subset preserves anchored and nested path behavior", () => {
    const ignored = compileDeepIgnore("/vendor/\n*.ts\nsrc/**/secret?.json\n");
    assert.equal(ignored("vendor"), true);
    assert.equal(ignored("vendor/child.js"), true);
    assert.equal(ignored("vendored.js"), false);
    assert.equal(ignored("nested/file.ts"), true);
    assert.equal(ignored("nested/barfile.tsx"), false);
    assert.equal(ignored("src/secret1.json"), true);
    assert.equal(ignored("src/a/b/secret1.json"), true);
    assert.equal(ignored("src/secret12.json"), false);
  });

  test("overlapping wildcard and literal rules finish within a bounded time", () => {
    const ignored = compileDeepIgnore(`/${"*a".repeat(24)}b.ts`);
    const start = performance.now();
    assert.equal(ignored(`${"a".repeat(48)}.ts`), false);
    assert.ok(performance.now() - start < 2_000);
  });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
