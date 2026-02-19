/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: orElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.183Z
 *
 * Overview:
 * Returns a provider that falls back to `that` when `self` returns `undefined` for a path.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider } from "effect"
 * 
 * const envProvider = ConfigProvider.fromEnv({
 *   env: { HOST: "prod.example.com" }
 * })
 * const defaults = ConfigProvider.fromUnknown({ HOST: "localhost", PORT: "3000" })
 * 
 * const combined = ConfigProvider.orElse(envProvider, defaults)
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
const exportName = "orElse";
const exportKind = "const";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Returns a provider that falls back to `that` when `self` returns `undefined` for a path.";
const sourceExample = "import { ConfigProvider } from \"effect\"\n\nconst envProvider = ConfigProvider.fromEnv({\n  env: { HOST: \"prod.example.com\" }\n})\nconst defaults = ConfigProvider.fromUnknown({ HOST: \"localhost\", PORT: \"3000\" })\n\nconst combined = ConfigProvider.orElse(envProvider, defaults)";
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
