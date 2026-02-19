/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: redacted
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:50:46.274Z
 *
 * Overview:
 * Creates a redacted flag that securely handles sensitive string input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Redacted } from "effect"
 * import { Flag } from "effect/unstable/cli"
 *
 * const passwordFlag = Flag.redacted("password")
 *
 * const program = Effect.gen(function*() {
 *   const [leftover, password] = yield* passwordFlag.parse({
 *     arguments: [],
 *     flags: { "password": ["abc123"] }
 *   })
 *   const value = Redacted.value(password) // Access the underlying value
 *   console.log("Password length:", value.length)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "redacted";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Creates a redacted flag that securely handles sensitive string input.";
const sourceExample =
  'import { Effect, Redacted } from "effect"\nimport { Flag } from "effect/unstable/cli"\n\nconst passwordFlag = Flag.redacted("password")\n\nconst program = Effect.gen(function*() {\n  const [leftover, password] = yield* passwordFlag.parse({\n    arguments: [],\n    flags: { "password": ["abc123"] }\n  })\n  const value = Redacted.value(password) // Access the underlying value\n  console.log("Password length:", value.length)\n})';
const moduleRecord = FlagModule as Record<string, unknown>;

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
