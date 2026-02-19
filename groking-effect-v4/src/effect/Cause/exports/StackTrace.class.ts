/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: StackTrace
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T03:49:05.761Z
 *
 * Overview:
 * `ServiceMap` key for the stack frame captured at the point of failure.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Runtime inspection and safe construction attempt for class exports.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Cause from "effect/Cause";
import * as CauseModule from "effect/Cause";

const exportName = "StackTrace";
const exportKind = "class";
const moduleImportPath = "effect/Cause";
const sourceSummary = "`ServiceMap` key for the stack frame captured at the point of failure.";
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
  yield* Console.log(`│ 🧱 ${moduleImportPath}.${exportName} (${exportKind})`);
  yield* Console.log(`└────────────────────────────────────────────────────────────┘`);
  yield* Console.log(`\n📝 ${sourceSummary}`);

  if (sourceExample.length > 0) {
    yield* Console.log(`\n📚 Source example:\n${sourceExample}`);
  }

  const candidate = CauseModule[exportName as keyof typeof CauseModule];
  if (typeof candidate !== "function") {
    return yield* Effect.fail(new Error(`${moduleImportPath}.${exportName} is not constructable at runtime.`));
  }

  const Constructor = candidate as new (...args: ReadonlyArray<unknown>) => unknown;
  yield* Console.log(`\n🔬 Constructor detected. Trying a zero-arg instantiation for discovery.`);

  const construction = yield* Effect.try({
    try: () => new Constructor(),
    catch: (error) => error
  }).pipe(
    Effect.map((value) => ({ _tag: "Right" as const, value })),
    Effect.catch((error) => Effect.succeed({ _tag: "Left" as const, error }))
  );

  if (construction._tag === "Right") {
    yield* Console.log(`✅ Construction succeeded. Instance preview:\n${formatUnknown(construction.value)}`);
  } else {
    yield* Console.log(`ℹ️ Construction failed (often expected when constructor args are required).`);
    yield* Console.log(`   ${String(construction.error)}`);
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
