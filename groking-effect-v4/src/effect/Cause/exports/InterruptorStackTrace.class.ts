/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: InterruptorStackTrace
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.687Z
 *
 * Overview:
 * `ServiceMap` key for the stack frame captured at the point of interruption.
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
import * as CauseModule from "effect/Cause";
import {
  attemptThunk,
  formatUnknown,
  logBunContextLayer,
  logCompletion,
  logHeader,
  logSourceExample,
  logSummary,
  reportProgramError
} from "@beep/groking-effect-v4/runtime/Playground";

const exportName = "InterruptorStackTrace";
const exportKind = "class";
const moduleImportPath = "effect/Cause";
const sourceSummary = "`ServiceMap` key for the stack frame captured at the point of interruption.";
const sourceExample = "";

const program = Effect.gen(function* () {
  yield* logHeader({ icon: "🧱", moduleImportPath, exportName, exportKind });
  yield* logSummary(sourceSummary);
  yield* logSourceExample(sourceExample);

  const candidate = CauseModule[exportName as keyof typeof CauseModule];
  if (typeof candidate !== "function") {
    return yield* Effect.fail(new Error(`${moduleImportPath}.${exportName} is not constructable at runtime.`));
  }

  const Constructor = candidate as new (...args: ReadonlyArray<unknown>) => unknown;
  yield* Console.log(`\n🔬 Constructor detected. Trying a zero-arg instantiation for discovery.`);

  const construction = yield* attemptThunk(() => new Constructor());

  if (construction._tag === "Right") {
    yield* Console.log(`✅ Construction succeeded. Instance preview:\n${formatUnknown(construction.value)}`);
  } else {
    yield* Console.log(`ℹ️ Construction failed (often expected when constructor args are required).`);
    yield* Console.log(`   ${String(construction.error)}`);
  }

  yield* logBunContextLayer(BunContext);
  yield* logCompletion(moduleImportPath, exportName);
}).pipe(reportProgramError);

BunRuntime.runMain(program);
