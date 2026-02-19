/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: join
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Joins string elements with a separator.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.join(["a", "b", "c"], "-")) // "a-b-c"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "join";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Joins string elements with a separator.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.join(["a", "b", "c"], "-")) // "a-b-c"';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape for Array.join.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const words = ["a", "b", "c"];
  const result = A.join(words, "-");

  yield* Console.log(`Array.join(["a", "b", "c"], "-") => ${result}`);
  yield* Console.log(`input unchanged => ${JSON.stringify(words)}`);
});

const exampleCurriedAndBoundaryInvocation = Effect.gen(function* () {
  const pathLike = A.join("/")(new Set(["usr", "local", "bin"]));
  const single = A.join(["solo"], ",");
  const empty = A.join([], ",");

  yield* Console.log(`Array.join("/")(Set("usr","local","bin")) => ${pathLike}`);
  yield* Console.log(`Array.join(["solo"], ",") => ${single}`);
  yield* Console.log(`Array.join([], ",") => "${empty}"`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Run the documented call form with string elements and a separator.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable + Boundary Cases",
      description: "Use data-last style on an iterable and compare single/empty arrays.",
      run: exampleCurriedAndBoundaryInvocation,
    },
  ],
});

BunRuntime.runMain(program);
