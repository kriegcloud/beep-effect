/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: redacted
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:14:24.523Z
 *
 * Overview:
 * Creates a primitive that wraps string input in a redacted type for secure handling.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Redacted } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseRedacted = Effect.gen(function*() {
 *   const result = yield* Primitive.redacted.parse("secret-password")
 *   console.log(Redacted.value(result)) // "secret-password"
 *   console.log(String(result)) // "<redacted>"
 * })
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
import * as PrimitiveModule from "effect/unstable/cli/Primitive";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "redacted";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Creates a primitive that wraps string input in a redacted type for secure handling.";
const sourceExample =
  'import { Effect, Redacted } from "effect"\nimport { Primitive } from "effect/unstable/cli"\n\nconst parseRedacted = Effect.gen(function*() {\n  const result = yield* Primitive.redacted.parse("secret-password")\n  console.log(Redacted.value(result)) // "secret-password"\n  console.log(String(result)) // "<redacted>"\n})';
const moduleRecord = PrimitiveModule as Record<string, unknown>;

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
