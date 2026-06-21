import {
  composeNextConfig,
  decodeBeepNextConfigEnv,
  defineBeepNextConfig,
  makeBeepNextBaseConfig,
} from "@beep/repo-configs/next";
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import type { NextConfig } from "next";

describe("Shared Next.js config preset", () => {
  it.effect(
    "decodes only the env toggles owned by the shared preset",
    Effect.fnUntraced(function* () {
      const env = yield* decodeBeepNextConfigEnv({
        ANALYZE: "1",
        NEXT_DISABLE_PWA: "0",
        OTHER_VALUE: "ignored",
      });

      expect(env).toEqual({
        ANALYZE: "1",
        NEXT_DISABLE_PWA: "0",
      });
      expect(Reflect.has(env, "OTHER_VALUE")).toBe(false);
    })
  );

  it("builds the current shared base config with additive app overrides", () => {
    const config = makeBeepNextBaseConfig({
      repoRoot: "/repo",
      allowedDevOrigins: ["oip-web.localhost"],
      additionalPageExtensions: ["mdoc"],
      additionalTranspilePackages: ["@beep/shared-domain"],
      additionalOptimizePackageImports: ["@beep/ui"],
      next: {
        pageExtensions: ["tsx", "story.tsx"],
        transpilePackages: ["@beep/ui"],
        experimental: {
          optimizePackageImports: ["@mui/material"],
        },
      },
    });

    expect(config.allowedDevOrigins).toEqual(["oip-web.localhost"]);
    expect(config.pageExtensions).toEqual(["ts", "tsx", "md", "mdx", "mdoc", "story.tsx"]);
    expect(config.transpilePackages).toEqual([
      "@beep/ui",
      "@beep/identity",
      "@beep/schema",
      "@beep/utils",
      "@beep/shared-domain",
    ]);
    expect(config.experimental?.optimizePackageImports).toContain("@base-ui/react");
    expect(config.experimental?.optimizePackageImports).toContain("@mui/material");
    expect(config.agentRules).toBe(false);
    expect(config.turbopack?.root).toBe("/repo");
    expect(config.typescript?.tsconfigPath).toBe("tsconfig.next.json");
    expect(Object.getOwnPropertyNames(config.experimental ?? {})).not.toContain("pipe");
    expect(Object.getOwnPropertyNames(config.typescript ?? {})).not.toContain("pipe");
  });

  it("adds secure headers without invoking app headers during construction", () =>
    Effect.gen(function* () {
      let headersCalled = false;
      const config = defineBeepNextConfig({
        repoRoot: "/repo",
        allowedDevOrigins: ["oip-web.localhost"],
        mdx: false,
        pwa: false,
        bundleAnalyzer: false,
        next: {
          headers() {
            headersCalled = true;
            return Promise.resolve([
              {
                source: "/custom",
                headers: [{ key: "X-App", value: "1" }],
              },
            ]);
          },
        },
      });

      expect(headersCalled).toBe(false);
      const headers = yield* Effect.promise(() => Promise.resolve(config.headers?.()));

      expect(headersCalled).toBe(true);
      expect(headers?.[0]?.source).toBe("/(.*)");
      expect(headers?.[0]?.headers).toContainEqual({
        key: "X-Content-Type-Options",
        value: "nosniff",
      });
      expect(headers?.[1]).toEqual({
        source: "/custom",
        headers: [{ key: "X-App", value: "1" }],
      });
    }));

  it("can disable every shared feature wrapper explicitly", () => {
    const config = defineBeepNextConfig({
      repoRoot: "/repo",
      allowedDevOrigins: ["oip-web.localhost"],
      securityHeaders: false,
      mdx: false,
      pwa: false,
      bundleAnalyzer: false,
    });

    expect(config.headers).toBeUndefined();
    expect(config.webpack).toBeUndefined();
  });

  it("composes plugin helpers in explicit left-to-right order", () => {
    let events: ReadonlyArray<string> = A.empty();
    const makePlugin =
      (name: string) =>
      (config: NextConfig): NextConfig => {
        events = A.append(events, name);
        return config;
      };

    const config = composeNextConfig({}, [makePlugin("mdx"), makePlugin("pwa"), makePlugin("analyzer")]);

    expect(config).toEqual({});
    expect(events).toEqual(["mdx", "pwa", "analyzer"]);
  });

  it("supports data-last composition for pipeline use", () => {
    const config = composeNextConfig([
      (current) => ({
        ...current,
        poweredByHeader: false,
      }),
    ])({ reactStrictMode: true });

    expect(config).toEqual({
      poweredByHeader: false,
      reactStrictMode: true,
    });
  });
});
