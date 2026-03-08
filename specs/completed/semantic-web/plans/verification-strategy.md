# Verification Strategy

## Purpose

Define the verification expectations that implementation and maintenance work for `@beep/semantic-web` must satisfy without inventing ad-hoc checks during execution.

## Verification Matrix

| Area | Required Verification |
|---|---|
| identifier schemas | valid/invalid fixture coverage for `IRI` and `URI` boundaries, plus normalization/equivalence cases where applicable |
| RDF value families | term, quad, dataset, prefix, and namespace fixtures with schema-level validation and equality checks |
| JSON-LD seams | context normalization, document boundary fixtures, and streaming parse/serialize coverage |
| provenance and evidence | minimal PROV core coverage, extension-tier cases, evidence anchor presence, and bounded projection behavior |
| semantic metadata | required public schema families expose semantic metadata; trivial helpers remain unannotated |
| service contracts | contract-level tests with fake or adapter-backed implementations for provenance, validation, query, and representation seams |
| canonicalization | dataset-level canonicalization/fingerprint checks are explicit and never confused with semantic identity |

## Effect v4-Specific Expectations

- use `Schema.toEquivalence(...)` as the default equality surface for schema-modeled domain values
- use `Schema.toArbitrary(...)` for property-based verification where it materially increases confidence
- do not use `Hash`, `Equal`, or `Graph` as substitutes for RDF semantic identity
- do not treat `Schema.toEncoderXml(...)` as RDF/XML support

## Package Command Expectations

The default package-scoped verification commands for implementation and maintenance work are:

```bash
bun run --filter=@beep/semantic-web check
bun run --filter=@beep/semantic-web lint
bun run --filter=@beep/semantic-web test
bun run --filter=@beep/semantic-web build
```

These commands are supported by the existing [`packages/common/semantic-web/package.json`](../../../packages/common/semantic-web/package.json) script surface.

## Failure Classification Rules

Later implementation passes should classify failures as:

- `pre-existing repo failure`
- `new package-specific failure`
- `environmental or dependency failure`

Only the second category should block package readiness without an explicit decision record.

## Acceptance Criteria

- verification expectations cover values, adapters, metadata, provenance, and service contracts
- all repo commands use `bun`
- package-scoped verification commands are explicit before implementation starts
