// Structural facts about package modules, read from source text.
//
// Vite's glob import inlines every `src` module's raw text at transform time
// (the yaml `fixture-text.ts` precedent), so these walks need no filesystem.
//
// `importClosure` follows runtime import edges: `import type` / `export type`
// edges are skipped because they are erased. Comments are stripped first,
// line comments before block comments, because JSDoc examples carry real
// import statements and prose such as `@beep/*` would otherwise open a block
// comment (the scratchpad github-actions reachability walker's ordering rule).

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const sources = import.meta.glob<string>("../../src/**/*.ts", { query: "?raw", import: "default", eager: true });

/** The raw text of a package source module, addressed relative to `src/` (for example `"internal/stringify.ts"`). */
const sourceText = (entry: string): string =>
  O.getOrThrowWith(R.get(sources, `../../src/${entry}`), () => new Error(`no source for ${entry}`));

const IMPORT_PATTERN = /(?:^|\n)\s*(?:import|export)\b([^;]*?)\bfrom\s*["']([^"']+)["']/g;
const TYPE_CLAUSE = /^\s*type\b/;
const LINE_COMMENT = /(^|\n)\s*\/\/.*/g;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;

// Side-effect (`import "x"`) and dynamic (`import("x")`) edges load modules
// too; neither has a `from` clause, so each needs its own pattern.
const SIDE_EFFECT_PATTERN = /(?:^|\n)\s*import\s*["']([^"']+)["']/g;
const DYNAMIC_PATTERN = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

const stripComments = (source: string): string =>
  pipe(source, Str.replace(LINE_COMMENT, "$1"), Str.replace(BLOCK_COMMENT, ""));

const runtimeFromEdge = (match: RegExpMatchArray): ReadonlyArray<string> => {
  const specifier = match[2];
  return specifier === undefined || TYPE_CLAUSE.test(match[1] ?? "") ? [] : [specifier];
};

const bareEdge = (match: RegExpMatchArray): ReadonlyArray<string> => (match[1] === undefined ? [] : [match[1]]);

const runtimeSpecifiers = (source: string): ReadonlyArray<string> => {
  const code = stripComments(source);
  const fromEdges = A.flatMap(A.fromIterable(Str.matchAll(IMPORT_PATTERN)(code)), runtimeFromEdge);
  const bareEdges = A.flatMap(
    A.appendAll(
      A.fromIterable(Str.matchAll(SIDE_EFFECT_PATTERN)(code)),
      A.fromIterable(Str.matchAll(DYNAMIC_PATTERN)(code))
    ),
    bareEdge
  );
  return A.appendAll(fromEdges, bareEdges);
};

const foldSegment = (segments: Array<string>, part: string): Array<string> => {
  if (part === "..") return A.dropRight(segments, 1);
  return part === "." ? segments : A.append(segments, part);
};

// Resolve a relative specifier against the importing module's `src`-relative
// directory, folding `.` and `..` segments.
const resolveRelative = (from: string, specifier: string): string =>
  A.join(A.reduce(Str.split(specifier, "/"), A.dropRight(Str.split(from, "/"), 1), foldSegment), "/");

/** The result of walking one entry module's runtime import closure. */
class ImportClosure extends S.Opaque<ImportClosure, { readonly brand: unique symbol }>()(
  S.Struct({
    /** Every `src`-relative module reached, the entry included. */
    modules: S.Array(S.String),
    /** Every bare (package) specifier any reached module imports at runtime. */
    packages: S.Array(S.String),
  })
) {}

const isRelative = Str.startsWith(".");

// Relative edges pass (they are followed); bare package edges fail (they are collected).
const classifySpecifier = (specifier: string): Result.Result<string, string> =>
  isRelative(specifier) ? Result.succeed(specifier) : Result.fail(specifier);

/**
 * Walk the runtime import closure of a module under `src`, addressed relative
 * to `src/` (for example `"index.ts"`). Relative edges are followed; bare
 * edges are collected and not entered.
 */
export const importClosure = (entry: string): ImportClosure => {
  const modules = MutableHashSet.empty<string>();
  const packages = MutableHashSet.empty<string>();
  const visit = (next: string): ReadonlyArray<string> => {
    if (MutableHashSet.has(modules, next)) return [];
    MutableHashSet.add(modules, next);
    const [relative, bare] = A.partition(runtimeSpecifiers(sourceText(next)), classifySpecifier);
    A.forEach(bare, (specifier) => MutableHashSet.add(packages, specifier));
    return A.map(relative, (specifier) => resolveRelative(next, specifier));
  };
  let pending: ReadonlyArray<string> = [entry];
  while (A.isReadonlyArrayNonEmpty(pending)) pending = A.flatMap(pending, visit);
  return ImportClosure.make({
    modules: A.sort(A.fromIterable(modules), Str.Order),
    packages: A.sort(A.fromIterable(packages), Str.Order),
  });
};
