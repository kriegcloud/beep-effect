/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: fileParse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:14:24.522Z
 *
 * Overview:
 * Reads and parses file content using the specified schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 * 
 * const tomlFilePrimitive = Primitive.fileParse({ format: "toml" })
 * 
 * const loadConfig = Effect.gen(function*() {
 *   const config = yield* tomlFilePrimitive.parse("./config.toml")
 *   console.log(config) // { name: "my-app", version: "1.0.0", port: 3000 }
 *   return config
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
import * as PrimitiveModule from "effect/unstable/cli/Primitive";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fileParse";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Reads and parses file content using the specified schema.";
const sourceExample = "import { Effect } from \"effect\"\nimport { Primitive } from \"effect/unstable/cli\"\n\nconst tomlFilePrimitive = Primitive.fileParse({ format: \"toml\" })\n\nconst loadConfig = Effect.gen(function*() {\n  const config = yield* tomlFilePrimitive.parse(\"./config.toml\")\n  console.log(config) // { name: \"my-app\", version: \"1.0.0\", port: 3000 }\n  return config\n})";
const moduleRecord = PrimitiveModule as Record<string, unknown>;

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
