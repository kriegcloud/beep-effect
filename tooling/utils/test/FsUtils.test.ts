import { describe } from "bun:test";
import { deepStrictEqual, scoped } from "@beep/testkit";
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Effect from "effect/Effect";
import * as E from "effect/Either";
import * as Layer from "effect/Layer";

const TestLayer = Layer.mergeAll(FsUtilsLive, BunFileSystem.layer, BunPath.layerPosix);

const mkTestDir = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;
  const base = path_.join(process.cwd(), ".tmp-FsUtils-tests", `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  yield* fs.makeDirectory(base, { recursive: true });
  return base;
});

const mkTestDirScoped = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const base = yield* mkTestDir;
  yield* Effect.addFinalizer(() => fs.remove(base, { recursive: true }).pipe(Effect.ignore));
  return base;
});

describe("FsUtils", () => {
  scoped("glob and globFiles find files", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;

      // setup
      yield* fs.makeDirectory(path_.join(base, "a", "sub"), {
        recursive: true,
      });
      yield* fs.makeDirectory(path_.join(base, "b", "sub"), {
        recursive: true,
      });
      const f1 = path_.join(base, "a", "one.txt");
      const f2 = path_.join(base, "a", "two.ts");
      const f3 = path_.join(base, "b", "sub", "three.txt");
      yield* fs.writeFileString(f1, "1");
      yield* fs.writeFileString(f2, "2");
      yield* fs.writeFileString(f3, "3");

      const txt = yield* utils.glob("**/*.txt", { cwd: base, absolute: true });
      const filesOnly = yield* utils.globFiles("**/*", {
        cwd: base,
        absolute: true,
      });

      deepStrictEqual(txt.sort(), [f1, f3].sort());
      deepStrictEqual(filesOnly.sort(), [f1, f2, f3].sort());
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("modifyFile modifies content", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;
      const file = path_.join(base, "file.txt");
      yield* fs.writeFileString(file, "hello");

      yield* utils.modifyFile(file, (s) => s.toUpperCase());
      const content = yield* fs.readFileString(file);
      deepStrictEqual(content, "HELLO");

      // unchanged should be a no-op
      yield* utils.modifyFile(file, (s) => s);
      const content2 = yield* fs.readFileString(file);
      deepStrictEqual(content2, "HELLO");
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("modifyGlob applies to all matched files", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;
      const x = path_.join(base, "x.js");
      const y = path_.join(base, "y.js");
      const z = path_.join(base, "z.txt");
      yield* fs.writeFileString(x, "abc");
      yield* fs.writeFileString(y, "def");
      yield* fs.writeFileString(z, "ghi");

      // Use absolute paths from glob to avoid relying on process.cwd()
      yield* utils.modifyGlob("**/*.js", () => "MOD", {
        cwd: base,
        absolute: true,
      });
      const cx = yield* fs.readFileString(x);
      const cy = yield* fs.readFileString(y);
      const cz = yield* fs.readFileString(z);
      deepStrictEqual(cx, "MOD");
      deepStrictEqual(cy, "MOD");
      deepStrictEqual(cz, "ghi");
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("rmAndCopy replaces destination directory", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;
      const from = path_.join(base, "from");
      const to = path_.join(base, "to");
      yield* fs.makeDirectory(path_.join(from, "sub"), { recursive: true });
      yield* fs.makeDirectory(to, { recursive: true });
      yield* fs.writeFileString(path_.join(from, "sub", "a.txt"), "A");
      yield* fs.writeFileString(path_.join(to, "old.txt"), "OLD");

      yield* utils.rmAndCopy(from, to);
      const a = yield* fs.readFileString(path_.join(to, "sub", "a.txt"));
      deepStrictEqual(a, "A");
      const oldExists = yield* Effect.either(fs.access(path_.join(to, "old.txt")));
      deepStrictEqual(E.isLeft(oldExists), true);
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("copyIfExists copies when source exists and is a no-op otherwise", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;
      const fromMissing = path_.join(base, "missing");
      const to1 = path_.join(base, "to1");
      yield* utils.copyIfExists(fromMissing, to1);
      const to1Exists = yield* Effect.either(fs.access(to1));
      deepStrictEqual(E.isLeft(to1Exists), true);

      const from = path_.join(base, "from");
      const to = path_.join(base, "to");
      yield* fs.makeDirectory(from, { recursive: true });
      yield* fs.writeFileString(path_.join(from, "f.txt"), "X");
      yield* utils.copyIfExists(from, to);
      const x = yield* fs.readFileString(path_.join(to, "f.txt"));
      deepStrictEqual(x, "X");
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("mkdirCached can be called multiple times", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;
      const dir = path_.join(base, "nested", "dir");
      yield* utils.mkdirCached(dir);
      yield* utils.mkdirCached(dir);
      yield* fs.writeFileString(path_.join(dir, "ok"), "1");
      const ok = yield* fs.readFileString(path_.join(dir, "ok"));
      deepStrictEqual(ok, "1");
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("copyGlobCached copies while preserving structure", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;
      const src = path_.join(base, "src");
      const out = path_.join(base, "out");
      yield* fs.makeDirectory(path_.join(src, "a"), { recursive: true });
      yield* fs.writeFileString(path_.join(src, "a", "b.txt"), "B");
      yield* fs.writeFileString(path_.join(src, "c.txt"), "C");

      yield* utils.copyGlobCached(src, "**/*", out);
      const pb = yield* fs.readFileString(path_.join(out, "a", "b.txt"));
      const pc = yield* fs.readFileString(path_.join(out, "c.txt"));
      deepStrictEqual(pb, "B");
      deepStrictEqual(pc, "C");
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("rmAndMkdir removes and recreates directory", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;
      const dir = path_.join(base, "dir");
      yield* fs.makeDirectory(dir, { recursive: true });
      yield* fs.writeFileString(path_.join(dir, "old.txt"), "OLD");
      yield* utils.rmAndMkdir(dir);
      const oldExists = yield* Effect.either(fs.access(path_.join(dir, "old.txt")));
      deepStrictEqual(E.isLeft(oldExists), true);
    }).pipe(Effect.provide(TestLayer))
  );

  scoped("readJson and writeJson roundtrip and error handling", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path_ = yield* Path.Path;
      const utils = yield* FsUtils;
      const base = yield* mkTestDirScoped;
      const good = path_.join(base, "good.json");
      const bad = path_.join(base, "bad.json");
      const data = { a: 1, b: [true, null] } as const;
      yield* utils.writeJson(good, data);
      const got = yield* utils.readJson(good);
      deepStrictEqual(got, data);

      yield* fs.writeFileString(bad, "{ bad json");
      const res = yield* Effect.either(utils.readJson(bad));
      deepStrictEqual(E.isLeft(res), true);
    }).pipe(Effect.provide(TestLayer))
  );
});
