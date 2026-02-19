/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: Do
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.387Z
 *
 * Overview:
 * Starting point for the "do simulation" — an array comprehension pattern.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 * 
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 3, 5]),
 *   Array.bind("y", () => [2, 4, 6]),
 *   Array.filter(({ x, y }) => x < y),
 *   Array.map(({ x, y }) => [x, y] as const)
 * )
 * console.log(result) // [[1, 2], [1, 4], [1, 6], [3, 4], [3, 6], [5, 6]]
 * ```
 *
 * Focus:
 * - Runtime inspection for value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Array from "effect/Array";
import {
  formatUnknown,
  logBunContextLayer,
  logCompletion,
  logHeader,
  logSourceExample,
  logSummary,
  reportProgramError
} from "@beep/groking-effect-v4/runtime/Playground";

const exportName = "Do";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Starting point for the \"do simulation\" — an array comprehension pattern.";
const sourceExample = "import { Array, pipe } from \"effect\"\n\nconst result = pipe(\n  Array.Do,\n  Array.bind(\"x\", () => [1, 3, 5]),\n  Array.bind(\"y\", () => [2, 4, 6]),\n  Array.filter(({ x, y }) => x < y),\n  Array.map(({ x, y }) => [x, y] as const)\n)\nconsole.log(result) // [[1, 2], [1, 4], [1, 6], [3, 4], [3, 6], [5, 6]]";

const program = Effect.gen(function* () {
  yield* logHeader({ icon: "🔎", moduleImportPath, exportName, exportKind });
  yield* logSummary(sourceSummary);
  yield* logSourceExample(sourceExample);
  yield* Console.log(`\n📦 Inspecting runtime value-like export...`);

  const moduleKeys = Object.keys(Array);
  yield* Console.log(`\n📦 Module export count: ${moduleKeys.length}`);

  const target = Array[exportName as keyof typeof Array];
  yield* Console.log(`🔬 Runtime typeof: ${typeof target}`);

  if (typeof target === "function") {
    const signaturePreview = String(target).replace(/\s+/g, " ").slice(0, 240);
    yield* Console.log(`⚙️ Function-like value preview: ${signaturePreview}${String(target).length > 240 ? "..." : ""}`);
  } else {
    yield* Console.log(`📄 Value preview:\n${formatUnknown(target)}`);
  }

  yield* logBunContextLayer(BunContext);
  yield* logCompletion(moduleImportPath, exportName);
}).pipe(reportProgramError);

BunRuntime.runMain(program);
