/**
 * Configuration loading and service wiring for docgen.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoDocgenId } from "@beep/identity/packages";
import { decodeTSConfigFromJsoncTextEffect, TSConfigCompilerOptions } from "@beep/repo-utils";
import { A } from "@beep/utils";
import { Context, Effect, FileSystem, Layer, Path, pipe } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as jsonc from "jsonc-parser";
import * as Domain from "./Domain.js";

const $I = $RepoDocgenId.create("Configuration");

/**
 * Default Jekyll remote theme used when neither CLI flags nor `docgen.json` provide one.
 *
 * @example
 * ```ts
 * import { DEFAULT_THEME } from "@beep/repo-docgen/Configuration"
 *
 * const configLine = `remote_theme: ${DEFAULT_THEME}`
 * console.log(configLine)
 * ```
 * @category configuration
 * @since 0.0.0
 */
// cspell:ignore mikearnaldi
export const DEFAULT_THEME = "mikearnaldi/just-the-docs";

const PACKAGE_JSON_FILE_NAME = "package.json";
const CONFIG_FILE_NAME = "docgen.json";

const CompilerOptionsShape = S.toEncoded(TSConfigCompilerOptions);
const CompilerOptionsSchema = S.Union([S.String, CompilerOptionsShape]);
const encodeCompilerOptions = S.encodeEffect(TSConfigCompilerOptions);
const isStringArray = (value: unknown): value is ReadonlyArray<string> =>
  A.isArray(value) && A.every(value, P.isString);

/**
 * Schema for the optional package-local `docgen.json` document.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ConfigurationSchema } from "@beep/repo-docgen/Configuration"
 *
 * const decode = S.decodeUnknownSync(ConfigurationSchema)
 * const config = decode({
 *   outDir: "docs",
 *   enforceExamples: true,
 *   include: ["src/Parser.ts"]
 * })
 *
 * console.log(config.include)
 * ```
 * @category configuration
 * @since 0.0.0
 */
export class ConfigurationSchema extends S.Class<ConfigurationSchema>($I`ConfigurationSchema`)({
  $schema: S.optionalKey(S.String),
  enableSearch: S.optionalKey(S.Boolean),
  enforceDescriptions: S.optionalKey(S.Boolean),
  enforceExamples: S.optionalKey(S.Boolean),
  enforceVersion: S.optionalKey(S.Boolean),
  examplesCompilerOptions: S.optionalKey(CompilerOptionsSchema),
  exclude: S.Array(S.String).pipe(S.optionalKey),
  include: S.Array(S.String).pipe(S.optionalKey),
  outDir: S.optionalKey(S.String),
  parseCompilerOptions: S.optionalKey(CompilerOptionsSchema),
  projectHomepage: S.optionalKey(S.String),
  runExamples: S.optionalKey(S.Boolean),
  srcDir: S.optionalKey(S.String),
  srcLink: S.optionalKey(S.String),
  theme: S.optionalKey(S.String),
  tscExecutable: S.optionalKey(S.String),
}) {}

/**
 * Runtime type for decoded `docgen.json` configuration documents.
 *
 * @example
 * ```ts
 * import type { ConfigurationDocument } from "@beep/repo-docgen/Configuration"
 *
 * const document: ConfigurationDocument = {
 *   enforceVersion: true,
 *   srcDir: "src"
 * }
 *
 * console.log(document.srcDir)
 * ```
 * @category configuration
 * @since 0.0.0
 */
export type ConfigurationDocument = ConfigurationSchema;

/**
 * Fully resolved configuration values used by the parser, example checker, and printer.
 *
 * @example
 * ```ts
 * import {
 *   DEFAULT_THEME,
 *   ConfigurationShape,
 *   defaultCompilerOptions
 * } from "@beep/repo-docgen/Configuration"
 *
 * const config = ConfigurationShape.make({
 *   enableSearch: true,
 *   enforceDescriptions: false,
 *   enforceExamples: true,
 *   enforceVersion: true,
 *   examplesCompilerOptions: defaultCompilerOptions,
 *   exclude: [],
 *   include: ["src/index.ts"],
 *   outDir: "docs",
 *   parseCompilerOptions: defaultCompilerOptions,
 *   projectHomepage: "https://github.com/beep-effect/beep-effect",
 *   projectName: "@beep/repo-docgen",
 *   runExamples: false,
 *   srcDir: "src",
 *   srcLink: "https://github.com/beep-effect/beep-effect/blob/main/packages/tooling/tool/docgen/src",
 *   theme: DEFAULT_THEME,
 *   tscExecutable: "tsc"
 * })
 *
 * console.log(config.include)
 * ```
 * @category configuration
 * @since 0.0.0
 */
export class ConfigurationShape extends S.Class<ConfigurationShape>($I`ConfigurationShape`)({
  enableSearch: S.Boolean,
  enforceDescriptions: S.Boolean,
  enforceExamples: S.Boolean,
  enforceVersion: S.Boolean,
  examplesCompilerOptions: CompilerOptionsShape,
  exclude: S.Array(S.String),
  include: S.Array(S.String),
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
 * Runtime configuration service consumed by docgen parsing, checking, and printing effects.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import {
 *   DEFAULT_THEME,
 *   Configuration,
 *   ConfigurationShape,
 *   defaultCompilerOptions
 * } from "@beep/repo-docgen/Configuration"
 *
 * const config = ConfigurationShape.make({
 *   enableSearch: true,
 *   enforceDescriptions: false,
 *   enforceExamples: true,
 *   enforceVersion: true,
 *   examplesCompilerOptions: defaultCompilerOptions,
 *   exclude: [],
 *   include: [],
 *   outDir: "docs",
 *   parseCompilerOptions: defaultCompilerOptions,
 *   projectHomepage: "https://github.com/beep-effect/beep-effect",
 *   projectName: "@beep/repo-docgen",
 *   runExamples: false,
 *   srcDir: "src",
 *   srcLink: "https://github.com/beep-effect/beep-effect/blob/main/packages/tooling/tool/docgen/src",
 *   theme: DEFAULT_THEME,
 *   tscExecutable: "tsc"
 * })
 *
 * const projectName = Effect.runSync(
 *   Effect.gen(function* () {
 *     const configuration = yield* Configuration
 *     return configuration.projectName
 *   }).pipe(Effect.provide(Configuration.layer(config)))
 * )
 *
 * console.log(projectName)
 * ```
 * @category services
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
 * import type { CompilerOptionsInput } from "@beep/repo-docgen/Configuration"
 *
 * const inlineOptions: CompilerOptionsInput = {
 *   moduleResolution: "bundler",
 *   noEmit: true,
 *   strict: true,
 *   target: "es2022"
 * }
 * const tsconfigPath: CompilerOptionsInput = "tsconfig.json"
 *
 * console.log([inlineOptions.moduleResolution, tsconfigPath])
 * ```
 * @category configuration
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
  readonly include: O.Option<ReadonlyArray<string>>;
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
 * import { defaultCompilerOptions } from "@beep/repo-docgen/Configuration"
 *
 * console.log(defaultCompilerOptions.moduleResolution)
 * ```
 * @category configuration
 * @since 0.0.0
 */
export const defaultCompilerOptions = {
  lib: ["ES2022", "DOM"],
  moduleResolution: "bundler",
  noEmit: true,
  skipLibCheck: true,
  strict: true,
  target: "es2022",
} as const satisfies S.Schema.Type<typeof CompilerOptionsShape>;

class PackageJsonSchema extends S.Class<PackageJsonSchema>($I`PackageJsonSchema`)({
  homepage: S.String,
  name: S.String,
}) {}

const readJsoncFile = <Schema extends S.ConstraintDecoder<unknown, never>>(
  filePath: string,
  schema: Schema
): Effect.Effect<S.Schema.Type<Schema>, Domain.DocgenError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFileString(filePath).pipe(
      Effect.mapError((cause) =>
        Domain.DocgenError.make({
          message: `[Configuration.readJsoncFile] Failed to read '${filePath}'\n${String(cause)}`,
        })
      )
    );

    const parsed = yield* Effect.try({
      catch: (cause) =>
        Domain.DocgenError.make({
          message: `[Configuration.readJsoncFile] Failed to parse '${filePath}'\n${String(cause)}`,
        }),
      try: () => jsonc.parse(content),
    });

    return yield* S.decodeUnknownEffect(schema)(parsed).pipe(
      Effect.mapError((cause) =>
        Domain.DocgenError.make({
          message: `[Configuration.readJsoncFile] Failed to decode '${filePath}'\n${String(cause)}`,
        })
      )
    );
  }) as Effect.Effect<S.Schema.Type<Schema>, Domain.DocgenError, FileSystem.FileSystem>;

const readPackageJson = (filePath: string) => readJsoncFile(filePath, PackageJsonSchema);

const readDocgenConfig = Effect.fn("Configuration.readDocgenConfig")(function* (
  filePath: string
): Effect.fn.Return<O.Option<ConfigurationDocument>, Domain.DocgenError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const exists = yield* fs.exists(filePath).pipe(
    Effect.mapError((cause) =>
      Domain.DocgenError.make({
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

const readTSConfig = Effect.fn("Configuration.readTSConfig")(function* (
  fileName: string
): Effect.fn.Return<
  S.Schema.Type<typeof CompilerOptionsShape>,
  Domain.DocgenError,
  FileSystem.FileSystem | Path.Path | Domain.Process
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const process = yield* Domain.Process;
  const cwd = yield* process.cwd;
  const resolved = path.resolve(cwd, fileName);
  const content = yield* fs.readFileString(resolved).pipe(
    Effect.mapError((cause) =>
      Domain.DocgenError.make({
        message: `[Configuration.readTSConfig] Failed to read TSConfig file '${resolved}'\n${String(cause)}`,
      })
    )
  );
  const tsconfig = yield* decodeTSConfigFromJsoncTextEffect(content).pipe(
    Effect.mapError((cause) =>
      Domain.DocgenError.make({
        message: `[Configuration.readTSConfig] Failed to decode TSConfig file '${resolved}'\n${cause.message}`,
      })
    )
  );
  if (O.isNone(tsconfig.compilerOptions)) {
    return defaultCompilerOptions;
  }

  return yield* encodeCompilerOptions(tsconfig.compilerOptions.value).pipe(
    Effect.mapError((cause) =>
      Domain.DocgenError.make({
        message: `[Configuration.readTSConfig] Failed to encode compiler options from '${resolved}'\n${cause.message}`,
      })
    )
  );
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
 * @remarks
 * CLI options win over `docgen.json`; missing values fall back to package metadata and repo defaults.
 * Example compiler options are post-processed to allow generated imports and to disable unused checks.
 * @effects
 * - Reads `package.json`, optional `docgen.json`, and any referenced TSConfig file from the current package.
 * - Fails with `DocgenError` when JSONC parsing, schema decoding, or file access fails.
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as O from "effect/Option"
 * import { load } from "@beep/repo-docgen/Configuration"
 * const program = load({
 *   enableSearch: O.some(false),
 *   enforceDescriptions: O.none(),
 *   enforceExamples: O.some(true),
 *   enforceVersion: O.none(),
 *   examplesCompilerOptions: O.none(),
 *   exclude: O.none(),
 *   include: O.some(["src/Domain.ts"]),
 *   outDir: O.none(),
 *   parseCompilerOptions: O.none(),
 *   projectHomepage: O.none(),
 *   runExamples: O.none(),
 *   srcDir: O.none(),
 *   srcLink: O.none(),
 *   theme: O.none(),
 *   tscExecutable: O.none()
 * }).pipe(Effect.map((config) => config.include))
 * console.log(program)
 * ```
 * @category configuration
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
  const include = O.getOrElse(args.include, () => docgenConfig?.include ?? []);
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
    enableSearch,
    enforceDescriptions,
    enforceExamples,
    enforceVersion,
    examplesCompilerOptions,
    exclude,
    include,
    outDir,
    parseCompilerOptions,
    projectHomepage,
    projectName,
    runExamples,
    srcDir,
    srcLink,
    theme,
    tscExecutable,
  });
});

/**
 * Empty layer kept for upstream workflow parity while this port resolves configuration in {@link load}.
 *
 * @internal
 * @example
 * ```ts
 * import { Layer } from "effect"
 * import { configProviderLayer } from "@beep/repo-docgen/Configuration"
 *
 * const merged = Layer.mergeAll(configProviderLayer, Layer.empty)
 * console.log(merged)
 * ```
 * @category layers
 * @since 0.0.0
 */
export const configProviderLayer = Layer.empty;
