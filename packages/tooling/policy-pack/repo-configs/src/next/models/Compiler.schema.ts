/**
 * Schemas for Next.js compiler and React compiler configuration.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $RepoConfigsId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { NextConfig as NextConfigFromNext } from "next";

const $I = $RepoConfigsId.create("next/models/Compiler.schema");

const StringArray = S.String.pipe(S.Array, S.mutable);
const StringTuple = S.mutable(S.Tuple([S.String, S.String]));
const UnknownRecord = S.Record(S.String, S.Unknown);

const isFunctionValue = <A extends Function>(value: unknown): value is A => P.isFunction(value);

const RunAfterProductionCompile = S.declare<
  NonNullable<NonNullable<NextConfigFromNext["compiler"]>["runAfterProductionCompile"]>
>(isFunctionValue, {
  expected: "Function",
  description: "Next.js compiler hook function.",
}).pipe(
  $I.annoteSchema("RunAfterProductionCompile", {
    description: "Hook function that runs after production build compilation finishes.",
  })
);

/**
 * Emotion compiler transform configuration.
 *
 * @example
 * ```ts
 * import { EmotionConfig } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const config = EmotionConfig.make({ sourceMap: true })
 * void config
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const EmotionConfig = S.Struct({
  sourceMap: S.optionalKey(S.Boolean),
  autoLabel: S.optionalKey(LiteralKit(["dev-only", "always", "never"] as const)),
  labelFormat: S.optionalKey(S.String),
  importMap: S.optionalKey(
    S.Record(
      S.String,
      S.Record(
        S.String,
        S.Struct({
          canonicalImport: S.optionalKey(StringTuple),
          styledBaseImport: S.optionalKey(StringTuple),
        })
      )
    )
  ),
}).pipe(
  $I.annoteSchema("EmotionConfig", {
    description: "Emotion compiler transform configuration.",
  })
);

/**
 * Emotion compiler transform configuration.
 *
 * @example
 * ```ts
 * import type { EmotionConfig } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const config: EmotionConfig = { autoLabel: "dev-only" }
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type EmotionConfig = typeof EmotionConfig.Type;

/**
 * Styled Components compiler transform configuration.
 *
 * @example
 * ```ts
 * import { StyledComponentsConfig } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const config = StyledComponentsConfig.make({ ssr: true })
 * void config
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const StyledComponentsConfig = S.Struct({
  displayName: S.optionalKey(S.Boolean),
  topLevelImportPaths: S.optionalKey(StringArray),
  ssr: S.optionalKey(S.Boolean),
  fileName: S.optionalKey(S.Boolean),
  meaninglessFileNames: S.optionalKey(StringArray),
  minify: S.optionalKey(S.Boolean),
  transpileTemplateLiterals: S.optionalKey(S.Boolean),
  namespace: S.optionalKey(S.String),
  pure: S.optionalKey(S.Boolean),
  cssProp: S.optionalKey(S.Boolean),
}).pipe(
  $I.annoteSchema("StyledComponentsConfig", {
    description: "Styled Components compiler transform configuration.",
  })
);

/**
 * Styled Components compiler transform configuration.
 *
 * @example
 * ```ts
 * import type { StyledComponentsConfig } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const config: StyledComponentsConfig = { ssr: true }
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type StyledComponentsConfig = typeof StyledComponentsConfig.Type;

/**
 * React Compiler options supported by Next.js.
 *
 * @example
 * ```ts
 * import { ReactCompilerOptions } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const config = ReactCompilerOptions.make({ compilationMode: "infer" })
 * void config
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ReactCompilerOptions = S.Struct({
  compilationMode: S.optionalKey(LiteralKit(["infer", "annotation", "all"] as const)),
  panicThreshold: S.optionalKey(LiteralKit(["none", "critical_errors", "all_errors"] as const)),
}).pipe(
  $I.annoteSchema("ReactCompilerOptions", {
    description: "React Compiler options supported by Next.js.",
    documentation: "https://react.dev/reference/react-compiler/configuration",
  })
);

/**
 * React Compiler options supported by Next.js.
 *
 * @example
 * ```ts
 * import type { ReactCompilerOptions } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const config: ReactCompilerOptions = { panicThreshold: "none" }
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ReactCompilerOptions = typeof ReactCompilerOptions.Type;

/**
 * Next.js compiler configuration block.
 *
 * @example
 * ```ts
 * import { CompilerConfig } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const config = CompilerConfig.make({ removeConsole: true })
 * void config
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const CompilerConfig = S.Struct({
  reactRemoveProperties: S.optionalKey(
    S.Union([S.Boolean, S.Struct({ properties: S.optionalKey(StringArray) })]).annotateKey({
      description: "Compiler transform that removes selected React properties.",
    })
  ),
  relay: S.optionalKey(
    S.Struct({
      src: S.String,
      artifactDirectory: S.optionalKey(S.String),
      language: S.optionalKey(LiteralKit(["typescript", "javascript", "flow"] as const)),
      eagerEsModules: S.optionalKey(S.Boolean),
    }).annotateKey({ description: "Relay compiler transform configuration." })
  ),
  removeConsole: S.optionalKey(
    S.Union([S.Boolean, S.Struct({ exclude: S.optionalKey(StringArray) })]).annotateKey({
      description: "Compiler transform that removes console calls.",
    })
  ),
  styledComponents: S.optionalKey(S.Union([S.Boolean, StyledComponentsConfig])),
  emotion: S.optionalKey(S.Union([S.Boolean, EmotionConfig])),
  styledJsx: S.optionalKey(S.Union([S.Boolean, S.Struct({ useLightningcss: S.optionalKey(S.Boolean) })])),
  define: S.optionalKey(S.Record(S.String, S.Union([S.String, S.Number, S.Boolean]))),
  defineServer: S.optionalKey(S.Record(S.String, S.Union([S.String, S.Number, S.Boolean]))),
  runAfterProductionCompile: S.optionalKey(RunAfterProductionCompile),
}).pipe(
  $I.annoteSchema("CompilerConfig", {
    description: "Next.js compiler configuration block.",
  })
);

/**
 * Next.js compiler configuration block.
 *
 * @example
 * ```ts
 * import type { CompilerConfig } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const config: CompilerConfig = { removeConsole: { exclude: ["error"] } }
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type CompilerConfig = typeof CompilerConfig.Type;

/**
 * Sass options passed through to Next.js.
 *
 * @example
 * ```ts
 * import { SassOptions } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const options = SassOptions.make({ implementation: "sass" })
 * void options
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const SassOptions = S.StructWithRest(
  S.Struct({
    implementation: S.optionalKey(S.String),
  }),
  [UnknownRecord]
).pipe(
  $I.annoteSchema("SassOptions", {
    description: "Sass options passed through to Next.js.",
  })
);

/**
 * Sass options passed through to Next.js.
 *
 * @example
 * ```ts
 * import type { SassOptions } from "@beep/repo-configs/next/models/Compiler.schema"
 *
 * const options: SassOptions = { implementation: "sass" }
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SassOptions = typeof SassOptions.Type;
