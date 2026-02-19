/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/encoding/Hex
 * Export: decodeString
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/encoding/Hex.ts
 * Generated: 2026-02-19T04:50:36.012Z
 *
 * Overview:
 * Decodes a hex encoded `string` into a UTF-8 `string`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 * import { Hex } from "effect/encoding"
 *
 * const result = Hex.decodeString("68656c6c6f")
 * if (Result.isSuccess(result)) {
 *   console.log(result.success) // "hello"
 * }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as HexModule from "effect/encoding/Hex";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "decodeString";
const exportKind = "const";
const moduleImportPath = "effect/encoding/Hex";
const sourceSummary = "Decodes a hex encoded `string` into a UTF-8 `string`.";
const sourceExample =
  'import { Result } from "effect"\nimport { Hex } from "effect/encoding"\n\nconst result = Hex.decodeString("68656c6c6f")\nif (Result.isSuccess(result)) {\n  console.log(result.success) // "hello"\n}';
const moduleRecord = HexModule as Record<string, unknown>;

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
