import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../..", import.meta.url));

const readJsonFile = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));

const packageJsonPathsUnder = (directory: string): ReadonlyArray<string> =>
  readdirSync(directory).flatMap((entry) => {
    const entryPath = join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return packageJsonPathsUnder(entryPath);
    }

    return entry === "package.json" ? [entryPath] : [];
  });

const isCanonicalToolingPackageRoot = (packageJsonPath: string): boolean =>
  /^packages\/tooling\/[^/]+\/[^/]+\/package\.json$/u.test(relative(repoRoot, packageJsonPath));

describe("foundation package topology", () => {
  it("keeps foundation packages canonical and leaves no legacy common workspace", () => {
    const rootPackage = readJsonFile(join(repoRoot, "package.json")) as {
      readonly workspaces?: ReadonlyArray<string>;
    };

    expect(rootPackage.workspaces).toEqual(
      expect.arrayContaining([
        "packages/foundation/capability/*",
        "packages/foundation/modeling/*",
        "packages/foundation/primitive/*",
        "packages/foundation/ui-system/*",
      ])
    );
    expect(rootPackage.workspaces).not.toContain("packages/common/*");
    expect(existsSync(join(repoRoot, "packages", "common"))).toBe(false);

    const packageJsonPaths = packageJsonPathsUnder(join(repoRoot, "packages", "foundation"));
    expect(packageJsonPaths.length).toBeGreaterThan(0);

    for (const packageJsonPath of packageJsonPaths) {
      const workspacePath = relative(repoRoot, packageJsonPath).replace(/\/package\.json$/u, "");
      const [, family, kind] = workspacePath.split("/");
      const packageJson = readJsonFile(packageJsonPath) as {
        readonly name?: string;
        readonly homepage?: string;
        readonly repository?: {
          readonly directory?: string;
        };
        readonly beep?: {
          readonly family?: string;
          readonly kind?: string;
        };
      };

      expect(family, `${workspacePath} family segment`).toBe("foundation");
      expect(packageJson.beep, `${workspacePath} beep metadata`).toEqual({
        family: "foundation",
        kind,
      });
      expect(packageJson.repository?.directory, `${workspacePath} repository.directory`).toBe(workspacePath);
      expect(packageJson.homepage, `${workspacePath} homepage`).toMatch(new RegExp(`/${workspacePath}$`, "u"));
    }
  });
});

describe("tooling package topology", () => {
  it("keeps tooling packages canonical and leaves no legacy tooling workspace", () => {
    const rootPackage = readJsonFile(join(repoRoot, "package.json")) as {
      readonly workspaces?: ReadonlyArray<string>;
    };

    expect(rootPackage.workspaces).toEqual(
      expect.arrayContaining([
        "packages/tooling/library/*",
        "packages/tooling/policy-pack/*",
        "packages/tooling/test-kit/*",
        "packages/tooling/tool/*",
      ])
    );
    expect(rootPackage.workspaces).not.toEqual(expect.arrayContaining(["tooling/cli", "tooling/repo-checks"]));
    expect(existsSync(join(repoRoot, "tooling"))).toBe(false);

    const packageJsonPaths = packageJsonPathsUnder(join(repoRoot, "packages", "tooling")).filter(
      isCanonicalToolingPackageRoot
    );
    expect(packageJsonPaths.length).toBeGreaterThan(0);

    for (const packageJsonPath of packageJsonPaths) {
      const workspacePath = relative(repoRoot, packageJsonPath).replace(/\/package\.json$/u, "");
      const [, family, kind] = workspacePath.split("/");
      const packageJson = readJsonFile(packageJsonPath) as {
        readonly homepage?: string;
        readonly repository?: {
          readonly directory?: string;
        };
        readonly beep?: {
          readonly family?: string;
          readonly kind?: string;
        };
      };

      expect(family, `${workspacePath} family segment`).toBe("tooling");
      expect(packageJson.beep, `${workspacePath} beep metadata`).toEqual({
        family: "tooling",
        kind,
      });
      expect(packageJson.repository?.directory, `${workspacePath} repository.directory`).toBe(workspacePath);
      expect(packageJson.homepage, `${workspacePath} homepage`).toMatch(new RegExp(`/${workspacePath}$`, "u"));
    }
  });
});
