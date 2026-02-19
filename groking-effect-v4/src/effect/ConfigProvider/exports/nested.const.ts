/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: nested
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.183Z
 *
 * Overview:
 * Scopes a provider so that all lookups are prefixed with the given path segments.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider } from "effect"
 * 
 * const provider = ConfigProvider.fromEnv({
 *   env: { APP_HOST: "localhost", APP_PORT: "3000" }
 * })
 * 
 * // Lookups for ["HOST"] now resolve to ["APP", "HOST"]
 * const scoped = ConfigProvider.nested(provider, "APP")
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
import * as ConfigProviderModule from "effect/ConfigProvider";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "nested";
const exportKind = "const";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Scopes a provider so that all lookups are prefixed with the given path segments.";
const sourceExample = "import { ConfigProvider } from \"effect\"\n\nconst provider = ConfigProvider.fromEnv({\n  env: { APP_HOST: \"localhost\", APP_PORT: \"3000\" }\n})\n\n// Lookups for [\"HOST\"] now resolve to [\"APP\", \"HOST\"]\nconst scoped = ConfigProvider.nested(provider, \"APP\")";
const moduleRecord = ConfigProviderModule as Record<string, unknown>;

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
