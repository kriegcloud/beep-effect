import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const fixtureRoot = fileURLToPath(new URL("./fixtures/repo-architecture-automation", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const registryPath = join(fixtureRoot, "registry", "fixture-lab.specimen.json");

const conceptPath = "entities/Specimen";
const expectedRoles = ["client", "config", "domain", "server", "tables", "ui", "use-cases"] as const;

const commonRequiredFiles = [
  "README.md",
  "LICENSE.md",
  "package.json",
  "vitest.config.ts",
  "docgen.json",
  "tsconfig.json",
  "dtslint/tsconfig.json",
] as const;

const roleRequiredFiles = {
  client: [
    "src/index.ts",
    `src/${conceptPath}/Specimen.command-client.ts`,
    `src/${conceptPath}/Specimen.query-client.ts`,
    `src/${conceptPath}/Specimen.service.ts`,
    `src/${conceptPath}/index.ts`,
    "test/SpecimenClient.test.ts",
    "dtslint/SpecimenClient.tst.ts",
  ],
  config: [
    "src/index.ts",
    "src/PublicConfig.ts",
    "src/ServerConfig.ts",
    "src/Secrets.ts",
    "src/Config.ts",
    "src/Layer.ts",
    "src/TestLayer.ts",
    "test/SpecimenConfig.test.ts",
    "dtslint/SpecimenConfig.tst.ts",
  ],
  domain: [
    "src/index.ts",
    "src/entities/index.ts",
    `src/${conceptPath}/Specimen.model.ts`,
    `src/${conceptPath}/Specimen.policy.ts`,
    `src/${conceptPath}/index.ts`,
    "test/Specimen.test.ts",
    "dtslint/Specimen.tst.ts",
  ],
  server: [
    "src/index.ts",
    "src/Layer.ts",
    `src/${conceptPath}/Specimen.repo.ts`,
    `src/${conceptPath}/Specimen.layer.ts`,
    `src/${conceptPath}/index.ts`,
    "test/SpecimenServer.test.ts",
    "dtslint/SpecimenServer.tst.ts",
  ],
  tables: [
    "src/index.ts",
    "src/Tables.ts",
    "src/ReadModels.ts",
    `src/${conceptPath}/Specimen.table.ts`,
    `src/${conceptPath}/Specimen.read-model-table.ts`,
    `src/${conceptPath}/index.ts`,
    "test/SpecimenReadModel.test.ts",
    "dtslint/SpecimenReadModel.tst.ts",
  ],
  ui: [
    "src/index.tsx",
    `src/${conceptPath}/Specimen.detail.tsx`,
    `src/${conceptPath}/index.ts`,
    "test/SpecimenDetail.test.tsx",
    "dtslint/SpecimenDetail.tst.ts",
  ],
  "use-cases": [
    "src/index.ts",
    "src/public.ts",
    "src/server.ts",
    "src/test.ts",
    `src/${conceptPath}/Specimen.commands.ts`,
    `src/${conceptPath}/Specimen.queries.ts`,
    `src/${conceptPath}/Specimen.errors.ts`,
    `src/${conceptPath}/Specimen.ports.ts`,
    `src/${conceptPath}/Specimen.service.ts`,
    `src/${conceptPath}/index.ts`,
    "test/SpecimenUseCases.test.ts",
    "dtslint/SpecimenUseCases.tst.ts",
  ],
} satisfies Record<(typeof expectedRoles)[number], ReadonlyArray<string>>;

const oldFlatFiles = {
  client: ["src/SpecimenClient.ts"],
  config: ["src/layer.ts", "src/public.ts", "src/secrets.ts"],
  domain: ["src/Specimen.ts"],
  server: ["src/SpecimenServer.ts"],
  tables: ["src/SpecimenReadModel.ts"],
  ui: ["src/SpecimenPanel.tsx", "test/SpecimenPanel.test.tsx", "dtslint/SpecimenPanel.tst.ts"],
  "use-cases": ["src/SpecimenUseCases.ts"],
} satisfies Record<(typeof expectedRoles)[number], ReadonlyArray<string>>;

const expectedExports = {
  client: [".", "./entities/Specimen"],
  config: [".", "./public", "./server", "./secrets", "./layer", "./test"],
  domain: [".", "./entities/Specimen"],
  server: [".", "./layer"],
  tables: [".", "./read-models", "./tables"],
  ui: [".", "./entities/Specimen"],
  "use-cases": [".", "./public", "./server", "./test"],
} satisfies Record<(typeof expectedRoles)[number], ReadonlyArray<string>>;

type Role = (typeof expectedRoles)[number];

type Registry = {
  readonly roles: ReadonlyArray<{
    readonly kind: Role;
    readonly packageName: string;
    readonly path: string;
    readonly exports: ReadonlyArray<string>;
    readonly rootBoundary?: string;
  }>;
  readonly slice: {
    readonly boundedContext: string;
    readonly concept: string;
    readonly domainKind: string;
    readonly conceptPath: string;
  };
};

type PackageJson = {
  readonly name: string;
  readonly private?: boolean;
  readonly workspaces?: ReadonlyArray<string>;
  readonly scripts: Readonly<Record<string, string>>;
  readonly exports: Readonly<Record<string, string>>;
};

const readJson = <A>(path: string): A => JSON.parse(readFileSync(path, "utf8")) as A;

const readRegistry = (): Registry => readJson(registryPath);

const readPackageJson = (packagePath: string): PackageJson => readJson(join(repoRoot, packagePath, "package.json"));

const rootPackageJson = (): PackageJson => readJson(join(repoRoot, "package.json"));

const matchesWorkspace = (packagePath: string, workspacePattern: string): boolean => {
  if (workspacePattern === packagePath) {
    return true;
  }

  if (!workspacePattern.endsWith("/*")) {
    return false;
  }

  const prefix = workspacePattern.slice(0, -1);
  const suffix = packagePath.slice(prefix.length);

  return packagePath.startsWith(prefix) && suffix.length > 0 && !suffix.includes("/");
};

const listFiles = (root: string): ReadonlyArray<string> =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);

    return entry.isDirectory() ? listFiles(path) : [path];
  });

const sourceFilesUnder = (path: string): ReadonlyArray<string> =>
  listFiles(join(repoRoot, path)).filter((filePath) => /\.(?:c|m)?[jt]sx?$/.test(filePath));

describe("repo architecture automation golden fixture", () => {
  it("keeps every registry role backed by a live workspace package", () => {
    const registry = readRegistry();
    const workspaces = rootPackageJson().workspaces ?? [];
    const missing = registry.roles.flatMap((role) =>
      [...commonRequiredFiles, ...roleRequiredFiles[role.kind]]
        .map((relativePath) => join(role.path, relativePath))
        .filter((relativePath) => !existsSync(join(repoRoot, relativePath)))
    );
    const nonWorkspaceRoles = registry.roles.filter(
      (role) => !workspaces.some((workspacePattern) => matchesWorkspace(role.path, workspacePattern))
    );

    expect(missing).toEqual([]);
    expect(nonWorkspaceRoles).toEqual([]);
  });

  it("keeps registry roles aligned with package metadata and concept path", () => {
    const registry = readRegistry();
    const packageNames = registry.roles.map((role) => readPackageJson(role.path).name);

    expect(registry.slice).toMatchObject({
      boundedContext: "fixture-lab",
      concept: "Specimen",
      domainKind: "entities",
      conceptPath,
    });
    expect(registry.roles.map((role) => role.kind).sort()).toEqual([...expectedRoles].sort());
    expect(packageNames.sort()).toEqual(registry.roles.map((role) => role.packageName).sort());
    expect(registry.roles.map((role) => [role.kind, [...role.exports].sort()] as const)).toEqual(
      registry.roles.map((role) => [role.kind, [...expectedExports[role.kind]].sort()] as const)
    );
  });

  it("uses canonical role files and removes the old flat fixture files", () => {
    const registry = readRegistry();
    const unexpectedFlatFiles = registry.roles.flatMap((role) =>
      oldFlatFiles[role.kind]
        .map((relativePath) => join(role.path, relativePath))
        .filter((relativePath) => existsSync(join(repoRoot, relativePath)))
    );

    expect(unexpectedFlatFiles).toEqual([]);
  });

  it("keeps explicit package export boundaries without wildcard exports", () => {
    const registry = readRegistry();
    const mismatches = registry.roles.flatMap((role) => {
      const packageJson = readPackageJson(role.path);
      const exportKeys = Object.keys(packageJson.exports).filter((exportKey) => exportKey !== "./package.json");
      const wildcardKeys = exportKeys.filter((exportKey) => exportKey.includes("*"));

      return [
        ...(packageJson.private === true ? [] : [`${role.packageName}#private`]),
        ...(exportKeys.sort().join("|") === [...expectedExports[role.kind]].sort().join("|")
          ? []
          : [`${role.packageName}#exports`]),
        ...wildcardKeys.map((exportKey) => `${role.packageName}#${exportKey}`),
      ];
    });

    expect(mismatches).toEqual([]);
  });

  it("keeps boundary-sensitive package roots browser-safe", () => {
    const useCasesIndex = readFileSync(
      join(repoRoot, "packages/fixture-lab/specimen/use-cases/src/index.ts"),
      "utf8"
    ).trim();
    const configIndex = readFileSync(
      join(repoRoot, "packages/fixture-lab/specimen/config/src/index.ts"),
      "utf8"
    ).trim();

    expect(useCasesIndex).toBe('export * from "./public.js";');
    expect(configIndex).toBe('export * from "./PublicConfig.js";');
  });

  it("keeps fixture client and server code on explicit boundary subpaths", () => {
    const files = [
      ...sourceFilesUnder("packages/fixture-lab/specimen/client/src"),
      ...sourceFilesUnder("packages/fixture-lab/specimen/server/src"),
    ];
    const forbiddenRootImports = [
      '"@beep/fixture-lab-specimen-use-cases"',
      "'@beep/fixture-lab-specimen-use-cases'",
      '"@beep/fixture-lab-specimen-config"',
      "'@beep/fixture-lab-specimen-config'",
    ];
    const violations = files.flatMap((filePath) => {
      const content = readFileSync(filePath, "utf8");

      return forbiddenRootImports
        .filter((forbiddenImport) => content.includes(forbiddenImport))
        .map((forbiddenImport) => `${relative(repoRoot, filePath)}#${forbiddenImport}`);
    });

    expect(violations).toEqual([]);
  });

  it("keeps every fixture package wired into repo quality scripts", () => {
    const registry = readRegistry();
    const missingScripts = registry.roles.flatMap((role) => {
      const packageJson = readPackageJson(role.path);
      const requiredScripts = ["build", "check", "lint", "test", "docgen"] as const;

      return requiredScripts
        .filter((scriptName) => packageJson.scripts[scriptName] === undefined)
        .map((scriptName) => `${role.packageName}#${scriptName}`);
    });

    expect(missingScripts).toEqual([]);
  });

  it("keeps fixture packages synthetic and out of product code", () => {
    const searchedRoots = ["apps", "packages/_internal", "packages/common", "tooling"] as const;
    const files = searchedRoots.flatMap((root) => sourceFilesUnder(root));
    const violations = files.flatMap((filePath) => {
      const relativePath = relative(repoRoot, filePath);

      if (
        relativePath.startsWith("tooling/cli/test/fixtures/") ||
        relativePath === "tooling/cli/test/repo-architecture-automation-fixture.test.ts"
      ) {
        return [];
      }

      const content = readFileSync(filePath, "utf8");
      const importsFixturePackage =
        /(?:from|import)\s*\(\s*["']@beep\/fixture-lab-specimen-/.test(content) ||
        /from\s+["']@beep\/fixture-lab-specimen-/.test(content);

      return importsFixturePackage ? [relativePath] : [];
    });

    expect(violations).toEqual([]);
  });
});
