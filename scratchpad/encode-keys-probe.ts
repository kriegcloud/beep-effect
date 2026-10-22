/**
 * Probe: what actually works with S.encodeKeys + Class factories today.
 *
 * Q1: does `S.Class` accept a Struct piped through `S.encodeKeys`? (user hoped yes)
 * Q2: does use-site `S.encodeKeys` on an effect-drizzle model's `json` variant static work?
 * Q3: what breaks when a fields record uses a quoted kebab key ("allowed-tools") instead?
 */
import * as EffectDrizzle from "@beep/effect-drizzle/pg";
import * as S from "effect/Schema";

// --- Q1: S.Class + encodeKeys-piped struct -------------------------------
const RenamedStruct = S.Struct({
  name: S.String,
  approvedSkills: S.String,
}).pipe(S.encodeKeys({ approvedSkills: "approved-skills" }));

// standalone decode works:
export const q1Standalone = S.decodeEffect(RenamedStruct)({
  name: "x",
  "approved-skills": "Bash",
});

// @ts-expect-error -- probe Q1's answer: S.Class requires S.Struct fields, and a struct piped through S.encodeKeys is a decodeTo, so Effect's S.Class rejects it. Owner: @beep/scratchpad. Exit: Effect's S.Class accepts an S.encodeKeys-piped struct, or the probe is retired.
export class Q1Class extends S.Class<Q1Class, { readonly brand: unique symbol }>("Q1Class")(RenamedStruct) {}

// --- Q2: use-site encodeKeys on a model's json variant static ------------
const kit = EffectDrizzle.make((pg) => ({
  defaultColumns: {
    id: S.Int.pipe(pg.primaryKey(), pg.serial()),
  },
}));

export class Frontmatter extends kit.Entity<Frontmatter>("Frontmatter")({
  name: S.String.check(S.isMaxLength(64)).pipe(kit.pg.varchar()),
  approvedSkills: S.String.pipe(kit.pg.text(), kit.pg.columnName("approved_skills")),
}) {}

export const FrontmatterWire = Frontmatter.json.pipe(S.encodeKeys({ approvedSkills: "approved-skills" }));

export const q2Decoded = S.decodeEffect(FrontmatterWire)({
  id: 1,
  name: "doc-skill",
  "approved-skills": "Bash, Read",
});
