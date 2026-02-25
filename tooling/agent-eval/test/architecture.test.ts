import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const collectTsFiles = (directory: string): ReadonlyArray<string> => {
  const entries = readdirSync(directory);
  const files: Array<string> = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      files.push(...collectTsFiles(absolute));
    } else if (absolute.endsWith(".ts")) {
      files.push(absolute);
    }
  }

  return files;
};

describe("architecture guardrails", () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const packageRoot = path.resolve(testDir, "..");

  it("uses effect/FileSystem and effect/Path instead of node fs/path in src", () => {
    const srcRoot = path.join(packageRoot, "src");
    const files = collectTsFiles(srcRoot);

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      expect(content.includes('from "node:fs"')).toBe(false);
      expect(content.includes('from "node:fs/promises"')).toBe(false);
      expect(content.includes('from "node:path"')).toBe(false);
    }
  });

  it("runner core uses deterministic matrix execution without nested loop tower", () => {
    const runnerPath = path.join(packageRoot, "src/benchmark/runner.ts");
    const source = readFileSync(runnerPath, "utf8");

    expect(source.includes("buildRunMatrix")).toBe(true);
    expect(/Effect\.forEach\(\s*matrix/.test(source)).toBe(true);

    expect(source.includes("for (const task of options.tasks)")).toBe(false);
    expect(source.includes("for (const condition of options.conditions)")).toBe(false);
    expect(source.includes("for (const agent of options.agents)")).toBe(false);
    expect(source.includes("for (let trial = 1; trial <= options.trials; trial += 1)")).toBe(false);
  });
});
