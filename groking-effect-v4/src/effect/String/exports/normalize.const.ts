/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/String
 * Export: normalize
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/String.ts
 * Generated: 2026-02-19T04:14:21.472Z
 *
 * Overview:
 * Normalizes a string according to the specified Unicode normalization form.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * const str = "\u1E9B\u0323"
 * assert.deepStrictEqual(pipe(str, String.normalize()), "\u1E9B\u0323")
 * assert.deepStrictEqual(pipe(str, String.normalize("NFC")), "\u1E9B\u0323")
 * assert.deepStrictEqual(pipe(str, String.normalize("NFD")), "\u017F\u0323\u0307")
 * assert.deepStrictEqual(pipe(str, String.normalize("NFKC")), "\u1E69")
 * assert.deepStrictEqual(
 *   pipe(str, String.normalize("NFKD")),
 *   "\u0073\u0323\u0307"
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StringModule from "effect/String";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "normalize";
const exportKind = "const";
const moduleImportPath = "effect/String";
const sourceSummary = "Normalizes a string according to the specified Unicode normalization form.";
const sourceExample =
  'import { pipe, String } from "effect"\nimport * as assert from "node:assert"\n\nconst str = "\\u1E9B\\u0323"\nassert.deepStrictEqual(pipe(str, String.normalize()), "\\u1E9B\\u0323")\nassert.deepStrictEqual(pipe(str, String.normalize("NFC")), "\\u1E9B\\u0323")\nassert.deepStrictEqual(pipe(str, String.normalize("NFD")), "\\u017F\\u0323\\u0307")\nassert.deepStrictEqual(pipe(str, String.normalize("NFKC")), "\\u1E69")\nassert.deepStrictEqual(\n  pipe(str, String.normalize("NFKD")),\n  "\\u0073\\u0323\\u0307"\n)';
const moduleRecord = StringModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
