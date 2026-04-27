import { fileURLToPath } from "node:url";
import { $CodedankWebId } from "@beep/identity";
import { FsUtilsLive, findRepoRoot } from "@beep/repo-utils";
import { CauseTaggedError } from "@beep/schema";
import { NodeServices } from "@effect/platform-node";
import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import { Cause, Config, Context, Effect, Layer, pipe } from "effect";
import type { NextConfig } from "next";
import nextPwa from "next-pwa";

const $I = $CodedankWebId.create("next.config");

export class NextConfigError extends CauseTaggedError<NextConfigError>($I`NextConfigError`)(
  "NextConfigError",
  {},
  $I.annote("NextConfigError", {
    description: "Error related to Next.js configuration",
  })
) {}

export class ConfigService extends Context.Service<
  ConfigService,
  {
    readonly NEXT_DISABLE_PWA: boolean;
    readonly ANALYZE: boolean;
  }
>()($I`ConfigService`) {
  static readonly layer = Layer.effect(
    ConfigService,
    Effect.gen(function* () {
      return yield* Config.all({
        NEXT_DISABLE_PWA: Config.boolean("NEXT_DISABLE_PWA"),
        ANALYZE: Config.boolean("ANALYZE"),
      });
    })
  );

  static readonly provide = Layer.merge(ConfigService.layer);
}

const program = Effect.gen(function* () {
  const repoRoot = yield* pipe(
    findRepoRoot(),
    Effect.tapErrorTag("NoSuchFileError", (error) => new Next()),
    Effect.orDie
  );

  const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
  });
}).pipe(
  Effect.tap((repoRoot) => Effect.logDebug(`Found repo root: ${repoRoot}`)),
  Effect.catchCause((cause) => {
    process.exitCode = 1;
    return Effect.logError(Cause.pretty(cause));
  })
);

const main = Effect.scoped(
  Layer.build(Layer.provideMerge(NodeServices.layer, FsUtilsLive)).pipe(
    Effect.flatMap(
      Effect.fnUntraced(function* (context) {
        return yield* program.pipe(Effect.provide(context));
      })
    )
  )
);

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "1",
});

const withPWA = nextPwa({
  dest: "public",
  disable: process.env.NEXT_DISABLE_PWA !== "0",
  register: true,
  skipWaiting: true,
});

const securityHeaders = [
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
] as const;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["codedank-web.localhost"],
  cacheComponents: true,
  outputFileTracingRoot: repoRoot,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  poweredByHeader: false,
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ["@beep/ui", "@beep/identity", "@beep/schema", "@beep/utils"],
  turbopack: {
    root: repoRoot,
  },
  typedRoutes: true,
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  experimental: {
    cssChunking: true,
    mcpServer: true,
    mdxRs: true,
    optimizePackageImports: [
      "@base-ui/react",
      "@mui/material",
      "@mui/x-charts",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "@mui/x-date-pickers-pro",
      "@mui/x-tree-view",
      "@phosphor-icons/react",
    ],
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default withBundleAnalyzer(withPWA(withMDX(nextConfig)));
