/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findErrorOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T03:49:05.755Z
 *
 * Overview:
 * Returns the first typed error value `E` from a cause wrapped in `Option.some`, or `Option.none` if no {@link Fail} reason exists.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Option } from "effect"
 * 
 * const some = Cause.findErrorOption(Cause.fail("error"))
 * console.log(Option.isSome(some)) // true
 * 
 * const none = Cause.findErrorOption(Cause.die("defect"))
 * console.log(Option.isNone(none)) // true
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

const exportName = "findErrorOption";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Returns the first typed error value `E` from a cause wrapped in `Option.some`, or `Option.none` if no {@link Fail} reason exists.";
const sourceExample = "import { Cause, Option } from \"effect\"\n\nconst some = Cause.findErrorOption(Cause.fail(\"error\"))\nconsole.log(Option.isSome(some)) // true\n\nconst none = Cause.findErrorOption(Cause.die(\"defect\"))\nconsole.log(Option.isNone(none)) // true";

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
