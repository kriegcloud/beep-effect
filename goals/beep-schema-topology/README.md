# @beep/schema Topology

## Status

**ACTIVE - Doctrine and pilot migration in progress**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-22
- **Updated:** 2026-05-22

## Purpose

This goal canonizes the topology for `@beep/schema`, the
`foundation/modeling` package that owns reusable Effect Schema schemas,
combinators, codecs, and schema-adjacent utilities.

The goal is to keep Effect-style namespace consistency while preserving the
repo's agent-friendly file topology: small role files, stable concept folders,
and explicit public subpaths.

## Reading Order

- [SPEC.md](./SPEC.md) - normative topology and public API contract
- [PLAN.md](./PLAN.md) - staged implementation and verification plan
- [ops/manifest.json](./ops/manifest.json) - machine-readable goal metadata

## Current Decisions

- Canonical concept imports are namespace-first:
  `import * as Duration from "@beep/schema/Duration"`.
- The package root stays a curated flat facade for convenience and migration
  compatibility.
- Concept subpaths are flat, e.g. `@beep/schema/Color`,
  `@beep/schema/EvmAddress`, and `@beep/schema/HttpStatus`.
- Concept folders use role files such as `.schema.ts`, `.input.ts`, and
  `.transforms.ts`; consumers import only the concept index.
- Utility namespaces such as `SchemaUtils` may expose helper leaves when the
  helper itself is the public concept.

## Non-Negotiable Boundaries

- `@beep/schema` remains domain-agnostic foundation substrate.
- Product language belongs in slices or `shared/*`, not in this package.
- Drivers, live Layers, config resolution, and app runtime wiring do not belong
  in schema concept modules.
- Compatibility aliases are transitional; new work should use canonical concept
  modules.

