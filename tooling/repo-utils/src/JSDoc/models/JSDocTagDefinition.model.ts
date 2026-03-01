import { $RepoUtilsId } from "@beep/identity/packages";
import type { TString } from "@beep/types";
import { thunkFalse } from "@beep/utils";
import { SchemaGetter } from "effect";
import * as S from "effect/Schema";
/* cspell:ignore Derivability derivability */
import { ApplicableTo } from "./ApplicableTo.model.js";
import { ASTDerivability } from "./ASTDerivability.model.js";
import { Specification } from "./Specification.model.js";
import { TagKind } from "./TagKind.model.js";
import { TagParameters } from "./TagParameters.model.js";

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
 * @since 0.0.0
 */
export declare namespace JSDocTagDefinition {
  /**
   * @since 0.0.0
   */
  export type Encoded = typeof JSDocTagDefinition.Encoded;
  /**
   * @since 0.0.0
   */
  export interface Instance<Tag extends TString.NonEmpty, Def extends Encoded> extends Encoded {
    _tag: Tag;
    synonyms: Def["synonyms"];
    tagKind: Def["tagKind"];
    specifications: Def["specifications"];
    applicableTo: Def["applicableTo"];
    astDerivable: Def["astDerivable"];
    relatedTags: Def["relatedTags"];
  }
}

/**
 * @since 0.0.0
 */
export const assertJsDoc: <const Def extends JSDocTagDefinition.Encoded>(input: Def) => asserts input is Def =
  S.asserts(S.toEncoded(JSDocTagDefinition));

/**
 * @since 0.0.0
 */
export const make = <const Tag extends TString.NonEmpty, const Def extends typeof JSDocTagDefinition.Encoded>(
  _tag: Tag,
  def: Omit<JSDocTagDefinition.Instance<Tag, Def>, "_tag">
) => {
  assertJsDoc({ _tag, ...def });

  return JSDocTagDefinition.mapFields((fields) => ({
    ...fields,
    _tag: S.tag(_tag),
    synonyms: S.Array(S.Literals(def.synonyms)),
    tagKind: TagKind.pick([def.tagKind]),
    specifications: S.Array(S.Literals(def.specifications)),
    applicableTo: S.Array(S.Literals(def.applicableTo)),
    astDerivable: ASTDerivability.pick([def.astDerivable]),
    relatedTags: S.Array(S.Literals(def.relatedTags)),
  }));
};
