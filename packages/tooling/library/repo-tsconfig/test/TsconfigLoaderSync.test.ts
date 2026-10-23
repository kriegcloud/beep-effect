import { MemoryFileSystem } from "@beep/memfs";
import { TsconfigExtendsError, TsconfigLoader } from "@beep/repo-tsconfig/TsconfigLoader";
import { TsconfigLoaderSync } from "@beep/repo-tsconfig/TsconfigLoaderSync";
import * as NodePath from "@effect/platform-node/NodePath";
import { assert, describe, it, layer } from "@effect/vitest";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as PlatformError from "effect/PlatformError";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { fixtureLayer, tree } from "./support/fixtures.ts";
import type { SyncFileSystem, TsconfigLoaderSyncOptions } from "@beep/repo-tsconfig/TsconfigLoaderSync";
import type { FixtureTree } from "./support/fixtures.ts";

/**
 * A `SyncFileSystem` over a real memfs volume: the handle's `sync` port is
 * node-shaped (`exists` follows links and is directory-true, `readFile`
 * throws node's exact errno on a miss), so it satisfies the consumer contract
 * structurally with no adapter. Contents are only what the tree seeds.
 */
const syncFs = (files: FixtureTree): SyncFileSystem => MemoryFileSystem.makeSync(files).sync;

// Pure Layer.succeed providers retain Node's exact POSIX and Win32 path methods.
const posixPath = NodePath.layerPosix.pipe(
  Layer.build,
  Effect.map(Context.get(Path.Path)),
  Effect.scoped,
  Effect.runSync
);
const win32Path = NodePath.layerWin32.pipe(
  Layer.build,
  Effect.map(Context.get(Path.Path)),
  Effect.scoped,
  Effect.runSync
);

const posixOptions = (files: FixtureTree): TsconfigLoaderSyncOptions => ({
  fileSystem: syncFs(files),
  path: posixPath,
});

/** Run `fn`, returning what it throws; fails the test if it returns instead. */
const capture = (fn: () => unknown): unknown => {
  let thrown: unknown;
  let threw = false;
  try {
    fn();
  } catch (error) {
    thrown = error;
    threw = true;
  }
  assert.isTrue(threw, "expected the call to throw");
  return thrown;
};

// ---------------------------------------------------------------------------
// The shared extends-chain fixture: derived wins over base per key.
// ---------------------------------------------------------------------------

const CHAIN_TREE = tree(
  ["/proj/tsconfig.json", `{ "extends": "./base.json", "compilerOptions": { "strict": true, "target": "es2024" } }`],
  ["/proj/base.json", `{ "compilerOptions": { "target": "es2015", "module": "esnext" } }`]
);

describe("TsconfigLoaderSync.load", () => {
  it("reads and decodes one config without touching extends", () => {
    const doc = TsconfigLoaderSync.load("/proj/tsconfig.json", posixOptions(CHAIN_TREE));
    assert.strictEqual(doc.extends, "./base.json");
    assert.deepStrictEqual(doc.compilerOptions?.strict, true);
  });
});

describe("TsconfigLoaderSync.resolve", () => {
  const directoryFiles = tree(
    ["/proj/tsconfig.json", '{"extends":"./base"}'],
    ["/proj/base/child.json", "{}"],
    ["/proj/base.json", '{"compilerOptions":{"strict":true}}']
  );

  it("skips directories when the optional isFile capability is supplied", () => {
    const fs = MemoryFileSystem.makeSync(directoryFiles).sync;
    const resolved = TsconfigLoaderSync.resolve("/proj/tsconfig.json", {
      path: posixPath,
      fileSystem: { ...fs, isFile: (path) => fs.exists(path) && fs.stat(path).isFile() },
    });
    assert.strictEqual(resolved.compilerOptions.strict, true);
    assert.deepStrictEqual(resolved.extendedPaths, ["/proj/base.json", "/proj/tsconfig.json"]);
  });

  it("retains the exists fallback for adapters without isFile", () => {
    const thrown = capture(() => TsconfigLoaderSync.resolve("/proj/tsconfig.json", posixOptions(directoryFiles)));
    assert.isTrue(PlatformError.isPlatformError(thrown));
  });

  it("wraps an isFile failure as a typed stat error", () => {
    const cause = PlatformError.badArgument({ module: "fixture", method: "isFile" });
    const thrown = capture(() =>
      TsconfigLoaderSync.resolve("/proj/tsconfig.json", {
        path: posixPath,
        fileSystem: {
          ...syncFs(directoryFiles),
          isFile: () => {
            throw cause;
          },
        },
      })
    );
    assert.isTrue(PlatformError.isPlatformError(thrown));
    if (PlatformError.isPlatformError(thrown)) {
      assert.strictEqual(thrown.reason.method, "stat");
      assert.strictEqual(thrown.cause, cause);
    }
  });
  it("resolves a single config with no extends", () => {
    const files = tree(["/proj/tsconfig.json", `{ "compilerOptions": { "strict": true } }`]);
    const resolved = TsconfigLoaderSync.resolve("/proj/tsconfig.json", posixOptions(files));
    assert.strictEqual(resolved.configPath, "/proj/tsconfig.json");
    assert.deepStrictEqual(resolved.extendedPaths, ["/proj/tsconfig.json"]);
    assert.strictEqual(resolved.compilerOptions.strict, true);
  });

  it("folds an extends chain derived-wins", () => {
    const resolved = TsconfigLoaderSync.resolve("/proj/tsconfig.json", posixOptions(CHAIN_TREE));
    assert.deepStrictEqual(resolved.extendedPaths, ["/proj/base.json", "/proj/tsconfig.json"]);
    // Derived wins on the shared key; the base-only key survives.
    assert.strictEqual(resolved.compilerOptions.target, "es2024");
    assert.strictEqual(resolved.compilerOptions.module, "esnext");
    assert.strictEqual(resolved.compilerOptions.strict, true);
  });

  it("decodes JSONC input (comments and trailing commas)", () => {
    const files = tree([
      "/proj/tsconfig.json",
      `{
				// the one live option
				"compilerOptions": {
					"strict": true, /* trailing comma below */
				},
			}`,
    ]);
    const resolved = TsconfigLoaderSync.resolve("/proj/tsconfig.json", posixOptions(files));
    assert.strictEqual(resolved.compilerOptions.strict, true);
  });

  it("throws the wrapped PlatformError for a missing file", () => {
    const thrown = capture(() => TsconfigLoaderSync.resolve("/proj/absent.json", posixOptions(tree())));
    assert.instanceOf(thrown, PlatformError.PlatformError);
    if (!PlatformError.isPlatformError(thrown)) return assert.fail("expected PlatformError");
    const error = thrown;
    assert.strictEqual(error.reason._tag, "Unknown");
    assert.strictEqual(error.reason.module, "FileSystem");
    assert.strictEqual(error.reason.method, "readFileString");
    // The original throw rides as the cause: the volume's own ENOENT, not a fabricated one.
    const cause = error.reason.cause;
    if (!P.hasProperty(cause, "code")) return assert.fail("expected errno cause");
    assert.strictEqual(cause.code, "ENOENT");
  });

  it("throws the typed TsconfigExtendsError on a cycle", () => {
    const files = tree(["/proj/a.json", `{ "extends": "./b.json" }`], ["/proj/b.json", `{ "extends": "./a.json" }`]);
    const thrown = capture(() => TsconfigLoaderSync.resolve("/proj/a.json", posixOptions(files)));
    assert.instanceOf(thrown, TsconfigExtendsError);
    if (!S.is(TsconfigExtendsError)(thrown)) return assert.fail("expected TsconfigExtendsError");
    assert.strictEqual(thrown.reason, "cycle");
  });
});

describe("TsconfigLoaderSync.compilerOptions", () => {
  it("projects resolve().compilerOptions", () => {
    const options = posixOptions(CHAIN_TREE);
    const projected = TsconfigLoaderSync.compilerOptions("/proj/tsconfig.json", options);
    assert.deepStrictEqual(projected, TsconfigLoaderSync.resolve("/proj/tsconfig.json", options).compilerOptions);
    assert.strictEqual(projected.target, "es2024");
  });
});

// ---------------------------------------------------------------------------
// Async/sync parity: the same fixture through both pipelines.
// ---------------------------------------------------------------------------

layer(fixtureLayer(CHAIN_TREE), { timeout: "30 seconds" })("TsconfigLoaderSync parity with TsconfigLoader", (it) => {
  it.effect("resolve returns the exact async result on the same fixture", () =>
    Effect.gen(function* () {
      const viaAsync = yield* TsconfigLoader.resolve("/proj/tsconfig.json");
      const viaSync = TsconfigLoaderSync.resolve("/proj/tsconfig.json", posixOptions(CHAIN_TREE));
      assert.deepStrictEqual(viaSync, viaAsync);
    })
  );

  it.effect("TsconfigLoader.compilerOptions projects the resolved options", () =>
    Effect.gen(function* () {
      const resolved = yield* TsconfigLoader.resolve("/proj/tsconfig.json");
      const projected = yield* TsconfigLoader.compilerOptions("/proj/tsconfig.json");
      assert.deepStrictEqual(projected, resolved.compilerOptions);
      assert.strictEqual(projected.target, "es2024");
    })
  );
});

// ---------------------------------------------------------------------------
// The consumer's path implementation is respected end to end: a win32-
// flavored SyncPath (drive-letter roots, backslash output) drives the whole
// resolution. Under the posix implementation these inputs would resolve
// against the test process cwd instead of the drive root.
// ---------------------------------------------------------------------------

/**
 * memfs is a POSIX volume, so a win32 path reaches it through a two-member
 * shim: backslashes become forward slashes and a drive root `C:` becomes the
 * top-level directory `/C:`. Only the spelling is translated — existence and
 * content still come from the volume. This suite is about the consumer's
 * `SyncPath` driving resolution, not about Windows filesystem semantics.
 */
const win32Fs = (files: FixtureTree): SyncFileSystem => {
  const toVolume = (p: string): string => {
    const slashed = Str.replace(/\\/g, "/")(p);
    return /^[A-Za-z]:\//.test(slashed) ? `/${slashed}` : slashed;
  };
  const port = MemoryFileSystem.makeSync(R.mapKeys(files, toVolume)).sync;
  return { exists: (p) => port.exists(toVolume(p)), readFile: (p) => port.readFile(toVolume(p)) };
};

describe("TsconfigLoaderSync with a win32 SyncPath", () => {
  const files = tree(
    ["C:/proj/tsconfig.json", `{ "extends": ".\\\\base.json", "compilerOptions": { "strict": true } }`],
    ["C:/proj/base.json", `{ "compilerOptions": { "target": "es2022" } }`]
  );
  const options: TsconfigLoaderSyncOptions = { fileSystem: win32Fs(files), path: win32Path };

  it("resolves a backslash extends chain under drive-letter roots", () => {
    const resolved = TsconfigLoaderSync.resolve("C:\\proj\\tsconfig.json", options);
    // The loader's documented normalize-to-forward-slash policy, applied to
    // paths the win32 implementation produced: drive-letter roots survive,
    // which the posix implementation could never have yielded.
    assert.strictEqual(resolved.configPath, "C:/proj/tsconfig.json");
    assert.deepStrictEqual(resolved.extendedPaths, ["C:/proj/base.json", "C:/proj/tsconfig.json"]);
    assert.strictEqual(resolved.compilerOptions.strict, true);
    assert.strictEqual(resolved.compilerOptions.target, "es2022");
  });

  it("treats a drive-letter path as absolute only under the supplied implementation", () => {
    // The premise the suite rests on, pinned: the two implementations
    // genuinely disagree about these inputs.
    assert.isTrue(win32Path.isAbsolute("C:\\proj\\tsconfig.json"));
    assert.isFalse(posixPath.isAbsolute("C:\\proj\\tsconfig.json"));
  });
});

// ---------------------------------------------------------------------------
// The optional realPath: a package target is realpathed through the consumer's
// function, and the identity stands in when the consumer supplies none.
// ---------------------------------------------------------------------------

/**
 * A linked workspace package, spelled as the two places it lives: the files exist under
 * `/proj/packages/lib`, and `/proj/app/node_modules/lib` is the same directory seen through a link.
 */
const LINKED_TREE = tree(
  ["/proj/packages/base/tsconfig.base.json", `{ "compilerOptions": { "strict": true } }`],
  ["/proj/packages/lib/tsconfig.json", `{ "extends": "../base/tsconfig.base.json" }`],
  ["/proj/app/node_modules/lib/tsconfig.json", `{ "extends": "../base/tsconfig.base.json" }`],
  ["/proj/app/tsconfig.json", `{ "extends": "lib/tsconfig.json" }`]
);

/** The link the tree models, as `realpathSync` would report it. */
const linkedRealPath = (p: string): string =>
  Str.startsWith("/proj/app/node_modules/lib/")(p) ? `/proj/packages/lib/${Str.slice(27)(p)}` : p;

describe("TsconfigLoaderSync realPath", () => {
  it("realpaths a package target through the consumer's realPath", () => {
    const options: TsconfigLoaderSyncOptions = {
      fileSystem: { ...syncFs(LINKED_TREE), realPath: linkedRealPath },
      path: posixPath,
    };
    const resolved = TsconfigLoaderSync.resolve("/proj/app/tsconfig.json", options);
    assert.deepStrictEqual(resolved.extendedPaths, [
      "/proj/packages/base/tsconfig.base.json",
      "/proj/packages/lib/tsconfig.json",
      "/proj/app/tsconfig.json",
    ]);
    assert.strictEqual(resolved.compilerOptions.strict, true);
  });

  it("keeps a package target as found when realPath is absent", () => {
    const thrown = capture(() => TsconfigLoaderSync.resolve("/proj/app/tsconfig.json", posixOptions(LINKED_TREE)));
    if (!S.is(TsconfigExtendsError)(thrown)) return assert.fail("expected TsconfigExtendsError");
    assert.strictEqual(thrown.reason, "not-found");
    assert.strictEqual(thrown.path, "/proj/app/node_modules/lib/tsconfig.json");
  });

  it("throws the wrapped PlatformError when realPath throws", () => {
    // An empty volume's readFile throws node's exact ENOENT for any path: a realistic realPath failure.
    const options: TsconfigLoaderSyncOptions = {
      fileSystem: { ...syncFs(LINKED_TREE), realPath: syncFs(tree()).readFile },
      path: posixPath,
    };
    const thrown = capture(() => TsconfigLoaderSync.resolve("/proj/app/tsconfig.json", options));
    if (!PlatformError.isPlatformError(thrown)) return assert.fail("expected PlatformError");
    assert.strictEqual(thrown.reason.method, "realPath");
    const cause = thrown.reason.cause;
    if (!P.hasProperty(cause, "code")) return assert.fail("expected errno cause");
    assert.strictEqual(cause.code, "ENOENT");
  });
});
