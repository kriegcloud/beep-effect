/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/encoding/Base64Url
 * Export: decode
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/encoding/Base64Url.ts
 * Generated: 2026-02-19T04:50:35.999Z
 *
 * Overview:
 * Decodes a base64 (URL) encoded `string` into a `Uint8Array`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 * import { Base64Url } from "effect/encoding"
 *
 * const result = Base64Url.decode("SGVsbG8_")
 * if (Result.isSuccess(result)) {
 *   console.log(Array.from(result.success)) // [72, 101, 108, 108, 111, 63]
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
import * as Base64UrlModule from "effect/Encoding";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "decode";
const exportKind = "const";
const moduleImportPath = "effect/Encoding";
const sourceSummary = "Decodes a base64 (URL) encoded `string` into a `Uint8Array`.";
const sourceExample =
  'import { Result } from "effect"\nimport { Base64Url } from "effect/encoding"\n\nconst result = Base64Url.decode("SGVsbG8_")\nif (Result.isSuccess(result)) {\n  console.log(Array.from(result.success)) // [72, 101, 108, 108, 111, 63]\n}';
const moduleRecord = Base64UrlModule as Record<string, unknown>;

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
