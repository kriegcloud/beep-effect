// @effect-diagnostics nodeBuiltinImport:skip-file
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Str from "effect/String";
import captures from "./fixtures/digests.json" with { type: "json" };
import { fixture, fixturePath } from "./fixtures.ts";

describe("historical lockfile documents", () => {
  it("preserves every captured document verbatim behind a non-installable filename", () => {
    assert.strictEqual(captures.length, 38);
    for (const { logicalPath, sha256 } of captures) {
      assert.isTrue(existsSync(fixturePath(logicalPath)), logicalPath);
      assert.isFalse(existsSync(join(import.meta.dirname, "fixtures", logicalPath)), logicalPath);
      const original = readFileSync(fixturePath(logicalPath));
      assert.strictEqual(createHash("sha256").update(original).digest("hex"), sha256, logicalPath);
      assert.strictEqual(fixture(logicalPath), original.toString("utf8"), logicalPath);
    }
  });

  it("enumerates the stored corpus so a new capture cannot escape the byte-preservation guard", () => {
    const stored = A.filter(
      readdirSync(join(import.meta.dirname, "fixtures"), { recursive: true, encoding: "utf8" }),
      Str.endsWith(".fixture"),
    );
    assert.deepEqual(
      A.sort(A.map(captures, ({ logicalPath }) => `${logicalPath}.fixture`), Str.Order),
      A.sort(A.map(stored, Str.replace(/\\/g, "/")), Str.Order),
    );
  });
});
