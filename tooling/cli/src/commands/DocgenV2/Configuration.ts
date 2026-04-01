/**
 *
 *
 * @module @beep/repo-cli/commands/DocgenV2/Configuration
 * @since 0.0.0
 */

import {$RepoCliId} from "@beep/identity/packages";

import {SchemaUtils} from "@beep/schema";
import {A} from "@beep/utils";
import {ServiceMap} from "effect";
import * as S from "effect/Schema";
const $I = $RepoCliId.create("commands/DocgenV2/Configuration");

const CompilerOptions = S.Union([
  S.String,
  S.Record(
    S.String,
    S.Unknown
  )
])
  .pipe(
    SchemaUtils.withStatics((schema) => {
      const defaultValue = schema.makeUnsafe({
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        moduleResolution: "Bundler",
        target: "ES2022",
        lib: [
          "ES2022",
          "DOM"
        ],
      });
      return {
        defaultValue,
        withKeyDefaults: (description: string) =>
          schema.pipe(SchemaUtils.withKeyDefaults(defaultValue))
            .annotateKey({
              description,
              default: defaultValue,
            }),
      };
    }),
    $I.annoteSchema(
      "CompilerOptions",
      {
        description: "TSConfig compiler options",
      }
    )
  );

export type CompilerOptions = typeof CompilerOptions.Type;

/**
 * @category Configuration
 * @since 0.0.0
 */
export class ConfigurationShape extends S.Class<ConfigurationShape>($I`ConfigurationShape`)(
  {
    $schema: S.OptionFromOptionalKey(S.String),
    projectHomepage: S.OptionFromOptionalKey(S.String)
      .annotateKey({
        description: "Will link to the project homepage from the Auxiliary Links of the generated documentation.",
      }),
    srcDir: S.String.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults("src")
    )
      .annotateKey({
        description: "The directory in which docgen will search for TypeScript" + " files to parse.",
        default: "src",
      }),
    outDir: S.String.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults("docs")
    )
      .annotateKey({
        description: "The directory to which docgen will generate its output markdown documents.",
        default: "docs",
      }),
    theme: S.String.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults("kriegcloud/just-the-docs")
    )
      .annotateKey({
        description:
          "The theme that docgen will specify should be used for GitHub Docs in the generated _config.yml file.",
        default: "kriegcloud/just-the-docs",
      }),
    enableSearch: S.Boolean.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults(true)
    )
      .annotateKey({
        description: "Whether or not search should be enabled for GitHub Docs in the generated _config.yml file.",
        default: true,
      }),
    enforceDescriptions: S.Boolean.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults(false)
    )
      .annotateKey({
        description: "Whether or not descriptions for each module export should be required.",
        default: false,
      }),
    enforceExamples: S.Boolean.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults(false)
    )
      .annotateKey({
        description:
          "Whether or not @example tags for each module export should be required. (Note: examples will not be enforced in module documentation)",
        default: false,
      }),
    enforceVersion: S.Boolean.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults(true)
    )
      .annotateKey({
        description: "Whether or not @since tags for each module export should be required.",
        default: true,
      }),
    exclude: S.String.pipe(
      S.Array,
      S.optionalKey,
      SchemaUtils.withKeyDefaults(A.empty<string>())
    )
      .annotateKey({
        description: "An array of glob strings specifying files that should be excluded from the documentation.",
        default: [],
      }),
    parseCompilerOptions: CompilerOptions.withKeyDefaults("tsconfig for parsing options (or path to a tsconfig)"),
    examplesCompilerOptions: CompilerOptions.withKeyDefaults(
      "tsconfig for the examples options (or path to a tsconfig)"
    ),
  },
  $I.annote(
    "ConfigurationShape",
    {
      description: "Configuration schema for @beep/repo-cli docgen",
    }
  )
) {
}

export class ConfigurationService extends ServiceMap.Service<ConfigurationService, ConfigurationShape>()(
  $I`Configuration`
) {
}
