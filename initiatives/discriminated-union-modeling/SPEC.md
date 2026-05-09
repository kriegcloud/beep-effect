# Discriminated Union Modeling Specification

## Status

**ACTIVE**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-09
- **Updated:** 2026-05-09

## Mission

Promote finite-case data modeling from local style preference to architecture
doctrine: data shapes that represent variants, lifecycle states, status/result
cases, or case-specific payloads should be discriminated unions.

## Doctrine

If a data shape has a finite set of cases, model the cases explicitly:

- Use a discriminated union rather than one object with optional/nullish fields
  that are only meaningful for some cases.
- Use Effect Schema tagged unions for schema-modeled data.
- Use `LiteralKit + mapMembers + Tuple.evolve + S.toTaggedUnion("<field>")`
  for reusable literal domains and non-`_tag` discriminators.
- Use `S.toTaggedUnion("<field>")` over existing annotated/class members when
  the members already carry the discriminator.
- Use `S.TaggedUnion(...)` only for canonical `_tag` object unions, or finalize
  tagged classes with `S.toTaggedUnion("_tag")`.
- Prefer the schema-derived `.match` helper when branching directly on a schema
  tagged union.
- For ordinary runtime discriminated unions, prefer `Match.tagsExhaustive` or
  `Match.tags` where it improves exhaustiveness.

## Boundary Rule

External wire contracts sometimes encode finite cases as optional or nullish
bags. Those shapes may remain at the boundary when required for compatibility,
but internal code should decode or normalize them into a tagged model before
case-specific behavior branches.

Optional fields remain appropriate when they mean true absence within one case.
They are not a substitute for case-specific payload modeling.

## Non-Goals

- No hard scanner or lint rule is added in this initiative.
- No generated ACP schema changes are made by hand.
- No broad repo migration is attempted.
- No xAI/Venice SSE done/data normalization is included in the proof batch.

## Acceptance

- Standards and schema-first skill guidance name the doctrine and enforcement
  posture.
- The proof batch uses schema tagged unions while preserving external wire
  shapes.
- Deferred candidates are inventoried with risk notes.
- Focused package checks pass, or any unrelated blocker is recorded with the
  exact command and failure.
