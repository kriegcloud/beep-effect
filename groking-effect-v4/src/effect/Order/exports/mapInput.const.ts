/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Order
 * Export: mapInput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Order.ts
 * Generated: 2026-02-19T04:14:15.470Z
 *
 * Overview:
 * Transforms an `Order` on type `A` into an `Order` on type `B` by providing a function that maps values of type `B` to values of type `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Order } from "effect"
 * 
 * const byLength = Order.mapInput(Order.Number, (s: string) => s.length)
 * 
 * console.log(byLength("a", "bb")) // -1
 * console.log(byLength("bb", "a")) // 1
 * console.log(byLength("aa", "bb")) // 0
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
import * as OrderModule from "effect/Order";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapInput";
const exportKind = "const";
const moduleImportPath = "effect/Order";
const sourceSummary = "Transforms an `Order` on type `A` into an `Order` on type `B` by providing a function that maps values of type `B` to values of type `A`.";
const sourceExample = "import { Order } from \"effect\"\n\nconst byLength = Order.mapInput(Order.Number, (s: string) => s.length)\n\nconsole.log(byLength(\"a\", \"bb\")) // -1\nconsole.log(byLength(\"bb\", \"a\")) // 1\nconsole.log(byLength(\"aa\", \"bb\")) // 0";
const moduleRecord = OrderModule as Record<string, unknown>;

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
