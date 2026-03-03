/**
 * @module @beep/repo-utils/models/TSCategory.model
 *
 * @description
 *
 * @since 0.0.0
 */

import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { ArchitecturalLayer } from "./ArchitecturalLayer.model.js";
import { ASTSignal } from "./ASTSignal.model.js";
import { DependencyProfile } from "./DependencyProfile.model.js";

const $I = $RepoUtilsId.create("JSDoc/models/TSCategory.model");

/**
 * Purity classification for a TSCategory taxonomy member.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CategoryPurity = LiteralKit(["pure", "effectful", "mixed"]).annotate(
  $I.annote("CategoryPurity", {
    description: "Purity classification",
    documentation:
      "- pure: no observable side effects\n- effectful: performs IO, mutation, or external effects\n- mixed: both pure and effectful patterns",
  })
);

/**
 * Inferred type for {@link CategoryPurity}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CategoryPurity = typeof CategoryPurity.Type;

/**
 * A single member of the closed taxonomy used to classify
 * TypeScript code elements in the knowledge graph.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TSCategoryDefinition extends S.Class<TSCategoryDefinition>($I`TSCategoryDefinition`)(
  {
    /**
     * Discriminant. PascalCase with no spaces.
     * This is the value used in `@category PascalCaseName`.
     */
    _tag: S.NonEmptyString.annotateKey({
      description: "Discriminant. PascalCase with no spaces.\nThis is the value used in `@category PascalCaseName`.",
    }),
    /** One-sentence definition precise enough to resolve ambiguity. */
    definition: S.NonEmptyString.annotateKey({
      description: "One-sentence definition precise enough to resolve ambiguity.",
    }),
    /**
     * Extended guidance written for LLM-based fallback classification.
     * Should cover membership, non-membership, and edge-case boundaries.
     */
    classificationGuidance: S.NonEmptyString.annotateKey({
      description:
        "Extended guidance written for LLM-based fallback classification.\nShould cover membership, non-membership, and edge-case boundaries.",
    }),
    /** Concrete production-like TypeScript patterns for this category. */
    examples: S.NonEmptyArray(S.String).annotateKey({
      description: "Concrete production-like TypeScript patterns for this category.",
    }),
    /** Disambiguation patterns that belong in other categories. */
    counterExamples: S.Array(S.String).annotateKey({
      description: "Disambiguation patterns that belong in other categories.",
    }),
    /**
     * Common SyntaxKind names for this category.
     * This is indicative, not exclusive.
     */
    typicalSyntaxKinds: S.Array(S.String).annotateKey({
      description: "Common SyntaxKind names for this category.\nThis is indicative, not exclusive.",
    }),
    /**
     * Deterministic AST signals. Every category includes at least one signal
     * with confidence >= 0.7.
     */
    astSignals: S.Array(ASTSignal).annotateKey({
      description: "Deterministic AST signals. Every category includes at least one signal\nwith confidence >= 0.7.",
    }),
    /**
     * Effect or monad analog for the computational nature of this category.
     * Null when no clean mapping exists.
     */
    effectAnalog: S.OptionFromNullOr(S.String).annotateKey({
      description:
        "Effect or monad analog for the computational nature of this category.\nNull when no clean mapping exists.",
    }),
    /** Architectural layers this category maps to. */
    architecturalLayers: S.Array(ArchitecturalLayer).annotateKey({
      description: "Architectural layers this category maps to.",
    }),
    /**
     * Purity classification.
     * - pure: no observable side effects
     * - effectful: performs IO, mutation, or external effects
     * - mixed: both pure and effectful patterns
     */
    purity: CategoryPurity.annotateKey({
      description:
        "Purity classification.\n- pure: no observable side effects\n- effectful: performs IO, mutation, or external effects\n- mixed: both pure and effectful patterns",
    }),
    /**
     * Semantically adjacent categories for query expansion and ambiguity handling.
     * Reference by `_tag` value.
     */
    adjacentCategories: S.Array(S.String).annotateKey({
      description:
        "Semantically adjacent categories for query expansion and ambiguity handling.\nReference by `_tag` value.",
    }),
    /** Import path glob patterns that are strong classification hints. */
    typicalImportPatterns: S.Array(S.String).annotateKey({
      description: "Import path glob patterns that are strong classification hints.",
    }),
    /** Typical dependency direction profile. */
    dependencyProfile: DependencyProfile.annotateKey({
      description: "Typical dependency direction profile.",
    }),
    /** Lower means document first in topological ordering. */
    documentationPriority: S.Number.annotateKey({
      description: "Lower means document first in topological ordering.",
    }),
  },
  $I.annote("TSCategoryDefinition", {
    description:
      "A single member of the closed taxonomy used to classify TypeScript code elements in the knowledge graph.",
  })
) {}
