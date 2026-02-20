import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import { systemError } from "effect/PlatformError";

/**
 * Build a lightweight in-memory FileSystem + Path layer for hook tests.
 */
export const createMemoryFs = (
  initialFiles: ReadonlyArray<readonly [string, string]>
): {
  readonly layer: Layer.Layer<FileSystem.FileSystem | Path.Path>;
} => {
  const files = new Map<string, string>();
  const dirs = new Set<string>();

  pipe(
    initialFiles,
    A.forEach(([filePath, content]) => {
      files.set(filePath, content);
      const parts = filePath.split("/");
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join("/"));
      }
    })
  );

  const fsLayer = FileSystem.layerNoop({
    exists: (path: string) => Effect.succeed(files.has(path) || dirs.has(path)),
    readFileString: (path: string) => {
      const content = files.get(path);
      if (content !== undefined) {
        return Effect.succeed(content);
      }
      return Effect.fail(
        systemError({
          _tag: "NotFound",
          module: "FileSystem",
          method: "readFileString",
          pathOrDescriptor: path,
          description: `File not found: ${path}`,
        })
      );
    },
    writeFileString: (path: string, content: string) => {
      files.set(path, content);
      return Effect.void;
    },
    readDirectory: (path: string) => {
      const entries: Array<string> = [];
      for (const filePath of files.keys()) {
        if (filePath.startsWith(`${path}/`)) {
          const remaining = filePath.slice(path.length + 1);
          const firstPart = remaining.split("/")[0];
          if (!entries.includes(firstPart)) {
            entries.push(firstPart);
          }
        }
      }
      return Effect.succeed(entries);
    },
    stat: (path: string) => {
      if (files.has(path)) {
        return Effect.succeed({
          type: "File" as const,
          mtime: new Date(),
          atime: new Date(),
          birthtime: new Date(),
          dev: 0,
          ino: 0,
          mode: 0o644,
          nlink: 1,
          uid: 0,
          gid: 0,
          rdev: 0,
          size: FileSystem.Size(100),
          blksize: FileSystem.Size(4096),
          blocks: 1,
        });
      }
      return Effect.fail(
        systemError({
          _tag: "NotFound",
          module: "FileSystem",
          method: "stat",
          pathOrDescriptor: path,
          description: `Not found: ${path}`,
        })
      );
    },
  });

  const pathLayer = Layer.mock(Path.Path)({
    [Path.TypeId]: Path.TypeId,
    join: (...parts: ReadonlyArray<string>) => parts.join("/"),
    resolve: (...parts: ReadonlyArray<string>) => parts.join("/"),
    dirname: (p: string) => {
      const lastSlash = p.lastIndexOf("/");
      return lastSlash >= 0 ? p.slice(0, lastSlash) : ".";
    },
    basename: (p: string) => {
      const lastSlash = p.lastIndexOf("/");
      return lastSlash >= 0 ? p.slice(lastSlash + 1) : p;
    },
    extname: (p: string) => {
      const dot = p.lastIndexOf(".");
      return dot >= 0 ? p.slice(dot) : "";
    },
    format: (obj) => [obj.dir, obj.base].filter(Boolean).join("/"),
    fromFileUrl: (url) => Effect.succeed(url.pathname),
    isAbsolute: (p) => p.startsWith("/"),
    normalize: (p) => p,
    parse: (p) => {
      const lastSlash = p.lastIndexOf("/");
      const base = lastSlash >= 0 ? p.slice(lastSlash + 1) : p;
      const dot = base.lastIndexOf(".");
      const ext = dot >= 0 ? base.slice(dot) : "";
      const name = ext ? base.slice(0, -ext.length) : base;
      const dir = lastSlash >= 0 ? p.slice(0, lastSlash) : "";
      return { root: p.startsWith("/") ? "/" : "", dir, base, ext, name };
    },
    relative: (_from, to) => to,
    toFileUrl: (p) => Effect.succeed(new URL(`file://${p}`)),
    toNamespacedPath: (p) => p,
    sep: "/",
  });

  const layer = Layer.mergeAll(fsLayer, pathLayer);

  return { layer };
};
