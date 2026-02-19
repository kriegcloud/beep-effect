/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: getUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.824Z
 *
 * Overview:
 * Unsafely lookup the value for the specified key in the `HashMap` using the internal hashing function.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 * 
 * const config = HashMap.make(
 *   ["api_url", "https://api.example.com"],
 *   ["timeout", "5000"],
 *   ["retries", "3"]
 * )
 * 
 * // Safe: use when you're certain the key exists
 * const apiUrl = HashMap.getUnsafe(config, "api_url") // "https://api.example.com"
 * console.log(`Connecting to: ${apiUrl}`)
 * 
 * // Preferred: use get() for uncertain keys
 * const dbUrl = HashMap.get(config, "db_url") // Option.none()
 * if (Option.isSome(dbUrl)) {
 *   console.log(`Database: ${dbUrl.value}`)
 * }
 * 
 * // This would throw: HashMap.getUnsafe(config, "db_url")
 * // Error: "HashMap.getUnsafe: key not found"
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
import * as HashMapModule from "effect/HashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Unsafely lookup the value for the specified key in the `HashMap` using the internal hashing function.";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\nimport * as Option from \"effect/Option\"\n\nconst config = HashMap.make(\n  [\"api_url\", \"https://api.example.com\"],\n  [\"timeout\", \"5000\"],\n  [\"retries\", \"3\"]\n)\n\n// Safe: use when you're certain the key exists\nconst apiUrl = HashMap.getUnsafe(config, \"api_url\") // \"https://api.example.com\"\nconsole.log(`Connecting to: ${apiUrl}`)\n\n// Preferred: use get() for uncertain keys\nconst dbUrl = HashMap.get(config, \"db_url\") // Option.none()\nif (Option.isSome(dbUrl)) {\n  console.log(`Database: ${dbUrl.value}`)\n}\n\n// This would throw: HashMap.getUnsafe(config, \"db_url\")\n// Error: \"HashMap.getUnsafe: key not found\"";
const moduleRecord = HashMapModule as Record<string, unknown>;

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
