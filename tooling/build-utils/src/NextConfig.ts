import * as A from "effect/Array";
import type {NextConfig} from "next";
import * as TranspilePackages from "./transpile-packages.js";
import * as BunContext from "@effect/platform-bun/BunContext";
import {FsUtilsLive} from "@beep/tooling-utils/FsUtils";
import {constant} from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import {pipe, Layer, Effect, Config} from "effect";
import * as Str from "effect/String";
import * as R from "effect/Record";
import {findRepoRoot} from "@beep/tooling-utils/repo";
import * as HashSet from "effect/HashSet";
import type {
  ContentSecurityPolicyOption,
  ForceHTTPSRedirectOption,
  FrameGuardOption,
  NoopenOption,
  NosniffOption,
  PermittedCrossDomainPoliciesOption,
  XSSProtectionOption,
} from "./secure-headers/index.js";
import {createSecureHeaders, type CreateSecureHeadersOptions} from "./create-secure-headers.js";
import {withMDX} from "./mdx.js";
import {type BundleAnalyzerOptions, withBundleAnalyzer} from "./bundle-analyzer.js";
import {defaultCache, type PWAConfig} from "./pwa/index.js";
import {withPWA} from "./pwa/index.js";

const layer = Layer.provideMerge(
  BunContext.layer,
  FsUtilsLive,
);

const defaultOptimizeImports = HashSet.make(
  "@iconify/react",
  "@mui/x-date-pickers",
  "@mui/lab",
  "@mui/icons-material",
  "@mui/material",
  "@beep/ui",
  "@beep/ui-core",
  "react-phone-number-input",
  "@effect/platform",
  "@effect/opentelemetry",
);

/**
 * Default Content-Security-Policy directives.
 * These are hardcoded defaults that provide a secure baseline CSP configuration.
 */
const defaultCSPDirectives = {
  defaultSrc: "'self'",
  baseURI: "'self'",
  formAction: "'self'",
  scriptSrc: ["'self'", "blob:", "https://cdn.jsdelivr.net"],
  workerSrc: ["'self'", "blob:"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
  fontSrc: ["'self'", "https://fonts.scalar.com"],
  styleSrcElem: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://cdn.jsdelivr.net"],
  scriptSrcElem: [
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "blob:",
    "https://vercel.live",
    "https://www.gstatic.com",
    "https://cdn.jsdelivr.net",
    "https://www.google.com",
  ],
  connectSrc: [
    "'self'",
    "https://vercel.live/",
    "https://vercel.com",
    "ws:",
    "wss:",
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://localhost:*",
    "https://127.0.0.1:*",
    "ws://localhost:34437",
    "wss://localhost:34437",
    "http://localhost:4318",
    "http://127.0.0.1:4318",
    "https://www.google.com",
  ],
  mediaSrc: ["'self'", "data:"],
  frameAncestors: ["'self'", "https://www.google.com", "https://vercel.live", "https://vercel.com"],
  imgSrc: [
    "'self'",
    "https://www.google-analytics.com",
    "data:",
    "blob:",
    "https://purecatamphetamine.github.io",
    "https://lh3.googleusercontent.com",
  ],
  frameSrc: ["'self'", "https://vercel.live", "https://www.google.com", "https://vercel.com"],
} as const;

/**
 * Default secure header options following security best practices.
 * These defaults can be overridden or merged with user-provided options.
 */
const defaultSecureHeaders = {
  contentSecurityPolicy: {
    directives: defaultCSPDirectives,
  } as ContentSecurityPolicyOption,
  forceHTTPSRedirect: [true, {maxAge: 63072000}] as ForceHTTPSRedirectOption,
  frameGuard: "deny" as FrameGuardOption,
  noopen: "noopen" as NoopenOption,
  nosniff: "nosniff" as NosniffOption,
  permittedCrossDomainPolicies: "none" as PermittedCrossDomainPoliciesOption,
  xssProtection: "sanitize" as XSSProtectionOption,
} satisfies CreateSecureHeadersOptions;

/**
 * Merges user-provided secure header options with defaults using Option.lift2.
 *
 * For each header option:
 * - If user provides a value, it takes precedence (user override)
 * - If user provides undefined/null, the default is used
 * - If user explicitly provides `false`, it disables the header
 *
 * The lift2 pattern is used to combine two Options where:
 * - `self` is the user-provided option
 * - `that` is the default option
 * The merge function prefers `self` (user value) when present.
 */
const mergeSecureHeaderOption = <T>(
  userOption: T | undefined,
  defaultOption: T | undefined
): O.Option<T> => {
  const merge = O.lift2<T, T, T>((user, _default) => user);
  const userOpt = O.fromNullable(userOption);
  const defaultOpt = O.fromNullable(defaultOption);

  return pipe(
    merge(userOpt, defaultOpt),
    O.orElse(() => userOpt),
    O.orElse(() => defaultOpt)
  );
};

/**
 * Helper to conditionally include a property in an object spread.
 * Returns an object with the property if the Option is Some, otherwise empty object.
 */
const optionalProp = <K extends string, T>(
  key: K,
  option: O.Option<T>
): { [P in K]: T } | Record<string, never> =>
  pipe(
    option,
    O.match({
      onNone: R.empty<string, never>,
      onSome: (value) => ({[key]: value}) as { [P in K]: T }
    })
  );

/**
 * Merges all secure header options with defaults immutably.
 * Uses Option.lift2 pattern for idiomatic Effect-style option handling.
 *
 * Only includes properties that have values (respects exactOptionalPropertyTypes).
 */
const mergeSecureHeaders = (
  userHeaders: CreateSecureHeadersOptions | undefined
): CreateSecureHeadersOptions => {
  const user = userHeaders ?? {};

  return {
    ...optionalProp("contentSecurityPolicy", mergeSecureHeaderOption(user.contentSecurityPolicy, defaultSecureHeaders.contentSecurityPolicy)),
    ...optionalProp("crossOriginEmbedderPolicy", mergeSecureHeaderOption(user.crossOriginEmbedderPolicy, undefined)),
    ...optionalProp("crossOriginOpenerPolicy", mergeSecureHeaderOption(user.crossOriginOpenerPolicy, undefined)),
    ...optionalProp("crossOriginResourcePolicy", mergeSecureHeaderOption(user.crossOriginResourcePolicy, undefined)),
    ...optionalProp("expectCT", mergeSecureHeaderOption(user.expectCT, undefined)),
    ...optionalProp("forceHTTPSRedirect", mergeSecureHeaderOption(user.forceHTTPSRedirect, defaultSecureHeaders.forceHTTPSRedirect)),
    ...optionalProp("frameGuard", mergeSecureHeaderOption(user.frameGuard, defaultSecureHeaders.frameGuard)),
    ...optionalProp("noopen", mergeSecureHeaderOption(user.noopen, defaultSecureHeaders.noopen)),
    ...optionalProp("nosniff", mergeSecureHeaderOption(user.nosniff, defaultSecureHeaders.nosniff)),
    ...optionalProp("permissionsPolicy", mergeSecureHeaderOption(user.permissionsPolicy, undefined)),
    ...optionalProp("permittedCrossDomainPolicies", mergeSecureHeaderOption(user.permittedCrossDomainPolicies, defaultSecureHeaders.permittedCrossDomainPolicies)),
    ...optionalProp("referrerPolicy", mergeSecureHeaderOption(user.referrerPolicy, undefined)),
    ...optionalProp("xssProtection", mergeSecureHeaderOption(user.xssProtection, defaultSecureHeaders.xssProtection)),
  };
};

type BeepNextConfig = Omit<NextConfig, "headers"> & {
  readonly headers?: CreateSecureHeadersOptions
  readonly bundleAnalyzerOptions?: BundleAnalyzerOptions
  readonly pwaConfig?: PWAConfig;
}

const withDefaults = (
  packageName: `@beep/${string}`,
  config?: BeepNextConfig
) => Effect.gen(function* () {
  const repoRoot = yield* findRepoRoot;
  const transpilePackages = yield* TranspilePackages.computeTranspilePackages({
    target: packageName
  });
  const hostname = yield* Config.url("NEXT_PUBLIC_STATIC_URL").pipe(
    Config.map((url) => pipe(
      url.toString(),
      Str.replace("https://", Str.empty),
    ))
  );
  const protocol = "https";
  const port = Str.empty;
  const pathname = `/**`;

  const images =
    pipe(
      config?.images,
      O.fromNullable,
      O.map((imgConfig) => ({
        unoptimized: P.isNotNullable(imgConfig.unoptimized) ? imgConfig.unoptimized : false,
        remotePatterns: [
          ...pipe(imgConfig.remotePatterns, O.fromNullable, O.getOrElse(A.empty)),
          {
            hostname,
            port,
            protocol,
            pathname,
          }
        ]
      } satisfies NextConfig["images"])),
      O.getOrThrow,
    );

  const pageExtensions =
    [
      "tsx",
      "ts",
      "mdx",
      "md",
      ...pipe(config?.pageExtensions, O.fromNullable, O.getOrElse(A.empty)),
    ];


  // const pwaConfig =


  return {
    reactCompiler: P.isNotNullable(config?.reactCompiler) ? config.reactCompiler : true,
    trailingSlash: P.isNotNullable(config?.trailingSlash) ? config.trailingSlash : false,
    images,
    transpilePackages,
    pageExtensions,
    compress: true,
    productionBrowserSourceMaps: true,
    staticPageGenerationTimeout: 60,

    cacheComponents: true,
    typedRoutes: P.isNotNullable(config?.typedRoutes) ? config.typedRoutes : true,
    serverExternalPackages: [
      ...pipe(config?.serverExternalPackages, O.fromNullable, O.getOrElse(A.empty)),
      "@node-rs/argon2",
    ],
    turbopack: pipe(config?.turbopack, O.fromNullable, O.getOrElse(constant({
      rules: {
        "*.svg": {
          loaders: A.make("@svgr/webpack"),
          as: "*.js"
        }
      }
    }))),
    outputFileTracingRoot: pipe(config?.outputFileTracingRoot, O.fromNullable, O.getOrElse(
      constant(repoRoot)
    )),
    experimental: O.fromNullable(config?.experimental).pipe(
      (opt) => {
        const optimizePackageImports = pipe([
          ...HashSet.toValues(defaultOptimizeImports),
          ...pipe(config?.experimental?.optimizePackageImports, O.fromNullable, O.getOrElse(A.empty))
        ], HashSet.fromIterable, HashSet.toValues);
        return pipe(opt, O.match({
          onNone: () => ({
            optimizePackageImports,
            mcpServer: true,
            turbopackFileSystemCacheForDev: true,
            turbotrace: {
              contextDirectory: __dirname,
              loadersToBundle: ["babel-loader"]
            }
          }),
          onSome: ({optimizePackageImports: _, ...experimental}) => ({
            ...experimental,
            turbotrace: {
              contextDirectory: __dirname,
              loadersToBundle: ["babel-loader"]
            },
            optimisticClientCache: true,
            ppr: true,
            optimizePackageImports
          })
        }));
      }
    )
  } satisfies BeepNextConfig;
}).pipe(Effect.provide(layer));

export const make = (
  packageName: `@beep/${string}`,
  config?: BeepNextConfig
) => Effect.gen(function* () {
  const mergedHeaders = mergeSecureHeaders(config?.headers);
  const secureHeaders = yield* createSecureHeaders(mergedHeaders);
  const configWithDefaults = yield* withDefaults(packageName, config);

  const pwaConfig = {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    runtimeCaching: [...defaultCache],
    fallbacks: {
      document: "/_offline",
    },
    ...pipe(O.fromNullable(config?.pwaConfig), O.getOrElse(R.empty))

  } satisfies PWAConfig;


  return yield* pipe(
    {
      ...configWithDefaults,
      headers: async () => [
        {
          source: "/:path*",
          headers: secureHeaders,
        },
      ],
      modularizeImports: {
        "@mui/material": {
          transform: "@mui/material/{{member}}"
        }
      }
    } satisfies NextConfig,
    withPWA(pwaConfig),
    withMDX,
    withBundleAnalyzer(config?.bundleAnalyzerOptions),
  );
}).pipe(Effect.withSpan("NextConfig.make"));

export const beepNextConfig = (
  packageName: `@beep/${string}`,
  config?: BeepNextConfig
): Promise<NextConfig> =>
Effect.runPromise(
    pipe(
      make(packageName, config),
      Effect.provide(layer),
      Effect.catchAll(Effect.die)
    )
  );