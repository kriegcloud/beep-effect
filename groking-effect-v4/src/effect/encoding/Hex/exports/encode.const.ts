/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/encoding/Hex
 * Export: encode
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/encoding/Hex.ts
 * Generated: 2026-02-19T04:50:36.012Z
 *
 * Overview:
 * Encodes the given value into a hex `string`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hex } from "effect/encoding"
 *
 * // Encode a string to hex
 * console.log(Hex.encode("hello")) // "68656c6c6f"
 *
 * // Encode binary data to hex
 * const bytes = new Uint8Array([72, 101, 108, 108, 111])
 * console.log(Hex.encode(bytes)) // "48656c6c6f"
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
import * as HexModule from "effect/Encoding";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "encode";
const exportKind = "const";
const moduleImportPath = "effect/Encoding";
const sourceSummary = "Encodes the given value into a hex `string`.";
const sourceExample =
  'import { Hex } from "effect/encoding"\n\n// Encode a string to hex\nconsole.log(Hex.encode("hello")) // "68656c6c6f"\n\n// Encode binary data to hex\nconst bytes = new Uint8Array([72, 101, 108, 108, 111])\nconsole.log(Hex.encode(bytes)) // "48656c6c6f"';
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
