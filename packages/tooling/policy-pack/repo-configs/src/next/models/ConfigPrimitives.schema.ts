/**
 * Shared schemas for named Next.js configuration declarations.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $RepoConfigsId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoConfigsId.create("next/models/ConfigPrimitives.schema");

const StringArray = S.String.pipe(S.Array, S.mutable);
const RegExpArray = S.RegExp.pipe(S.Array, S.mutable);
const StringOrStringArray = S.Union([S.String, StringArray]);

/**
 * Locale-specific domain routing entry for Next.js internationalization.
 *
 * @example
 * ```ts
 * import { DomainLocale } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const locale = DomainLocale.make({
 *   defaultLocale: "en",
 *   domain: "example.com"
 * })
 * void locale
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const DomainLocale = S.Struct({
  defaultLocale: S.NonEmptyString.annotateKey({
    description: "Default locale served for the configured domain.",
  }),
  domain: S.NonEmptyString.annotateKey({
    description: "Domain name used for locale routing.",
  }),
  http: S.optionalKey(S.Literal(true).annotateKey({ description: "Whether the domain uses HTTP." })),
  locales: S.optionalKey(StringArray.annotateKey({ description: "Locales served for this domain." })),
}).pipe(
  $I.annoteSchema("DomainLocale", {
    description: "Locale-specific domain routing entry for Next.js internationalization.",
  })
);

/**
 * Locale-specific domain routing entry for Next.js internationalization.
 *
 * @example
 * ```ts
 * import type { DomainLocale } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const locale: DomainLocale = { defaultLocale: "en", domain: "example.com" }
 * void locale
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DomainLocale = typeof DomainLocale.Type;

/**
 * Internationalization configuration for a Next.js app.
 *
 * @example
 * ```ts
 * import { I18NConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const i18n = I18NConfig.make({
 *   defaultLocale: "en",
 *   locales: ["en", "es"]
 * })
 * void i18n
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const I18NConfig = S.Struct({
  defaultLocale: S.NonEmptyString.annotateKey({
    description: "Default locale for the application.",
    documentation: "https://nextjs.org/docs/advanced-features/i18n-routing",
  }),
  domains: S.optionalKey(
    DomainLocale.pipe(S.Array, S.mutable, S.annotateKey({ description: "Domain locale routing entries." }))
  ),
  localeDetection: S.optionalKey(S.Literal(false).annotateKey({ description: "Disables automatic locale detection." })),
  locales: StringArray.annotateKey({
    description: "Locales supported by the application.",
    documentation: "https://nextjs.org/docs/advanced-features/i18n-routing",
  }),
}).pipe(
  $I.annoteSchema("I18NConfig", {
    description: "Internationalization configuration for a Next.js app.",
    documentation: "https://nextjs.org/docs/advanced-features/i18n-routing",
  })
);

/**
 * Internationalization configuration for a Next.js app.
 *
 * @example
 * ```ts
 * import type { I18NConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const config: I18NConfig = { defaultLocale: "en", locales: ["en"] }
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type I18NConfig = typeof I18NConfig.Type;

/**
 * Next.js TypeScript configuration block.
 *
 * @example
 * ```ts
 * import { TypeScriptConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const config = TypeScriptConfig.make({ tsconfigPath: "tsconfig.next.json" })
 * void config
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TypeScriptConfig = S.Struct({
  ignoreBuildErrors: S.optionalKey(
    S.Boolean.annotateKey({ description: "Do not run TypeScript during production builds." })
  ),
  tsconfigPath: S.optionalKey(
    S.NonEmptyString.annotateKey({
      description: "Relative path to a custom tsconfig file.",
      documentation: "https://nextjs.org/docs/app/api-reference/config/typescript",
    })
  ),
}).pipe(
  $I.annoteSchema("TypeScriptConfig", {
    description: "Next.js TypeScript configuration block.",
  })
);

/**
 * Next.js TypeScript configuration block.
 *
 * @example
 * ```ts
 * import type { TypeScriptConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const config: TypeScriptConfig = { tsconfigPath: "tsconfig.next.json" }
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TypeScriptConfig = typeof TypeScriptConfig.Type;

/**
 * Route export path map entry query parameters.
 *
 * @example
 * ```ts
 * import { NextParsedUrlQuery } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const query = NextParsedUrlQuery.make({ slug: "hello" })
 * void query
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const NextParsedUrlQuery = S.Record(S.String, StringOrStringArray).pipe(
  $I.annoteSchema("NextParsedUrlQuery", {
    description: "Route export path map entry query parameters.",
  })
);

/**
 * Route export path map entry query parameters.
 *
 * @example
 * ```ts
 * import type { NextParsedUrlQuery } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const query: NextParsedUrlQuery = { slug: "hello" }
 * void query
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type NextParsedUrlQuery = typeof NextParsedUrlQuery.Type;

/**
 * Public export path map returned by `next.config.js` `exportPathMap`.
 *
 * @example
 * ```ts
 * import { ExportPathMap } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const paths = ExportPathMap.make({
 *   "/": { page: "/" }
 * })
 * void paths
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ExportPathMap = S.Record(
  S.String,
  S.Struct({
    page: S.String.annotateKey({ description: "Page route that should render this export path." }),
    query: S.optionalKey(NextParsedUrlQuery.annotateKey({ description: "Query parameters for the exported path." })),
  })
).pipe(
  $I.annoteSchema("ExportPathMap", {
    description: "Public export path map returned by next.config.js exportPathMap.",
  })
);

/**
 * Public export path map returned by `next.config.js` `exportPathMap`.
 *
 * @example
 * ```ts
 * import type { ExportPathMap } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const paths: ExportPathMap = { "/": { page: "/" } }
 * void paths
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ExportPathMap = typeof ExportPathMap.Type;

/**
 * Fetch logging configuration used by Next.js.
 *
 * @example
 * ```ts
 * import { LoggingConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const logging = LoggingConfig.make({ fetches: { fullUrl: true } })
 * void logging
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const LoggingConfig = S.Struct({
  fetches: S.optionalKey(
    S.Struct({
      fullUrl: S.optionalKey(S.Boolean.annotateKey({ description: "Log full fetch request URLs." })),
      hmrRefreshes: S.optionalKey(
        S.Boolean.annotateKey({
          description: "If true, fetch requests restored from the HMR cache are logged during an HMR refresh request.",
        })
      ),
    }).annotateKey({ description: "Fetch logging configuration." })
  ),
  incomingRequests: S.optionalKey(
    S.Union([
      S.Boolean,
      S.Struct({
        ignore: RegExpArray.annotateKey({
          description: "Regular expressions matching incoming requests that should not be logged.",
        }),
      }),
    ]).annotateKey({ description: "Incoming request logging configuration." })
  ),
  serverFunctions: S.optionalKey(
    S.Boolean.annotateKey({ description: "If false, Server Function invocation logging is disabled." })
  ),
  browserToTerminal: S.optionalKey(
    S.Union([S.Boolean, LiteralKit(["error", "warn"] as const)]).annotateKey({
      description: "Forward browser console logs to the terminal.",
    })
  ),
}).pipe(
  $I.annoteSchema("LoggingConfig", {
    description: "Logging configuration for Next.js.",
  })
);

/**
 * Fetch logging configuration used by Next.js.
 *
 * @example
 * ```ts
 * import type { LoggingConfig } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const logging: LoggingConfig = { serverFunctions: false }
 * void logging
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LoggingConfig = typeof LoggingConfig.Type;

/**
 * Lightning CSS feature name accepted by Next.js.
 *
 * @example
 * ```ts
 * import { LightningCssFeature } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const feature = LightningCssFeature.Enum.nesting
 * void feature
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const LightningCssFeature = LiteralKit([
  "nesting",
  "not-selector-list",
  "dir-selector",
  "lang-selector-list",
  "is-selector",
  "text-decoration-thickness-percent",
  "media-interval-syntax",
  "media-range-syntax",
  "custom-media-queries",
  "clamp-function",
  "color-function",
  "oklab-colors",
  "lab-colors",
  "p3-colors",
  "hex-alpha-colors",
  "space-separated-color-notation",
  "font-family-system-ui",
  "double-position-gradients",
  "vendor-prefixes",
  "logical-properties",
  "light-dark",
  "selectors",
  "media-queries",
  "colors",
] as const).pipe(
  $I.annoteSchema("LightningCssFeature", {
    description: "Lightning CSS feature name accepted by Next.js.",
  })
);

/**
 * Lightning CSS feature name accepted by Next.js.
 *
 * @example
 * ```ts
 * import type { LightningCssFeature } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const feature = "nesting" satisfies LightningCssFeature
 * void feature
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LightningCssFeature = typeof LightningCssFeature.Type;

/**
 * Lightning CSS include/exclude feature configuration.
 *
 * @example
 * ```ts
 * import { LightningCssFeatures } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const features = LightningCssFeatures.make({ include: ["nesting"] })
 * void features
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const LightningCssFeatures = S.Struct({
  include: S.optionalKey(
    LightningCssFeature.pipe(
      S.Array,
      S.mutable,
      S.annotateKey({ description: "Lightning CSS features to always include." })
    )
  ),
  exclude: S.optionalKey(
    LightningCssFeature.pipe(
      S.Array,
      S.mutable,
      S.annotateKey({ description: "Lightning CSS features to always exclude." })
    )
  ),
}).pipe(
  $I.annoteSchema("LightningCssFeatures", {
    description: "Lightning CSS include/exclude feature configuration.",
  })
);

/**
 * Lightning CSS include/exclude feature configuration.
 *
 * @example
 * ```ts
 * import type { LightningCssFeatures } from "@beep/repo-configs/next/models/ConfigPrimitives.schema"
 *
 * const features: LightningCssFeatures = { exclude: ["colors"] }
 * void features
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LightningCssFeatures = typeof LightningCssFeatures.Type;
