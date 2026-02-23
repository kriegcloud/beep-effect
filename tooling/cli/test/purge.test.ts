import { FsUtilsLive } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { FileSystem, Path } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TestConsole } from "effect/testing";
import { ChildProcessSpawner } from "effect/unstable/process";
import { purgeAtRoot } from "../src/commands/purge.js";
import { rootCommand } from "../src/commands/root.js";

// ---------------------------------------------------------------------------
// Test layers
// ---------------------------------------------------------------------------

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({})
);

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers));
const withTestLayers =
  <A, E, R, Args extends ReadonlyArray<unknown>>(fn: (...args: Args) => Effect.Effect<A, E, R>) =>
  (...args: Args) =>
    fn(...args).pipe(Effect.provide(TestLayers));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const WORKSPACE_DIR_ARTIFACTS = ["build", "dist", ".next", "coverage", ".turbo", "node_modules"] as const;

interface RepoFixture {
  readonly rootDir: string;
  readonly workspaceDir: string;
}

const createRepoFixture = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rootDir = path.join(path.resolve("."), `_test-purge-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const workspaceDir = path.join(rootDir, "custom-workspaces", "pkg-a");

  yield* fs.makeDirectory(path.join(rootDir, ".git"), { recursive: true });
  yield* fs.makeDirectory(workspaceDir, { recursive: true });

  yield* fs.writeFileString(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
        name: "@test/root",
        private: true,
        workspaces: ["custom-workspaces/*"],
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    path.join(workspaceDir, "package.json"),
    JSON.stringify(
      {
        name: "@test/pkg-a",
        version: "0.0.0",
        private: true,
      },
      null,
      2
    )
  );

  // Root artifacts
  yield* fs.makeDirectory(path.join(rootDir, "node_modules"), { recursive: true });
  yield* fs.makeDirectory(path.join(rootDir, ".turbo"), { recursive: true });
  yield* fs.writeFileString(path.join(rootDir, "bun.lock"), "# bun lock");

  // Workspace artifacts
  yield* fs.writeFileString(path.join(workspaceDir, ".tsbuildinfo"), "{}");
  for (const artifact of WORKSPACE_DIR_ARTIFACTS) {
    const dir = path.join(workspaceDir, artifact);
    yield* fs.makeDirectory(dir, { recursive: true });
    yield* fs.writeFileString(path.join(dir, ".keep"), "x");
  }

  return { rootDir, workspaceDir } as const satisfies RepoFixture;
});

const createEmptyRepoFixture = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rootDir = path.join(
    path.resolve("."),
    `_test-purge-empty-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const workspaceDir = path.join(rootDir, "custom-workspaces", "pkg-a");

  yield* fs.makeDirectory(path.join(rootDir, ".git"), { recursive: true });
  yield* fs.makeDirectory(workspaceDir, { recursive: true });

  yield* fs.writeFileString(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
        name: "@test/root",
        private: true,
        workspaces: ["custom-workspaces/*"],
      },
      null,
      2
    )
  );

  yield* fs.writeFileString(
    path.join(workspaceDir, "package.json"),
    JSON.stringify(
      {
        name: "@test/pkg-a",
        version: "0.0.0",
        private: true,
      },
      null,
      2
    )
  );

  return { rootDir, workspaceDir } as const satisfies RepoFixture;
});

const cleanupFixture = Effect.fn(function* (rootDir: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.remove(rootDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
});

const exists = Effect.fn(function* (target: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.exists(target).pipe(Effect.orElseSucceed(() => false));
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("purge command", () => {
  it.effect(
    "should purge workspace artifacts and root caches by default",
    withTestLayers(
      Effect.fn(function* () {
        const path = yield* Path.Path;
        const fixture = yield* createRepoFixture();

        try {
          const summary = yield* purgeAtRoot(fixture.rootDir, false);

          expect(summary.workspaceCount).toBe(1);

          // Root artifacts should be removed by default.
          expect(yield* exists(path.join(fixture.rootDir, "node_modules"))).toBe(false);
          expect(yield* exists(path.join(fixture.rootDir, ".turbo"))).toBe(false);

          // bun.lock should remain unless --lock is requested.
          expect(yield* exists(path.join(fixture.rootDir, "bun.lock"))).toBe(true);

          // Workspace artifacts should be removed.
          expect(yield* exists(path.join(fixture.workspaceDir, ".tsbuildinfo"))).toBe(false);
          for (const artifact of WORKSPACE_DIR_ARTIFACTS) {
            expect(yield* exists(path.join(fixture.workspaceDir, artifact))).toBe(false);
          }

          const logs = (yield* TestConsole.logLines).map(String);
          expect(logs.some((line) => line.includes("Purging"))).toBe(true);
          expect(logs.some((line) => line.includes("Purge complete"))).toBe(true);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "should remove root bun.lock when lock option is enabled",
    withTestLayers(
      Effect.fn(function* () {
        const path = yield* Path.Path;
        const fixture = yield* createRepoFixture();

        try {
          yield* purgeAtRoot(fixture.rootDir, true);
          expect(yield* exists(path.join(fixture.rootDir, "bun.lock"))).toBe(false);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it.effect(
    "should succeed when targets are already absent",
    withTestLayers(
      Effect.fn(function* () {
        const fixture = yield* createEmptyRepoFixture();

        try {
          const summary = yield* purgeAtRoot(fixture.rootDir, false);

          expect(summary.workspaceCount).toBe(1);
          expect(summary.targetedCount).toBeGreaterThan(0);
          expect(summary.removedCount).toBe(0);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );

  it("should be registered under the root command tree", () => {
    const subcommandNames = rootCommand.subcommands.flatMap((group) => group.commands.map((command) => command.name));
    expect(subcommandNames).toContain("purge");
  });
});
