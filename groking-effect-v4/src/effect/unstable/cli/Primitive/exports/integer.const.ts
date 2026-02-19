/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: integer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:14:24.523Z
 *
 * Overview:
 * Creates a primitive that parses integer numbers from string input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 * 
 * const parseInteger = Effect.gen(function*() {
 *   const result1 = yield* Primitive.integer.parse("42")
 *   console.log(result1) // 42
 * 
 *   const result2 = yield* Primitive.integer.parse("-123")
 *   console.log(result2) // -123
 * 
 *   const result3 = yield* Primitive.integer.parse("0")
 *   console.log(result3) // 0
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
const exportName = "integer";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Creates a primitive that parses integer numbers from string input.";
const sourceExample = "import { Effect } from \"effect\"\nimport { Primitive } from \"effect/unstable/cli\"\n\nconst parseInteger = Effect.gen(function*() {\n  const result1 = yield* Primitive.integer.parse(\"42\")\n  console.log(result1) // 42\n\n  const result2 = yield* Primitive.integer.parse(\"-123\")\n  console.log(result2) // -123\n\n  const result3 = yield* Primitive.integer.parse(\"0\")\n  console.log(result3) // 0\n})";
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
