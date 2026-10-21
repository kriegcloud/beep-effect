import { StepExec } from "@beep/repo-cli/test/PackageScripts";
import {
  CoveragePackageArtifact,
  CoverageProducerCompareOptions,
  CoverageProducerIdentity,
  CoverageProducerManifest,
  CoverageProducerPackage,
  CoverageProducerPartition,
  CoverageProducerWriteOptions,
  CoverageRegressionBaseline,
  collectCoverageProducerArtifacts,
  compareCoverageProducerArtifacts,
  discoverCoverageArtifactSources,
  resolveCoverageProducerIdentity,
  writeCoverageProducerArtifact,
} from "@beep/repo-cli/test/Quality";
import { sha256Hex } from "@beep/repo-utils/Sha256Hex";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { afterEach, expect, it, vi } from "@effect/vitest";
import { createInstrumenter } from "@vitest/istanbul-lib-instrument";
import * as A from "effect/Array";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as S from "effect/Schema";

// The producer's runtime metadata is a boundary: fixtures exercise both admitted
// Bun metadata and its rejection while retaining real filesystem/process services.
const runtimeVersions = (bun: string | undefined) =>
  vi.stubGlobal(
    "process",
    new Proxy(process, {
      get: (target, key, receiver) =>
        key === "versions"
          ? new Proxy(target.versions, {
              get: (versions, versionKey, versionReceiver) =>
                versionKey === "bun" ? bun : Reflect.get(versions, versionKey, versionReceiver),
            })
          : Reflect.get(target, key, receiver),
    })
  );
afterEach(() => vi.unstubAllGlobals());

const encode = S.encodeEffect(S.fromJsonString(S.Unknown));
const decodeManifest = S.decodeUnknownEffect(S.fromJsonString(CoverageProducerManifest));
const fixture = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const root = yield* fs.makeTempDirectoryScoped({ prefix: "coverage-artifacts-" });
  const packagePath = "packages/example";
  const packageRoot = path.join(root, packagePath);
  yield* fs.makeDirectory(path.join(packageRoot, "src"), { recursive: true });
  yield* fs.makeDirectory(path.join(packageRoot, "coverage"), { recursive: true });
  yield* fs.writeFileString(
    path.join(root, "package.json"),
    '{"name":"@beep/fixture-root","private":true,"workspaces":["packages/*"]}'
  );
  yield* fs.writeFileString(
    path.join(packageRoot, "package.json"),
    '{"name":"@beep/example","type":"module","scripts":{"coverage":"vitest run --coverage"}}'
  );
  yield* fs.writeFileString(
    path.join(packageRoot, "vitest.config.ts"),
    'export default { test: { coverage: { include: ["src/**/*.ts"], exclude: ["src/excluded.ts"] } } }'
  );
  const source = "export const choose = (flag: boolean) => flag ? 1 : 2;\n";
  yield* fs.writeFileString(path.join(packageRoot, "src/choose.ts"), source);
  yield* fs.writeFileString(path.join(packageRoot, "src/index.ts"), 'export { choose } from "./choose.js";\n');
  yield* fs.writeFileString(path.join(packageRoot, "src/excluded.ts"), "export const excluded = 1;\n");
  const git = yield* StepExec.runCaptured({ command: "git", args: ["init", "--quiet"], cwd: root });
  expect(git.exitCode).toBe(0);
  const commit = yield* StepExec.runCaptured({
    command: "git",
    args: [
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "commit",
      "--allow-empty",
      "--no-gpg-sign",
      "-m",
      "fixture",
    ],
    cwd: root,
  });
  expect(commit.exitCode).toBe(0);
  const head = yield* StepExec.runCaptured({ command: "git", args: ["rev-parse", "HEAD"], cwd: root });
  const identity = CoverageProducerIdentity.make({
    executionSha: head.output.trim(),
    baseSha: head.output.trim(),
    runId: "123",
    runAttempt: 1,
    scopeDigest: yield* sha256Hex(yield* encode(["@beep/example"])),
  });
  const tests = [`${packagePath}/test/one.test.ts`, `${packagePath}/test/two.test.ts`];
  const instrumenter = createInstrumenter({ esModules: true, parserPlugins: ["typescript"] });
  instrumenter.instrumentSync(source, path.join(packageRoot, "src/choose.ts"));
  const raw = instrumenter.lastFileCoverage();
  if (raw === null || raw === undefined) return yield* Effect.die("Fixture instrumentation produced no coverage map");
  // Load the real Node/Bun Vitest provider before changing only the producer
  // metadata boundary, so Vite chooses its actual runtime implementation.
  yield* discoverCoverageArtifactSources(root, packagePath);
  runtimeVersions(process.versions.bun ?? "fixture-bun");
  const selection = (index: number) =>
    CoverageProducerPackage.make({
      packageName: "@beep/example",
      packagePath,
      expectedTestFiles: tests,
      testReportPath: "coverage/unit-results.json",
      shard: { index, total: 2 },
    });
  const write = Effect.fnUntraced(function* (index: number, includeBarrel?: boolean) {
    const coverage = {
      ...raw,
      s: R.map(raw.s, () => 1),
      f: R.map(raw.f, () => 1),
      b: R.map(raw.b, (hits) => A.map(hits, (_, branch) => (branch === index - 1 ? 1 : 0))),
    };
    yield* fs.writeFileString(
      path.join(packageRoot, "coverage/coverage-final.json"),
      yield* encode({
        [raw.path]: coverage,
        ...(includeBarrel === true
          ? {
              [path.join(packageRoot, "src/index.ts")]: {
                path: path.join(packageRoot, "src/index.ts"),
                statementMap: {},
                fnMap: {},
                branchMap: {},
                s: {},
                f: {},
                b: {},
              },
            }
          : {}),
      })
    );
    yield* fs.writeFileString(
      path.join(packageRoot, "coverage/unit-results.json"),
      yield* encode({
        success: true,
        numFailedTests: 0,
        numFailedTestSuites: 0,
        testResults: [{ name: path.join(root, tests[index - 1] ?? ""), status: "passed" }],
      })
    );
    yield* writeCoverageProducerArtifact(
      root,
      CoverageProducerWriteOptions.make({
        artifactRoot: `.beep/artifacts/shard-${index}`,
        identity,
        partitionId: `unit-${index}`,
        packages: [selection(index)],
      })
    );
  });
  const options = CoverageProducerCompareOptions.make({
    artifactRoot: ".beep/artifacts",
    identity,
    scoped: true,
    expectedPartitions: A.map([1, 2], (index) =>
      CoverageProducerPartition.make({ partitionId: `unit-${index}`, packages: [selection(index)] })
    ),
  });
  return { root, fs, path, packageRoot, packagePath, identity, tests, raw, options, write };
});

type ArtifactFixture = Effect.Success<ReturnType<typeof fixture>>;
const sealedFixture = Effect.fnUntraced(function* () {
  const f = yield* fixture();
  yield* f.write(1);
  yield* f.write(2);
  const manifestPath = f.path.join(f.root, ".beep/artifacts/shard-2/manifest.json");
  const manifest = yield* f.fs.readFileString(manifestPath).pipe(Effect.flatMap(decodeManifest));
  const entry = manifest.packages[0];
  if (entry === undefined) return yield* Effect.die("Expected sealed package");
  return { ...f, manifest, manifestPath, entry };
});
const rejectChangedManifest = Effect.fnUntraced(function* (
  f: Effect.Success<ReturnType<typeof sealedFixture>>,
  manifest: CoverageProducerManifest
) {
  yield* f.fs.writeFileString(f.manifestPath, yield* encode(manifest));
  const failure = yield* collectCoverageProducerArtifacts(f.root, f.options).pipe(Effect.flip);
  expect(failure.message).toContain("Coverage artifact:");
});

it.layer(NodeServices.layer, { timeout: "30 seconds" })("coverage artifact integrity", (it) => {
  it.effect("refuses to publish Bun provenance from a Node runtime", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      runtimeVersions(undefined);
      const failure = yield* writeCoverageProducerArtifact(
        f.root,
        CoverageProducerWriteOptions.make({
          artifactRoot: ".beep/rejected-node",
          identity: f.identity,
          partitionId: "node",
          packages: [],
        })
      ).pipe(Effect.flip);
      expect(failure.message).toContain("must run under Bun");
      expect(yield* f.fs.exists(f.path.join(f.root, ".beep/rejected-node/manifest.json"))).toBe(false);
    })
  );

  it.effect("merges complementary branch hits and retains an instrumenter-proven empty barrel", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      yield* f.write(1);
      yield* f.write(2);
      const snapshots = yield* collectCoverageProducerArtifacts(f.root, f.options);
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0]?.baseline.branches).toBe(100);
      expect(snapshots[0]?.baseline.uncovered).toEqual({ lines: 0, statements: 0, functions: 0, branches: 0 });
      expect(R.keys(snapshots[0]?.baseline.files ?? {})).toEqual([
        `${f.packagePath}/src/choose.ts`,
        `${f.packagePath}/src/index.ts`,
      ]);
      expect(yield* discoverCoverageArtifactSources(f.root, f.packagePath)).toEqual([
        `${f.packagePath}/src/choose.ts`,
        `${f.packagePath}/src/index.ts`,
      ]);
    })
  );

  it.effect("merges a genuine empty barrel present in one shard and omitted in another", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      yield* f.write(1, true);
      yield* f.write(2);
      const snapshots = yield* collectCoverageProducerArtifacts(f.root, f.options);
      expect(snapshots[0]?.baseline.files[`${f.packagePath}/src/index.ts`]?.uncovered).toEqual({
        lines: 0,
        statements: 0,
        functions: 0,
        branches: 0,
      });
    })
  );

  it.effect("compares sealed snapshots with existing floors without a local coverage producer", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      yield* f.write(1);
      yield* f.write(2);
      const snapshots = yield* collectCoverageProducerArtifacts(f.root, f.options);
      const first = snapshots[0];
      if (first === undefined) return yield* Effect.die("Expected validated snapshot");
      yield* f.fs.makeDirectory(f.path.join(f.root, "standards"));
      const baseline = CoverageRegressionBaseline.make({
        schema_version: 2,
        generated_at: "fixture",
        git_sha: f.identity.executionSha,
        command: "fixture",
        epsilon: 0.001,
        minimum: {
          lines: first.baseline.lines,
          statements: first.baseline.statements,
          functions: first.baseline.functions,
          branches: first.baseline.branches,
        },
        exemptions: {},
        follow_ups: {},
        packages: { "@beep/example": first.baseline },
      });
      yield* f.fs.writeFileString(
        f.path.join(f.root, "standards/coverage.regression-baseline.jsonc"),
        yield* encode(baseline)
      );
      // Removing local reports proves the adapter consumes sealed artifacts only.
      yield* f.fs.remove(f.path.join(f.packageRoot, "coverage"), { recursive: true });
      yield* compareCoverageProducerArtifacts(f.root, f.options).pipe(
        Effect.provideService(ConfigProvider.ConfigProvider, ConfigProvider.fromUnknown({}))
      );
      expect(yield* f.fs.exists(f.path.join(f.packageRoot, "coverage"))).toBe(false);
    })
  );

  it.effect("fails closed when a selected shard never uploaded", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      yield* f.write(1);
      const failure = yield* collectCoverageProducerArtifacts(f.root, f.options).pipe(Effect.flip);
      expect(failure.message).toContain("missing producer partitions");
    })
  );

  it.effect("rejects changed checkout identity before consuming reports", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      const failure = yield* collectCoverageProducerArtifacts(
        f.root,
        CoverageProducerCompareOptions.make({
          ...f.options,
          identity: CoverageProducerIdentity.make({ ...f.identity, executionSha: "b".repeat(40) }),
        })
      ).pipe(Effect.flip);
      expect(failure.message).toContain("differs from the checkout");
    })
  );

  it.effect("refuses to overwrite an existing producer manifest", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      yield* f.write(1);
      const failure = yield* f.write(1).pipe(Effect.flip);
      expect(failure.message).toContain("already exists");
    })
  );

  it.effect("rejects a newly selected executable source omitted by the producer", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      yield* f.fs.writeFileString(
        f.path.join(f.packageRoot, "src/untouched.ts"),
        "export const untouched = () => 42;\n"
      );
      const failure = yield* f.write(1).pipe(Effect.flip);
      expect(failure.message).toContain("missing executable source");
    })
  );

  it.effect("binds the actual execution SHA while keeping the requested PR head separate", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      const identity = yield* resolveCoverageProducerIdentity(f.root, {
        base: "HEAD",
        packageNames: ["@beep/example"],
      }).pipe(
        Effect.provideService(
          ConfigProvider.ConfigProvider,
          ConfigProvider.fromUnknown({
            BEEP_COVERAGE_RUN_ID: "producer",
            BEEP_COVERAGE_RUN_ATTEMPT: "3",
            GITHUB_RUN_ID: "consumer",
            GITHUB_RUN_ATTEMPT: "9",
            BEEP_COVERAGE_REQUEST_HEAD_SHA: "b".repeat(40),
          })
        )
      );
      expect(identity.executionSha).toBe(f.identity.executionSha);
      expect(identity.baseSha).toBe(f.identity.executionSha);
      expect(identity.requestHeadSha).toBe("b".repeat(40));
      expect(identity.runId).toBe("producer");
      expect(identity.runAttempt).toBe(3);
      const fallback = yield* resolveCoverageProducerIdentity(f.root, {
        base: "HEAD",
        packageNames: ["@beep/example"],
      }).pipe(
        Effect.provideService(
          ConfigProvider.ConfigProvider,
          ConfigProvider.fromUnknown({ GITHUB_RUN_ID: "producer", GITHUB_RUN_ATTEMPT: "3" })
        )
      );
      expect(fallback.scopeDigest).toBe(identity.scopeDigest);
      expect(fallback.requestHeadSha).toBeUndefined();
    })
  );

  it.effect("accepts genuine remapped Istanbul ranges and implicit else locations without losing counters", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      yield* f.write(1);
      const remapped = {
        ...f.raw,
        statementMap: R.map(f.raw.statementMap, (range) => ({ ...range, end: { ...range.end, column: null } })),
        fnMap: R.map(f.raw.fnMap, ({ line: _line, ...fn }) => ({
          ...fn,
          loc: { ...fn.loc, end: { ...fn.loc.end, column: null } },
        })),
        branchMap: R.map(f.raw.branchMap, ({ line: _line, ...branch }) => ({
          ...branch,
          locations: A.map(branch.locations, (range, index) => (index === 0 ? range : { start: {}, end: {} })),
        })),
        s: R.map(f.raw.s, () => 1),
        f: R.map(f.raw.f, () => 1),
        b: R.map(f.raw.b, (hits) => A.map(hits, () => 1)),
      };
      yield* f.fs.writeFileString(
        f.path.join(f.packageRoot, "coverage/coverage-final.json"),
        yield* encode({ [f.raw.path]: remapped })
      );
      const selection = CoverageProducerPackage.make({
        packageName: "@beep/example",
        packagePath: f.packagePath,
        expectedTestFiles: [f.tests[0] ?? ""],
        testReportPath: "coverage/unit-results.json",
      });
      yield* writeCoverageProducerArtifact(
        f.root,
        CoverageProducerWriteOptions.make({
          artifactRoot: ".beep/remapped/one",
          identity: f.identity,
          partitionId: "one",
          packages: [selection],
        })
      );
      const snapshots = yield* collectCoverageProducerArtifacts(
        f.root,
        CoverageProducerCompareOptions.make({
          artifactRoot: ".beep/remapped",
          identity: f.identity,
          scoped: true,
          expectedPartitions: [CoverageProducerPartition.make({ partitionId: "one", packages: [selection] })],
        })
      );
      expect(snapshots[0]?.baseline.uncovered).toEqual({ lines: 0, statements: 0, functions: 0, branches: 0 });
      expect(snapshots[0]?.baseline.branches).toBe(100);
    })
  );

  for (const scenario of ["missing", "attempt", "git"] as const) {
    it.effect(`rejects ${scenario} execution provenance`, () =>
      Effect.gen(function* () {
        const f = yield* fixture();
        const failure = yield* resolveCoverageProducerIdentity(f.root, {
          base: scenario === "git" ? "nonexistent-ref" : "HEAD",
          packageNames: [],
        }).pipe(
          Effect.provideService(
            ConfigProvider.ConfigProvider,
            ConfigProvider.fromUnknown(
              scenario === "missing"
                ? {}
                : { GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: scenario === "attempt" ? "invalid" : "1" }
            )
          ),
          Effect.flip
        );
        expect(failure.message).toContain(
          scenario === "missing" ? "required" : scenario === "attempt" ? "invalid workflow attempt" : "cannot resolve"
        );
      })
    );
  }

  it.effect("rejects report bytes from an unsuccessful suite", () =>
    Effect.gen(function* () {
      const f = yield* fixture();
      yield* f.write(1);
      yield* f.fs.writeFileString(
        f.path.join(f.packageRoot, "coverage/unit-results.json"),
        yield* encode({ success: false, numFailedTests: 1, numFailedTestSuites: 1, testResults: [] })
      );
      const failure = yield* writeCoverageProducerArtifact(
        f.root,
        CoverageProducerWriteOptions.make({
          artifactRoot: ".beep/artifacts/failed",
          identity: f.identity,
          partitionId: "failed",
          packages: [
            CoverageProducerPackage.make({
              packageName: "@beep/example",
              packagePath: f.packagePath,
              expectedTestFiles: f.tests,
              testReportPath: "coverage/unit-results.json",
            }),
          ],
        })
      ).pipe(Effect.flip);
      expect(failure.message).toContain("unsuccessful");
    })
  );

  for (const [scenario, patch] of R.toEntries({
    attempt: { runAttempt: 2 },
    base: { baseSha: "b".repeat(40) },
    scope: { scopeDigest: "b".repeat(64) },
  })) {
    it.effect(`rejects stale ${scenario} provenance`, () =>
      Effect.gen(function* () {
        const f = yield* sealedFixture();
        yield* rejectChangedManifest(
          f,
          CoverageProducerManifest.make({
            ...f.manifest,
            identity: CoverageProducerIdentity.make({ ...f.manifest.identity, ...patch }),
          })
        );
      })
    );
  }
  for (const [scenario, patch] of R.toEntries({
    partition: { partitionId: "unplanned" },
    assignment: { packages: [] },
  })) {
    it.effect(`rejects unexpected ${scenario}`, () =>
      Effect.gen(function* () {
        const f = yield* sealedFixture();
        yield* rejectChangedManifest(f, CoverageProducerManifest.make({ ...f.manifest, ...patch }));
      })
    );
  }
  const packagePatches = {
    overlap: (f: ArtifactFixture, entry: CoveragePackageArtifact) => ({
      ...entry,
      actualTestFiles: [f.tests[0] ?? ""],
    }),
    missingTests: (_f: ArtifactFixture, entry: CoveragePackageArtifact) => ({ ...entry, actualTestFiles: [] }),
    sourceHash: (_f: ArtifactFixture, entry: CoveragePackageArtifact) => ({
      ...entry,
      sources: A.map(entry.sources, (source) => ({ ...source, sha256: "b".repeat(64) })),
    }),
    reportHash: (_f: ArtifactFixture, entry: CoveragePackageArtifact) => ({ ...entry, reportSha256: "b".repeat(64) }),
  };
  for (const [scenario, patch] of R.toEntries(packagePatches)) {
    it.effect(`rejects ${scenario} envelope corruption`, () =>
      Effect.gen(function* () {
        const f = yield* sealedFixture();
        yield* rejectChangedManifest(
          f,
          CoverageProducerManifest.make({ ...f.manifest, packages: [CoveragePackageArtifact.make(patch(f, f.entry))] })
        );
      })
    );
  }
  const rawPatches = {
    emptyMap: (_f: ArtifactFixture) => ({ statementMap: {}, fnMap: {}, branchMap: {}, s: {}, f: {}, b: {} }),
    counterMap: (_f: ArtifactFixture) => ({ s: {} }),
    negativeHits: (f: ArtifactFixture) => ({ s: R.map(f.raw.s, () => -1) }),
    branchArity: (f: ArtifactFixture) => ({ b: R.map(f.raw.b, () => []) }),
    keyPath: (f: ArtifactFixture) => ({ path: `${f.packagePath}/src/different.ts` }),
    instrumentation: (f: ArtifactFixture) => ({
      statementMap: R.map(f.raw.statementMap, (range) => ({ ...range, start: { ...range.start, line: 10 } })),
    }),
  };
  for (const [scenario, patch] of R.toEntries(rawPatches)) {
    it.effect(`rejects ${scenario} raw counter corruption`, () =>
      Effect.gen(function* () {
        const f = yield* sealedFixture();
        const rawPath = `${f.packagePath}/src/choose.ts`;
        const report = yield* encode({ [rawPath]: { ...f.raw, path: rawPath, ...patch(f) } });
        yield* f.fs.writeFileString(f.path.join(f.root, ".beep/artifacts/shard-2", f.entry.reportPath), report);
        yield* rejectChangedManifest(
          f,
          CoverageProducerManifest.make({
            ...f.manifest,
            packages: [CoveragePackageArtifact.make({ ...f.entry, reportSha256: yield* sha256Hex(report) })],
          })
        );
      })
    );
  }
  it.effect("rejects a consumer plan that omits a selected package", () =>
    Effect.gen(function* () {
      const f = yield* sealedFixture();
      const failure = yield* collectCoverageProducerArtifacts(
        f.root,
        CoverageProducerCompareOptions.make({ ...f.options, expectedPartitions: [] })
      ).pipe(Effect.flip);
      expect(failure.message).toContain("selected package scope");
    })
  );
  it.effect("rejects a complete partition set containing an incomplete package shard set", () =>
    Effect.gen(function* () {
      const f = yield* sealedFixture();
      yield* f.fs.writeFileString(
        f.manifestPath,
        yield* encode(CoverageProducerManifest.make({ ...f.manifest, packages: [] }))
      );
      const expectedPartitions = A.map(f.options.expectedPartitions, (partition) =>
        partition.partitionId === "unit-2" ? CoverageProducerPartition.make({ ...partition, packages: [] }) : partition
      );
      const failure = yield* collectCoverageProducerArtifacts(
        f.root,
        CoverageProducerCompareOptions.make({ ...f.options, expectedPartitions })
      ).pipe(Effect.flip);
      expect(failure.message).toContain("incomplete shard set");
    })
  );
  it.effect("rejects two reported slices for the same shard index", () =>
    Effect.gen(function* () {
      const f = yield* sealedFixture();
      const selection = CoverageProducerPackage.make({ ...f.entry.selection, shard: { index: 1, total: 2 } });
      yield* f.fs.writeFileString(
        f.manifestPath,
        yield* encode(
          CoverageProducerManifest.make({
            ...f.manifest,
            packages: [CoveragePackageArtifact.make({ ...f.entry, selection })],
          })
        )
      );
      const expectedPartitions = A.map(f.options.expectedPartitions, (partition) =>
        partition.partitionId === "unit-2"
          ? CoverageProducerPartition.make({ ...partition, packages: [selection] })
          : partition
      );
      const failure = yield* collectCoverageProducerArtifacts(
        f.root,
        CoverageProducerCompareOptions.make({ ...f.options, expectedPartitions })
      ).pipe(Effect.flip);
      expect(failure.message).toContain("shard indexes");
    })
  );
  for (const scenario of ["missing-report", "unexpected-test", "unexpected-source"] as const) {
    it.effect(`refuses to seal ${scenario} producer evidence`, () =>
      Effect.gen(function* () {
        const f = yield* sealedFixture();
        if (scenario === "missing-report") {
          yield* f.fs.remove(f.path.join(f.packageRoot, "coverage/unit-results.json"));
        } else if (scenario === "unexpected-test") {
          yield* f.fs.writeFileString(
            f.path.join(f.packageRoot, "coverage/unit-results.json"),
            yield* encode({
              success: true,
              numFailedTests: 0,
              numFailedTestSuites: 0,
              testResults: [{ name: f.path.join(f.root, "test/unselected.test.ts"), status: "passed" }],
            })
          );
        } else {
          const extra = f.path.join(f.packageRoot, "src/excluded.ts");
          yield* f.fs.writeFileString(
            f.path.join(f.packageRoot, "coverage/coverage-final.json"),
            yield* encode({ [f.raw.path]: f.raw, [extra]: { ...f.raw, path: extra } })
          );
        }
        const failure = yield* writeCoverageProducerArtifact(
          f.root,
          CoverageProducerWriteOptions.make({
            artifactRoot: ".beep/rejected",
            identity: f.identity,
            partitionId: "rejected",
            packages: [f.entry.selection],
          })
        ).pipe(Effect.flip);
        expect(failure.message).toContain("Coverage artifact:");
      })
    );
  }

  it.effect("refuses to publish through a symlinked artifact directory", () =>
    Effect.gen(function* () {
      const f = yield* sealedFixture();
      const fs = yield* FileSystem.FileSystem;
      const outside = f.path.join(f.root, "outside-artifacts");
      yield* fs.makeDirectory(outside);
      yield* fs.symlink(outside, f.path.join(f.root, ".beep/unsafe-output"));
      const failure = yield* writeCoverageProducerArtifact(
        f.root,
        CoverageProducerWriteOptions.make({
          artifactRoot: ".beep/unsafe-output",
          identity: f.identity,
          partitionId: "unsafe",
          packages: [f.entry.selection],
        })
      ).pipe(Effect.flip);
      expect(failure.message).toContain("cannot seal raw report");
      expect(yield* fs.readDirectory(outside)).toEqual([]);
    })
  );

  it.effect("rejects a sealed report replaced by a filesystem symlink", () =>
    Effect.gen(function* () {
      const f = yield* sealedFixture();
      const fs = yield* FileSystem.FileSystem;
      const reportPath = f.path.join(f.root, ".beep/artifacts/shard-2", f.entry.reportPath);
      const original = yield* fs.readFileString(reportPath);
      const outside = f.path.join(f.root, "outside-report.json");
      yield* fs.writeFileString(outside, original);
      yield* fs.remove(reportPath);
      yield* fs.symlink(outside, reportPath);
      const failure = yield* collectCoverageProducerArtifacts(f.root, f.options).pipe(Effect.flip);
      expect(failure.message).toContain("cannot safely read");
    })
  );

  it.effect("rejects duplicate partitions even when their manifests are identical", () =>
    Effect.gen(function* () {
      const f = yield* sealedFixture();
      yield* f.fs.makeDirectory(f.path.join(f.root, ".beep/artifacts/duplicate"), { recursive: true });
      yield* f.fs.writeFileString(
        f.path.join(f.root, ".beep/artifacts/duplicate/manifest.json"),
        yield* encode(f.manifest)
      );
      yield* rejectChangedManifest(f, f.manifest);
    })
  );
  it.effect("rejects source bytes changed after the producer executed", () =>
    Effect.gen(function* () {
      const f = yield* sealedFixture();
      yield* f.fs.writeFileString(f.path.join(f.packageRoot, "src/choose.ts"), "export const changed = 1;\n");
      yield* rejectChangedManifest(f, f.manifest);
    })
  );
  it.effect("rejects report paths escaping the selected source root", () =>
    Effect.gen(function* () {
      const f = yield* sealedFixture();
      const report = yield* encode({ "../escape.ts": f.raw });
      yield* f.fs.writeFileString(f.path.join(f.root, ".beep/artifacts/shard-2", f.entry.reportPath), report);
      yield* rejectChangedManifest(
        f,
        CoverageProducerManifest.make({
          ...f.manifest,
          packages: [CoveragePackageArtifact.make({ ...f.entry, reportSha256: yield* sha256Hex(report) })],
        })
      );
    })
  );
});
