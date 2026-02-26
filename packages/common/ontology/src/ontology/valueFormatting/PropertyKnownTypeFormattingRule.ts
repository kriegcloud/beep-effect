/**
 * Formatting rules for known ontology semantic value types.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/valueFormatting/PropertyKnownTypeFormattingRule
 */
import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/valueFormatting/PropertyKnownTypeFormattingRule");

/**
 * Known platform-specific semantic property types.
 *
 * @since 0.0.0
 * @category schemas
 */
export const KnownType = LiteralKit(["USER_OR_GROUP_ID", "RESOURCE_RID", "ARTIFACT_GID"]).annotate(
  $I.annote("KnownType", {
    description: "Supported known semantic property kinds with predefined formatting behavior.",
  })
);

/**
 * Type for {@link KnownType}.
 *
 * @since 0.0.0
 * @category models
 */
export type KnownType = typeof KnownType.Type;

/**
 * Formatting rule variants for properties tagged as known semantic types.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PropertyKnhownTypeFormattingRule = KnownType.mapMembers((members) => {
  const type = S.tag("knownType");
  return pipe(
    members,
    Tuple.evolve([
      ({ literal }) =>
        S.Struct({
          type,
          knownType: S.tag(literal),
        }),
      ({ literal }) =>
        S.Struct({
          type,
          knownType: S.tag(literal),
        }),
      ({ literal }) =>
        S.Struct({
          type,
          knownType: S.tag(literal),
        }),
    ])
  );
}).annotate(
  $I.annote("PropertyKnhownTypeFormattingRule", {
    description:
      "Tagged union of formatting rules for known semantic property types such as principal, resource, and artifact identifiers.",
  })
);

/**
 * Type for {@link PropertyKnhownTypeFormattingRule}.
 *
 * @since 0.0.0
 * @category models
 */
export type PropertyKnhownTypeFormattingRule = typeof PropertyKnhownTypeFormattingRule.Type;
