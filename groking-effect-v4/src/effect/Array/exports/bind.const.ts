/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: bind
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.386Z
 *
 * Overview:
 * Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 * 
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 2]),
 *   Array.bind("y", () => ["a", "b"])
 * )
 * console.log(result)
 * // [{ x: 1, y: "a" }, { x: 1, y: "b" }, { x: 2, y: "a" }, { x: 2, y: "b" }]
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

const exportName = "bind";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.";
const sourceExample = "import { Array, pipe } from \"effect\"\n\nconst result = pipe(\n  Array.Do,\n  Array.bind(\"x\", () => [1, 2]),\n  Array.bind(\"y\", () => [\"a\", \"b\"])\n)\nconsole.log(result)\n// [{ x: 1, y: \"a\" }, { x: 1, y: \"b\" }, { x: 2, y: \"a\" }, { x: 2, y: \"b\" }]";

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
