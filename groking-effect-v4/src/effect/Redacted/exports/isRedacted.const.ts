/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Redacted
 * Export: isRedacted
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Redacted.ts
 * Generated: 2026-02-19T04:14:16.295Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Redacted } from "effect"
 * 
 * const secret = Redacted.make("my-secret")
 * const plainString = "not-secret"
 * 
 * console.log(Redacted.isRedacted(secret)) // true
 * console.log(Redacted.isRedacted(plainString)) // false
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
import * as RedactedModule from "effect/Redacted";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isRedacted";
const exportKind = "const";
const moduleImportPath = "effect/Redacted";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { Redacted } from \"effect\"\n\nconst secret = Redacted.make(\"my-secret\")\nconst plainString = \"not-secret\"\n\nconsole.log(Redacted.isRedacted(secret)) // true\nconsole.log(Redacted.isRedacted(plainString)) // false";
const moduleRecord = RedactedModule as Record<string, unknown>;

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
