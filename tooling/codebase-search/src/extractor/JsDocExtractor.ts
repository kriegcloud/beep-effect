/**
 * JSDoc metadata extraction from TypeScript source files using ts-morph AST
 * traversal and doctrine for comment parsing. Produces partial IndexedSymbol
 * records containing all documentation fields.
 * @since 0.0.0
 * @packageDocumentation
 */

import type { Tag as DoctrineTag } from "doctrine";
import doctrine from "doctrine";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as tsMorph from "ts-morph";

import type { ParamDoc } from "../IndexedSymbol.js";

// ---------------------------------------------------------------------------
// JsDocResult
// ---------------------------------------------------------------------------

/**
 * The partial result from JSDoc tag extraction for a single code symbol.
 * Contains all documentation-derived fields that feed into an IndexedSymbol.
 * @since 0.0.0
 * @category types
 */
export interface JsDocResult {
  readonly description: string;
  readonly since: string;
  readonly category: string;
  readonly domain: string | null;
  readonly remarks: string | null;
  readonly examples: ReadonlyArray<string>;
  readonly params: ReadonlyArray<ParamDoc>;
  readonly returns: string | null;
  readonly errors: ReadonlyArray<string>;
  readonly seeRefs: ReadonlyArray<string>;
  readonly provides: ReadonlyArray<string>;
  readonly dependsOn: ReadonlyArray<string>;
  readonly deprecated: boolean;
  readonly isPackageDocumentation: boolean;
  readonly moduleDescription: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * The default JsDocResult returned when no JSDoc comment is found on a node.
 * Provides sensible empty/default values for every documentation field.
 * @since 0.0.0
 * @category constants
 */
export const DEFAULT_JSDOC_RESULT: JsDocResult = {
  description: "",
  since: "0.0.0",
  category: "uncategorized",
  domain: null,
  remarks: null,
  examples: [],
  params: [],
  returns: null,
  errors: [],
  seeRefs: [],
  provides: [],
  dependsOn: [],
  deprecated: false,
  isPackageDocumentation: false,
  moduleDescription: null,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** @internal */
const getTagDescription = (tag: DoctrineTag): string =>
  pipe(
    O.fromNullishOr(tag.description),
    O.map(Str.trim),
    O.getOrElse(() => "")
  );

/** @internal */
const getTagsByTitle = (tags: ReadonlyArray<DoctrineTag>, title: string): ReadonlyArray<DoctrineTag> =>
  A.filter(tags, (tag) => tag.title === title);

/** @internal */
const getFirstTagByTitle = (tags: ReadonlyArray<DoctrineTag>, title: string): O.Option<DoctrineTag> =>
  A.findFirst(tags, (tag) => tag.title === title);

/** @internal */
const collectTagDescriptions = (tags: ReadonlyArray<DoctrineTag>, title: string): ReadonlyArray<string> =>
  pipe(
    getTagsByTitle(tags, title),
    A.map(getTagDescription),
    A.filter((desc) => Str.length(desc) > 0)
  );

/**
 * Extracts the raw JSDoc comment text from a ts-morph Node. Attempts to use
 * the JSDocableNode interface first, falling back to leading comment ranges.
 * @since 0.0.0
 * @category internal
 */
const getRawJsDocText = (node: tsMorph.Node): O.Option<string> => {
  // Try the structured JSDoc API first
  if (tsMorph.Node.isJSDocable(node)) {
    const jsDocs = node.getJsDocs();
    if (A.isArrayNonEmpty(jsDocs)) {
      // Use the last JSDoc (closest to the node)
      const lastDoc = jsDocs[A.length(jsDocs) - 1];
      return O.some(lastDoc.getText());
    }
  }

  // Fall back to leading comment ranges for nodes not in the JSDocable category
  const commentRanges = node.getLeadingCommentRanges();
  if (A.isArrayNonEmpty(commentRanges)) {
    const sourceFile = node.getSourceFile();
    const fullText = sourceFile.getFullText();
    // Find the last block comment that looks like JSDoc (starts with /**)
    return pipe(
      commentRanges,
      A.filter((range) => range.getKind() === tsMorph.ts.SyntaxKind.MultiLineCommentTrivia),
      A.map((range) => fullText.slice(range.getPos(), range.getEnd())),
      A.filter(Str.startsWith("/**")),
      A.last
    );
  }

  return O.none();
};

/**
 * Parses a raw JSDoc comment string using doctrine and extracts all fields
 * into a JsDocResult. Handles tag collection, defaults, and custom tags.
 * @since 0.0.0
 * @category internal
 */
const parseDoctrineComment = (rawComment: string): JsDocResult => {
  const parsed = doctrine.parse(rawComment, {
    unwrap: true,
    sloppy: true,
  });

  const tags: ReadonlyArray<DoctrineTag> = parsed.tags;

  // description
  const description = pipe(
    O.fromNullishOr(parsed.description),
    O.map(Str.trim),
    O.getOrElse(() => "")
  );

  // @since
  const since = pipe(
    getFirstTagByTitle(tags, "since"),
    O.map(getTagDescription),
    O.filter((s) => Str.length(s) > 0),
    O.getOrElse(() => "0.0.0")
  );

  // @category
  const category = pipe(
    getFirstTagByTitle(tags, "category"),
    O.map(getTagDescription),
    O.filter((s) => Str.length(s) > 0),
    O.getOrElse(() => "uncategorized")
  );

  // @domain (custom tag)
  const domain = pipe(
    getFirstTagByTitle(tags, "domain"),
    O.map(getTagDescription),
    O.filter((s) => Str.length(s) > 0),
    O.getOrElse(() => null as string | null)
  );

  // @remarks
  const remarks = pipe(
    getFirstTagByTitle(tags, "remarks"),
    O.map(getTagDescription),
    O.filter((s) => Str.length(s) > 0),
    O.getOrElse(() => null as string | null)
  );

  // @example (collect all)
  const examples: ReadonlyArray<string> = collectTagDescriptions(tags, "example");

  // @param
  const params: ReadonlyArray<ParamDoc> = pipe(
    getTagsByTitle(tags, "param"),
    A.map(
      (tag): ParamDoc => ({
        name: pipe(
          O.fromNullishOr(tag.name),
          O.getOrElse(() => "")
        ),
        description: getTagDescription(tag),
      })
    ),
    A.filter((p) => Str.length(p.name) > 0)
  );

  // @returns / @return
  const returns = pipe(
    getFirstTagByTitle(tags, "returns"),
    O.orElse(() => getFirstTagByTitle(tags, "return")),
    O.map(getTagDescription),
    O.filter((s) => Str.length(s) > 0),
    O.getOrElse(() => null as string | null)
  );

  // @throws / @errors (collect all)
  const errors: ReadonlyArray<string> = A.appendAll(
    collectTagDescriptions(tags, "throws"),
    collectTagDescriptions(tags, "errors")
  );

  // @see (collect all)
  const seeRefs: ReadonlyArray<string> = collectTagDescriptions(tags, "see");

  // @provides (custom tag, collect all)
  const provides: ReadonlyArray<string> = collectTagDescriptions(tags, "provides");

  // @depends (custom tag, collect all)
  const dependsOn: ReadonlyArray<string> = collectTagDescriptions(tags, "depends");

  // @deprecated (presence check)
  const deprecated = pipe(getFirstTagByTitle(tags, "deprecated"), O.isSome);

  // @packageDocumentation / @module (presence check)
  const hasPackageDoc = pipe(getFirstTagByTitle(tags, "packageDocumentation"), O.isSome);
  const hasModule = pipe(getFirstTagByTitle(tags, "module"), O.isSome);
  const isPackageDocumentation = hasPackageDoc || hasModule;

  // moduleDescription is set only for package documentation nodes
  const moduleDescription = isPackageDocumentation && Str.length(description) > 0 ? description : null;

  return {
    description,
    since,
    category,
    domain,
    remarks,
    examples,
    params,
    returns,
    errors,
    seeRefs,
    provides,
    dependsOn,
    deprecated,
    isPackageDocumentation,
    moduleDescription,
  };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extracts JSDoc metadata from a ts-morph AST node. Parses the nearest JSDoc
 * comment using doctrine and returns a structured JsDocResult with all
 * documentation fields populated from the comment tags.
 * @since 0.0.0
 * @category extractors
 */
export const extractJsDoc = (node: tsMorph.Node): JsDocResult =>
  pipe(
    getRawJsDocText(node),
    O.match({
      onNone: () => DEFAULT_JSDOC_RESULT,
      onSome: parseDoctrineComment,
    })
  );

/**
 * Extracts the module-level JSDoc comment from a TypeScript source file.
 * Looks for the first JSDoc comment containing either the
 * `@packageDocumentation` tag or the `@module` tag.
 * Returns null if no module-level documentation exists.
 * @since 0.0.0
 * @category extractors
 */
export const extractModuleDoc = (sourceFile: tsMorph.SourceFile): JsDocResult | null => {
  // Strategy 1: Check the first statement's JSDoc for @packageDocumentation
  const statements = sourceFile.getStatements();
  if (A.isArrayNonEmpty(statements)) {
    const firstStatement = statements[0];
    const result = extractJsDoc(firstStatement);
    if (result.isPackageDocumentation) {
      return result;
    }
  }

  // Strategy 2: Scan leading comment ranges on the source file itself
  const fullText = sourceFile.getFullText();
  // Find /** ... */ block comments that contain @packageDocumentation or @module
  const commentRegex = /\/\*\*[\s\S]*?\*\//g;
  const allMatches = A.fromIterable(pipe(fullText, Str.matchAll(commentRegex)));

  const firstStatementPos = pipe(
    A.head(statements),
    O.map((stmt) => stmt.getStart()),
    O.getOrElse(() => Str.length(fullText))
  );

  const result = pipe(
    allMatches,
    A.filter((m) => (m.index ?? 0) < firstStatementPos),
    A.findFirst((m) => {
      const parsed = parseDoctrineComment(m[0]);
      return parsed.isPackageDocumentation;
    }),
    O.map((m) => parseDoctrineComment(m[0]))
  );

  return O.getOrElse(result, () => null as JsDocResult | null);
};
