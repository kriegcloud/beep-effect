import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { layer as GlobLayer, type GlobOptions, Glob as GlobService, type Pattern } from "@beep/utils/Glob";
import { Effect, Match } from "effect";
import { describe, expect, it } from "vitest";

const makeFixture = async (): Promise<{ readonly dir: string; readonly cleanup: () => Promise<void> }> => {
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
};

const runGlob = (pattern: Pattern, options?: undefined | GlobOptions) =>
  Effect.gen(function* () {
    const glob = yield* GlobService;
    return yield* glob.glob(pattern, options);
  }).pipe(Effect.provide(GlobLayer), Effect.runPromise);

const withBunGlobDisabled = async <A>(run: () => Promise<A>): Promise<A> => {
  const BunRef = globalThis.Bun;

  return Match.value(BunRef === undefined).pipe(
    Match.when(true, run),
    Match.orElse(async () => {
      const originalGlob = BunRef.Glob;
      Reflect.set(BunRef, "Glob", undefined);

      try {
        return await run();
      } finally {
        Reflect.set(BunRef, "Glob", originalGlob);
      }
    })
  );
};

describe("@beep/utils Glob", () => {
  it("supports array patterns, ignore filters, and deduped deterministic output", async () => {
    const fixture = await makeFixture();

    try {
      const results = await runGlob(["src/**/*.ts", "src/index.ts"], {
        cwd: fixture.dir,
        ignore: ["**/nested/**", "**/errors/**"],
      });

      expect(results).toEqual(["src/index.ts"]);
    } finally {
      await fixture.cleanup();
    }
  });

  it("supports absolute paths and directory matches when nodir is false", async () => {
    const fixture = await makeFixture();

    try {
      const results = await runGlob("src/**", {
        absolute: true,
        cwd: fixture.dir,
      });

      expect(results).toContain(resolve(fixture.dir, "src", "errors"));
      expect(results).toContain(resolve(fixture.dir, "src", "index.ts"));
      expect(results).toContain(resolve(fixture.dir, "src", "nested"));
      expect(results).toContain(resolve(fixture.dir, "src", "nested", "deep.ts"));
    } finally {
      await fixture.cleanup();
    }
  });

  it("supports nodir by returning only files", async () => {
    const fixture = await makeFixture();

    try {
      const results = await runGlob("src/**", {
        cwd: fixture.dir,
        nodir: true,
      });

      expect(results).toEqual(["src/errors/problem.ts", "src/index.ts", "src/nested/deep.ts"]);
    } finally {
      await fixture.cleanup();
    }
  });

  it("falls back to Node globbing when Bun.Glob is unavailable", async () => {
    const fixture = await makeFixture();

    try {
      const results = await withBunGlobDisabled(() =>
        runGlob("src/**", {
          absolute: true,
          cwd: fixture.dir,
          ignore: ["**/errors/**"],
          nodir: true,
        })
      );

      expect(results).toEqual([
        resolve(fixture.dir, "src", "index.ts"),
        resolve(fixture.dir, "src", "nested", "deep.ts"),
      ]);
    } finally {
      await fixture.cleanup();
    }
  });
});
