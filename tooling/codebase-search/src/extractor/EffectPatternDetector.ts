/**
 * Detects Effect v4 API patterns from TypeScript AST nodes and extracts
 * Schema annotation metadata. Uses ts-morph for AST analysis to identify
 * which of the 17 canonical Effect patterns a given node matches, and to
 * extract `.annotate()` and `.annotateKey()` metadata from Schema expressions.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { Node } from "ts-morph";
import { SyntaxKind } from "ts-morph";

import type { EffectPattern, FieldDoc } from "../IndexedSymbol.js";

// ---------------------------------------------------------------------------
// SchemaAnnotations
// ---------------------------------------------------------------------------

/**
 * Metadata extracted from a Schema `.annotate()` call including the identifier,
 * human-readable title, and description fields.
 * @since 0.0.0
 * @category types
 */
export interface SchemaAnnotations {
  readonly identifier: string | null;
  readonly title: string | null;
  readonly description: string | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Mapping of Effect API call expression prefixes to their canonical EffectPattern values.
 * Used for text-based pattern matching on node source text.
 * @internal
 */
const TEXT_PATTERNS: ReadonlyArray<readonly [string, EffectPattern]> = [
  ["Context.Tag(", "Context.Tag"],
  ["Layer.effect(", "Layer.effect"],
  ["Layer.succeed(", "Layer.succeed"],
  ["Layer.provide(", "Layer.provide"],
  ["Command.make(", "Command.make"],
  ["Flag.string(", "Flag.string"],
  ["Flag.boolean(", "Flag.boolean"],
  ["Argument.string(", "Argument.string"],
  ["Argument.number(", "Argument.number"],
  ["Effect.fn(", "Effect.fn"],
  ["Effect.gen(", "Effect.gen"],
] as const;

/**
 * Schema call expression patterns mapped from their function name to the
 * corresponding EffectPattern. Checked against the initializer text of
 * variable declarations.
 * @internal
 */
const SCHEMA_CALL_PATTERNS: ReadonlyArray<readonly [string, EffectPattern]> = [
  ["S.Struct(", "Schema.Struct"],
  ["Schema.Struct(", "Schema.Struct"],
  ["S.Class(", "Schema.Class"],
  ["Schema.Class(", "Schema.Class"],
  ["S.Union(", "Schema.Union"],
  ["Schema.Union(", "Schema.Union"],
  ["S.TaggedStruct(", "Schema.TaggedStruct"],
  ["Schema.TaggedStruct(", "Schema.TaggedStruct"],
] as const;

/** @internal */
const containsSubstring = (haystack: string, needle: string): boolean =>
  Str.includes(needle)(haystack);

/**
 * Extracts a string-valued field from an object literal text.
 * Handles both single-quoted and double-quoted values.
 * @internal
 */
const extractStringField = (text: string, fieldName: string): string | null => {
  // Match field: "value" or field: 'value' (single-line)
  const singleLineRegex = new RegExp(
    `${fieldName}\\s*:\\s*["']([^"']+)["']`,
  );
  const singleMatch = text.match(singleLineRegex);
  if (singleMatch !== null) {
    return pipe(
      A.get(singleMatch, 1),
      O.getOrElse(() => "" as string),
    ) || null;
  }

  // Match multi-line: field:\n    "value"
  const multiLineRegex = new RegExp(
    `${fieldName}\\s*:\\s*\\n?\\s*["']([\\s\\S]*?)["']\\s*$`,
    "m",
  );
  const multiMatch = text.match(multiLineRegex);
  if (multiMatch !== null) {
    return pipe(
      A.get(multiMatch, 1),
      O.getOrElse(() => "" as string),
    ) || null;
  }

  return null;
};

// ---------------------------------------------------------------------------
// detectEffectPattern
// ---------------------------------------------------------------------------

/**
 * Detects which of the 17 canonical Effect v4 API patterns a given ts-morph
 * AST node matches. Uses a priority-ordered decision tree: TaggedErrorClass
 * class declarations first, then Schema call expressions, then general
 * text-based pattern matching. Returns null if no pattern is detected.
 * @since 0.0.0
 * @category detectors
 */
export const detectEffectPattern = (node: Node): EffectPattern | null => {
  // 1. TaggedErrorClass: class declaration with heritage clause
  if (node.getKind() === SyntaxKind.ClassDeclaration) {
    const text = node.getText();
    if (containsSubstring(text, "TaggedErrorClass")) {
      return "Schema.TaggedErrorClass";
    }
  }

  // 2. Variable declarations: check initializer for Schema call patterns
  if (node.getKind() === SyntaxKind.VariableStatement) {
    const text = node.getText();

    // 2a. Check Schema call patterns first
    const schemaMatch = pipe(
      SCHEMA_CALL_PATTERNS,
      A.findFirst(([pattern]) => containsSubstring(text, pattern)),
      O.map(([, effectPattern]) => effectPattern),
    );
    if (O.isSome(schemaMatch)) {
      return schemaMatch.value;
    }

    // 2b. Check for pipe chains with .brand(
    if (containsSubstring(text, ".brand(")) {
      return "Schema.brand";
    }

    // 2c. Check text-based patterns in variable statements
    const textMatch = pipe(
      TEXT_PATTERNS,
      A.findFirst(([pattern]) => containsSubstring(text, pattern)),
      O.map(([, effectPattern]) => effectPattern),
    );
    if (O.isSome(textMatch)) {
      return textMatch.value;
    }
  }

  // 3. For other node types, try text-based matching
  if (
    node.getKind() !== SyntaxKind.ClassDeclaration &&
    node.getKind() !== SyntaxKind.VariableStatement
  ) {
    const text = node.getText();

    const textMatch = pipe(
      TEXT_PATTERNS,
      A.findFirst(([pattern]) => containsSubstring(text, pattern)),
      O.map(([, effectPattern]) => effectPattern),
    );
    if (O.isSome(textMatch)) {
      return textMatch.value;
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// extractSchemaAnnotations
// ---------------------------------------------------------------------------

/**
 * Extracts `.annotate()` metadata from a Schema expression AST node. Parses
 * the annotation object literal to find identifier, title, and description
 * string fields. Returns null if no `.annotate()` call is found on the node.
 * @since 0.0.0
 * @category extractors
 */
export const extractSchemaAnnotations = (node: Node): SchemaAnnotations | null => {
  const text = node.getText();

  // Look for .annotate({ ... })
  const annotateRegex = /\.annotate\s*\(\s*\{([\s\S]*?)\}\s*\)/;
  const match = text.match(annotateRegex);

  if (match === null) {
    return null;
  }

  const annotateBody = pipe(
    A.get(match, 1),
    O.getOrElse(() => ""),
  );

  const identifier = extractStringField(annotateBody, "identifier");
  const title = extractStringField(annotateBody, "title");
  const description = extractStringField(annotateBody, "description");

  // Only return if at least one field was found
  if (identifier === null && title === null && description === null) {
    return null;
  }

  return { identifier, title, description };
};

// ---------------------------------------------------------------------------
// extractFieldAnnotations
// ---------------------------------------------------------------------------

/**
 * Extracts per-field `.annotateKey()` metadata from a Schema.Struct declaration
 * AST node. Returns an array of FieldDoc objects containing the field name and
 * its description, or null if no annotateKey calls are found.
 * @since 0.0.0
 * @category extractors
 */
export const extractFieldAnnotations = (node: Node): ReadonlyArray<FieldDoc> | null => {
  const text = node.getText();

  // Look for patterns like:
  //   fieldName: S.String.annotateKey({ description: "..." })
  //   fieldName: Schema.String.annotateKey({ description: "..." })
  const annotateKeyRegex = /(\w+)\s*:\s*[\w.]+\.annotateKey\s*\(\s*\{([\s\S]*?)\}\s*\)/g;

  const matches: ReadonlyArray<RegExpExecArray> = A.fromIterable(text.matchAll(annotateKeyRegex));

  const optionalResults = pipe(
    matches,
    A.map((execResult): O.Option<FieldDoc> => {
      const fieldName = pipe(
        A.get(execResult, 1),
        O.getOrElse(() => ""),
      );
      const annotateBody = pipe(
        A.get(execResult, 2),
        O.getOrElse(() => ""),
      );

      const fieldDescription = extractStringField(annotateBody, "description");

      if (Str.length(fieldName) > 0 && fieldDescription !== null) {
        return O.some({ name: fieldName, description: fieldDescription });
      }

      return O.none();
    }),
  );

  const results = A.getSomes(optionalResults);

  return A.isArrayNonEmpty(results) ? results : null;
};
