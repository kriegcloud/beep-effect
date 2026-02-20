/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/encoding/Base64
 * Export: decode
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/encoding/Base64.ts
 * Generated: 2026-02-19T04:50:35.993Z
 *
 * Overview:
 * Decodes a base64 (RFC4648) encoded `string` into a `Uint8Array`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 * import { Base64 } from "effect/encoding"
 *
 * const result = Base64.decode("SGVsbG8=")
 * if (Result.isSuccess(result)) {
 *   console.log(Array.from(result.success)) // [72, 101, 108, 108, 111]
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
import * as Base64Module from "effect/Encoding";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "decode";
const exportKind = "const";
const moduleImportPath = "effect/Encoding";
const sourceSummary = "Decodes a base64 (RFC4648) encoded `string` into a `Uint8Array`.";
const sourceExample =
  'import { Result } from "effect"\nimport { Base64 } from "effect/encoding"\n\nconst result = Base64.decode("SGVsbG8=")\nif (Result.isSuccess(result)) {\n  console.log(Array.from(result.success)) // [72, 101, 108, 108, 111]\n}';
const moduleRecord = Base64Module as Record<string, unknown>;

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
