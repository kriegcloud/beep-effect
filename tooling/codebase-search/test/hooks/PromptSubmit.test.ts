import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import { systemError } from "effect/PlatformError";
import * as Str from "effect/String";

import type { SearchResultForHook } from "../../src/hooks/PromptSubmit.js";
import {
  BM25_INDEX_FILE,
  constructSearchQuery,
  formatContextInjection,
  formatSymbolIdResults,
  MAX_QUERY_LENGTH,
  promptSubmitHook,
  shouldSkipSearch,
} from "../../src/hooks/PromptSubmit.js";
import { INDEX_DIR } from "../../src/hooks/SessionStart.js";

// ---------------------------------------------------------------------------
// In-memory filesystem (matches SessionStart.test.ts pattern)
// ---------------------------------------------------------------------------

const createMemoryFs = (
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

const runWithFs = <A, E>(
  initialFiles: ReadonlyArray<readonly [string, string]>,
  effect: Effect.Effect<A, E, FileSystem.FileSystem | Path.Path>
): Effect.Effect<A, E> => {
  const { layer } = createMemoryFs(initialFiles);
  return Effect.provide(effect, layer);
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PromptSubmit", () => {
  // -------------------------------------------------------------------------
  // shouldSkipSearch — pure function tests
  // -------------------------------------------------------------------------

  describe("shouldSkipSearch", () => {
    it("skips short prompts (< 15 chars)", () => {
      expect(shouldSkipSearch("fix bug")).toBe(true);
      expect(shouldSkipSearch("hello")).toBe(true);
      expect(shouldSkipSearch("short prompt")).toBe(true);
    });

    it("skips slash commands (/commit, /help)", () => {
      expect(shouldSkipSearch("/commit all changes")).toBe(true);
      expect(shouldSkipSearch("/help me understand")).toBe(true);
      expect(shouldSkipSearch("/review-pr 123 please")).toBe(true);
    });

    it("skips git operations", () => {
      expect(shouldSkipSearch("commit all staged changes")).toBe(true);
      expect(shouldSkipSearch("push to origin main branch")).toBe(true);
      expect(shouldSkipSearch("merge feature into main branch")).toBe(true);
      expect(shouldSkipSearch("rebase onto main branch now")).toBe(true);
      expect(shouldSkipSearch("checkout the feature branch")).toBe(true);
      expect(shouldSkipSearch("branch off from main branch")).toBe(true);
      expect(shouldSkipSearch("pull latest from remote origin")).toBe(true);
    });

    it("skips build commands", () => {
      expect(shouldSkipSearch("run the test suite please")).toBe(true);
      expect(shouldSkipSearch("test the search module now")).toBe(true);
      expect(shouldSkipSearch("build the codebase search package")).toBe(true);
      expect(shouldSkipSearch("lint all typescript files")).toBe(true);
      expect(shouldSkipSearch("format the source files")).toBe(true);
    });

    it("skips conversational responses", () => {
      expect(shouldSkipSearch("yes please do that now")).toBe(true);
      expect(shouldSkipSearch("no that is not correct")).toBe(true);
      expect(shouldSkipSearch("ok sounds great to me")).toBe(true);
      expect(shouldSkipSearch("thanks for the help with that")).toBe(true);
      expect(shouldSkipSearch("sure go ahead and do it")).toBe(true);
      expect(shouldSkipSearch("got it will look into it")).toBe(true);
      expect(shouldSkipSearch("sounds good let us proceed")).toBe(true);
    });

    it("does NOT skip creation prompts", () => {
      expect(shouldSkipSearch("create a new schema for user profiles")).toBe(false);
      expect(shouldSkipSearch("implement the search handler for codebase")).toBe(false);
      expect(shouldSkipSearch("add validation to the PackageJson schema")).toBe(false);
      expect(shouldSkipSearch("write a function to parse the config")).toBe(false);
    });

    it("does NOT skip descriptive task prompts", () => {
      expect(shouldSkipSearch("the search results need better formatting")).toBe(false);
      expect(shouldSkipSearch("how does the BM25 indexer work in this project")).toBe(false);
      expect(shouldSkipSearch("refactor the KeywordSearch service to use streams")).toBe(false);
    });

    it("skips general knowledge questions", () => {
      expect(shouldSkipSearch("what is the difference between types")).toBe(true);
      expect(shouldSkipSearch("who is the author of effect")).toBe(true);
      expect(shouldSkipSearch("how does claude handle context")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // constructSearchQuery — pure function tests
  // -------------------------------------------------------------------------

  describe("constructSearchQuery", () => {
    it("strips 'please create a' prefix", () => {
      const result = constructSearchQuery("please create a new schema for users");
      expect(result).toBe("new schema for users");
    });

    it("strips 'can you' prefix", () => {
      const result = constructSearchQuery("can you implement the search handler");
      expect(result).toBe("search handler");
    });

    it("strips 'help me' prefix", () => {
      const result = constructSearchQuery("help me understand the BM25 indexer");
      expect(result).toBe("understand the BM25 indexer");
    });

    it("strips 'i need to' prefix", () => {
      const result = constructSearchQuery("i need to add a new service layer");
      expect(result).toBe("new service layer");
    });

    it("strips 'let's' prefix", () => {
      const result = constructSearchQuery("let's build the search pipeline");
      expect(result).toBe("search pipeline");
    });

    it("strips action verbs with articles", () => {
      expect(constructSearchQuery("create a new validation schema")).toBe("new validation schema");
      expect(constructSearchQuery("implement an error handler")).toBe("error handler");
      expect(constructSearchQuery("build the search module")).toBe("search module");
      expect(constructSearchQuery("write a unit test")).toBe("unit test");
      expect(constructSearchQuery("make a new service")).toBe("new service");
      expect(constructSearchQuery("add the missing types")).toBe("missing types");
    });

    it("truncates to 200 chars", () => {
      const longPrompt = "a".repeat(300);
      const result = constructSearchQuery(longPrompt);
      expect(Str.length(result)).toBeLessThanOrEqual(MAX_QUERY_LENGTH);
    });

    it("extracts first sentence when long", () => {
      const longPrompt =
        "Create a new schema for user profiles. " +
        "The schema should include fields for name, email, and role. " +
        "It should also validate that the email is in the correct format. " +
        "Additionally we need to handle the case where the user is an admin. " +
        "This is very important for the project.";
      const result = constructSearchQuery(longPrompt);
      // "create" and "a" are stripped, so "new schema for user profiles." should be extracted
      expect(Str.length(result)).toBeLessThanOrEqual(MAX_QUERY_LENGTH);
    });

    it("handles combined polite + action prefixes", () => {
      const result = constructSearchQuery("please add a new error type");
      expect(result).toBe("new error type");
    });

    it("trims whitespace", () => {
      const result = constructSearchQuery("  implement the thing  ");
      expect(result).toBe("thing");
    });
  });

  // -------------------------------------------------------------------------
  // formatContextInjection — pure function tests
  // -------------------------------------------------------------------------

  describe("formatContextInjection", () => {
    it("returns empty for no results", () => {
      const result = formatContextInjection(A.empty<SearchResultForHook>());
      expect(result).toBe("");
    });

    it("wraps in system-reminder tags", () => {
      const results: ReadonlyArray<SearchResultForHook> = A.make({
        name: "PackageJson",
        kind: "schema",
        filePath: "tooling/repo-utils/src/schemas.ts",
        startLine: 42,
        description: "Schema for package.json files",
        signature: "const PackageJson: S.Struct<...>",
      });
      const result = formatContextInjection(results);
      expect(result).toContain("<system-reminder>");
      expect(result).toContain("</system-reminder>");
      expect(result).toContain("## Relevant Existing Code (auto-discovered)");
    });

    it("includes symbol info", () => {
      const results: ReadonlyArray<SearchResultForHook> = A.make({
        name: "PackageJson",
        kind: "schema",
        filePath: "tooling/repo-utils/src/schemas.ts",
        startLine: 42,
        description: "Schema for package.json files",
        signature: "const PackageJson: S.Struct<...>",
      });
      const result = formatContextInjection(results);
      expect(result).toContain("**PackageJson**");
      expect(result).toContain("(schema)");
      expect(result).toContain("tooling/repo-utils/src/schemas.ts:42");
      expect(result).toContain("Schema for package.json files");
      expect(result).toContain("`const PackageJson: S.Struct<...>`");
    });

    it("truncates long signatures (omits them)", () => {
      const longSig = "x".repeat(150);
      const results: ReadonlyArray<SearchResultForHook> = A.make({
        name: "Foo",
        kind: "function",
        filePath: "src/foo.ts",
        startLine: 1,
        description: "A function",
        signature: longSig,
      });
      const result = formatContextInjection(results);
      expect(result).not.toContain(longSig);
    });

    it("includes signature when short enough", () => {
      const results: ReadonlyArray<SearchResultForHook> = A.make({
        name: "Foo",
        kind: "function",
        filePath: "src/foo.ts",
        startLine: 1,
        description: "A function",
        signature: "const foo: () => void",
      });
      const result = formatContextInjection(results);
      expect(result).toContain("`const foo: () => void`");
    });

    it("omits empty signatures", () => {
      const results: ReadonlyArray<SearchResultForHook> = A.make({
        name: "Foo",
        kind: "function",
        filePath: "src/foo.ts",
        startLine: 1,
        description: "A function",
        signature: "",
      });
      const result = formatContextInjection(results);
      // Should not have a trailing backtick line
      expect(result).toContain("A function");
      expect(result).not.toContain("``");
    });

    it("includes guidance about reuse and search tool", () => {
      const results: ReadonlyArray<SearchResultForHook> = A.make({
        name: "X",
        kind: "type",
        filePath: "src/x.ts",
        startLine: 1,
        description: "Something useful here",
        signature: "type X = string",
      });
      const result = formatContextInjection(results);
      expect(result).toContain("Consider reusing or extending");
      expect(result).toContain("search_codebase");
    });

    it("formats multiple results", () => {
      const results: ReadonlyArray<SearchResultForHook> = A.make(
        {
          name: "Alpha",
          kind: "schema",
          filePath: "src/alpha.ts",
          startLine: 10,
          description: "First schema",
          signature: "const Alpha: S.Struct<...>",
        },
        {
          name: "Beta",
          kind: "service",
          filePath: "src/beta.ts",
          startLine: 20,
          description: "Second service",
          signature: "class Beta extends ServiceMap.Service",
        }
      );
      const result = formatContextInjection(results);
      expect(result).toContain("**Alpha**");
      expect(result).toContain("**Beta**");
      expect(result).toContain("(schema)");
      expect(result).toContain("(service)");
    });
  });

  // -------------------------------------------------------------------------
  // formatSymbolIdResults — pure function tests
  // -------------------------------------------------------------------------

  describe("formatSymbolIdResults", () => {
    it("returns empty for no results", () => {
      const result = formatSymbolIdResults(A.empty());
      expect(result).toBe("");
    });

    it("wraps in system-reminder tags", () => {
      const results = A.make({ symbolId: "@beep/repo-utils/schemas/PackageJson", score: 0.85 });
      const result = formatSymbolIdResults(results);
      expect(result).toContain("<system-reminder>");
      expect(result).toContain("</system-reminder>");
    });

    it("extracts name from symbolId", () => {
      const results = A.make({ symbolId: "@beep/repo-utils/schemas/PackageJson", score: 0.85 });
      const result = formatSymbolIdResults(results);
      expect(result).toContain("**PackageJson**");
      expect(result).toContain("@beep/repo-utils/schemas");
    });

    it("includes score", () => {
      const results = A.make({ symbolId: "@beep/repo-utils/schemas/PackageJson", score: 0.85 });
      const result = formatSymbolIdResults(results);
      expect(result).toContain("0.85");
    });
  });

  // -------------------------------------------------------------------------
  // promptSubmitHook — Effect-based tests
  // -------------------------------------------------------------------------

  describe("promptSubmitHook", () => {
    it.effect("returns empty for short prompts", () =>
      runWithFs(
        [],
        Effect.gen(function* () {
          const result = yield* promptSubmitHook("/project", "fix bug");
          expect(result).toBe("");
        })
      )
    );

    it.effect("returns empty for slash commands", () =>
      runWithFs(
        [],
        Effect.gen(function* () {
          const result = yield* promptSubmitHook("/project", "/commit all changes now");
          expect(result).toBe("");
        })
      )
    );

    it.effect("returns empty for git operations", () =>
      runWithFs(
        [],
        Effect.gen(function* () {
          const result = yield* promptSubmitHook("/project", "push to origin main branch");
          expect(result).toBe("");
        })
      )
    );

    it.effect("returns empty for conversational responses", () =>
      runWithFs(
        [],
        Effect.gen(function* () {
          const result = yield* promptSubmitHook("/project", "yes please do that thing");
          expect(result).toBe("");
        })
      )
    );

    it.effect("returns empty when no BM25 index exists", () =>
      runWithFs(
        [],
        Effect.gen(function* () {
          const result = yield* promptSubmitHook("/project", "create a schema for user profiles");
          expect(result).toBe("");
        })
      )
    );

    it.effect("returns empty when BM25 index file missing from .code-index/", () =>
      runWithFs(
        [["/project/.code-index/index-meta.json", "{}"]],
        Effect.gen(function* () {
          const result = yield* promptSubmitHook("/project", "create a schema for user profiles");
          expect(result).toBe("");
        })
      )
    );

    it.effect("never throws — always returns a string", () =>
      runWithFs(
        // Provide a file that will fail to parse as BM25 index
        [[`/project/${INDEX_DIR}/${BM25_INDEX_FILE}`, "invalid json content"]],
        Effect.gen(function* () {
          const result = yield* promptSubmitHook("/project", "create a schema for user profiles");
          expect(typeof result).toBe("string");
        })
      )
    );

    it.effect("returns empty for build commands", () =>
      runWithFs(
        [],
        Effect.gen(function* () {
          const result = yield* promptSubmitHook("/project", "run the test suite please");
          expect(result).toBe("");
        })
      )
    );
  });
});
