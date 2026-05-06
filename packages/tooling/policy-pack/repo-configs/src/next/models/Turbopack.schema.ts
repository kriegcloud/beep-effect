/**
 * Schemas for Next.js Turbopack configuration.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $RepoConfigsId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoConfigsId.create("next/models/Turbopack.schema");

/**
 * JSON-compatible value accepted by Turbopack loader options.
 *
 * @example
 * ```ts
 * import { JSONValue } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const value = JSONValue.make({ enabled: true })
 * void value
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export type JSONValue = string | number | boolean | Array<JSONValue> | { [key: string]: JSONValue };
/**
 * JSON-compatible value schema accepted by Turbopack loader options.
 *
 * @example
 * ```ts
 * import { JSONValue } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const value = JSONValue.make({ enabled: true })
 * void value
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const JSONValue: S.Codec<JSONValue, JSONValue> = S.suspend(() =>
  S.Union([S.String, S.Number, S.Boolean, JSONValue.pipe(S.Array, S.mutable), S.Record(S.String, JSONValue)])
).pipe(
  $I.annoteSchema("JSONValue", {
    description: "JSON-compatible value accepted by Turbopack loader options.",
  })
);

/**
 * Record of Turbopack loader options.
 *
 * @example
 * ```ts
 * import { TurbopackLoaderOptions } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const options = TurbopackLoaderOptions.make({ flag: true })
 * void options
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurbopackLoaderOptions = S.Record(S.String, JSONValue).pipe(
  $I.annoteSchema("TurbopackLoaderOptions", {
    description: "Record of Turbopack loader options.",
  })
);

/**
 * Record of Turbopack loader options.
 *
 * @example
 * ```ts
 * import type { TurbopackLoaderOptions } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const options: TurbopackLoaderOptions = { flag: true }
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TurbopackLoaderOptions = typeof TurbopackLoaderOptions.Type;

/**
 * Loader entry accepted by a Turbopack rule.
 *
 * @example
 * ```ts
 * import { TurbopackLoaderItem } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const loader = TurbopackLoaderItem.make({ loader: "sass-loader" })
 * void loader
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurbopackLoaderItem = S.Union([
  S.String,
  S.Struct({
    loader: S.String,
    options: S.optionalKey(TurbopackLoaderOptions),
  }),
]).pipe(
  $I.annoteSchema("TurbopackLoaderItem", {
    description: "Loader entry accepted by a Turbopack rule.",
  })
);

/**
 * Loader entry accepted by a Turbopack rule.
 *
 * @example
 * ```ts
 * import type { TurbopackLoaderItem } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const loader: TurbopackLoaderItem = "sass-loader"
 * void loader
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TurbopackLoaderItem = typeof TurbopackLoaderItem.Type;

/**
 * Built-in Turbopack rule condition.
 *
 * @example
 * ```ts
 * import { TurbopackLoaderBuiltinCondition } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const condition = TurbopackLoaderBuiltinCondition.Enum.browser
 * void condition
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurbopackLoaderBuiltinCondition = LiteralKit([
  "browser",
  "foreign",
  "development",
  "production",
  "node",
  "edge-light",
] as const).pipe(
  $I.annoteSchema("TurbopackLoaderBuiltinCondition", {
    description: "Built-in Turbopack rule condition.",
  })
);

/**
 * Built-in Turbopack rule condition.
 *
 * @example
 * ```ts
 * import type { TurbopackLoaderBuiltinCondition } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const condition = "browser" satisfies TurbopackLoaderBuiltinCondition
 * void condition
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TurbopackLoaderBuiltinCondition = typeof TurbopackLoaderBuiltinCondition.Type;

/**
 * Recursive condition object used by Turbopack rules.
 *
 * @example
 * ```ts
 * import { TurbopackRuleCondition } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const condition = TurbopackRuleCondition.make({ all: ["browser"] })
 * void condition
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export type TurbopackRuleCondition =
  | { readonly all: Array<TurbopackRuleCondition> }
  | { readonly any: Array<TurbopackRuleCondition> }
  | { readonly not: TurbopackRuleCondition }
  | TurbopackLoaderBuiltinCondition
  | {
      readonly path?: string | RegExp;
      readonly content?: RegExp;
      readonly query?: string | RegExp;
      readonly contentType?: string | RegExp;
    };
/**
 * Recursive condition schema used by Turbopack rules.
 *
 * @example
 * ```ts
 * import { TurbopackRuleCondition } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const condition = TurbopackRuleCondition.make({ all: ["browser"] })
 * void condition
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurbopackRuleCondition: S.Codec<TurbopackRuleCondition, TurbopackRuleCondition> = S.suspend(() =>
  S.Union([
    S.Struct({ all: TurbopackRuleCondition.pipe(S.Array, S.mutable) }),
    S.Struct({ any: TurbopackRuleCondition.pipe(S.Array, S.mutable) }),
    S.Struct({ not: TurbopackRuleCondition }),
    TurbopackLoaderBuiltinCondition,
    S.Struct({
      path: S.optionalKey(S.Union([S.String, S.RegExp])),
      content: S.optionalKey(S.RegExp),
      query: S.optionalKey(S.Union([S.String, S.RegExp])),
      contentType: S.optionalKey(S.Union([S.String, S.RegExp])),
    }),
  ])
).pipe(
  $I.annoteSchema("TurbopackRuleCondition", {
    description: "Recursive condition object used by Turbopack rules.",
  })
);

/**
 * Module type used by Turbopack for matched files.
 *
 * @example
 * ```ts
 * import { TurbopackModuleType } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const type = TurbopackModuleType.Enum.ecmascript
 * void type
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurbopackModuleType = LiteralKit([
  "asset",
  "ecmascript",
  "typescript",
  "css",
  "css-module",
  "wasm",
  "raw",
  "node",
  "bytes",
  "text",
] as const).pipe(
  $I.annoteSchema("TurbopackModuleType", {
    description: "Module type used by Turbopack for matched files.",
    documentation: "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#module-types",
  })
);

/**
 * Module type used by Turbopack for matched files.
 *
 * @example
 * ```ts
 * import type { TurbopackModuleType } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const type = "text" satisfies TurbopackModuleType
 * void type
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TurbopackModuleType = typeof TurbopackModuleType.Type;

/**
 * Object-form Turbopack rule configuration.
 *
 * @example
 * ```ts
 * import { TurbopackRuleConfigItem } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const rule = TurbopackRuleConfigItem.make({ type: "text" })
 * void rule
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurbopackRuleConfigItem = S.Struct({
  loaders: S.optionalKey(
    TurbopackLoaderItem.pipe(S.Array, S.mutable, S.annotateKey({ description: "Loaders to apply." }))
  ),
  as: S.optionalKey(S.String.annotateKey({ description: "Rename the file extension for loader output." })),
  condition: S.optionalKey(
    TurbopackRuleCondition.annotateKey({ description: "Condition for when this rule applies." })
  ),
  type: S.optionalKey(
    TurbopackModuleType.annotateKey({ description: "Module type to use for matched files without a custom loader." })
  ),
}).pipe(
  $I.annoteSchema("TurbopackRuleConfigItem", {
    description: "Object-form Turbopack rule configuration.",
  })
);

/**
 * Object-form Turbopack rule configuration.
 *
 * @example
 * ```ts
 * import type { TurbopackRuleConfigItem } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const rule: TurbopackRuleConfigItem = { type: "text" }
 * void rule
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TurbopackRuleConfigItem = typeof TurbopackRuleConfigItem.Type;

/**
 * Turbopack rule configuration collection.
 *
 * @example
 * ```ts
 * import { TurbopackRuleConfigCollection } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const collection = TurbopackRuleConfigCollection.make([{ loader: "sass-loader" }])
 * void collection
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurbopackRuleConfigCollection = S.Union([
  TurbopackRuleConfigItem,
  S.Union([TurbopackLoaderItem, TurbopackRuleConfigItem]).pipe(S.Array, S.mutable),
]).pipe(
  $I.annoteSchema("TurbopackRuleConfigCollection", {
    description: "Turbopack rule configuration collection.",
  })
);

/**
 * Turbopack rule configuration collection.
 *
 * @example
 * ```ts
 * import type { TurbopackRuleConfigCollection } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const collection: TurbopackRuleConfigCollection = ["sass-loader"]
 * void collection
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TurbopackRuleConfigCollection = typeof TurbopackRuleConfigCollection.Type;

/**
 * Options for Turbopack in `next.config.js`.
 *
 * @example
 * ```ts
 * import { TurbopackOptions } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const options = TurbopackOptions.make({ root: process.cwd() })
 * void options
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurbopackOptions = S.Struct({
  resolveAlias: S.optionalKey(
    S.Record(
      S.String,
      S.Union([
        S.String,
        S.String.pipe(S.Array, S.mutable),
        S.Record(S.String, S.Union([S.String, S.String.pipe(S.Array, S.mutable)])),
      ])
    ).annotateKey({
      description: "Mapping of aliased imports to modules loaded in their place.",
      documentation: "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#resolving-aliases",
    })
  ),
  resolveExtensions: S.optionalKey(
    S.String.pipe(
      S.Array,
      S.mutable,
      S.annotateKey({
        description: "Extensions to resolve when importing files.",
        documentation:
          "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#resolving-custom-extensions",
      })
    )
  ),
  rules: S.optionalKey(
    S.Record(S.String, TurbopackRuleConfigCollection).annotateKey({
      description: "Webpack loaders to apply when running with Turbopack.",
      documentation:
        "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#configuring-webpack-loaders",
    })
  ),
  root: S.optionalKey(S.String.annotateKey({ description: "Repo root available for Turbopack resolution." })),
  debugIds: S.optionalKey(
    S.Boolean.annotateKey({ description: "Enables generation of debug IDs in JavaScript bundles and source maps." })
  ),
  ignoreIssue: S.optionalKey(
    S.Struct({
      path: S.Union([S.String, S.RegExp]),
      title: S.optionalKey(S.Union([S.String, S.RegExp])),
      description: S.optionalKey(S.Union([S.String, S.RegExp])),
    }).pipe(S.Array, S.mutable, S.annotateKey({ description: "Issue filter rules ignored by Turbopack." }))
  ),
}).pipe(
  $I.annoteSchema("TurbopackOptions", {
    description: "Options for Turbopack in next.config.js.",
  })
);

/**
 * Options for Turbopack in `next.config.js`.
 *
 * @example
 * ```ts
 * import type { TurbopackOptions } from "@beep/repo-configs/next/models/Turbopack.schema"
 *
 * const options: TurbopackOptions = { root: process.cwd() }
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TurbopackOptions = typeof TurbopackOptions.Type;
