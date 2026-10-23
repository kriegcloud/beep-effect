// @effect-diagnostics nodeBuiltinImport:skip-file -- nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. Owner: @beep/cli-kit. Exit: effected-promotion graduates the module and ports this test to @effect/vitest layer() and Effect platform services.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Str from "effect/String";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../src");

/** Every relative import specifier in a module, resolved to a source path. */
const importsOf = (file: string): ReadonlyArray<string> => {
  const source = readFileSync(file, "utf8");
  const specifiers = A.map([...Str.matchAll(/from\s+"(\.[^"]+)"/g)(source)], (match) => match[1] ?? "");
  return A.map(specifiers, (specifier) => resolve(dirname(file), Str.replace(/\.js$/, ".ts")(specifier)));
};

/** Every module reachable from an entrypoint, transitively. */
const reachableFrom = (entry: string): ReadonlySet<string> => {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (file === undefined || seen.has(file)) continue;
    seen.add(file);
    for (const next of importsOf(file)) queue.push(next);
  }
  return seen;
};

describe("entrypoint boundary", () => {
  it("nothing reachable from `.` imports CliTest", () => {
    const reachable = reachableFrom(resolve(SRC, "index.ts"));
    const offenders = A.filter([...reachable], (file) =>
      /cli-kit\/src\/(CliTest|testing|TestTerminal)\.ts$/.test(file)
    );
    assert.deepStrictEqual(offenders, [], "test utilities belong behind ./testing");
  });

  it("positive control: ./testing DOES reach CliTest", () => {
    const reachable = reachableFrom(resolve(SRC, "testing.ts"));
    assert.isAbove(reachable.size, 1, "the walker must actually resolve imports");
    assert.isTrue(A.some([...reachable], (file) => /cli-kit\/src\/CliTest\.ts$/.test(file)));
  });

  it("the walker resolves the main entry's modules, or it proves nothing", () => {
    const reachable = reachableFrom(resolve(SRC, "index.ts"));
    assert.isTrue(A.some([...reachable], (file) => /cli-kit\/src\/CliRuntime\.ts$/.test(file)));
  });

  it.effect("the main entry exports the whole presentation layer, and only testing exports the test doubles", () =>
    Effect.gen(function* () {
      const main = yield* Effect.promise(() => import("@beep/cli-kit"));
      const testing = yield* Effect.promise(() => import("@beep/cli-kit/testing"));
      assert.deepStrictEqual(A.sort(R.keys(main), Str.Order), [
        "Cancelled",
        "CliAudience",
        "CliColor",
        "CliDoc",
        "CliEnv",
        "CliExit",
        "CliFailure",
        "CliInteractive",
        "CliLinks",
        "CliLog",
        "CliLogger",
        "CliMessage",
        "CliPrompt",
        "CliRuntime",
        "CliTheme",
        "ConfigIssueRenderer",
        "Doc",
        "Fmt",
        "GithubAnnotation",
        "Glyphs",
        "NotInteractive",
        "Render",
        "SchemaIssueRenderer",
        "Status",
        "Token",
      ]);
      assert.deepStrictEqual(A.sort(R.keys(testing), Str.Order), ["CliTest", "TestTerminal"]);
    })
  );
});
