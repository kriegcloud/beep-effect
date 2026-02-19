/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: make
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.161Z
 *
 * Overview:
 * Creates a `Config` from a raw parsing function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 * 
 * const hostPort = Config.make((provider) =>
 *   Effect.all({
 *     host: Config.string("host").parse(provider),
 *     port: Config.number("port").parse(provider)
 *   })
 * )
 * 
 * const provider = ConfigProvider.fromUnknown({ host: "localhost", port: 3000 })
 * // Effect.runSync(hostPort.parse(provider))
 * // { host: "localhost", port: 3000 }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
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
const exportName = "make";
const exportKind = "function";
const moduleImportPath = "effect/Config";
const sourceSummary = "Creates a `Config` from a raw parsing function.";
const sourceExample = "import { Config, ConfigProvider, Effect } from \"effect\"\n\nconst hostPort = Config.make((provider) =>\n  Effect.all({\n    host: Config.string(\"host\").parse(provider),\n    port: Config.number(\"port\").parse(provider)\n  })\n)\n\nconst provider = ConfigProvider.fromUnknown({ host: \"localhost\", port: 3000 })\n// Effect.runSync(hostPort.parse(provider))\n// { host: \"localhost\", port: 3000 }";
const moduleRecord = ConfigModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
