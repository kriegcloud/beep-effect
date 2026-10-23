# Vendored fixtures

Two oracles, each pinning this package's output against something published
rather than against our own assumptions.

## Vendored: CycloneDX 1.6 JSON schema

| | |
| --- | --- |
| File | `bom-1.6.SNAPSHOT.schema.json` |
| Schema `$id` | `http://cyclonedx.org/schema/bom-1.6.schema.json` |
| Source | `@cyclonedx/cyclonedx-library@10.1.0`, `res/schema/bom-1.6.SNAPSHOT.schema.json` |
| Upstream | <https://github.com/CycloneDX/cyclonedx-javascript-library> |
| License | Apache-2.0 |
| Pinned | 2026-07-25 |
| Upstream release | tag `v10.1.0` of the library repository (the npm tarball's `res/schema/` copy) |
| Carried from | effected `packages/sbom/__test__/fixtures/`, vendored there in effected commit `7d8beae930c1269dc77897a1172306d82c8c610a` |
| sha256 | `83821ba49aa366ad1f1d16c34837d05edd010f036f652e310db1c77d57b37c58` (the upstream bytes, identical to the effected copy) |

The file is excluded from Biome (`biome.jsonc`) so a format sweep cannot rewrite it: a reformatted copy no longer hashes
to the pin above, and its provenance could not be checked.

### Why this is here

`@beep/sbom` declines the CycloneDX library as a runtime dependency: 6.6 MB with seven optional peers, for an object model and a JSON normalizer the package emits directly. Declining the *library* is not the same as declining the *specification*, so the published schema is vendored here as a **test-only conformance oracle**.

The filename says `SNAPSHOT` because that is what the library ships; the `$id` inside is the released `bom-1.6.schema.json`.

### How it is used

Two layers read this file through a JSON import (no filesystem at test time):

- `test/conformance.test.ts` derives its expectations from it — `required` arrays, `enum` members, property names — rather than hand-writing them, so a wrong `externalReference.type`, a missing `required` field or a renamed property fails against the specification itself.
- `test/conformance.ajv.test.ts` validates whole emitted documents against it with `ajv` `8.20.0` and `ajv-formats` `3.0.1` (exact devDependency pins, effected-promotion W4-b): a fixed document exercising every field, a seeded property over valid inputs, and pinned gaps (an unparseable timestamp and duplicate components emit invalid documents; an empty `bomRef` is refused at construction). `goals/effected-promotion/ops/sbom-corpus.ts` builds the same validator (same stand-ins, same format registrations) over this file, read as data, and runs it over an SBOM for every tracked repo manifest.

### External references: stand-ins, not yet vendored

The schema names two sibling schemas by `$ref`: `spdx.SNAPSHOT.schema.json` (the SPDX license-id enumeration) and `jsf-0.82.SNAPSHOT.schema.json` (the JSF signature). Both ship in the same `@cyclonedx/cyclonedx-library@10.1.0` `res/schema/` directory. They are **not vendored yet**: fetching them is a download this lane was not cleared to make. Until they are, `test/support/cyclonedx.ts` registers recorded stand-ins:

| `$ref` | Stand-in | What is not checked |
| --- | --- | --- |
| `spdx.SNAPSHOT.schema.json` | `{ "type": "string" }` | that a `license.id` is in the SPDX enumeration; the emitter writes `license.id` only for an id `@beep/spdx` knows, and `conformance.test.ts` checks that branch |
| `jsf-0.82.SNAPSHOT.schema.json` | `{ "definitions": { "signature": {} } }` | nothing the emitter writes: it never emits a `signature` |

`ajv-formats` implements `date-time` but not `idn-email` or `iri-reference`; those two are registered as accept-all, so emails and URLs pass through unchecked by format.

Follow-up: vendor both files from the same release, record their commit and sha256 here, add them to the `_typos.toml` excludes beside this file, and replace the stand-ins.

### Updating

Re-pin when targeting a new CycloneDX version. Per the settled ruling the emitter is **1.6-only** — there is no 1.5 path and no version option — so a new spec version is a deliberate migration, not an added branch.

## Vendored: the `@actions/attest` provenance shape

| | |
| --- | --- |
| File | `actions-attest-provenance.json` |
| Source | `actions/toolkit`, `packages/attest/src/provenance.ts` (`buildSLSAProvenancePredicate`) |
| Upstream | <https://github.com/actions/toolkit/blob/0be0a6ef893c47d7b130e178c1cedc03ab6ceb9c/packages/attest/src/provenance.ts> |
| Package version | `@actions/attest@3.2.0` |
| License | MIT |
| Pinned | 2026-07-25 |
| sha256 | `fb2216434a46e87fe1670686ec80765cc282102ab002e6241cdbb7d4afcd1043` |

### Why this is here

A verifier must see the same `buildDefinition` / `runDetails` structure whether an attestation came through `@actions/attest` or through this package. That compatibility is a **property**, so the design records it as a pinned fixture rather than a comment.

The file is the predicate `buildSLSAProvenancePredicate` produces for one fixed set of OIDC claims, transcribed from the upstream expression above. `SlsaProvenance.forGitHubWorkflow` is fed those same claims and must serialize to exactly this — deep-equal, so an extra field fails as loudly as a missing one.

One deliberate divergence, and it is in our favour: upstream reads `process.env.GITHUB_SERVER_URL` with no default, so an unset variable emits the literal string `undefined` into every URL. `GitHubWorkflowProvenance.serverUrl` is a required field, so the value is always the caller's and never the ambient environment's.

### Updating

Re-pin when the upstream predicate shape changes — a shape change there is a compatibility break here, which is exactly what this fixture exists to surface.
