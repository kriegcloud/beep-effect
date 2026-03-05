import { $RepoUtilsId } from "@beep/identity/packages";
import { thunkFalse } from "@beep/utils";
import { SchemaGetter } from "effect";
import * as S from "effect/Schema";
/* cspell:ignore Derivability derivability */
import { ApplicableTo } from "./ApplicableTo.model.js";
import { ASTDerivability } from "./ASTDerivability.model.js";
import "./JSDocTagAnnotation.model.js";
import { Specification } from "./Specification.model.js";
import { TagKind } from "./TagKind.model.js";
import { TagParameters } from "./TagParameters.model.js";
import { type TagName, TagValue } from "./TagValue.model.js";

const $I = $RepoUtilsId.create("JSDoc/models/JSDocTagDefinition.model");

/**
 * Complete metadata for a single JSDoc/TSDoc tag.
 * Designed as a discriminated union member via `_tag`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JSDocTagDefinition extends S.Class<JSDocTagDefinition>($I`JSDocTagDefinition`)(
  {
    /** Canonical tag name without '@' prefix. Used as discriminant. */
    _tag: S.String.annotateKey({
      description: "Canonical tag name without '@' prefix. Used as discriminant.",
    }),
    /** Alternative names that resolve to this tag (without '@' prefix) */
    synonyms: S.Array(S.String).annotateKey({
      description: "Alternative names that resolve to this tag (without '@' prefix)",
    }),
    /** Human-readable description of what this tag does */
    overview: S.String.annotateKey({
      description: "Human-readable description of what this tag does",
    }),
    /** The syntactic kind: block, inline, or modifier */
    tagKind: TagKind.annotateKey({
      description: "The syntactic kind: block, inline, or modifier",
    }),
    /** Which specification(s) define this tag */
    specifications: S.Array(Specification).annotateKey({
      description: "Which specification(s) define this tag",
    }),
    /** What AST node types this tag can attach to */
    applicableTo: S.Array(ApplicableTo).annotateKey({
      description: "What AST node types this tag can attach to",
    }),
    /** Whether content can be derived from the TypeScript AST */
    astDerivable: ASTDerivability.annotateKey({
      description: "Whether content can be derived from the TypeScript AST",
    }),
    /** Explanation of AST derivability (especially for "partial") */
    astDerivableNote: S.String.annotateKey({
      description: "Explanation of AST derivability (especially for 'partial')",
    }),
    /** Structured parameter info */
    parameters: TagParameters.annotateKey({
      description: "Structured parameter info",
    }),
    /** Tags that are semantically related */
    relatedTags: S.Array(S.String).annotateKey({
      description: "Tags that are semantically related",
    }),
    /** Whether this tag is deprecated in favor of another approach */
    isDeprecated: S.optional(S.Boolean)
      .pipe(
        S.decodeTo(S.toType(S.Boolean), {
          decode: SchemaGetter.withDefault(thunkFalse),
          encode: SchemaGetter.required(),
        })
      )
      .annotateKey({
        description: "Whether this tag is deprecated in favor of another approach",
      }),
    /** If deprecated, what replaces it */
    deprecatedNote: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "If deprecated, what replaces it",
    }),
    /** Compact code example */
    example: S.String,
  },
  $I.annote("JSDocTagDefinition", {
    description: "Complete metadata for a single JSDoc/TSDoc tag",
    documentation: "Designed as a discriminated union member via `_tag`.",
  })
) {}

/**
 * JSDoc model export.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export declare namespace JSDocTagDefinition {
  /**
   * JSDoc model export.
   *
   * @category DomainModel
   * @since 0.0.0
   */
  export type Encoded = typeof JSDocTagDefinition.Encoded;
  /**
   * JSDoc model export.
   *
   * @category DomainModel
   * @since 0.0.0
   */
  export interface Instance<Tag extends TagName, Def extends Encoded> extends Encoded {
    _tag: Tag;
    applicableTo: Def["applicableTo"];
    astDerivable: Def["astDerivable"];
    relatedTags: Def["relatedTags"];
    specifications: Def["specifications"];
    synonyms: Def["synonyms"];
    tagKind: Def["tagKind"];
  }
}

/**
 * JSDoc model export.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const assertJsDoc: <const Def extends JSDocTagDefinition.Encoded>(input: Def) => asserts input is Def =
  S.asserts(S.toEncoded(JSDocTagDefinition));

/**
 * Builds a JSDoc tag definition schema for a concrete tag payload.
 *
 * @param _tag - Canonical tag discriminator.
 * @param meta - Tag metadata payload without the discriminator.
 * @returns Specialized schema for the provided tag metadata payload.
 * @category DomainModel
 * @since 0.0.0
 */
export const make = <const Tag extends TagName, const Def extends typeof JSDocTagDefinition.Encoded>(
  _tag: Tag,
  meta: Omit<JSDocTagDefinition.Instance<Tag, Def>, "_tag">
) => {
  const def = S.decodeSync(JSDocTagDefinition)({ _tag, ...meta });
  return JSDocTagDefinition.mapFields((_) => ({
    _tag: S.tag(_tag),
    value: TagValue.cases[_tag],
  })).annotate({ jsDocTagMetadata: def });
};
