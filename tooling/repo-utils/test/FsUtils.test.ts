import { FsUtils, FsUtilsLive } from "@beep/repo-utils/FsUtils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as Fs from "effect/FileSystem";
import * as O from "effect/Option";
import * as Str from "effect/String";

// Build a TestLayer that provides FsUtils AND also passes through FileSystem/Path
// so tests can use them directly (e.g. for makeTempDirectory)
const PlatformLayer = Layer.mergeAll(NodeServices.layer);
const TestLayer = FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer));

layer(TestLayer)("FsUtils", (it) => {
  describe("glob", () => {
    it.effect(
      "should match files with a pattern",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const results = yield* utils.glob("src/**/*.ts", {
          cwd: `${__dirname}/..`,
        });
        expect(results.length).toBeGreaterThan(0);
        expect(results.some((r) => r.includes("index.ts"))).toBe(true);
      })
    );

    it.effect(
      "should return empty array for non-matching pattern",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const results = yield* utils.glob("**/*.nonexistent-ext-xyz", {
          cwd: `${__dirname}/..`,
        });
        expect(results).toEqual([]);
      })
    );

    it.effect(
      "should respect ignore option",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const results = yield* utils.glob("src/**/*.ts", {
          cwd: `${__dirname}/..`,
          ignore: ["**/errors/**"],
        });
        expect(results.every((r) => !r.includes("errors/"))).toBe(true);
      })
    );
  });

  describe("globFiles", () => {
    it.effect(
      "should only return files, not directories",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const results = yield* utils.globFiles("src/**", {
          cwd: `${__dirname}/..`,
        });
        // All results should have file extensions (not bare directory names)
        expect(results.length).toBeGreaterThan(0);
        expect(results.every((r) => r.includes("."))).toBe(true);
      })
    );
  });

  describe("readJson / writeJson", () => {
    it.effect(
      "should round-trip JSON through write and read",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const fs = yield* Fs.FileSystem;
        const tmpDir = yield* fs.makeTempDirectory();

        const filePath = `${tmpDir}/test.json`;
        const data = { name: "test-pkg", version: "1.0.0" };

        yield* utils.writeJson(filePath, data);
        const result = yield* utils.readJson(filePath);

        expect(result).toEqual(O.some(data));

        // Clean up
        yield* fs.remove(tmpDir, { recursive: true });
      })
    );

    it.effect(
      "should write with 2-space indentation and trailing newline",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const fs = yield* Fs.FileSystem;
        const tmpDir = yield* fs.makeTempDirectory();

        const filePath = `${tmpDir}/formatted.json`;
        yield* utils.writeJson(filePath, { a: 1 });

        const raw = yield* fs.readFileString(filePath);
        expect(raw).toBe('{\n  "a": 1\n}\n');

        yield* fs.remove(tmpDir, { recursive: true });
      })
    );

    it.effect(
      "should fail with NoSuchFileError for missing file",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const result = yield* utils
          .readJson("/nonexistent/path/file.json")
          .pipe(Effect.catchTag("NoSuchFileError", (e) => Effect.succeed(`caught: ${e.path}`)));
        expect(result).toBe("caught: /nonexistent/path/file.json");
      })
    );

    it.effect(
      "should return None for invalid JSON",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const fs = yield* Fs.FileSystem;
        const tmpDir = yield* fs.makeTempDirectory();

        const filePath = `${tmpDir}/bad.json`;
        yield* fs.writeFileString(filePath, "not valid json {{{");

        const result = yield* utils.readJson(filePath);
        expect(result).toEqual(O.none());

        yield* fs.remove(tmpDir, { recursive: true });
      })
    );
  });

  describe("modifyFile", () => {
    it.effect(
      "should modify file content and return true",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const fs = yield* Fs.FileSystem;
        const tmpDir = yield* fs.makeTempDirectory();

        const filePath = `${tmpDir}/modify.txt`;
        yield* fs.writeFileString(filePath, "hello world");

        const changed = yield* utils.modifyFile(filePath, (content) => Str.replace("world", "effect")(content));
        expect(changed).toBe(true);

        const result = yield* fs.readFileString(filePath);
        expect(result).toBe("hello effect");

        yield* fs.remove(tmpDir, { recursive: true });
      })
    );

    it.effect(
      "should return false and not write when content unchanged",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const fs = yield* Fs.FileSystem;
        const tmpDir = yield* fs.makeTempDirectory();

        const filePath = `${tmpDir}/noop.txt`;
        yield* fs.writeFileString(filePath, "unchanged");

        const changed = yield* utils.modifyFile(filePath, (content) => content);
        expect(changed).toBe(false);

        yield* fs.remove(tmpDir, { recursive: true });
      })
    );

    it.effect(
      "should fail with NoSuchFileError for missing file",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const result = yield* utils
          .modifyFile("/nonexistent/file.txt", (c) => c)
          .pipe(Effect.catchTag("NoSuchFileError", (e) => Effect.succeed(`caught: ${e.path}`)));
        expect(result).toBe("caught: /nonexistent/file.txt");
      })
    );
  });

  describe("existsOrThrow", () => {
    it.effect(
      "should succeed for existing path",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const fs = yield* Fs.FileSystem;
        const tmpDir = yield* fs.makeTempDirectory();
        yield* utils.existsOrThrow(tmpDir);
        yield* fs.remove(tmpDir, { recursive: true });
      })
    );

    it.effect(
      "should fail for non-existing path",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const result = yield* utils
          .existsOrThrow("/nonexistent/path/xyz")
          .pipe(Effect.catchTag("NoSuchFileError", (e) => Effect.succeed(`caught: ${e.path}`)));
        expect(result).toBe("caught: /nonexistent/path/xyz");
      })
    );
  });

  describe("isDirectory / isFile", () => {
    it.effect(
      "should return true for a directory",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const fs = yield* Fs.FileSystem;
        const tmpDir = yield* fs.makeTempDirectory();

        expect(yield* utils.isDirectory(tmpDir)).toBe(true);
        expect(yield* utils.isFile(tmpDir)).toBe(false);

        yield* fs.remove(tmpDir, { recursive: true });
      })
    );

    it.effect(
      "should return true for a file",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const fs = yield* Fs.FileSystem;
        const tmpFile = yield* fs.makeTempFile();

        expect(yield* utils.isFile(tmpFile)).toBe(true);
        expect(yield* utils.isDirectory(tmpFile)).toBe(false);

        yield* fs.remove(tmpFile);
      })
    );
  });

  describe("getParentDirectory", () => {
    it.effect(
      "should return the parent directory",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const parent = yield* utils.getParentDirectory("/foo/bar/baz.ts");
        expect(parent).toBe("/foo/bar");
      })
    );

    it.effect(
      "should handle root path",
      Effect.fn(function* () {
        const utils = yield* FsUtils;
        const parent = yield* utils.getParentDirectory("/");
        expect(parent).toBe("/");
      })
    );
  });
});
// bench
