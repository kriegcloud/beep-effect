/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Console
 * Export: group
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Console.ts
 * Generated: 2026-02-19T04:14:11.195Z
 *
 * Overview:
 * Creates a new inline group in the console and returns a scoped Effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       yield* Console.group({ label: "User Processing" })
 *       yield* Console.log("Loading user data...")
 *       yield* Console.log("Validating user...")
 *       yield* Console.log("User processed successfully")
 *     })
 *   )
 * })
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
import * as ConsoleModule from "effect/Console";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "group";
const exportKind = "const";
const moduleImportPath = "effect/Console";
const sourceSummary = "Creates a new inline group in the console and returns a scoped Effect.";
const sourceExample = "import { Console, Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.scoped(\n    Effect.gen(function*() {\n      yield* Console.group({ label: \"User Processing\" })\n      yield* Console.log(\"Loading user data...\")\n      yield* Console.log(\"Validating user...\")\n      yield* Console.log(\"User processed successfully\")\n    })\n  )\n})";
const moduleRecord = ConsoleModule as Record<string, unknown>;

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
