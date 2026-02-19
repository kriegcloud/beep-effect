/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: fromDir
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.182Z
 *
 * Overview:
 * Creates a `ConfigProvider` that reads configuration from a directory tree on disk, where each file is a leaf value and each directory is a container.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider, Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const provider = yield* ConfigProvider.fromDir({
 *     rootPath: "/etc/myapp"
 *   })
 *   return provider
 * })
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
const exportName = "fromDir";
const exportKind = "const";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Creates a `ConfigProvider` that reads configuration from a directory tree on disk, where each file is a leaf value and each directory is a container.";
const sourceExample = "import { ConfigProvider, Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const provider = yield* ConfigProvider.fromDir({\n    rootPath: \"/etc/myapp\"\n  })\n  return provider\n})";
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
