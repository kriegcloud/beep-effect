/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: makeReducerConcat
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T03:49:05.489Z
 *
 * Overview:
 * Returns a `Reducer` that combines `Array` values by concatenation.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Runtime inspection and safe invocation attempt for function exports.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Cause from "effect/Cause";
import * as Array from "effect/Array";

const exportName = "makeReducerConcat";
const exportKind = "function";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns a `Reducer` that combines `Array` values by concatenation.";
const sourceExample = "";

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
  yield* Console.log(`│ 🧪 ${moduleImportPath}.${exportName} (${exportKind})`);
  yield* Console.log(`└────────────────────────────────────────────────────────────┘`);
  yield* Console.log(`\n📝 ${sourceSummary}`);

  if (sourceExample.length > 0) {
    yield* Console.log(`\n📚 Source example:\n${sourceExample}`);
  }

  const candidate = Array[exportName as keyof typeof Array];
  if (typeof candidate !== "function") {
    return yield* Effect.fail(new Error(`${moduleImportPath}.${exportName} is not callable at runtime.`));
  }

  const fn = candidate as (...args: ReadonlyArray<unknown>) => unknown;
  yield* Console.log(`\n🔬 Callable detected. Trying a zero-arg invocation for discovery.`);

  const invocation = yield* Effect.try({
    try: () => fn(),
    catch: (error) => error
  }).pipe(
    Effect.map((value) => ({ _tag: "Right" as const, value })),
    Effect.catch((error) => Effect.succeed({ _tag: "Left" as const, error }))
  );

  if (invocation._tag === "Right") {
    yield* Console.log(`✅ Invocation succeeded. Result:\n${formatUnknown(invocation.value)}`);
  } else {
    yield* Console.log(`ℹ️ Invocation failed (this is often expected for parameterized APIs).`);
    yield* Console.log(`   ${String(invocation.error)}`);
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
