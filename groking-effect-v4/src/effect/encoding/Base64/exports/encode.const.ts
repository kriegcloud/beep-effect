/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/encoding/Base64
 * Export: encode
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/encoding/Base64.ts
 * Generated: 2026-02-19T04:50:35.994Z
 *
 * Overview:
 * Encodes the given value into a base64 (RFC4648) `string`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Base64 } from "effect/encoding"
 *
 * // Encode a string
 * console.log(Base64.encode("hello")) // "aGVsbG8="
 *
 * // Encode binary data
 * const bytes = new Uint8Array([72, 101, 108, 108, 111])
 * console.log(Base64.encode(bytes)) // "SGVsbG8="
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
const exportName = "encode";
const exportKind = "const";
const moduleImportPath = "effect/Encoding";
const sourceSummary = "Encodes the given value into a base64 (RFC4648) `string`.";
const sourceExample =
  'import { Base64 } from "effect/encoding"\n\n// Encode a string\nconsole.log(Base64.encode("hello")) // "aGVsbG8="\n\n// Encode binary data\nconst bytes = new Uint8Array([72, 101, 108, 108, 111])\nconsole.log(Base64.encode(bytes)) // "SGVsbG8="';
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
