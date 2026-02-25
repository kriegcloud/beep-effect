import { versionSyncCommand } from "@beep/repo-cli/commands/version-sync/index";
import { type BiomeSchemaState, buildBiomeReport } from "@beep/repo-cli/commands/version-sync/resolvers/biome";
import { type BunVersionState, buildBunReport } from "@beep/repo-cli/commands/version-sync/resolvers/bun";
import { buildDockerReport, type DockerImageState } from "@beep/repo-cli/commands/version-sync/resolvers/docker";
import { buildNodeReport, type NodeVersionState } from "@beep/repo-cli/commands/version-sync/resolvers/node";
import { updatePackageManagerField } from "@beep/repo-cli/commands/version-sync/updaters/package-json";
import { updatePlainTextFile } from "@beep/repo-cli/commands/version-sync/updaters/plain-text";
import { replaceNodeVersionWithFile, updateYamlValue } from "@beep/repo-cli/commands/version-sync/updaters/yaml-file";
import { FsUtilsLive } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { FileSystem, Path } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { TestConsole } from "effect/testing";
import { Command } from "effect/unstable/cli";
import { FetchHttpClient } from "effect/unstable/http";
import { ChildProcessSpawner } from "effect/unstable/process";

// ---------------------------------------------------------------------------
// Test layers
// ---------------------------------------------------------------------------

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  FetchHttpClient.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({})
);

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers));
const withTestLayers =
  <A, E, R, Args extends ReadonlyArray<unknown>>(fn: (...args: Args) => Effect.Effect<A, E, R>) =>
  (...args: Args) =>
    fn(...args).pipe(Effect.provide(TestLayers));

const run = Command.runWith(versionSyncCommand, { version: "0.0.0" });

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const createTmpDir = Effect.fn(function* (suffix: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tmpDir = path.join(path.resolve("."), `_test-vsync-${suffix}-${Date.now()}`);
  yield* fs.makeDirectory(tmpDir, { recursive: true });
  return tmpDir;
});

const removeTmpDir = Effect.fn(function* (tmpDir: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.remove(tmpDir, { recursive: true }).pipe(Effect.orElseSucceed(() => void 0));
});

// ---------------------------------------------------------------------------
// Report builder tests (pure logic, no I/O)
// ---------------------------------------------------------------------------

describe("version-sync report builders", () => {
  it.effect(
    "buildBunReport should detect drift when versions mismatch",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: BunVersionState = {
          bunVersionFile: "1.3.2",
          packageManagerField: "1.3.9",
          latest: O.none(),
        };
        const report = buildBunReport(state);

        expect(report.category).toBe("bun");
        expect(report.status).toBe("drift");
        expect(A.length(report.items)).toBe(1);
        expect(report.items[0].file).toBe(".bun-version");
        expect(report.items[0].current).toBe("1.3.2");
        expect(report.items[0].expected).toBe("1.3.9");
      })
    )
  );

  it.effect(
    "buildBunReport should use latest version when available",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: BunVersionState = {
          bunVersionFile: "1.3.2",
          packageManagerField: "1.3.9",
          latest: O.some("1.4.2"),
        };
        const report = buildBunReport(state);

        expect(report.status).toBe("drift");
        // Both should drift toward 1.4.2
        expect(A.length(report.items)).toBe(2);
        expect(report.items[0].expected).toBe("1.4.2");
        expect(report.items[1].expected).toContain("1.4.2");
      })
    )
  );

  it.effect(
    "buildBunReport should report ok when versions match",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: BunVersionState = {
          bunVersionFile: "1.3.9",
          packageManagerField: "1.3.9",
          latest: O.none(),
        };
        const report = buildBunReport(state);

        expect(report.status).toBe("ok");
        expect(A.length(report.items)).toBe(0);
      })
    )
  );

  it.effect(
    "buildNodeReport should detect CI version mismatch",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: NodeVersionState = {
          nvmrc: "22",
          workflowLocations: [
            {
              file: ".github/workflows/release.yml",
              jobName: "build",
              stepIndex: 2,
              currentValue: "20",
              yamlPath: ["jobs", "build", "steps", 2, "with", "node-version"],
            },
          ],
        };
        const report = buildNodeReport(state);

        expect(report.status).toBe("drift");
        expect(A.length(report.items)).toBe(1);
        expect(report.items[0].current).toBe("20");
        expect(report.items[0].expected).toBe("22");
      })
    )
  );

  it.effect(
    "buildNodeReport should report ok when CI matches .nvmrc",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: NodeVersionState = {
          nvmrc: "22",
          workflowLocations: [
            {
              file: ".github/workflows/release.yml",
              jobName: "build",
              stepIndex: 2,
              currentValue: "22",
              yamlPath: ["jobs", "build", "steps", 2, "with", "node-version"],
            },
          ],
        };
        const report = buildNodeReport(state);

        expect(report.status).toBe("ok");
        expect(A.length(report.items)).toBe(0);
      })
    )
  );

  it.effect(
    "buildDockerReport should detect unpinned images",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: DockerImageState = {
          images: [
            {
              service: "redis",
              fullImage: "redis:latest",
              registry: "library",
              repository: "redis",
              tag: "latest",
              yamlPath: ["services", "redis", "image"],
              latest: O.none(),
            },
          ],
        };
        const report = buildDockerReport(state);

        expect(report.status).toBe("unpinned");
        expect(A.length(report.items)).toBe(1);
        expect(report.items[0].current).toBe("redis:latest");
      })
    )
  );

  it.effect(
    "buildDockerReport should report ok for pinned images with no network",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: DockerImageState = {
          images: [
            {
              service: "grafana",
              fullImage: "grafana/otel-lgtm:0.11.10",
              registry: "",
              repository: "grafana/otel-lgtm",
              tag: "0.11.10",
              yamlPath: ["services", "grafana", "image"],
              latest: O.none(),
            },
          ],
        };
        const report = buildDockerReport(state);

        expect(report.status).toBe("ok");
        expect(A.length(report.items)).toBe(0);
      })
    )
  );
});

// ---------------------------------------------------------------------------
// Biome schema report builder tests
// ---------------------------------------------------------------------------

describe("version-sync biome report builders", () => {
  it.effect(
    "buildBiomeReport should detect drift when schema version differs from installed",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: BiomeSchemaState = {
          schemaUrl: "https://biomejs.dev/schemas/2.3.0/schema.json",
          schemaVersion: O.some("2.3.0"),
          installedVersion: "2.4.4",
        };
        const report = buildBiomeReport(state);

        expect(report.category).toBe("biome");
        expect(report.status).toBe("drift");
        expect(A.length(report.items)).toBe(1);
        expect(report.items[0].file).toBe("biome.jsonc");
        expect(report.items[0].current).toBe("2.3.0");
        expect(report.items[0].expected).toBe("2.4.4");
      })
    )
  );

  it.effect(
    "buildBiomeReport should report ok when versions match",
    withTestLayers(() =>
      Effect.sync(() => {
        const state: BiomeSchemaState = {
          schemaUrl: "https://biomejs.dev/schemas/2.4.4/schema.json",
          schemaVersion: O.some("2.4.4"),
          installedVersion: "2.4.4",
        };
        const report = buildBiomeReport(state);

        expect(report.status).toBe("ok");
        expect(A.length(report.items)).toBe(0);
      })
    )
  );
});

// ---------------------------------------------------------------------------
// Updater tests (file I/O with temp files)
// ---------------------------------------------------------------------------

describe("version-sync updaters", () => {
  it.effect(
    "updatePlainTextFile should update .bun-version content",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = yield* createTmpDir("plain-text");
        try {
          const filePath = path.join(tmpDir, ".bun-version");
          yield* fs.writeFileString(filePath, "1.3.2\n");

          const changed = yield* updatePlainTextFile(filePath, "1.3.9");
          expect(changed).toBe(true);

          const content = yield* fs.readFileString(filePath);
          expect(content).toBe("1.3.9\n");
        } finally {
          yield* removeTmpDir(tmpDir);
        }
      })
    )
  );

  it.effect(
    "updatePlainTextFile should return false when already correct",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = yield* createTmpDir("plain-text-noop");
        try {
          const filePath = path.join(tmpDir, ".bun-version");
          yield* fs.writeFileString(filePath, "1.3.9\n");

          const changed = yield* updatePlainTextFile(filePath, "1.3.9");
          expect(changed).toBe(false);
        } finally {
          yield* removeTmpDir(tmpDir);
        }
      })
    )
  );

  it.effect(
    "updatePackageManagerField should update packageManager with jsonc-parser",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = yield* createTmpDir("pkg-json");
        try {
          const filePath = path.join(tmpDir, "package.json");
          yield* fs.writeFileString(filePath, '{\n  "name": "@test/root",\n  "packageManager": "bun@1.3.2"\n}\n');

          const changed = yield* updatePackageManagerField(filePath, "1.3.9");
          expect(changed).toBe(true);

          const content = yield* fs.readFileString(filePath);
          expect(content).toContain('"bun@1.3.9"');
          // Should preserve structure
          expect(content).toContain('"name"');
        } finally {
          yield* removeTmpDir(tmpDir);
        }
      })
    )
  );

  it.effect(
    "updateYamlValue should update Docker image tag preserving comments",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = yield* createTmpDir("yaml-value");
        try {
          const filePath = path.join(tmpDir, "docker-compose.yml");
          const original = [
            "# Docker services",
            "services:",
            "  redis:",
            "    image: redis:latest # pin this",
            "    ports:",
            "      - '6379:6379'",
            "",
          ].join("\n");
          yield* fs.writeFileString(filePath, original);

          const changed = yield* updateYamlValue(filePath, ["services", "redis", "image"], "redis:7.4.2");
          expect(changed).toBe(true);

          const content = yield* fs.readFileString(filePath);
          expect(content).toContain("redis:7.4.2");
          expect(content).not.toContain("redis:latest");
          // Comments should be preserved
          expect(content).toContain("# Docker services");
          expect(content).toContain("# pin this");
        } finally {
          yield* removeTmpDir(tmpDir);
        }
      })
    )
  );

  it.effect(
    "replaceNodeVersionWithFile should swap node-version for node-version-file",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = yield* createTmpDir("yaml-node");
        try {
          const filePath = path.join(tmpDir, "ci.yml");
          const original = [
            "name: CI",
            "on: push",
            "jobs:",
            "  build:",
            "    runs-on: ubuntu-latest",
            "    steps:",
            "      - uses: actions/checkout@v4",
            "      - uses: actions/setup-node@v4",
            "        with:",
            "          node-version: 20",
            "      - run: npm test",
            "",
          ].join("\n");
          yield* fs.writeFileString(filePath, original);

          const changed = yield* replaceNodeVersionWithFile(filePath, [
            { yamlPath: ["jobs", "build", "steps", 1, "with", "node-version"] },
          ]);
          expect(changed).toBe(true);

          const content = yield* fs.readFileString(filePath);
          expect(content).toContain("node-version-file");
          expect(content).toContain(".nvmrc");
          expect(content).not.toContain("node-version: 20");
        } finally {
          yield* removeTmpDir(tmpDir);
        }
      })
    )
  );
});

// ---------------------------------------------------------------------------
// CLI integration tests
// ---------------------------------------------------------------------------

describe("version-sync CLI integration", () => {
  it.effect(
    "should run check mode against the real repo",
    withTestLayers(
      Effect.fn(function* () {
        // The real repo has known drift; just verify command runs without crash
        yield* run(["--skip-network"]).pipe(Effect.orElseSucceed(() => void 0));

        const logs = A.map(yield* TestConsole.logLines, String);
        // Should produce a report
        expect(A.some(logs, (l) => l.includes("Version Sync Report"))).toBe(true);
      })
    )
  );

  it.effect(
    "should run with --bun-only filter",
    withTestLayers(
      Effect.fn(function* () {
        yield* run(["--skip-network", "--bun-only"]).pipe(Effect.orElseSucceed(() => void 0));

        const logs = A.map(yield* TestConsole.logLines, String);
        expect(A.some(logs, (l) => l.includes("Bun Runtime"))).toBe(true);
        // Should NOT contain other categories
        expect(A.some(logs, (l) => l.includes("Node.js Runtime"))).toBe(false);
        expect(A.some(logs, (l) => l.includes("Docker Images"))).toBe(false);
      })
    )
  );

  it.effect(
    "should run with --node-only filter",
    withTestLayers(
      Effect.fn(function* () {
        yield* run(["--skip-network", "--node-only"]).pipe(Effect.orElseSucceed(() => void 0));

        const logs = A.map(yield* TestConsole.logLines, String);
        expect(A.some(logs, (l) => l.includes("Node.js Runtime"))).toBe(true);
        expect(A.some(logs, (l) => l.includes("Bun Runtime"))).toBe(false);
      })
    )
  );

  it.effect(
    "should run with --docker-only filter",
    withTestLayers(
      Effect.fn(function* () {
        yield* run(["--skip-network", "--docker-only"]).pipe(Effect.orElseSucceed(() => void 0));

        const logs = A.map(yield* TestConsole.logLines, String);
        expect(A.some(logs, (l) => l.includes("Docker Images"))).toBe(true);
        expect(A.some(logs, (l) => l.includes("Bun Runtime"))).toBe(false);
      })
    )
  );
});
