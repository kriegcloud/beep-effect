/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: sortBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T03:49:05.493Z
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
import * as Cause from "effect/Cause";
import * as Array from "effect/Array";

const exportName = "sortBy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Sorts an array by multiple `Order`s applied in sequence: the first order is used first; ties are broken by the second order, and so on.";
const sourceExample = "import { Array, Order, pipe } from \"effect\"\n\nconst users = [\n  { name: \"Alice\", age: 30 },\n  { name: \"Bob\", age: 25 },\n  { name: \"Charlie\", age: 30 }\n]\n\nconst result = pipe(\n  users,\n  Array.sortBy(\n    Order.mapInput(Order.Number, (user: (typeof users)[number]) => user.age),\n    Order.mapInput(Order.String, (user: (typeof users)[number]) => user.name)\n  )\n)\nconsole.log(result)\n// [{ name: \"Bob\", age: 25 }, { name: \"Alice\", age: 30 }, { name: \"Charlie\", age: 30 }]";

const formatUnknown = (value: unknown): string => {
  try {
    if (typeof value === "string") {
      return value;
    }
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const program = Effect.gen(function* () {
  yield* Console.log(`\n┌────────────────────────────────────────────────────────────┐`);
  yield* Console.log(`│ 🔎 ${moduleImportPath}.${exportName} (${exportKind})`);
  yield* Console.log(`└────────────────────────────────────────────────────────────┘`);
  yield* Console.log(`\n📝 ${sourceSummary}`);

  if (sourceExample.length > 0) {
    yield* Console.log(`\n📚 Source example:\n${sourceExample}`);
  }

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

  yield* Console.log(`🧱 BunContext layer detected: ${String("layer" in BunContext)}`);
  yield* Console.log(`\n✅ Demo complete for ${moduleImportPath}.${exportName}`);
}).pipe(
  Effect.catch((error) => Effect.gen(function* () {
    const msg = String(error);
    yield* Console.log(`\n💥 Program failed: ${msg}`);
    const cause = Cause.fail(error);
    yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`);
    return yield* Effect.fail(error);
  }))
);

BunRuntime.runMain(program);
