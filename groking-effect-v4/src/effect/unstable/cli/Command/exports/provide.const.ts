/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: provide
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:14:24.445Z
 *
 * Overview:
 * Provides the handler of a command with the services produced by a layer that optionally depends on the command-line input to be created.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FileSystem, PlatformError } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const deploy = Command.make("deploy", {
 *   env: Flag.string("env")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     const fs = yield* FileSystem.FileSystem
 *     // Use fs...
 *   })).pipe(
 *     // Provide FileSystem based on the --env flag
 *     Command.provide((config) =>
 *       config.env === "local"
 *         ? FileSystem.layerNoop({})
 *         : FileSystem.layerNoop({
 *           access: () =>
 *             Effect.fail(
 *               PlatformError.badArgument({
 *                 module: "FileSystem",
 *                 method: "access"
 *               })
 *             )
 *         })
 *     )
 *   )
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
import * as CommandModule from "effect/unstable/cli/Command";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "provide";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary =
  "Provides the handler of a command with the services produced by a layer that optionally depends on the command-line input to be created.";
const sourceExample =
  'import { Effect, FileSystem, PlatformError } from "effect"\nimport { Command, Flag } from "effect/unstable/cli"\n\nconst deploy = Command.make("deploy", {\n  env: Flag.string("env")\n}, (config) =>\n  Effect.gen(function*() {\n    const fs = yield* FileSystem.FileSystem\n    // Use fs...\n  })).pipe(\n    // Provide FileSystem based on the --env flag\n    Command.provide((config) =>\n      config.env === "local"\n        ? FileSystem.layerNoop({})\n        : FileSystem.layerNoop({\n          access: () =>\n            Effect.fail(\n              PlatformError.badArgument({\n                module: "FileSystem",\n                method: "access"\n              })\n            )\n        })\n    )\n  )';
const moduleRecord = CommandModule as Record<string, unknown>;

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
