# eCFR `@effect/openapi-generator` Swagger-2.0 Spike

Date: 2026-06-30 · Phase: P1 · Author: claude (Opus 4.8)

Mandatory spike per `SPEC.md` AC#4 and the P1 exit criteria: run the
`@effect/openapi-generator` Swagger-2.0 normalization spike on eCFR, record
dialect warnings, and document the bespoke-renderer fallback decision. Required
"even if FedReg is the selected keyless driver" — here eCFR is *both* the spike
subject and the selected keyless driver.

Pinned versions: `effect` and `@effect/openapi-generator` both at
`4.0.0-beta.92` (the repo `catalog:` pin; `SPEC.md` prose says `beta.91` but the
repo catalog outranks packet prose and has since advanced to `beta.92`).

## Method

1. Probed for a machine-fetchable eCFR spec (see Finding 1).
2. Built a faithful Swagger-2.0 fragment for the live
   `GET /api/versioner/v1/titles.json` shape (fetched from the real API), using
   Swagger-2.0 idioms on purpose: `$ref: "#/definitions/..."`, `type: string` +
   `format: date`, and no `nullable` keyword.
3. Fed its `definitions` to
   `@effect/openapi-generator/JsonSchemaGenerator`'s `make().addSchema(...)` +
   `generate(source, definitions, false)` — the same entry points `@beep/acp`
   uses — across `source ∈ { "openapi-3.1", "openapi-3.0" }`, with refs both
   unchanged (`#/definitions/`) and normalized (`#/components/schemas/`).

## Findings (recorded dialect warnings / gaps)

1. **eCFR publishes no cleanly machine-fetchable spec.** The documented
   `https://www.ecfr.gov/developers/documentation/api/v1.json` `302`-redirects to
   an HTML "Request Access" page; `…/api/versioner/v1/openapi.json`,
   `…/swagger.json`, `/api-docs/v1.json`, and the Federal Register equivalents
   all return `404` or HTML. The *data* endpoints (e.g. `…/versioner/v1/titles.json`)
   work fine. So a "download-the-published-spec then generate" pipeline is not
   viable for eCFR regardless of generator capability — the spec must be
   hand-maintained as a checked-in artifact.

2. **No Swagger-2.0 source dialect.** `JsonSchemaGenerator`'s `Source` type is
   `"openapi-3.0" | "openapi-3.1"` only — there is no `"swagger-2.0"`. A Swagger
   2.0 document cannot be fed directly; its `definitions` must first be lifted to
   OpenAPI-3.x JSON Schema (and, strictly, its `#/definitions/` refs rewritten to
   `#/components/schemas/`, though see Finding 4).

3. **`format: date` is silently downgraded.** A `{ type: "string", format: "date" }`
   property emits `Schema.String.annotate({ format: "date" })` — a plain string
   with a decorative annotation, **not** a date-aware codec. eCFR payloads are
   date-heavy (`latest_amended_on`, `latest_issue_date`, `up_to_date_as_of`), so
   the generator loses the one refinement that matters most for this API.

4. **`addSchema(...)` + `generate(defs)` double-emits.** Calling `addSchema` per
   definition *and* passing the same `definitions` to `generate(...)` emits each
   model twice (once under `// non-recursive definitions`, once under
   `// schemas`). A correct pipeline must pick one path or dedupe in a
   post-processor (as `@beep/acp`'s 700-line TypeScript-AST post-processor does).
   Separately, `#/definitions/` refs *did* resolve without normalization in this
   run, but that is undocumented and fragile.

## Decision: bespoke renderer over a checked-in spec

For eCFR (and, by the same reasoning, the P2 CourtListener/DOL drivers), use a
**runpod-style bespoke renderer over a checked-in `openapi.json`**, not
`@effect/openapi-generator`. Rationale, in priority order:

- Finding 1 removes the generator's core value prop (consuming a published
  spec) — we hand-maintain the spec either way.
- Finding 2 forces a Swagger-2.0→3.x normalization step the generator will not do.
- Finding 3 means we would still hand-fix the emitted date fields.
- Finding 4 means we would still own a post-processor to reach the beep idiom
  (`S.Class` + `$I` identity + JSDoc) — the acp precedent is ~700 lines for that.

A bespoke renderer (`packages/drivers/ecfr/scripts/generate.ts`, ~150 lines)
reads the checked-in Swagger-2.0 `openapi.json`, topologically sorts definitions,
and emits idiomatic `S.Class` value models + operation descriptors directly into
`src/_generated/Ecfr.generated.ts` — deterministically (verified: re-running
`generate` produces byte-identical output). It also documents the date fields
(`// date (YYYY-MM-DD)`) rather than silently downgrading them.

**Where the generator still fits (unchanged from Q1):** for an upstream that
*does* publish a clean OpenAPI 3.x spec, `@effect/openapi-generator` remains the
preferred path (the acp precedent). This spike narrows its applicability, it does
not retire it. GovInfo (P0) is finished on its hand-authored contract + value
models and does not need a generator at all.

## Reproduction

The spike was run against a transient scratch script (not committed) using the
`@effect/openapi-generator/JsonSchemaGenerator` `make`/`addSchema`/`generate`
API. The faithful Swagger-2.0 fragment it used is preserved as the committed
`packages/drivers/ecfr/openapi.json` (the same shape the bespoke renderer now
consumes).
