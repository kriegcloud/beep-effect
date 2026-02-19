/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: omit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.492Z
 *
 * Overview:
 * Creates a new struct with the specified keys removed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Struct } from "effect"
 * 
 * const user = { name: "Alice", age: 30, password: "secret" }
 * const safe = pipe(user, Struct.omit(["password"]))
 * console.log(safe) // { name: "Alice", age: 30 }
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
import * as StructModule from "effect/Struct";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "omit";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary = "Creates a new struct with the specified keys removed.";
const sourceExample = "import { pipe, Struct } from \"effect\"\n\nconst user = { name: \"Alice\", age: 30, password: \"secret\" }\nconst safe = pipe(user, Struct.omit([\"password\"]))\nconsole.log(safe) // { name: \"Alice\", age: 30 }";
const moduleRecord = StructModule as Record<string, unknown>;

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
