/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: mapInput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.183Z
 *
 * Overview:
 * Transforms the path segments before they reach the underlying store.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider } from "effect"
 *
 * const provider = ConfigProvider.fromEnv({
 *   env: { APP_HOST: "localhost" }
 * })
 *
 * const upper = ConfigProvider.mapInput(provider, (path) =>
 *   path.map((seg) =>
 *     typeof seg === "string" ? seg.toUpperCase() : seg
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigProviderModule from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapInput";
const exportKind = "const";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Transforms the path segments before they reach the underlying store.";
const sourceExample =
  'import { ConfigProvider } from "effect"\n\nconst provider = ConfigProvider.fromEnv({\n  env: { APP_HOST: "localhost" }\n})\n\nconst upper = ConfigProvider.mapInput(provider, (path) =>\n  path.map((seg) =>\n    typeof seg === "string" ? seg.toUpperCase() : seg\n  )\n)';
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
