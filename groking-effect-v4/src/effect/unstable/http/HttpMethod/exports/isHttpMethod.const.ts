/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/http/HttpMethod
 * Export: isHttpMethod
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/http/HttpMethod.ts
 * Generated: 2026-02-19T04:14:26.460Z
 *
 * Overview:
 * Tests if a value is a `HttpMethod`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { HttpMethod } from "effect/unstable/http"
 * 
 * console.log(HttpMethod.isHttpMethod("GET"))
 * // true
 * console.log(HttpMethod.isHttpMethod("get"))
 * // false
 * console.log(HttpMethod.isHttpMethod(1))
 * // false
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
import * as HttpMethodModule from "effect/unstable/http/HttpMethod";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isHttpMethod";
const exportKind = "const";
const moduleImportPath = "effect/unstable/http/HttpMethod";
const sourceSummary = "Tests if a value is a `HttpMethod`.";
const sourceExample = "import { HttpMethod } from \"effect/unstable/http\"\n\nconsole.log(HttpMethod.isHttpMethod(\"GET\"))\n// true\nconsole.log(HttpMethod.isHttpMethod(\"get\"))\n// false\nconsole.log(HttpMethod.isHttpMethod(1))\n// false";
const moduleRecord = HttpMethodModule as Record<string, unknown>;

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
