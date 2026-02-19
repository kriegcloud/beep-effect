/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: orElseSucceed
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.912Z
 *
 * Overview:
 * Replaces the original failure with a success value, ensuring the effect cannot fail.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const validate = (age: number): Effect.Effect<number, string> => {
 *   if (age < 0) {
 *     return Effect.fail("NegativeAgeError")
 *   } else if (age < 18) {
 *     return Effect.fail("IllegalAgeError")
 *   } else {
 *     return Effect.succeed(age)
 *   }
 * }
 *
 * const program = Effect.orElseSucceed(validate(-1), () => 18)
 *
 * console.log(Effect.runSyncExit(program))
 * // Output:
 * // { _id: 'Exit', _tag: 'Success', value: 18 }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "orElseSucceed";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Replaces the original failure with a success value, ensuring the effect cannot fail.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst validate = (age: number): Effect.Effect<number, string> => {\n  if (age < 0) {\n    return Effect.fail("NegativeAgeError")\n  } else if (age < 18) {\n    return Effect.fail("IllegalAgeError")\n  } else {\n    return Effect.succeed(age)\n  }\n}\n\nconst program = Effect.orElseSucceed(validate(-1), () => 18)\n\nconsole.log(Effect.runSyncExit(program))\n// Output:\n// { _id: \'Exit\', _tag: \'Success\', value: 18 }';
const moduleRecord = EffectModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
