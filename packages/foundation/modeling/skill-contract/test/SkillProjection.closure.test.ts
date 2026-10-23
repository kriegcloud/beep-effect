import { it } from "@beep/test-runner";
import { describe } from "@effect/vitest";
import { assertTrue, deepStrictEqual } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Str from "effect/String";

// Every source module of this package, inlined as raw text by Vite at
// transform time, so the scan needs no filesystem.
const sources = import.meta.glob<string>("../src/**/*.ts", { query: "?raw", import: "default", eager: true });

const MARKDOWN_SPECIFIER = /["'](@beep\/markdown(?:\/[^"']*)?)["']/g;

const markdownSpecifiers = (source: string): ReadonlyArray<string> =>
  A.flatMap(A.fromIterable(Str.matchAll(MARKDOWN_SPECIFIER)(source)), (match) =>
    match[1] === undefined ? [] : [match[1]]
  );

describe("@beep/skill-contract SkillProjection import closure", () => {
  it.effect("enters @beep/markdown only through the string-level FrontmatterSource leaf", () =>
    Effect.sync(() => {
      const specifiers = A.dedupe(A.flatMap(R.values(sources), markdownSpecifiers));
      // The scan really read the package: SkillProjection.ts is among the sources.
      assertTrue(A.some(R.keys(sources), Str.endsWith("/SkillProjection.ts")));
      // FrontmatterSource's own closure is pinned in @beep/markdown
      // (test/index.coverage.test.ts): it reaches the raw fence scanner and
      // never the block parser, the inline parser or the root barrel. Holding
      // every edge into the package to that one leaf keeps the parsers out of
      // this package's closure.
      deepStrictEqual(specifiers, ["@beep/markdown/FrontmatterSource"]);
    })
  );
});
