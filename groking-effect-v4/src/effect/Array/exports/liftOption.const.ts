/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: liftOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T03:49:05.489Z
 *
 * Overview:
 * Lifts an `Option`-returning function into one that returns an array: `Some(a)` becomes `[a]`, `None` becomes `[]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Option } from "effect"
 * 
 * const parseNumber = Array.liftOption((s: string) => {
 *   const n = Number(s)
 *   return isNaN(n) ? Option.none() : Option.some(n)
 * })
 * console.log(parseNumber("123")) // [123]
 * console.log(parseNumber("abc")) // []
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

const exportName = "liftOption";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Lifts an `Option`-returning function into one that returns an array: `Some(a)` becomes `[a]`, `None` becomes `[]`.";
const sourceExample = "import { Array, Option } from \"effect\"\n\nconst parseNumber = Array.liftOption((s: string) => {\n  const n = Number(s)\n  return isNaN(n) ? Option.none() : Option.some(n)\n})\nconsole.log(parseNumber(\"123\")) // [123]\nconsole.log(parseNumber(\"abc\")) // []";

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
