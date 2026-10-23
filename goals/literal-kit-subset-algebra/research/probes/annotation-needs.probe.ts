import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";

type KpiTier = "repair-green" | "local-full-proof" | "unassigned" | "untiered";
type Stage = "repair-loop" | "pre-push" | "hosted";
declare const stage: O.Option<Stage>;
declare const full: boolean;

// A: no annotations anywhere; outer return type only
export const a = (): KpiTier =>
  O.match(stage, {
    onNone: () => "untiered",
    onSome: Match.type<Stage>().pipe(
      Match.when("repair-loop", () => "repair-green"),
      Match.when("pre-push", () => (full ? "local-full-proof" : "unassigned")),
      Match.when("hosted", () => "unassigned"),
      Match.exhaustive
    ),
  });

// B: onNone unannotated, Match chain uses withReturnType
export const b = (): KpiTier =>
  O.match(stage, {
    onNone: () => "untiered",
    onSome: Match.type<Stage>().pipe(
      Match.withReturnType<KpiTier>(),
      Match.when("repair-loop", () => "repair-green"),
      Match.when("pre-push", () => (full ? "local-full-proof" : "unassigned")),
      Match.when("hosted", () => "unassigned"),
      Match.exhaustive
    ),
  });

// C: F.constant thunks (the codemod form), no annotations
export const c = (): KpiTier =>
  O.match(stage, {
    onNone: F.constant("untiered" as const),
    onSome: Match.type<Stage>().pipe(
      Match.when("repair-loop", F.constant("repair-green" as const)),
      Match.when("pre-push", () => (full ? ("local-full-proof" as const) : ("unassigned" as const))),
      Match.when("hosted", F.constant("unassigned" as const)),
      Match.exhaustive
    ),
  });

// D: a wrong literal must still be rejected through the outer return type
export const d = (): KpiTier =>
  O.match(stage, {
    onNone: () => "untiered",
    onSome: () => "not-a-tier",
  });

// E: observe the inferred type of a case-based union (no outer annotation)
export const e = O.match(stage, { onNone: () => "untiered", onSome: () => "unassigned" });
type E = typeof e;
const eCheck: ["untiered" | "unassigned"] extends [E]
  ? E extends "untiered" | "unassigned"
    ? "narrow"
    : "wide"
  : "wide" = "narrow";

export { eCheck };
