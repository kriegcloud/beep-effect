/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: sortBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.397Z
 *
 * Overview:
 * Sorts an array by multiple `Order`s applied in sequence: the first order is used first; ties are broken by the second order, and so on.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Order, pipe } from "effect"
 * 
 * const users = [
 *   { name: "Alice", age: 30 },
 *   { name: "Bob", age: 25 },
 *   { name: "Charlie", age: 30 }
 * ]
 * 
 * const result = pipe(
 *   users,
 *   Array.sortBy(
 *     Order.mapInput(Order.Number, (user: (typeof users)[number]) => user.age),
 *     Order.mapInput(Order.String, (user: (typeof users)[number]) => user.name)
 *   )
 * )
 * console.log(result)
 * // [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 30 }]
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

const exportName = "sortBy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Sorts an array by multiple `Order`s applied in sequence: the first order is used first; ties are broken by the second order, and so on.";
const sourceExample = "import { Array, Order, pipe } from \"effect\"\n\nconst users = [\n  { name: \"Alice\", age: 30 },\n  { name: \"Bob\", age: 25 },\n  { name: \"Charlie\", age: 30 }\n]\n\nconst result = pipe(\n  users,\n  Array.sortBy(\n    Order.mapInput(Order.Number, (user: (typeof users)[number]) => user.age),\n    Order.mapInput(Order.String, (user: (typeof users)[number]) => user.name)\n  )\n)\nconsole.log(result)\n// [{ name: \"Bob\", age: 25 }, { name: \"Alice\", age: 30 }, { name: \"Charlie\", age: 30 }]";

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
