import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { FileSystem, Path } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option, pipe } from "effect";

const NFS: typeof import("node:fs") = createRequire(import.meta.url)("node:fs");

const makeTempDir = (): string => {
  const dir = Path.join(tmpdir(), `beep-fs-${randomUUID()}`);
  NFS.mkdirSync(dir, { recursive: true });
  return dir;
};

const cleanup = (dir: string): void => NFS.rmSync(dir, { recursive: true, force: true });

describe("FileSystem sync wrappers", () => {
  it("appendFileSync appends to a file, creating it", () => {
    const dir = makeTempDir();
    try {
      const file = Path.join(dir, "log.txt");
      Effect.runSync(FileSystem.appendFileSync(file, "a"));
      Effect.runSync(FileSystem.appendFileSync(file, "b"));
      Effect.runSync(pipe(file, FileSystem.appendFileSync("c", { flag: "a" })));
      expect(NFS.readFileSync(file, "utf8")).toBe("abc");
    } finally {
      cleanup(dir);
    }
  });

  it("existsSync reports presence without a failure channel", () => {
    const dir = makeTempDir();
    try {
      const file = Path.join(dir, "present.txt");
      Effect.runSync(FileSystem.appendFileSync(file, "x"));
      expect(Effect.runSync(FileSystem.existsSync(file))).toBe(true);
      expect(Effect.runSync(FileSystem.existsSync(Path.join(dir, "absent.txt")))).toBe(false);
    } finally {
      cleanup(dir);
    }
  });

  it("statSync returns a File.Info with branded bigint size", () => {
    const dir = makeTempDir();
    try {
      const file = Path.join(dir, "data.txt");
      Effect.runSync(FileSystem.appendFileSync(file, "hello"));
      const fileInfo = Effect.runSync(FileSystem.statSync(file));
      expect(fileInfo.type).toBe("File");
      expect(typeof fileInfo.size).toBe("bigint");
      expect(fileInfo.size).toBe(5n);
      expect(Option.isSome(fileInfo.mtime)).toBe(true);

      const dirInfo = Effect.runSync(FileSystem.statSync(dir));
      expect(dirInfo.type).toBe("Directory");
    } finally {
      cleanup(dir);
    }
  });

  it("readdirSync lists names, and Dirent entries with { withFileTypes: true }", () => {
    const dir = makeTempDir();
    try {
      Effect.runSync(FileSystem.appendFileSync(Path.join(dir, "file.txt"), "x"));
      NFS.mkdirSync(Path.join(dir, "sub"));

      const names = Effect.runSync(FileSystem.readdirSync(dir));
      expect([...names].sort()).toEqual(["file.txt", "sub"]);

      const entries = Effect.runSync(FileSystem.readdirSync(dir, { withFileTypes: true }));
      const subEntry = entries.find((entry) => entry.name === "sub");
      expect(Option.isSome(Option.fromNullishOr(subEntry))).toBe(true);
      expect(subEntry?.isDirectory()).toBe(true);
    } finally {
      cleanup(dir);
    }
  });

  it("renameSync moves a path", () => {
    const dir = makeTempDir();
    try {
      const from = Path.join(dir, "old.txt");
      const to = Path.join(dir, "new.txt");
      Effect.runSync(FileSystem.appendFileSync(from, "x"));
      Effect.runSync(FileSystem.renameSync(from, to));
      expect(Effect.runSync(FileSystem.existsSync(from))).toBe(false);
      expect(Effect.runSync(FileSystem.existsSync(to))).toBe(true);

      const movedAgain = Path.join(dir, "again.txt");
      Effect.runSync(pipe(to, FileSystem.renameSync(movedAgain)));
      expect(Effect.runSync(FileSystem.existsSync(to))).toBe(false);
      expect(Effect.runSync(FileSystem.existsSync(movedAgain))).toBe(true);
    } finally {
      cleanup(dir);
    }
  });

  it("rmSync removes a populated directory with { recursive, force }", () => {
    const dir = makeTempDir();
    try {
      const target = Path.join(dir, "tree");
      NFS.mkdirSync(target);
      Effect.runSync(FileSystem.appendFileSync(Path.join(target, "leaf.txt"), "x"));
      Effect.runSync(FileSystem.rmSync(target, { recursive: true, force: true }));
      expect(Effect.runSync(FileSystem.existsSync(target))).toBe(false);
    } finally {
      cleanup(dir);
    }
  });

  it("maps ENOENT to a PlatformError whose reason is NotFound", () => {
    const error = Effect.runSync(Effect.flip(FileSystem.statSync(Path.join(tmpdir(), `beep-missing-${randomUUID()}`))));
    expect(error.reason._tag).toBe("NotFound");
    expect(error.reason.module).toBe("FileSystem");
    expect(error.reason.method).toBe("statSync");
  });
});
