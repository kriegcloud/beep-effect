/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: boolean
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:14:24.522Z
 *
 * Overview:
 * Creates a primitive that parses boolean values from string input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 * 
 * const parseBoolean = Effect.gen(function*() {
 *   const result1 = yield* Primitive.boolean.parse("true")
 *   console.log(result1) // true
 * 
 *   const result2 = yield* Primitive.boolean.parse("yes")
 *   console.log(result2) // true
 * 
 *   const result3 = yield* Primitive.boolean.parse("false")
 *   console.log(result3) // false
 * 
 *   const result4 = yield* Primitive.boolean.parse("0")
 *   console.log(result4) // false
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
const exportName = "boolean";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Creates a primitive that parses boolean values from string input.";
const sourceExample = "import { Effect } from \"effect\"\nimport { Primitive } from \"effect/unstable/cli\"\n\nconst parseBoolean = Effect.gen(function*() {\n  const result1 = yield* Primitive.boolean.parse(\"true\")\n  console.log(result1) // true\n\n  const result2 = yield* Primitive.boolean.parse(\"yes\")\n  console.log(result2) // true\n\n  const result3 = yield* Primitive.boolean.parse(\"false\")\n  console.log(result3) // false\n\n  const result4 = yield* Primitive.boolean.parse(\"0\")\n  console.log(result4) // false\n})";
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
