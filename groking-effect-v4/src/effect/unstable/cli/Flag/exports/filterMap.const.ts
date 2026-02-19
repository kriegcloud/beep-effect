/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: filterMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:50:46.273Z
 *
 * Overview:
 * Transforms and filters a flag value, failing with a custom error if the transformation returns None.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * import { Flag } from "effect/unstable/cli"
 *
 * // Parse positive integers only
 * const positiveInt = Flag.integer("count").pipe(
 *   Flag.filterMap(
 *     (n) => n > 0 ? Option.some(n) : Option.none(),
 *     (n) => `Expected positive integer, got ${n}`
 *   )
 * )
 *
 * // Parse valid email addresses
 * const emailFlag = Flag.string("email").pipe(
 *   Flag.filterMap(
 *     (email) => email.includes("@") ? Option.some(email) : Option.none(),
 *     (email) => `Invalid email address: ${email}`
 *   )
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filterMap";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary =
  "Transforms and filters a flag value, failing with a custom error if the transformation returns None.";
const sourceExample =
  'import { Option } from "effect"\nimport { Flag } from "effect/unstable/cli"\n\n// Parse positive integers only\nconst positiveInt = Flag.integer("count").pipe(\n  Flag.filterMap(\n    (n) => n > 0 ? Option.some(n) : Option.none(),\n    (n) => `Expected positive integer, got ${n}`\n  )\n)\n\n// Parse valid email addresses\nconst emailFlag = Flag.string("email").pipe(\n  Flag.filterMap(\n    (email) => email.includes("@") ? Option.some(email) : Option.none(),\n    (email) => `Invalid email address: ${email}`\n  )\n)';
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
