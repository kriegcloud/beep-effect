# Discriminated Union Modeling

## Status

Active

## Mission

Make discriminated unions the default modeling shape for finite variants,
lifecycle states, status/result cases, and case-specific payloads.

The initiative records architecture doctrine and applies one low-risk proof
batch. It does not add a hard scanner, generator support, or broad migration.

## Current Contract

- Internal models use discriminated unions when a data shape has finite cases.
- Effect Schema unions use `S.toTaggedUnion("<field>")` for discriminators such
  as `kind`, `type`, `status`, `profile`, or `family`.
- Canonical `_tag` object unions may use `S.TaggedUnion(...)` or tagged schema
  classes finalized with `S.toTaggedUnion("_tag")`.
- External wire shapes that arrive as optional/nullish bags remain accepted at
  the boundary, but decode or normalize into internal tagged models where the
  cases are finite.
- Existing optional fields remain valid when they represent true absence inside
  one case, not hidden case payloads.
- Enforcement is review-based doctrine in this initiative. No scanner is added.

## Reading Order

- [SPEC.md](./SPEC.md) - doctrine and acceptance rules
- [PLAN.md](./PLAN.md) - implementation order and verification
- [DEFERRED-CANDIDATES.md](./DEFERRED-CANDIDATES.md) - future migration
  inventory

## Proof Batch

The first batch keeps public wire shapes stable and targets existing schemas
that already expose discriminators:

- repo package metadata `family`
- xAI response `_tag`
- ACP incoming notification `_tag`
- semantic-web RDF `termType`
- semantic-web evidence selector `kind`
- semantic-web JSON-LD stream input `kind`
- semantic-web SPARQL result `profile`
