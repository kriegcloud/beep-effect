/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: tail
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.399Z
 *
 * Overview:
 * Returns all elements except the first, or `undefined` if the array is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * 
 * console.log(Array.tail([1, 2, 3, 4])) // [2, 3, 4]
 * console.log(Array.tail([])) // undefined
 * ```
 *
 * Focus:
 * - Runtime inspection and safe invocation attempt for function exports.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Array from "effect/Array";
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

const exportName = "tail";
const exportKind = "function";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns all elements except the first, or `undefined` if the array is empty.";
const sourceExample = "import { Array } from \"effect\"\n\nconsole.log(Array.tail([1, 2, 3, 4])) // [2, 3, 4]\nconsole.log(Array.tail([])) // undefined";

const program = Effect.gen(function* () {
  yield* logHeader({ icon: "🧪", moduleImportPath, exportName, exportKind });
  yield* logSummary(sourceSummary);
  yield* logSourceExample(sourceExample);

  const candidate = Array[exportName as keyof typeof Array];
  if (typeof candidate !== "function") {
    return yield* Effect.fail(new Error(`${moduleImportPath}.${exportName} is not callable at runtime.`));
  }

  const fn = candidate as (...args: ReadonlyArray<unknown>) => unknown;
  yield* Console.log(`\n🔬 Callable detected. Trying a zero-arg invocation for discovery.`);

  const invocation = yield* attemptThunk(() => fn());

  if (invocation._tag === "Right") {
    yield* Console.log(`✅ Invocation succeeded. Result:\n${formatUnknown(invocation.value)}`);
  } else {
    yield* Console.log(`ℹ️ Invocation failed (this is often expected for parameterized APIs).`);
    yield* Console.log(`   ${String(invocation.error)}`);
  }

  yield* logBunContextLayer(BunContext);
  yield* logCompletion(moduleImportPath, exportName);
}).pipe(reportProgramError);

BunRuntime.runMain(program);
