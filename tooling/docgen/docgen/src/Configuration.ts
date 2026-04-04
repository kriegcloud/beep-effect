/**
 * @module @beep/repo-cli/commands/DocgenV2/Configuration
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TSConfigCompilerOptions } from "@beep/repo-utils";

import { SchemaUtils } from "@beep/schema";
import { A } from "@beep/utils";
import { Effect, SchemaTransformation, ServiceMap } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/DocgenV2/Configuration");

const strictDecodeOptions = { onExcessProperty: "error" as const };
const EncodedTSConfigCompilerOptions = S.toEncoded(TSConfigCompilerOptions);
const decodeEncodedTSConfigCompilerOptions = S.decodeUnknownEffect(EncodedTSConfigCompilerOptions);

const CompilerOptionsObject = S.Unknown.pipe(
  S.decodeTo(
    EncodedTSConfigCompilerOptions,
    SchemaTransformation.transformOrFail({
      decode: (input) =>
        decodeEncodedTSConfigCompilerOptions(input, strictDecodeOptions).pipe(Effect.mapError((error) => error.issue)),
      encode: Effect.succeed,
    })
  ),
  $I.annoteSchema("CompilerOptionsObject", {
    description: "Strict encoded TSConfig compiler options validated via @beep/repo-utils.",
  })
);

const CompilerOptions = S.Union([S.String, CompilerOptionsObject]).pipe(
  SchemaUtils.withStatics((schema) => {
    const defaultValue = S.decodeUnknownSync(CompilerOptionsObject)({
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      moduleResolution: "Bundler",
      target: "ES2022",
      lib: ["ES2022", "DOM"],
    });

    return {
      defaultValue,
      withKeyDefaults: (description: string) =>
        schema.pipe(SchemaUtils.withKeyDefaults(defaultValue)).annotateKey({
          description,
          default: defaultValue,
        }),
    };
  }),
  $I.annoteSchema("CompilerOptions", {
    description: "TSConfig compiler options",
  })
);

/**
 * Supported compiler option input shapes for DocgenV2 parsing and example checks.
 *
 * @category Types
 * @since 0.0.0
 */
export type CompilerOptions = typeof CompilerOptions.Type;

/**
 * Declares the configuration schema consumed by the DocgenV2 command.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ConfigurationShape extends S.Class<ConfigurationShape>($I`ConfigurationShape`)(
  {
    $schema: S.OptionFromOptionalKey(S.String),
    projectHomepage: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Will link to the project homepage from the Auxiliary Links of the generated documentation.",
    }),
    srcDir: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("src")).annotateKey({
      description: "The directory in which docgen will search for TypeScript" + " files to parse.",
      default: "src",
    }),
    outDir: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("docs")).annotateKey({
      description: "The directory to which docgen will generate its output markdown documents.",
      default: "docs",
    }),
    theme: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("kriegcloud/just-the-docs")).annotateKey({
      description:
        "The theme that docgen will specify should be used for GitHub Docs in the generated _config.yml file.",
      default: "kriegcloud/just-the-docs",
    }),
    enableSearch: S.Boolean.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(true)).annotateKey({
      description: "Whether or not search should be enabled for GitHub Docs in the generated _config.yml file.",
      default: true,
    }),
    enforceDescriptions: S.Boolean.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(false)).annotateKey({
      description: "Whether or not descriptions for each module export should be required.",
      default: false,
    }),
    enforceExamples: S.Boolean.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(false)).annotateKey({
      description:
        "Whether or not @example tags for each module export should be required. (Note: examples will not be enforced in module documentation)",
      default: false,
    }),
    enforceVersion: S.Boolean.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(true)).annotateKey({
      description: "Whether or not @since tags for each module export should be required.",
      default: true,
    }),
    exclude: S.String.pipe(S.Array, S.optionalKey, SchemaUtils.withKeyDefaults(A.empty<string>())).annotateKey({
      description: "An array of glob strings specifying files that should be excluded from the documentation.",
      default: [],
    }),
    parseCompilerOptions: CompilerOptions.withKeyDefaults("tsconfig for parsing options (or path to a tsconfig)"),
    examplesCompilerOptions: CompilerOptions.withKeyDefaults(
      "tsconfig for the examples options (or path to a tsconfig)"
    ),
  },
  $I.annote("ConfigurationShape", {
    description: "Configuration schema for @beep/repo-cli docgen",
  })
) {}

/**
 * Provides resolved DocgenV2 configuration to effectful command services.
 *
 * @category Services
 * @since 0.0.0
 */
export class Configuration extends ServiceMap.Service<Configuration, ConfigurationShape>()($I`Configuration`) {}
