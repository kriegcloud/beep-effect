/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: optional
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:50:46.274Z
 *
 * Overview:
 * Makes a flag optional, returning an Option type that can be None if not provided.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option } from "effect"
 * import { Flag } from "effect/unstable/cli"
 *
 * const optionalPort = Flag.optional(Flag.integer("port"))
 *
 * const program = Effect.gen(function*() {
 *   const [leftover, port] = yield* optionalPort.parse({
 *     arguments: [],
 *     flags: { "port": ["4000"] }
 *   })
 *   if (Option.isSome(port)) {
 *     console.log("Port specified:", port.value)
 *   } else {
 *     console.log("No port specified, using default")
 *   }
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
const exportName = "optional";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Makes a flag optional, returning an Option type that can be None if not provided.";
const sourceExample =
  'import { Effect, Option } from "effect"\nimport { Flag } from "effect/unstable/cli"\n\nconst optionalPort = Flag.optional(Flag.integer("port"))\n\nconst program = Effect.gen(function*() {\n  const [leftover, port] = yield* optionalPort.parse({\n    arguments: [],\n    flags: { "port": ["4000"] }\n  })\n  if (Option.isSome(port)) {\n    console.log("Port specified:", port.value)\n  } else {\n    console.log("No port specified, using default")\n  }\n})';
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
