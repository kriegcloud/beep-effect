import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { layer as GlobLayer, type GlobOptions, Glob as GlobService, type Pattern } from "@beep/utils/Glob";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, Layer, Match } from "effect";
import { describe, expect, it } from "vitest";

type Fixture = {
  readonly dir: string;
  readonly cleanup: () => Promise<void>;
};

const platformLayer = GlobLayer.pipe(Layer.provide(Layer.mergeAll(BunFileSystem.layer, BunPath.layer)));

const acquireFixture = Effect.promise<Fixture>(async () => {
  const dir = await mkdtemp(join(tmpdir(), "beep-utils-glob-"));

  await mkdir(join(dir, "src", "errors"), { recursive: true });
  await mkdir(join(dir, "src", "nested"), { recursive: true });
  await writeFile(join(dir, "src", "index.ts"), "");
  await writeFile(join(dir, "src", "errors", "problem.ts"), "");
  await writeFile(join(dir, "src", "nested", "deep.ts"), "");
  await writeFile(join(dir, "README.md"), "");

  return {
    dir,
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
});

const runGlob = (pattern: Pattern, options?: undefined | GlobOptions) =>
  Effect.gen(function* () {
    const glob = yield* GlobService;
    return yield* glob.glob(pattern, options);
  }).pipe(Effect.provide(platformLayer));

type GlobProgram = ReturnType<typeof runGlob>;

const disableBunGlob = (bunRef: typeof Bun) => {
  const originalGlob = bunRef.Glob;
  Reflect.set(bunRef, "Glob", undefined);
  return originalGlob;
};

const restoreBunGlob = (bunRef: typeof Bun, originalGlob: typeof Bun.Glob) => {
  Reflect.set(bunRef, "Glob", originalGlob);
};

const toGlobMutationError =
  (action: string) =>
  (cause: unknown): Error =>
    cause instanceof Error ? cause : new Error(`Failed to ${action} Bun.Glob`);

const withBunGlobDisabled = (effect: GlobProgram) => {
  const bunRef = globalThis.Bun;

  return Match.value(bunRef === undefined).pipe(
    Match.when(true, () => effect),
    Match.orElse(() =>
      Effect.acquireUseRelease(
        Effect.try({
          try: () => disableBunGlob(bunRef),
          catch: toGlobMutationError("disable"),
        }),
        () => effect,
        (originalGlob) =>
          Effect.try({
            try: () => restoreBunGlob(bunRef, originalGlob),
            catch: toGlobMutationError("restore"),
          })
      )
    )
  );
};

describe("@beep/utils Glob", () => {
  it("supports array patterns, ignore filters, and deduped deterministic output", async () => {
    const program = Effect.acquireUseRelease(
      acquireFixture,
      (fixture) =>
        runGlob(["src/**/*.ts", "src/index.ts"], {
          cwd: fixture.dir,
          ignore: ["**/nested/**", "**/errors/**"],
        }),
      (fixture) => Effect.promise(fixture.cleanup)
    );
    const results = await Effect.runPromise(program);

    expect(results).toEqual(["src/index.ts"]);
  });

  it("supports absolute paths and directory matches when nodir is false", async () => {
    const program = Effect.acquireUseRelease(
      acquireFixture,
      (fixture) =>
        runGlob("src/**", {
          absolute: true,
          cwd: fixture.dir,
        }).pipe(
          Effect.tap((results) =>
            Effect.sync(() => {
              expect(results).toContain(resolve(fixture.dir, "src", "errors"));
              expect(results).toContain(resolve(fixture.dir, "src", "index.ts"));
              expect(results).toContain(resolve(fixture.dir, "src", "nested"));
              expect(results).toContain(resolve(fixture.dir, "src", "nested", "deep.ts"));
            })
          )
        ),
      (fixture) => Effect.promise(fixture.cleanup)
    );
    await Effect.runPromise(program);
  });

  it("supports nodir by returning only files", async () => {
    const program = Effect.acquireUseRelease(
      acquireFixture,
      (fixture) =>
        runGlob("src/**", {
          cwd: fixture.dir,
          nodir: true,
        }),
      (fixture) => Effect.promise(fixture.cleanup)
    );
    const results = await Effect.runPromise(program);

    expect(results).toEqual(["src/errors/problem.ts", "src/index.ts", "src/nested/deep.ts"]);
  });

  it("falls back to Node globbing when Bun.Glob is unavailable", async () => {
    const program = Effect.acquireUseRelease(
      acquireFixture,
      (fixture) =>
        withBunGlobDisabled(
          runGlob("src/**", {
            absolute: true,
            cwd: fixture.dir,
            ignore: ["**/errors/**"],
            nodir: true,
          })
        ).pipe(
          Effect.tap((results) =>
            Effect.sync(() => {
              expect(results).toEqual([
                resolve(fixture.dir, "src", "index.ts"),
                resolve(fixture.dir, "src", "nested", "deep.ts"),
              ]);
            })
          )
        ),
      (fixture) => Effect.promise(fixture.cleanup)
    );
    await Effect.runPromise(program);
  });

  it("does not recurse into symlinked directories", async () => {
    const program = Effect.acquireUseRelease(
      acquireFixture,
      (fixture) =>
        Effect.promise(() => symlink(fixture.dir, join(fixture.dir, "src", "linked-root"))).pipe(
          Effect.flatMap(() =>
            runGlob("src/**", {
              cwd: fixture.dir,
              nodir: true,
            })
          )
        ),
      (fixture) => Effect.promise(fixture.cleanup)
    );
    const results = await Effect.runPromise(program);

    expect(results).toEqual(["src/errors/problem.ts", "src/index.ts", "src/nested/deep.ts"]);
  });
});
