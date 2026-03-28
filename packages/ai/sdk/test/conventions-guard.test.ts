import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { expect, test } from "@effect/vitest";

const claudeDir = new URL("../src/claude", import.meta.url);
const testDir = new URL(".", import.meta.url);

type SourceFile = {
  readonly path: string;
  readonly content: string;
};

const collectSourceFiles = async (directory: string): Promise<ReadonlyArray<SourceFile>> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry): Promise<ReadonlyArray<SourceFile>> => {
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectSourceFiles(absolutePath);
      }
      if (!entry.isFile() || !entry.name.endsWith(".ts")) {
        return [];
      }
      const content = await readFile(absolutePath, "utf8");
      return [{ path: absolutePath, content }];
    })
  );

  return files.flat();
};

const findPatternHits = (files: ReadonlyArray<SourceFile>, pattern: string) =>
  files.filter((file) => file.content.includes(pattern)).map((file) => file.path);

const findRegexHits = (files: ReadonlyArray<SourceFile>, pattern: RegExp) =>
  files.filter((file) => pattern.test(file.content)).map((file) => file.path);

const castPattern = ["as unknown", "as"].join(" ");
const anyPattern = new RegExp(["\\b", "an", "y", "\\b"].join(""));
const serviceMapUnsafePattern = ["ServiceMap", ".makeUnsafe("].join("");
const directRunPromisePattern = ["Effect", ".runPromise("].join("");
const directRunPromiseAllowlist = [
  "experimental-event-log.test.ts",
  "experimental-persisted-queue.test.ts",
  "hooks-audit-logging.test.ts",
  "logging.test.ts",
  "mcp-tool.test.ts",
  "message-filters.test.ts",
  "query-result.test.ts",
  "storage-artifact-store.test.ts",
  "storage-chat-history-recorder.test.ts",
] as const;

test("core schema and identity conventions disallow legacy patterns", async () => {
  const files = await collectSourceFiles(claudeDir.pathname);

  const withIdentifierHits = findPatternHits(files, "withIdentifier(");
  const literalsHits = findPatternHits(files, "S.Literals(");
  const rawLegacyIdHits = findPatternHits(files, "@effect/claude-agent-sdk/");
  const jsonParseHits = findPatternHits(files, "JSON.parse(");
  const jsonStringifyHits = findPatternHits(files, "JSON.stringify(");
  const switchHits = findPatternHits(files, "switch (");
  const throwHits = findRegexHits(files, /\bthrow\s+/);
  const newErrorHits = findPatternHits(files, "new Error(");
  const castHits = findPatternHits(files, castPattern);
  const anyHits = findRegexHits(files, anyPattern);

  expect(withIdentifierHits).toEqual([]);
  expect(literalsHits).toEqual([]);
  expect(rawLegacyIdHits).toEqual([]);
  expect(jsonParseHits).toEqual([]);
  expect(jsonStringifyHits).toEqual([]);
  expect(switchHits).toEqual([]);
  expect(throwHits).toEqual([]);
  expect(newErrorHits).toEqual([]);
  expect(castHits).toEqual([]);
  expect(anyHits).toEqual([]);
});

test("discriminator-heavy schema modules include tagged-union modeling", async () => {
  const taggedUnionTargets = [
    "Schema/Hooks.ts",
    "Schema/Message.ts",
    "Schema/Permission.ts",
    "Schema/Options.ts",
    "Schema/Mcp.ts",
    "experimental/EventLog.ts",
  ] as const;

  await Promise.all(
    taggedUnionTargets.map(async (relativePath) => {
      const content = await readFile(new URL(`../src/claude/${relativePath}`, import.meta.url), "utf8");
      expect(content.includes("S.toTaggedUnion(")).toBe(true);
    })
  );
});

test("ai-sdk tests keep runtime boundaries and unsafe ServiceMap usage explicit", async () => {
  const files = await collectSourceFiles(testDir.pathname);

  const serviceMapUnsafeHits = findPatternHits(files, serviceMapUnsafePattern).map((filePath) =>
    relative(testDir.pathname, filePath)
  );
  const directRunPromiseHits = findPatternHits(files, directRunPromisePattern).map((filePath) =>
    relative(testDir.pathname, filePath)
  );

  expect(serviceMapUnsafeHits).toEqual([]);
  expect(directRunPromiseHits).toEqual([...directRunPromiseAllowlist]);
});
