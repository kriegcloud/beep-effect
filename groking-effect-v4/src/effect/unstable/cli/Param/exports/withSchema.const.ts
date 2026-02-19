/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: withSchema
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:50:46.350Z
 *
 * Overview:
 * Validates parsed values against a Schema, providing detailed error messages.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import * as Param from "effect/unstable/cli/Param"
 * // @internal - this module is not exported publicly
 *
 * const isEmail = Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
 *
 * const Email = Schema.String.pipe(
 *   Schema.check(isEmail)
 * )
 *
 * const email = Param.string(Param.flagKind, "email").pipe(
 *   Param.withSchema(Email)
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
import * as ParamModule from "effect/unstable/cli/Param";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withSchema";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Validates parsed values against a Schema, providing detailed error messages.";
const sourceExample =
  'import { Schema } from "effect"\nimport * as Param from "effect/unstable/cli/Param"\n// @internal - this module is not exported publicly\n\nconst isEmail = Schema.isPattern(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/)\n\nconst Email = Schema.String.pipe(\n  Schema.check(isEmail)\n)\n\nconst email = Param.string(Param.flagKind, "email").pipe(\n  Param.withSchema(Email)\n)';
const moduleRecord = ParamModule as Record<string, unknown>;

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
