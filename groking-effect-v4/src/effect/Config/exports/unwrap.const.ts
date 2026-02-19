/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: unwrap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.162Z
 *
 * Overview:
 * Constructs a `Config<T>` from a value matching `Wrap<T>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config } from "effect"
 * 
 * interface Options {
 *   key: string
 * }
 * 
 * const makeConfig = (config: Config.Wrap<Options>): Config.Config<Options> =>
 *   Config.unwrap(config)
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigModule from "effect/Config";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "unwrap";
const exportKind = "const";
const moduleImportPath = "effect/Config";
const sourceSummary = "Constructs a `Config<T>` from a value matching `Wrap<T>`.";
const sourceExample = "import { Config } from \"effect\"\n\ninterface Options {\n  key: string\n}\n\nconst makeConfig = (config: Config.Wrap<Options>): Config.Config<Options> =>\n  Config.unwrap(config)";
const moduleRecord = ConfigModule as Record<string, unknown>;

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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
