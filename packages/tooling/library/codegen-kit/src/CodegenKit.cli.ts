/**
 * Shared command-line entrypoint for package code generators.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as A from "effect/Array";
import * as Command from "effect/cli/Command";
import * as Flag from "effect/cli/Flag";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as FetchHttpClient from "effect/http/FetchHttpClient";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { CodegenGenerateError } from "./CodegenKit.errors.ts";
import { GenerateConfig as GenerateConfigSchema } from "./CodegenKit.models.ts";
import { CodegenKit } from "./CodegenKit.service.ts";
import type { GenerateConfig } from "./CodegenKit.models.ts";
import type { ExtraRendererRegistry } from "./CodegenKit.service.ts";

/**
 * Options for package-specific generator entrypoints.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface GenerateCliOptions {
  readonly extraRenderers?: ExtraRendererRegistry | undefined;
}

const incompatibleFlags = CodegenGenerateError.make({
  message: "--check is offline and cannot be combined with --refresh",
  cause: "incompatible codegen flags",
});

const isGenerateConfig = S.is(GenerateConfigSchema);

const isGenerateConfigs = (input: unknown): input is A.NonEmptyReadonlyArray<GenerateConfig> =>
  A.isArray(input) && A.isReadonlyArrayNonEmpty(input) && A.every(input, isGenerateConfig);

const toConfigs = (
  input: GenerateConfig | A.NonEmptyReadonlyArray<GenerateConfig>
): A.NonEmptyReadonlyArray<GenerateConfig> => (isGenerateConfigs(input) ? input : A.of(input));

const runCli = (
  input: GenerateConfig | A.NonEmptyReadonlyArray<GenerateConfig>,
  options: GenerateCliOptions = {}
): void => {
  const configs = toConfigs(input);
  const command = Command.make(
    "generate",
    {
      check: Flag.Boolean("check").pipe(Flag.withDefault(false)),
      refresh: Flag.Boolean("refresh").pipe(Flag.withDefault(false)),
    },
    Effect.fn("CodegenKit.cli")(function* ({ check, refresh }) {
      if (check && refresh) return yield* incompatibleFlags;
      const kit = yield* CodegenKit;
      yield* kit.runAll(configs, check ? "check" : "write", refresh);
    })
  ).pipe(Command.withDescription("Generate source from a pinned local spec cache."));

  const platform = Layer.merge(NodeServices.layer, FetchHttpClient.layer);
  const kit = CodegenKit.layer(options.extraRenderers).pipe(Layer.provide(platform));
  const runtime = Layer.merge(platform, kit);
  const program = runtime.pipe(
    Layer.build,
    Effect.flatMap((context) => Command.run(command, { version: "0.0.0" }).pipe(Effect.provide(context))),
    Effect.scoped
  );
  NodeRuntime.runMain(program);
};

/**
 * Runs a package generator with offline check mode and explicit cache refresh.
 *
 * **Details**
 *
 * Pass one config or a non-empty array of configs. Every config runs in order with the same
 * `--check` / `--refresh` flags; in check mode the drift reports of every config are collected and
 * printed before the command fails, so one run shows every drifted module.
 *
 * **Example** (Launch a local generator)
 *
 * ```ts
 * import { GenerateConfig, runGenerateCli } from "@beep/codegen-kit"
 *
 * const config = GenerateConfig.make({
 *   packageName: "@beep/example",
 *   identity: { composer: "$ExampleId", moduleId: "_generated/schema.gen" },
 *   source: { _tag: "file", path: "spec/schema.json" },
 *   dialect: "json-schema-2020-12",
 *   format: "schemas",
 *   output: { path: "src/_generated/schema.gen.ts" }
 * })
 *
 * if (import.meta.main) runGenerateCli(config)
 * ```
 *
 * **Example** (Launch one generator for two schema modules)
 *
 * ```ts
 * import { GenerateConfig, runGenerateCli } from "@beep/codegen-kit"
 *
 * const v2 = GenerateConfig.make({
 *   packageName: "@beep/example",
 *   identity: { composer: "$ExampleId", moduleId: "_generated/schema.gen" },
 *   source: { _tag: "file", path: "spec/v2/schema.json" },
 *   dialect: "json-schema-2020-12",
 *   format: "schemas",
 *   output: { path: "src/_generated/schema.gen.ts" }
 * })
 * const v1 = GenerateConfig.make({
 *   packageName: "@beep/example",
 *   identity: { composer: "$ExampleId", moduleId: "_generated/schema-v1.gen" },
 *   source: { _tag: "file", path: "spec/v1/schema.json" },
 *   dialect: "json-schema-2020-12",
 *   format: "schemas",
 *   output: { path: "src/_generated/schema-v1.gen.ts", exampleImport: "@beep/example/schema-v1" }
 * })
 *
 * if (import.meta.main) runGenerateCli([v2, v1])
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const runGenerateCli: {
  (options?: GenerateCliOptions): (config: GenerateConfig | A.NonEmptyReadonlyArray<GenerateConfig>) => void;
  (config: GenerateConfig | A.NonEmptyReadonlyArray<GenerateConfig>, options?: GenerateCliOptions): void;
} = dual(
  (args) => isGenerateConfig(args[0]) || isGenerateConfigs(args[0]),
  (config: GenerateConfig | A.NonEmptyReadonlyArray<GenerateConfig>, options?: GenerateCliOptions): void =>
    runCli(config, options)
);
