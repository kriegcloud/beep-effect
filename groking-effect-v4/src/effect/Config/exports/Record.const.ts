/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: Record
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.161Z
 *
 * Overview:
 * A `Schema.Codec` for key-value record types that can also be parsed from a flat comma-separated string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect, Schema } from "effect"
 * 
 * const schema = Config.Record(Schema.String, Schema.String)
 * const config = Config.schema(schema, "OTEL_RESOURCE_ATTRIBUTES")
 * 
 * const provider = ConfigProvider.fromEnv({
 *   env: {
 *     OTEL_RESOURCE_ATTRIBUTES:
 *       "service.name=my-service,service.version=1.0.0,custom.attribute=value"
 *   }
 * })
 * 
 * console.dir(Effect.runSync(config.parse(provider)))
 * // {
 * //   'service.name': 'my-service',
 * //   'service.version': '1.0.0',
 * //   'custom.attribute': 'value'
 * // }
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
import * as ConfigModule from "effect/Config";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Record";
const exportKind = "const";
const moduleImportPath = "effect/Config";
const sourceSummary = "A `Schema.Codec` for key-value record types that can also be parsed from a flat comma-separated string.";
const sourceExample = "import { Config, ConfigProvider, Effect, Schema } from \"effect\"\n\nconst schema = Config.Record(Schema.String, Schema.String)\nconst config = Config.schema(schema, \"OTEL_RESOURCE_ATTRIBUTES\")\n\nconst provider = ConfigProvider.fromEnv({\n  env: {\n    OTEL_RESOURCE_ATTRIBUTES:\n      \"service.name=my-service,service.version=1.0.0,custom.attribute=value\"\n  }\n})\n\nconsole.dir(Effect.runSync(config.parse(provider)))\n// {\n//   'service.name': 'my-service',\n//   'service.version': '1.0.0',\n//   'custom.attribute': 'value'\n// }";
const moduleRecord = ConfigModule as Record<string, unknown>;

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
