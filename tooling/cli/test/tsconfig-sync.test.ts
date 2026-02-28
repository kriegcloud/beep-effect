import { rootCommand } from "@beep/repo-cli/commands/root";
import { syncTsconfigAtRoot } from "@beep/repo-cli/commands/tsconfig-sync";
import { FsUtilsLive } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { FileSystem, Path } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { TestConsole } from "effect/testing";
import { ChildProcessSpawner } from "effect/unstable/process";
import * as jsonc from "jsonc-parser";

// ---------------------------------------------------------------------------
// Test layers
// ---------------------------------------------------------------------------

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({
    streamString: () => Stream.empty,
    streamLines: () => Stream.empty,
  })
);

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers));
const withTestLayers =
  <A, E, R, Args extends ReadonlyArray<unknown>>(fn: (...args: Args) => Effect.Effect<A, E, R>) =>
  (...args: Args) =>
    fn(...args).pipe(Effect.provide(TestLayers));
const stringifyJson = (value: unknown, _replacer?: unknown, _space?: unknown) =>
  S.encodeSync(S.UnknownFromJsonString)(value);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface Fixture {
  readonly rootDir: string;
  readonly rootTsconfigPackagesPath: string;
  readonly rootTsconfigPath: string;
  readonly pkgBTsconfigPath: string;
  readonly pkgCBuildTsconfigPath: string;
  readonly pkgCRootTsconfigPath: string;
  readonly pkgAPackageJsonPath: string;
  readonly pkgBPackageJsonPath: string;
}

interface TsconfigReferencesLike {
  readonly references?: ReadonlyArray<{ readonly path?: string }>;
}

interface TsconfigPathsLike {
  readonly compilerOptions?: {
    readonly paths?: Readonly<Record<string, ReadonlyArray<string>>>;
  };
}

const createFixture = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rootDir = path.join(
    path.resolve("."),
    `_test-tsconfig-sync-${Date.now()}-${Str.slice(2)(Math.random().toString(36))}`
  );

  const pkgADir = path.join(rootDir, "tooling", "pkg-a");
  const pkgBDir = path.join(rootDir, "tooling", "pkg-b");
  const pkgCDir = path.join(rootDir, "packages", "pkg-c");
  const pkgAPackageJsonPath = path.join(pkgADir, "package.json");
  const pkgBPackageJsonPath = path.join(pkgBDir, "package.json");

  yield* fs.makeDirectory(path.join(rootDir, ".git"), { recursive: true });
  yield* fs.makeDirectory(path.join(pkgADir, "src"), { recursive: true });
  yield* fs.makeDirectory(path.join(pkgBDir, "src"), { recursive: true });
  yield* fs.makeDirectory(path.join(pkgCDir, "src"), { recursive: true });
  yield* fs.makeDirectory(path.join(pkgCDir, "test"), { recursive: true });

  yield* fs.writeFileString(
    path.join(rootDir, "package.json"),
    stringifyJson(
      {
        name: "@test/root",
        private: true,
        workspaces: ["tooling/*", "packages/*"],
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    pkgAPackageJsonPath,
    stringifyJson(
      {
        name: "@beep/pkg-a",
        version: "0.0.0",
        private: true,
        dependencies: {},
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    pkgBPackageJsonPath,
    stringifyJson(
      {
        name: "@beep/pkg-b",
        version: "0.0.0",
        private: true,
        dependencies: {
          "@beep/pkg-a": "workspace:*",
        },
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    path.join(pkgCDir, "package.json"),
    stringifyJson(
      {
        name: "@beep/pkg-c",
        version: "0.0.0",
        private: true,
        dependencies: {
          "@beep/pkg-a": "workspace:*",
        },
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(path.join(pkgADir, "src", "index.ts"), "export const A = 1\n");
  yield* fs.writeFileString(path.join(pkgBDir, "src", "index.ts"), "export const B = 1\n");
  yield* fs.writeFileString(path.join(pkgCDir, "src", "index.ts"), "export const C = 1\n");

  yield* fs.writeFileString(
    path.join(rootDir, "tsconfig.packages.json"),
    `{
  "extends": "./tsconfig.base.json",
  "references": [
    { "path": "tooling/pkg-b" },
    { "path": "tooling/deleted" }
  ]
}
`
  );

  yield* fs.writeFileString(
    path.join(rootDir, "tsconfig.json"),
    `{
  "extends": "./tsconfig.base.json",
  "references": [{ "path": "tsconfig.packages.json" }],
  "compilerOptions": {
    "paths": {
      // preserve unrelated alias
      "@/*": ["./src/*"],
      "@beep/pkg-a": ["./tooling/wrong/src/index.ts"],
      "@beep/pkg-a/*": ["./tooling/wrong/src/*.ts"],
      "@beep/deleted": ["./tooling/deleted/src/index.ts"],
      "@beep/deleted/*": ["./tooling/deleted/src/*.ts"],
      "@beep/pkg-a/test/*": ["./tooling/pkg-a/test/*.ts"]
    }
  }
}
`
  );

  yield* fs.writeFileString(
    path.join(pkgADir, "tsconfig.json"),
    stringifyJson(
      {
        extends: "../../tsconfig.base.json",
        include: ["src"],
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    path.join(pkgBDir, "tsconfig.json"),
    stringifyJson(
      {
        extends: "../../tsconfig.base.json",
        include: ["src"],
        references: [
          { path: "../pkg-a/tsconfig.json" },
          { path: "../../packages/pkg-c/tsconfig.build.json" },
          { path: "../missing/tsconfig.json" },
        ],
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    path.join(pkgCDir, "tsconfig.json"),
    stringifyJson(
      {
        extends: "../../tsconfig.base.json",
        references: [{ path: "tsconfig.src.json" }, { path: "tsconfig.test.json" }],
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    path.join(pkgCDir, "tsconfig.src.json"),
    stringifyJson(
      {
        extends: "../../tsconfig.base.json",
        include: ["src"],
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    path.join(pkgCDir, "tsconfig.test.json"),
    stringifyJson(
      {
        extends: "../../tsconfig.base.json",
        include: ["test"],
        references: [{ path: "tsconfig.src.json" }],
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    path.join(pkgCDir, "tsconfig.build.json"),
    stringifyJson(
      {
        extends: "./tsconfig.src.json",
        references: [],
      },
      null,
      2
    )
  );

  return {
    rootDir,
    rootTsconfigPackagesPath: path.join(rootDir, "tsconfig.packages.json"),
    rootTsconfigPath: path.join(rootDir, "tsconfig.json"),
    pkgBTsconfigPath: path.join(pkgBDir, "tsconfig.json"),
    pkgCBuildTsconfigPath: path.join(pkgCDir, "tsconfig.build.json"),
    pkgCRootTsconfigPath: path.join(pkgCDir, "tsconfig.json"),
    pkgAPackageJsonPath,
    pkgBPackageJsonPath,
  } as const satisfies Fixture;
});

const cleanupFixture = Effect.fn(function* (rootDir: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.remove(rootDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
});

const parseJsonc = <T>(content: string): T => jsonc.parse(content) as T;

const readReferencePaths = (content: string): ReadonlyArray<string> => {
  const parsed = parseJsonc<TsconfigReferencesLike>(content);
  return (parsed.references ?? []).flatMap((entry) => (typeof entry.path === "string" ? [entry.path] : []));
};

const runSync = (fixture: Fixture) =>
  syncTsconfigAtRoot(fixture.rootDir, {
    mode: "sync",
    verbose: false,
  });

const runDryRun = (fixture: Fixture) =>
  syncTsconfigAtRoot(fixture.rootDir, {
    mode: "dry-run",
    verbose: false,
  });

const runCheck = (fixture: Fixture) =>
  syncTsconfigAtRoot(fixture.rootDir, {
    mode: "check",
    verbose: false,
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("tsconfig-sync command", () => {
  it.effect(
    "syncs tsconfig.packages.json references from workspace discovery",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createFixture();

        try {
          yield* runSync(fixture);

          const content = yield* fs.readFileString(fixture.rootTsconfigPackagesPath);
          const refs = readReferencePaths(content);

          expect(refs).toEqual(["packages/pkg-c", "tooling/pkg-a", "tooling/pkg-b"]);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "syncs root alias pairs and preserves unrelated aliases",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createFixture();

        try {
          yield* runSync(fixture);

          const content = yield* fs.readFileString(fixture.rootTsconfigPath);
          const parsed = parseJsonc<TsconfigPathsLike>(content);
          const paths = parsed.compilerOptions?.paths ?? {};

          expect(paths["@beep/pkg-a"]).toEqual(["./tooling/pkg-a/src/index.ts"]);
          expect(paths["@beep/pkg-a/*"]).toEqual(["./tooling/pkg-a/src/*.ts"]);
          expect(paths["@beep/pkg-b"]).toEqual(["./tooling/pkg-b/src/index.ts"]);
          expect(paths["@beep/pkg-b/*"]).toEqual(["./tooling/pkg-b/src/*.ts"]);
          expect(paths["@beep/pkg-c"]).toEqual(["./packages/pkg-c/src/index.ts"]);
          expect(paths["@beep/pkg-c/*"]).toEqual(["./packages/pkg-c/src/*.ts"]);

          expect(paths["@beep/deleted"]).toBeUndefined();
          expect(paths["@beep/deleted/*"]).toBeUndefined();

          expect(paths["@/*"]).toEqual(["./src/*"]);
          expect(paths["@beep/pkg-a/test/*"]).toEqual(["./tooling/pkg-a/test/*.ts"]);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "handles mixed package tsconfig layouts without clobbering split root config",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createFixture();

        try {
          yield* runSync(fixture);

          const pkgBRefs = readReferencePaths(yield* fs.readFileString(fixture.pkgBTsconfigPath));
          expect(pkgBRefs).toContain("../pkg-a/tsconfig.json");
          expect(pkgBRefs).toContain("../../packages/pkg-c/tsconfig.build.json");
          expect(pkgBRefs).not.toContain("../missing/tsconfig.json");

          const pkgCBuildRefs = readReferencePaths(yield* fs.readFileString(fixture.pkgCBuildTsconfigPath));
          expect(pkgCBuildRefs).toEqual(["../../tooling/pkg-a/tsconfig.json"]);

          const pkgCRootRefs = readReferencePaths(yield* fs.readFileString(fixture.pkgCRootTsconfigPath));
          expect(pkgCRootRefs).toEqual(["tsconfig.src.json", "tsconfig.test.json"]);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "check mode fails on drift and passes after synchronization",
    withTestLayers(
      Effect.fn(function* () {
        const fixture = yield* createFixture();

        try {
          const before = yield* runCheck(fixture).pipe(
            Effect.match({
              onFailure: (error) => error._tag,
              onSuccess: () => "Success",
            })
          );
          expect(before).toBe("TsconfigSyncDriftError");

          yield* runSync(fixture);

          const after = yield* runCheck(fixture).pipe(
            Effect.match({
              onFailure: (error) => error._tag,
              onSuccess: () => "Success",
            })
          );
          expect(after).toBe("Success");
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "dry-run reports changes without writing files",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createFixture();

        try {
          const beforePackages = yield* fs.readFileString(fixture.rootTsconfigPackagesPath);
          const beforeRoot = yield* fs.readFileString(fixture.rootTsconfigPath);

          const result = yield* runDryRun(fixture);
          expect(result.changedFiles).toBeGreaterThan(0);

          const afterPackages = yield* fs.readFileString(fixture.rootTsconfigPackagesPath);
          const afterRoot = yield* fs.readFileString(fixture.rootTsconfigPath);

          expect(afterPackages).toBe(beforePackages);
          expect(afterRoot).toBe(beforeRoot);

          const logs = (yield* TestConsole.logLines).map(String);
          expect(logs.some((line) => line.includes("dry-run planned changes"))).toBe(true);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "returns TsconfigSyncFilterError when --filter does not match any workspace",
    withTestLayers(
      Effect.fn(function* () {
        const fixture = yield* createFixture();

        try {
          const outcome = yield* syncTsconfigAtRoot(fixture.rootDir, {
            mode: "sync",
            filter: "@beep/does-not-exist",
            verbose: false,
          }).pipe(
            Effect.match({
              onFailure: (error) => error._tag,
              onSuccess: () => "Success",
            })
          );

          expect(outcome).toBe("TsconfigSyncFilterError");
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "returns TsconfigSyncCycleError when workspace graph contains a cycle",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createFixture();

        try {
          yield* fs.writeFileString(
            fixture.pkgAPackageJsonPath,
            stringifyJson(
              {
                name: "@beep/pkg-a",
                version: "0.0.0",
                private: true,
                dependencies: {
                  "@beep/pkg-b": "workspace:*",
                },
              },
              null,
              2
            )
          );

          const outcome = yield* runSync(fixture).pipe(
            Effect.match({
              onFailure: (error) => error._tag,
              onSuccess: () => "Success",
            })
          );

          expect(outcome).toBe("TsconfigSyncCycleError");
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "preserves existing valid references not declared in package.json (type-only safety)",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createFixture();

        try {
          yield* runSync(fixture);

          const pkgBRefs = readReferencePaths(yield* fs.readFileString(fixture.pkgBTsconfigPath));
          expect(pkgBRefs).toContain("../../packages/pkg-c/tsconfig.build.json");
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "removes references to deleted or non-existent workspace targets",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createFixture();

        try {
          yield* runSync(fixture);

          const rootRefs = readReferencePaths(yield* fs.readFileString(fixture.rootTsconfigPackagesPath));
          expect(rootRefs).not.toContain("tooling/deleted");

          const pkgBRefs = readReferencePaths(yield* fs.readFileString(fixture.pkgBTsconfigPath));
          expect(pkgBRefs).not.toContain("../missing/tsconfig.json");
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "is idempotent on second run",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createFixture();

        try {
          const first = yield* runSync(fixture);
          expect(first.changedFiles).toBeGreaterThan(0);

          const snapshotPackages = yield* fs.readFileString(fixture.rootTsconfigPackagesPath);
          const snapshotRoot = yield* fs.readFileString(fixture.rootTsconfigPath);
          const snapshotPkgB = yield* fs.readFileString(fixture.pkgBTsconfigPath);
          const snapshotPkgCBuild = yield* fs.readFileString(fixture.pkgCBuildTsconfigPath);

          const second = yield* runSync(fixture);
          expect(second.changedFiles).toBe(0);

          expect(yield* fs.readFileString(fixture.rootTsconfigPackagesPath)).toBe(snapshotPackages);
          expect(yield* fs.readFileString(fixture.rootTsconfigPath)).toBe(snapshotRoot);
          expect(yield* fs.readFileString(fixture.pkgBTsconfigPath)).toBe(snapshotPkgB);
          expect(yield* fs.readFileString(fixture.pkgCBuildTsconfigPath)).toBe(snapshotPkgCBuild);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it("is registered under the root command tree", () => {
    const subcommandNames = rootCommand.subcommands.flatMap((group) => group.commands.map((command) => command.name));
    expect(subcommandNames).toContain("tsconfig-sync");
  });
});
