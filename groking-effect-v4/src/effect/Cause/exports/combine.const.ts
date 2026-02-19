/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: combine
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T03:49:05.754Z
 *
 * Overview:
 * Merges two causes into a single cause whose `reasons` array is the union of both inputs (de-duplicated by value equality).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 * 
 * const cause1 = Cause.fail("error1")
 * const cause2 = Cause.fail("error2")
 * const combined = Cause.combine(cause1, cause2)
 * console.log(combined.reasons.length) // 2
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
import * as CauseModule from "effect/Cause";

const exportName = "combine";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Merges two causes into a single cause whose `reasons` array is the union of both inputs (de-duplicated by value equality).";
const sourceExample = "import { Cause } from \"effect\"\n\nconst cause1 = Cause.fail(\"error1\")\nconst cause2 = Cause.fail(\"error2\")\nconst combined = Cause.combine(cause1, cause2)\nconsole.log(combined.reasons.length) // 2";

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

  const moduleKeys = Object.keys(CauseModule);
  yield* Console.log(`\n📦 Module export count: ${moduleKeys.length}`);

  const target = CauseModule[exportName as keyof typeof CauseModule];
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
