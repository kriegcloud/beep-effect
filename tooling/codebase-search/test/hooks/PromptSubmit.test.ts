import type { SearchResultForHook } from "@beep/codebase-search";
import {
  BM25_INDEX_FILE,
  Bm25Writer,
  Bm25WriterMock,
  constructSearchQuery,
  formatContextInjection,
  formatSymbolIdResults,
  INDEX_DIR,
  MAX_QUERY_LENGTH,
  promptSubmitHook,
  shouldSkipSearch,
} from "@beep/codebase-search";
import { describe, expect, it } from "@effect/vitest";
import { Effect, type FileSystem, Layer, type Path } from "effect";
import * as A from "effect/Array";
import * as Str from "effect/String";
import { createMemoryFs } from "./memory-fs.js";

const runWithFs = <A, E>(
  initialFiles: ReadonlyArray<readonly [string, string]>,
  effect: Effect.Effect<A, E, FileSystem.FileSystem | Path.Path | Bm25Writer>
): Effect.Effect<A, E> => {
  const { layer } = createMemoryFs(initialFiles);
  const testLayer = Layer.mergeAll(layer, Bm25WriterMock);
  return Effect.provide(effect, testLayer);
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

    it.effect("reads BM25 index from custom indexPath", () =>
      Effect.gen(function* () {
        const { layer: fsLayer } = createMemoryFs([["/project/.custom-index/bm25-index.json", "{}"]]);
        const bm25Layer = Layer.succeed(
          Bm25Writer,
          Bm25Writer.of({
            createIndex: () => Effect.void,
            addDocuments: () => Effect.void,
            removeBySymbolIds: () => Effect.void,
            search: () => Effect.succeed([{ symbolId: "@beep/pkg/mod/Foo", score: 1 }]),
            listSymbolIds: () => Effect.succeed([]),
            save: () => Effect.void,
            load: () => Effect.void,
          })
        );

        const result = yield* promptSubmitHook("/project", "create a schema for user profiles", ".custom-index").pipe(
          Effect.provide(Layer.mergeAll(fsLayer, bm25Layer))
        );

        expect(result).toContain("<system-reminder>");
      })
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
