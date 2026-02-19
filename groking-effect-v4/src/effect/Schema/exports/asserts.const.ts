/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: asserts
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:14:18.705Z
 *
 * Overview:
 * Creates an assertion function that throws an error if the input doesn't match the schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * 
 * const assertString: (u: unknown) => asserts u is string = Schema.asserts(
 *   Schema.String
 * )
 * 
 * // This will pass silently (no return value)
 * try {
 *   assertString("hello")
 *   console.log("String assertion passed")
 * } catch (error) {
 *   console.log("String assertion failed")
 * }
 * 
 * // This will throw an error
 * try {
 *   assertString(123)
 * } catch (error) {
 *   console.log("Non-string assertion failed as expected")
 * }
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
import * as SchemaModule from "effect/Schema";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "asserts";
const exportKind = "const";
const moduleImportPath = "effect/Schema";
const sourceSummary = "Creates an assertion function that throws an error if the input doesn't match the schema.";
const sourceExample = "import { Schema } from \"effect\"\n\nconst assertString: (u: unknown) => asserts u is string = Schema.asserts(\n  Schema.String\n)\n\n// This will pass silently (no return value)\ntry {\n  assertString(\"hello\")\n  console.log(\"String assertion passed\")\n} catch (error) {\n  console.log(\"String assertion failed\")\n}\n\n// This will throw an error\ntry {\n  assertString(123)\n} catch (error) {\n  console.log(\"Non-string assertion failed as expected\")\n}";
const moduleRecord = SchemaModule as Record<string, unknown>;

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
