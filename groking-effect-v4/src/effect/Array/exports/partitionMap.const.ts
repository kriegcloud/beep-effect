/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: partitionMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T03:49:05.492Z
 *
 * Overview:
 * Maps each element to a `Result`, then separates failures and successes into two arrays.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Result } from "effect"
 * 
 * const result = Array.partitionMap(
 *   [1, 2, 3, 4, 5],
 *   (x) => x % 2 === 0 ? Result.succeed(x) : Result.fail(x)
 * )
 * console.log(result) // [[1, 3, 5], [2, 4]]
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

const exportName = "partitionMap";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Maps each element to a `Result`, then separates failures and successes into two arrays.";
const sourceExample = "import { Array, Result } from \"effect\"\n\nconst result = Array.partitionMap(\n  [1, 2, 3, 4, 5],\n  (x) => x % 2 === 0 ? Result.succeed(x) : Result.fail(x)\n)\nconsole.log(result) // [[1, 3, 5], [2, 4]]";

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
