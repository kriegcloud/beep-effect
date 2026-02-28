import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@effect/vitest";

const coreDir = new URL("../src/core", import.meta.url);

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

test("core schema and identity conventions disallow legacy patterns", async () => {
  const files = await collectSourceFiles(coreDir.pathname);

  const withIdentifierHits = findPatternHits(files, "withIdentifier(");
  const literalsHits = findPatternHits(files, "S.Literals(");
  const rawLegacyIdHits = findPatternHits(files, "@effect/claude-agent-sdk/");
  const jsonParseHits = findPatternHits(files, "JSON.parse(");
  const jsonStringifyHits = findPatternHits(files, "JSON.stringify(");
  const switchHits = findPatternHits(files, "switch (");
  const throwHits = findRegexHits(files, /\bthrow\s+/);
  const newErrorHits = findPatternHits(files, "new Error(");
  const castHits = findPatternHits(files, "as unknown as");
  const anyHits = findRegexHits(files, /\bany\b/);

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
      const content = await readFile(new URL(`../src/core/${relativePath}`, import.meta.url), "utf8");
      expect(content.includes("S.toTaggedUnion(")).toBe(true);
    })
  );
});
