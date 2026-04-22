/**
 * Configuration loading and service wiring for docgen.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DocgenId } from "@beep/identity/packages";
import { decodeTSConfigFromJsoncTextEffect, TSConfigCompilerOptions } from "@beep/repo-utils";
import { Context, Effect, FileSystem, Layer, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as jsonc from "jsonc-parser";
import * as Domain from "./Domain.js";

const $I = $DocgenId.create("Configuration");

/**
 * Default Jekyll theme used when docgen does not receive an explicit theme override.
 *
 * @example
 * ```ts
 * import { DEFAULT_THEME } from "@beep/docgen/Configuration"
 * void DEFAULT_THEME
 * ```
 * @category service
 * @since 0.0.0
 */
// cspell:ignore mikearnaldi
export const DEFAULT_THEME = "mikearnaldi/just-the-docs";

const PACKAGE_JSON_FILE_NAME = "package.json";
const CONFIG_FILE_NAME = "docgen.json";

const CompilerOptionsShape = S.toEncoded(TSConfigCompilerOptions);
const CompilerOptionsSchema = S.Union([S.String, CompilerOptionsShape]);
const encodeCompilerOptions = S.encodeSync(TSConfigCompilerOptions);
const isStringArray = (value: unknown): value is ReadonlyArray<string> =>
  A.isArray(value) && A.every(value, P.isString);

/**
 * Schema describing the optional `docgen.json` configuration document.
 *
 * @example
 * ```ts
 * import { ConfigurationSchema } from "@beep/docgen/Configuration"
 * void ConfigurationSchema
 * ```
 * @category service
 * @since 0.0.0
 */
export class ConfigurationSchema extends S.Class<ConfigurationSchema>($I`ConfigurationSchema`)({
  $schema: S.optionalKey(S.String),
  projectHomepage: S.optionalKey(S.String),
  srcLink: S.optionalKey(S.String),
  srcDir: S.optionalKey(S.String),
  outDir: S.optionalKey(S.String),
  theme: S.optionalKey(S.String),
  enableSearch: S.optionalKey(S.Boolean),
  enforceDescriptions: S.optionalKey(S.Boolean),
  enforceExamples: S.optionalKey(S.Boolean),
  enforceVersion: S.optionalKey(S.Boolean),
  tscExecutable: S.optionalKey(S.String),
  runExamples: S.optionalKey(S.Boolean),
  exclude: S.Array(S.String).pipe(S.optionalKey),
  parseCompilerOptions: S.optionalKey(CompilerOptionsSchema),
  examplesCompilerOptions: S.optionalKey(CompilerOptionsSchema),
}) {}

/**
 * Runtime type for decoded `docgen.json` configuration documents.
 *
 * @example
 * ```ts
 * import type { ConfigurationDocument } from "@beep/docgen/Configuration"
 * type ExampleConfigurationDocument = ConfigurationDocument
 * ```
 * @category service
 * @since 0.0.0
 */
export type ConfigurationDocument = typeof ConfigurationSchema.Type;

/**
 * Fully resolved configuration values used while docgen executes.
 *
 * @example
 * ```ts
 * import { ConfigurationShape } from "@beep/docgen/Configuration"
 * void ConfigurationShape
 * ```
 * @category service
 * @since 0.0.0
 */
export class ConfigurationShape extends S.Class<ConfigurationShape>($I`ConfigurationShape`)({
  enableSearch: S.Boolean,
  enforceDescriptions: S.Boolean,
  enforceExamples: S.Boolean,
  enforceVersion: S.Boolean,
  examplesCompilerOptions: CompilerOptionsShape,
  exclude: S.Array(S.String),
  outDir: S.String,
  parseCompilerOptions: CompilerOptionsShape,
  projectHomepage: S.String,
  projectName: S.String,
  runExamples: S.Boolean,
  srcDir: S.String,
  srcLink: S.String,
  theme: S.String,
  tscExecutable: S.String,
}) {}

/**
 * Runtime configuration service for docgen command execution.
 *
 * @example
 * ```ts
 * import { Configuration } from "@beep/docgen/Configuration"
 * void Configuration
 * ```
 * @category service
 * @since 0.0.0
 */
export class Configuration extends Context.Service<Configuration, ConfigurationShape>()($I`Configuration`) {
  /**
   * Creates a layer that provides the current docgen configuration.
   *
   * @param config - Resolved configuration values to expose.
   * @returns Layer providing the {@link Configuration} service.
   */
  static layer(config: ConfigurationShape) {
    return Layer.succeed(Configuration, Configuration.of(config));
  }
}

/**
 * Accepted CLI or config-file input for compiler options.
 *
 * @example
 * ```ts
 * import type { CompilerOptionsInput } from "@beep/docgen/Configuration"
 * type ExampleCompilerOptionsInput = CompilerOptionsInput
 * ```
 * @category service
 * @since 0.0.0
 */
export type CompilerOptionsInput = string | S.Schema.Type<typeof CompilerOptionsShape>;

/**
 * @internal
 */
type LoadArgs = {
  readonly enableSearch: O.Option<boolean>;
  readonly enforceDescriptions: O.Option<boolean>;
  readonly enforceExamples: O.Option<boolean>;
  readonly enforceVersion: O.Option<boolean>;
  readonly examplesCompilerOptions: O.Option<CompilerOptionsInput>;
  readonly exclude: O.Option<ReadonlyArray<string>>;
  readonly outDir: O.Option<string>;
  readonly parseCompilerOptions: O.Option<CompilerOptionsInput>;
  readonly projectHomepage: O.Option<string>;
  readonly runExamples: O.Option<boolean>;
  readonly srcDir: O.Option<string>;
  readonly srcLink: O.Option<string>;
  readonly theme: O.Option<string>;
  readonly tscExecutable: O.Option<string>;
};

/**
 * Default compiler options used when no explicit parse configuration is provided.
 *
 * @internal
 * @example
 * ```ts
 * import { defaultCompilerOptions } from "@beep/docgen/Configuration"
 * void defaultCompilerOptions
 * ```
 * @category service
 * @since 0.0.0
 */
export const defaultCompilerOptions = {
  noEmit: true,
  strict: true,
  skipLibCheck: true,
  moduleResolution: "bundler",
  target: "es2022",
  lib: ["ES2022", "DOM"],
} as const satisfies S.Schema.Type<typeof CompilerOptionsShape>;

class PackageJsonSchema extends S.Class<PackageJsonSchema>($I`PackageJsonSchema`)({
  name: S.String,
  homepage: S.String,
}) {}

const readJsoncFile = <Schema extends S.Decoder<unknown, never>>(
  filePath: string,
  schema: Schema
): Effect.Effect<S.Schema.Type<Schema>, Domain.DocgenError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFileString(filePath).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Configuration.readJsoncFile] Failed to read '${filePath}'\n${String(cause)}`,
          })
      )
    );

    const parsed = yield* Effect.try({
      try: () => jsonc.parse(content),
      catch: (cause) =>
        new Domain.DocgenError({
          message: `[Configuration.readJsoncFile] Failed to parse '${filePath}'\n${String(cause)}`,
        }),
    });

    return yield* S.decodeUnknownEffect(schema)(parsed).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Configuration.readJsoncFile] Failed to decode '${filePath}'\n${String(cause)}`,
          })
      )
    );
  }) as Effect.Effect<S.Schema.Type<Schema>, Domain.DocgenError, FileSystem.FileSystem>;

const readPackageJson = (filePath: string) => readJsoncFile(filePath, PackageJsonSchema);

const readDocgenConfig = (
  filePath: string
): Effect.Effect<O.Option<ConfigurationDocument>, Domain.DocgenError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(filePath).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Configuration.readDocgenConfig] Failed to check '${filePath}'\n${String(cause)}`,
          })
      )
    );

    if (!exists) {
      return O.none();
    }

    const config = yield* readJsoncFile(filePath, ConfigurationSchema);
    return O.some(config);
  });

const readTSConfig = (
  fileName: string
): Effect.Effect<
  S.Schema.Type<typeof CompilerOptionsShape>,
  Domain.DocgenError,
  FileSystem.FileSystem | Path.Path | Domain.Process
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const process = yield* Domain.Process;
    const cwd = yield* process.cwd;
    const resolved = path.resolve(cwd, fileName);
    const content = yield* fs.readFileString(resolved).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Configuration.readTSConfig] Failed to read TSConfig file '${resolved}'\n${String(cause)}`,
          })
      )
    );
    const tsconfig = yield* decodeTSConfigFromJsoncTextEffect(content).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Configuration.readTSConfig] Failed to decode TSConfig file '${resolved}'\n${cause.message}`,
          })
      )
    );
    return O.match(tsconfig.compilerOptions, {
      onNone: () => defaultCompilerOptions,
      onSome: encodeCompilerOptions,
    });
  });

const resolveCompilerOptions = (
  fromCLI: O.Option<CompilerOptionsInput>,
  fromDocgenJson: O.Option<CompilerOptionsInput>
): Effect.Effect<
  S.Schema.Type<typeof CompilerOptionsShape>,
  Domain.DocgenError,
  FileSystem.FileSystem | Path.Path | Domain.Process
> => {
  const resolved = O.orElse(fromCLI, () => fromDocgenJson);

  if (O.isNone(resolved)) {
    return Effect.succeed(defaultCompilerOptions);
  }

  return P.isString(resolved.value) ? readTSConfig(resolved.value) : Effect.succeed(resolved.value);
};

const resolveString = (fromCLI: O.Option<string>, fromDocgenJson: O.Option<string>, fallback: string): string =>
  O.getOrElse(
    O.orElse(fromCLI, () => fromDocgenJson),
    () => fallback
  );

const resolveBoolean = (fromCLI: O.Option<boolean>, fromDocgenJson: O.Option<boolean>, fallback: boolean): boolean =>
  O.getOrElse(
    O.orElse(fromCLI, () => fromDocgenJson),
    () => fallback
  );

/**
 * Loads and resolves the effective docgen configuration from CLI input and repo files.
 *
 * @internal
 * @param args - CLI-sourced configuration overrides.
 * @returns Effect that resolves the effective docgen configuration service value.
 * @example
 * ```ts
 * import { load } from "@beep/docgen/Configuration"
 * void load
 * ```
 * @category service
 * @since 0.0.0
 */
export const load = Effect.fn("load")(function* (args: LoadArgs) {
  const process = yield* Domain.Process;
  const cwd = yield* process.cwd;
  const path = yield* Path.Path;

  const packageJson = yield* readPackageJson(path.join(cwd, PACKAGE_JSON_FILE_NAME));
  const maybeConfig = yield* readDocgenConfig(path.join(cwd, CONFIG_FILE_NAME));
  const docgenConfig = O.getOrUndefined(maybeConfig);

  const projectName = packageJson.name;
  const projectHomepage = resolveString(
    args.projectHomepage,
    O.fromNullishOr(docgenConfig?.projectHomepage),
    packageJson.homepage
  );
  const srcLink = resolveString(
    args.srcLink,
    O.fromNullishOr(docgenConfig?.srcLink),
    `${projectHomepage}/blob/main/src/`
  );
  const srcDir = resolveString(args.srcDir, O.fromNullishOr(docgenConfig?.srcDir), "src");
  const outDir = resolveString(args.outDir, O.fromNullishOr(docgenConfig?.outDir), "docs");
  const theme = resolveString(args.theme, O.fromNullishOr(docgenConfig?.theme), DEFAULT_THEME);
  const enableSearch = resolveBoolean(args.enableSearch, O.fromNullishOr(docgenConfig?.enableSearch), true);
  const enforceDescriptions = resolveBoolean(
    args.enforceDescriptions,
    O.fromNullishOr(docgenConfig?.enforceDescriptions),
    false
  );
  const enforceExamples = resolveBoolean(args.enforceExamples, O.fromNullishOr(docgenConfig?.enforceExamples), false);
  const enforceVersion = resolveBoolean(args.enforceVersion, O.fromNullishOr(docgenConfig?.enforceVersion), true);
  const tscExecutable = resolveString(args.tscExecutable, O.fromNullishOr(docgenConfig?.tscExecutable), "tsc");
  const runExamples = resolveBoolean(args.runExamples, O.fromNullishOr(docgenConfig?.runExamples), false);
  const exclude = O.getOrElse(args.exclude, () => docgenConfig?.exclude ?? []);
  const parseCompilerOptions = yield* resolveCompilerOptions(
    args.parseCompilerOptions,
    O.fromNullishOr(docgenConfig?.parseCompilerOptions)
  );
  const resolvedExamplesCompilerOptions = yield* resolveCompilerOptions(
    args.examplesCompilerOptions,
    O.fromNullishOr(docgenConfig?.examplesCompilerOptions)
  );
  // Examples commonly include illustrative bindings that are intentionally unused.
  // Force-disable unused checks to keep docs validation focused on type correctness.
  const configuredExampleTypes: ReadonlyArray<string> = isStringArray(resolvedExamplesCompilerOptions.types)
    ? resolvedExamplesCompilerOptions.types
    : A.empty<string>();
  const exampleTypes: ReadonlyArray<string> = pipe(configuredExampleTypes, A.append("node"), A.append("bun"), A.dedupe);
  const examplesCompilerOptions = {
    ...resolvedExamplesCompilerOptions,
    allowImportingTsExtensions: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    types: exampleTypes,
  };

  return Configuration.of({
    projectName,
    projectHomepage,
    srcLink,
    srcDir,
    outDir,
    theme,
    enableSearch,
    enforceDescriptions,
    enforceExamples,
    enforceVersion,
    tscExecutable,
    runExamples,
    exclude,
    parseCompilerOptions,
    examplesCompilerOptions,
  });
});

/**
 * Present for upstream parity; the CLI merges configuration directly in `load`.
 *
 * @internal
 * @example
 * ```ts
 * import { configProviderLayer } from "@beep/docgen/Configuration"
 * void configProviderLayer
 * ```
 * @category service
 * @since 0.0.0
 */
export const configProviderLayer = Layer.empty;
