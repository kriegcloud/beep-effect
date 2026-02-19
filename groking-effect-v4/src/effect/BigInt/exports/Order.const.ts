/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigInt
 * Export: Order
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigInt.ts
 * Generated: 2026-02-19T04:14:10.086Z
 *
 * Overview:
 * Provides an `Order` instance for `bigint` that allows comparing and sorting BigInt values.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as BigInt from "effect/BigInt"
 * 
 * const a = 123n
 * const b = 456n
 * const c = 123n
 * 
 * console.log(BigInt.Order(a, b)) // -1 (a < b)
 * console.log(BigInt.Order(b, a)) // 1 (b > a)
 * console.log(BigInt.Order(a, c)) // 0 (a === c)
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
import * as BigIntModule from "effect/BigInt";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Order";
const exportKind = "const";
const moduleImportPath = "effect/BigInt";
const sourceSummary = "Provides an `Order` instance for `bigint` that allows comparing and sorting BigInt values.";
const sourceExample = "import * as BigInt from \"effect/BigInt\"\n\nconst a = 123n\nconst b = 456n\nconst c = 123n\n\nconsole.log(BigInt.Order(a, b)) // -1 (a < b)\nconsole.log(BigInt.Order(b, a)) // 1 (b > a)\nconsole.log(BigInt.Order(a, c)) // 0 (a === c)";
const moduleRecord = BigIntModule as Record<string, unknown>;

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
