/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: url
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.162Z
 *
 * Overview:
 * Creates a config for a `URL` value parsed from a string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const url = yield* Config.url("URL")
 *   console.log(url)
 * })
 *
 * const provider = ConfigProvider.fromEnv({
 *   env: {
 *     URL: "https://example.com"
 *   }
 * })
 *
 * Effect.runSync(
 *   program.pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider))
 * )
 * // Output:
 * // URL {
 * //   href: 'https://example.com/',
 * //   origin: 'https://example.com',
 * //   protocol: 'https:',
 * //   username: '',
 * //   password: '',
 * //   host: 'example.com',
 * //   hostname: 'example.com',
 * //   port: '',
 * //   pathname: '/',
 * //   search: '',
 * //   searchParams: URLSearchParams {},
 * //   hash: ''
 * // }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigModule from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "url";
const exportKind = "function";
const moduleImportPath = "effect/Config";
const sourceSummary = "Creates a config for a `URL` value parsed from a string.";
const sourceExample =
  "import { Config, ConfigProvider, Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const url = yield* Config.url(\"URL\")\n  console.log(url)\n})\n\nconst provider = ConfigProvider.fromEnv({\n  env: {\n    URL: \"https://example.com\"\n  }\n})\n\nEffect.runSync(\n  program.pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider))\n)\n// Output:\n// URL {\n//   href: 'https://example.com/',\n//   origin: 'https://example.com',\n//   protocol: 'https:',\n//   username: '',\n//   password: '',\n//   host: 'example.com',\n//   hostname: 'example.com',\n//   port: '',\n//   pathname: '/',\n//   search: '',\n//   searchParams: URLSearchParams {},\n//   hash: ''\n// }";
const moduleRecord = ConfigModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
