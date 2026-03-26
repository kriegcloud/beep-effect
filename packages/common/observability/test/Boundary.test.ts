import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../../..");
const readText = (relativePath: string) => readFileSync(resolve(packageRoot, relativePath), "utf8");

describe("Boundary", () => {
  it("keeps package exports explicit and removes root node ambient types", { timeout: 60_000 }, () => {
    const packageJson = JSON.parse(readText("package.json")) as {
      exports: Record<string, string>;
    };
    const tsconfigSource = readText("tsconfig.json");

    expect(packageJson.exports).toMatchObject({
      ".": "./src/index.ts",
      "./experimental/server": "./src/experimental/server/index.ts",
      "./server": "./src/server/index.ts",
      "./web": "./src/web/index.ts",
    });
    expect(packageJson.exports).not.toHaveProperty("./*");
    expect(tsconfigSource).not.toMatch(/"types"\s*:\s*\[[^\]]*"node"/m);
  });

  it("keeps the root and web entrypoints free from server-only imports", { timeout: 60_000 }, () => {
    const indexSource = readText("src/index.ts");
    const webLayerSource = readText("src/web/Layer.ts");

    expect(indexSource).not.toContain("./server");
    expect(indexSource).not.toContain("./web");
    expect(indexSource).not.toContain("./experimental");
    expect(webLayerSource).not.toContain("effect/unstable/devtools");
    expect(webLayerSource).not.toContain("effect/unstable/observability");
    expect(webLayerSource).not.toContain("@effect/platform-");
    expect(webLayerSource).not.toContain("node:");
  });

  it("typechecks browser-safe, server-safe, and experimental-server fixtures", { timeout: 180_000 }, () => {
    const tscPath = resolve(repoRoot, "node_modules/.bin/tsc");
    const browserTsconfig = resolve(packageRoot, "test/fixtures/tsconfig.browser.json");
    const experimentalServerTsconfig = resolve(packageRoot, "test/fixtures/tsconfig.experimental-server.json");
    const serverTsconfig = resolve(packageRoot, "test/fixtures/tsconfig.server.json");

    expect(() =>
      execFileSync(tscPath, ["--noEmit", "-p", browserTsconfig], { cwd: repoRoot, stdio: "pipe" })
    ).not.toThrow();
    expect(() =>
      execFileSync(tscPath, ["--noEmit", "-p", serverTsconfig], { cwd: repoRoot, stdio: "pipe" })
    ).not.toThrow();
    expect(() =>
      execFileSync(tscPath, ["--noEmit", "-p", experimentalServerTsconfig], { cwd: repoRoot, stdio: "pipe" })
    ).not.toThrow();
  });
});
