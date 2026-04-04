import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { layer as GlobLayer, type GlobOptions, Glob as GlobService, type Pattern } from "@beep/utils/Glob";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";

const tempDirs: Array<string> = [];

const makeFixture = async (): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), "beep-utils-glob-"));
  tempDirs.push(dir);

  await mkdir(join(dir, "src", "errors"), { recursive: true });
  await mkdir(join(dir, "src", "nested"), { recursive: true });
  await writeFile(join(dir, "src", "index.ts"), "");
  await writeFile(join(dir, "src", "errors", "problem.ts"), "");
  await writeFile(join(dir, "src", "nested", "deep.ts"), "");
  await writeFile(join(dir, "README.md"), "");

  return dir;
};

const runGlob = (pattern: Pattern, options?: undefined | GlobOptions) =>
  Effect.gen(function* () {
    const glob = yield* GlobService;
    return yield* glob.glob(pattern, options);
  }).pipe(Effect.provide(GlobLayer), Effect.runPromise);

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe("@beep/utils Glob", () => {
  it("supports array patterns, ignore filters, and deduped deterministic output", async () => {
    const dir = await makeFixture();

    const results = await runGlob(["src/**/*.ts", "src/index.ts"], {
      cwd: dir,
      ignore: ["**/nested/**", "**/errors/**"],
    });

    expect(results).toEqual(["src/index.ts"]);
  });

  it("supports absolute paths and directory matches when nodir is false", async () => {
    const dir = await makeFixture();

    const results = await runGlob("src/**", {
      absolute: true,
      cwd: dir,
    });

    expect(results).toContain(resolve(dir, "src", "errors"));
    expect(results).toContain(resolve(dir, "src", "index.ts"));
    expect(results).toContain(resolve(dir, "src", "nested"));
    expect(results).toContain(resolve(dir, "src", "nested", "deep.ts"));
  });

  it("supports nodir by returning only files", async () => {
    const dir = await makeFixture();

    const results = await runGlob("src/**", {
      cwd: dir,
      nodir: true,
    });

    expect(results).toEqual(["src/errors/problem.ts", "src/index.ts", "src/nested/deep.ts"]);
  });
});
