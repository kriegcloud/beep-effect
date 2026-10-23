// @effect-diagnostics nodeBuiltinImport:skip-file -- nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. Owner: @beep/cli-kit. Exit: effected-promotion graduates the module and ports this test to @effect/vitest layer() and Effect platform services.
// Every source file is erasable TypeScript: Node's strip-only mode runs it by removing the types alone. A parameter
// property, an enum or a runtime namespace needs code generated for it, and Node refuses the file.
import { readdirSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Str from "effect/String";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

const sources = (dir: string): ReadonlyArray<string> =>
  A.flatMap(readdirSync(dir, { withFileTypes: true }), (entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sources(path) : Str.endsWith(".ts")(entry.name) ? [path] : [];
  });

/** The files Node's strip-only mode refuses, with the reason it gives. */
const refused = (files: ReadonlyArray<{ readonly name: string; readonly text: string }>): ReadonlyArray<string> =>
  A.flatMap(files, ({ name, text }) => {
    try {
      stripTypeScriptTypes(text, { mode: "strip" });
      return [];
    } catch (error) {
      return [`${name}: ${error instanceof Error ? Str.split(error.message, "\n")[0] : String(error)}`];
    }
  });

describe("erasable TypeScript", () => {
  it("every file under src strips with no code generated", () => {
    const files = A.map(sources(SRC), (path) => ({ name: relative(SRC, path), text: readFileSync(path, "utf8") }));
    assert.isAbove(files.length, 50, "the walk found the sources");
    assert.deepStrictEqual(refused(files), []);
  });

  it("control: a parameter property, an enum and a runtime namespace are each refused", () => {
    const offences = A.map(
      ["class A { constructor(readonly x: number) {} }", "enum Colour { Red }", "namespace N { export const x = 1 }"],
      (text, index) => ({ name: `case ${index}`, text })
    );
    assert.strictEqual(refused(offences).length, 3);
    assert.deepStrictEqual(
      refused([{ name: "fine", text: "class A { readonly x: number; constructor(x: number) { this.x = x } }" }]),
      []
    );
  });
});
