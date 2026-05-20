import {
  ChangesetGraphPackageReference,
  changesetPackageReferencesFromText,
  findMissingChangesetPackageReferences,
  makeChangesetGraphSummary,
  runChangesetGraphCheck,
} from "@beep/repo-cli/commands/Quality/ChangesetGraph";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { ChildProcess } from "effect/unstable/process";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const testLayer = Layer.mergeAll(
  NodeServices.layer,
  TestConsole.layer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer))
);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const runGit = Effect.fn("ChangesetGraphTest.runGit")(function* (repoRoot: string, args: ReadonlyArray<string>) {
  const handle = yield* ChildProcess.make("git", [...args], {
    cwd: repoRoot,
    stdout: "ignore",
    stderr: "ignore",
  });
  const exitCode = yield* handle.exitCode;
  expect(exitCode).toBe(0);
});

const withTempRepo = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();

      return { fs, tmpDir } as const;
    }),
    ({ tmpDir }) => use(tmpDir),
    ({ fs, tmpDir }) => fs.remove(tmpDir, { recursive: true, force: true })
  ).pipe(provideScopedLayer(testLayer));

const writeRepoFile = Effect.fn("ChangesetGraphTest.writeRepoFile")(function* (
  repoRoot: string,
  relativePath: string,
  content: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.join(repoRoot, relativePath);

  yield* fs.makeDirectory(path.dirname(absolutePath), { recursive: true });
  yield* fs.writeFileString(absolutePath, content);
});

const writePackageJson = (repoRoot: string, relativePath: string, document: unknown) =>
  writeRepoFile(repoRoot, relativePath, `${encodeJson(document)}\n`);

const writeFixtureRepo = Effect.fn("ChangesetGraphTest.writeFixtureRepo")(function* (
  repoRoot: string,
  changesetContent: string
) {
  yield* writePackageJson(repoRoot, "package.json", {
    private: true,
    workspaces: ["packages/*"],
  });
  yield* writePackageJson(repoRoot, "packages/demo/package.json", {
    name: "@beep/demo",
    version: "0.0.0",
  });
  yield* writeRepoFile(repoRoot, ".changeset/README.md", "# Changesets\n");
  yield* writeRepoFile(repoRoot, ".changeset/demo.md", changesetContent);
  yield* runGit(repoRoot, ["init"]);
  yield* runGit(repoRoot, ["add", "."]);
});

describe("changeset graph", () => {
  it.effect("parses package names from changeset frontmatter", () =>
    Effect.gen(function* () {
      const references = yield* changesetPackageReferencesFromText(
        ".changeset/demo.md",
        `---
"@beep/schema": patch
"@beep/repo-cli": minor
---

Patch package metadata.
`
      );

      expect(references).toEqual([
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/repo-cli",
        }),
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/schema",
        }),
      ]);
    })
  );

  it.effect("treats empty changeset frontmatter as a valid no-op", () =>
    Effect.gen(function* () {
      const references = yield* changesetPackageReferencesFromText(
        ".changeset/noop.md",
        `---
---

Record a private workspace change.
`
      );

      expect(references).toEqual([]);
    })
  );

  it("reports only package references outside the workspace graph", () => {
    const missing = findMissingChangesetPackageReferences(
      ["@beep/schema"],
      [
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/schema",
        }),
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/missing",
        }),
      ]
    );

    expect(missing).toEqual([
      new ChangesetGraphPackageReference({
        file: ".changeset/demo.md",
        packageName: "@beep/missing",
      }),
    ]);
  });

  it("builds a stable summary for release preflight output", () => {
    const summary = makeChangesetGraphSummary(
      ["@beep/schema"],
      [".changeset/demo.md"],
      [
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/missing",
        }),
      ]
    );

    expect(summary).toMatchObject({
      workspacePackages: 1,
      changesetFiles: 1,
      references: 1,
      missingReferences: [
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/missing",
        }),
      ],
    });
  });

  it("accepts tracked workspace changesets through the release-path check", () =>
    Effect.runPromise(
      Effect.scoped(
        withTempRepo((tmpDir) =>
          Effect.gen(function* () {
            yield* writeFixtureRepo(
              tmpDir,
              `---
"@beep/demo": patch
---

Patch demo.
`
            );

            const summary = yield* runChangesetGraphCheck(tmpDir);

            expect(summary).toMatchObject({
              workspacePackages: 1,
              changesetFiles: 1,
              references: 1,
              missingReferences: [],
            });
          })
        )
      )
    ));

  it("rejects tracked changesets that reference packages outside the workspace graph", () =>
    Effect.runPromise(
      Effect.scoped(
        withTempRepo((tmpDir) =>
          Effect.gen(function* () {
            yield* writeFixtureRepo(
              tmpDir,
              `---
"@beep/missing": patch
---

Patch missing package.
`
            );

            const error = yield* runChangesetGraphCheck(tmpDir).pipe(Effect.flip);
            const errorLines = yield* TestConsole.errorLines;

            expect(error).toMatchObject({
              message: "Changeset package graph validation failed.",
            });
            expect(errorLines).toEqual([
              "[changeset-graph] changeset package references outside current workspace graph:",
              "- .changeset/demo.md :: @beep/missing",
            ]);
          })
        )
      )
    ));

  it("treats tracked empty changesets as release-path no-ops", () =>
    Effect.runPromise(
      Effect.scoped(
        withTempRepo((tmpDir) =>
          Effect.gen(function* () {
            yield* writeFixtureRepo(
              tmpDir,
              `---
---

Record a private workspace change.
`
            );

            const summary = yield* runChangesetGraphCheck(tmpDir);

            expect(summary).toMatchObject({
              workspacePackages: 1,
              changesetFiles: 1,
              references: 0,
              missingReferences: [],
            });
          })
        )
      )
    ));
});
