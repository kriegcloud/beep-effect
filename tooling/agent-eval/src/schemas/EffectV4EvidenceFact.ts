import * as S from "effect/Schema";

/**
 * Source-backed Effect v4 correction/evidence fact.
 *
 * @since 0.0.0
 * @category models
 */
export type EffectV4EvidenceFact = {
  readonly id: string;
  readonly fact: string;
  readonly sourceType: "effect_smol_llms" | "effect_smol_migration" | "effect_v4_kg";
  readonly sourceRef: string;
  readonly replacement: string;
  readonly keywords: ReadonlyArray<string>;
  readonly severity: "critical" | "warning";
};

/**
 * Runtime schema for evidence fact records.
 *
 * @since 0.0.0
 * @category schemas
 */
export const EffectV4EvidenceFactSchema = S.Struct({
  id: S.NonEmptyString,
  fact: S.NonEmptyString,
  sourceType: S.Literals(["effect_smol_llms", "effect_smol_migration", "effect_v4_kg"]),
  sourceRef: S.NonEmptyString,
  replacement: S.NonEmptyString,
  keywords: S.Array(S.NonEmptyString),
  severity: S.Literals(["critical", "warning"]),
});
