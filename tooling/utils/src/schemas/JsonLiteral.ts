import * as S from "effect/Schema";

/**
 * JSON literal values (primitives accepted by JSON).
 *
 * @since 0.1.0
 * @category JSON
 */
export const JsonLiteral = S.Union(
  S.String,
  S.Number,
  S.Boolean,
  S.Null,
).annotations({
  identifier: "@beep/tooling-utils/schemas/JsonLiteral.Schema",
  title: "JsonLiteral",
  description: "JSON literal values (primitives accepted by JSON)",
});

export type JsonLiteralType = typeof JsonLiteral.Type;
