/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: instanceOfUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Unsafe variant of `instanceOf` that allows matching without type narrowing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 * 
 * class CustomError extends Error {
 *   constructor(message: string, public code: number) {
 *     super(message)
 *   }
 * }
 * 
 * // When you need to match instances but handle type narrowing manually
 * const handleError = Match.type<unknown>().pipe(
 *   Match.when(Match.instanceOfUnsafe(CustomError), (err: any) => {
 *     // Manual type assertion needed
 *     const customErr = err as CustomError
 *     return `Custom error ${customErr.code}: ${customErr.message}`
 *   }),
 *   Match.orElse(() => "Not a CustomError")
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MatchModule from "effect/Match";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "instanceOfUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Unsafe variant of `instanceOf` that allows matching without type narrowing.";
const sourceExample = "import { Match } from \"effect\"\n\nclass CustomError extends Error {\n  constructor(message: string, public code: number) {\n    super(message)\n  }\n}\n\n// When you need to match instances but handle type narrowing manually\nconst handleError = Match.type<unknown>().pipe(\n  Match.when(Match.instanceOfUnsafe(CustomError), (err: any) => {\n    // Manual type assertion needed\n    const customErr = err as CustomError\n    return `Custom error ${customErr.code}: ${customErr.message}`\n  }),\n  Match.orElse(() => \"Not a CustomError\")\n)";
const moduleRecord = MatchModule as Record<string, unknown>;

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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
