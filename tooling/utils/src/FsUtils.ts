import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Glob from "glob";

const make = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;

  const glob = (
    pattern: string | ReadonlyArray<string>,
    options?: Glob.GlobOptions,
  ) =>
    Effect.tryPromise({
      try: () => Glob.glob(pattern as any, options as any),
      catch: (e) => new Error(`glob failed: ${e}`),
    }).pipe(Effect.withSpan("FsUtils.glob"));

  const globFiles = (
    pattern: string | ReadonlyArray<string>,
    options: Glob.GlobOptions = {},
  ) => glob(pattern, { ...options, nodir: true });

  const modifyFile = (path: string, f: (s: string, path: string) => string) =>
    fs.readFileString(path).pipe(
      Effect.bindTo("original"),
      Effect.let("modified", ({ original }) => f(original, path)),
      Effect.flatMap(({ modified, original }) =>
        original === modified
          ? Effect.void
          : fs.writeFile(path, new TextEncoder().encode(modified)),
      ),
      Effect.withSpan("FsUtils.modifyFile", { attributes: { path } }),
    );

  const modifyGlob = (
    pattern: string | ReadonlyArray<string>,
    f: (s: string, path: string) => string,
    options?: Glob.GlobOptions,
  ) =>
    globFiles(pattern, options).pipe(
      Effect.flatMap((paths) =>
        Effect.forEach(paths, (path) => modifyFile(path, f), {
          concurrency: "inherit",
          discard: true,
        }),
      ),
      Effect.withSpan("FsUtils.modifyGlob", { attributes: { pattern } }),
    );

  const rmAndCopy = (from: string, to: string) =>
    fs
      .remove(to, { recursive: true })
      .pipe(
        Effect.ignore,
        Effect.zipRight(fs.copy(from, to)),
        Effect.withSpan("FsUtils.rmAndCopy", { attributes: { from, to } }),
      );

  const copyIfExists = (from: string, to: string) =>
    fs.access(from).pipe(
      Effect.zipRight(Effect.ignore(fs.remove(to, { recursive: true }))),
      Effect.zipRight(fs.copy(from, to)),
      Effect.catchTag("SystemError", (e) =>
        e.reason === "NotFound" ? Effect.void : Effect.fail(e),
      ),
      Effect.withSpan("FsUtils.copyIfExists", { attributes: { from, to } }),
    );

  const mkdirCached_ = yield* Effect.cachedFunction((path: string) =>
    fs
      .makeDirectory(path, { recursive: true })
      .pipe(Effect.withSpan("FsUtils.mkdirCached", { attributes: { path } })),
  );

  const mkdirCached = (path: string) => mkdirCached_(path_.resolve(path));

  const copyGlobCached = (baseDir: string, pattern: string, to: string) =>
    globFiles(path_.join(baseDir, pattern)).pipe(
      Effect.flatMap(
        Effect.forEach(
          (path) => {
            const dest = path_.join(to, path_.relative(baseDir, path));
            const destDir = path_.dirname(dest);
            return mkdirCached(destDir).pipe(
              Effect.zipRight(fs.copyFile(path, dest)),
            );
          },
          { concurrency: "inherit", discard: true },
        ),
      ),
      Effect.withSpan("FsUtils.copyGlobCached", {
        attributes: { baseDir, pattern, to },
      }),
    );

  const rmAndMkdir = (path: string) =>
    fs
      .remove(path, { recursive: true })
      .pipe(
        Effect.ignore,
        Effect.zipRight(mkdirCached(path)),
        Effect.withSpan("FsUtils.rmAndMkdir", { attributes: { path } }),
      );

  const readJson = (path: string) =>
    Effect.tryMap(fs.readFileString(path), {
      try: (_) => JSON.parse(_),
      catch: (e) => new Error(`readJson failed (${path}): ${e}`),
    });

  const writeJson = (path: string, json: unknown) =>
    fs.writeFileString(
      path,
      `${JSON.stringify(json, null, 2)}
`,
    );

  return {
    glob,
    globFiles,
    modifyFile,
    modifyGlob,
    copyIfExists,
    rmAndMkdir,
    rmAndCopy,
    mkdirCached,
    copyGlobCached,
    readJson,
    writeJson,
  } as const;
});

export interface FsUtils extends Effect.Effect.Success<typeof make> {}

export const FsUtils = Context.GenericTag<FsUtils>(
  "@beep/tooling-utils/FsUtils",
);
export const FsUtilsLive = Layer.effect(FsUtils, make).pipe(
  Layer.provide(NodeFileSystem.layer),
  Layer.provide(NodePath.layerPosix),
);
