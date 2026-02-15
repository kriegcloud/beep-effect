# Reflection Log: Enron Data Pipeline

> Cumulative learnings from each phase of spec execution.
>
> **Schema reference**: See `specs/_guide/patterns/reflection-system.md` for structured JSON format, quality scoring (102 points max), and skill promotion thresholds.

---

## Phase 0: Research & Dataset Acquisition

### What Worked
- Source-first validation worked well: direct checks against CMU, Kaggle, HuggingFace, npm registry, and library READMEs reduced assumption drift.
- Uploading the CMU canonical archive to S3 gave an immediately usable baseline for Phase 1 without waiting on Kaggle credentials.
- Running research in parallel sub-agents accelerated comparison drafting while acquisition/upload proceeded.

### What Didn't Work
- Kaggle direct dataset download is login-gated in this environment, so "single-file CSV first" could not be executed as the primary acquisition path.
- `aws-api` MCP upload from local disk was blocked by its isolated file-access boundary (`/tmp/aws-api-mcp/workdir` in the MCP runtime), so local `aws s3 cp` was needed for transfer.
- Kaggle API metadata does not expose file inventory anonymously (`files` returned empty in public `view` response), which limits schema verification without credentials.

### Patterns Discovered
- For public datasets mirrored across ecosystems, always separate:
  - canonical provenance source (CMU),
  - convenience packaging (Kaggle),
  - pre-processed derivatives (HuggingFace).
- For parser library selection in this repo context, dependency footprint + TypeScript ergonomics are decisive tie-breakers after core MIME capability.
- For S3 evidence, `list-objects-v2` plus `head-object` provides sufficient proof (key, size, timestamp, encryption) for phase completion.

### Prompt Refinements
- Future Phase 0 prompts should explicitly state acceptable fallback order: Kaggle authenticated -> CMU direct tarball -> stop and report.
- Add an explicit instruction to record both compressed artifact size and checksum for uploaded raw datasets.
- Add a prompt line clarifying that signature stripping is not expected to be solved by MIME parser choice alone; treat it as a separate normalization stage.

---

## Phase 1: Email Parsing Infrastructure

### What Worked
- Building around `postal-mime` gave reliable header extraction plus MIME decoding (multipart, quoted-printable, base64) with very little glue code.
- A deterministic ID strategy based on canonicalized `Message-ID` (`<lowercased@id>`) produced stable `email:` and `thread:` identifiers across formatting variants.
- Fixture-first tests (realistic RFC 2822 samples) surfaced parser and bridge defects quickly and kept fixes localized.
- Explicit normalization for quoted replies/signatures worked as a separate post-parse stage, which aligns with the Phase 0 finding that parser libraries do not provide first-class signature stripping.

### What Didn't Work
- The spec verification commands still reference `@beep/tooling-cli`, but the workspace package is `@beep/repo-cli`; running the old filter fails with “No package found”.
- `S.DateFromString` decode paths require encoded strings, not `Date` objects. Initial decode attempts failed until parser/bridge inputs were serialized as ISO strings before schema decode.
- Using `String.replaceAll` with non-global regexes in Bun caused runtime failures in `normalizeMessageId`; this had to be replaced with `String.replace`.

### Patterns Discovered
- Treat `Message-ID` normalization as a hard invariant before:
  - relationship linking (`In-Reply-To`, `References`)
  - deterministic hashing
  - equality/grouping operations
- Keep parser output validation at the schema boundary (`S.decodeUnknown`) and feed encoded values when using transform schemas like `DateFromString`.
- For email body cleanup, deterministic heuristics work best in this order:
  - normalize line endings
  - strip quoted reply blocks
  - strip trailing signature blocks
  - collapse excessive blank lines

### Prompt Refinements
- Update spec verification commands to `@beep/repo-cli` (or rename package references consistently across docs/spec).
- Explicitly call out that schemas with `DateFromString` should receive encoded ISO strings at decode boundaries.
- Add one prompt line that `Message-ID` canonicalization must be case-insensitive and angle-bracket tolerant before hashing.
- Require at least one multipart fixture and one malformed fixture in parser tests to prevent regressions in MIME and failure handling.

---

## Phase 2: Subset Curation & S3 Upload

### What Worked
- A deterministic scoring model with explicit factor breakdowns made selection explainable and testable (`thread-scorer.ts` now reports per-factor normalized signals + weighted points).
- Running curation against a large deterministic maildir slice (200K messages) produced a stable 2.5K-message curated subset and reproducible manifest hashes.
- Manifest-first artifact packaging (`threads.json`, `documents.json`, `manifest.json`) with SHA-256 checks enabled direct cache/integrity validation.
- Phase 2 tests were effective at guarding behavior:
  - ranking/tie-break stability in scorer tests,
  - curation bounds + diversity + manifest hash integrity in curator tests.

### What Didn't Work
- The CMU maildir sample used here has sparse `In-Reply-To`/`References` linkage in practice, so naive depth scoring based only on reconstructed thread size/depth under-reported deep discussions.
- `lengthDiversity` remained unavailable in the selected slice (`availableCategoryCoverage.lengthDiversity = 0`), because reconstructed threads were predominantly single-message.
- Ad-hoc runtime scripts using Effect platform layers (`Bun*` / `NodeContext`) had module-resolution friction outside normal package execution paths.

### Patterns Discovered
- For Enron curation quality, “deep thread” needs a fallback signal from embedded quoted/forwarded structure (e.g., `Original Message`, `From:` chains), not just explicit RFC reply headers.
- Deterministic curation on large corpora is easiest when done with:
  - lexicographic file traversal,
  - explicit input caps,
  - stable tie-break ordering at every selection phase.
- Curated artifact reproducibility should be expressed as:
  - selected counts,
  - selection criteria summary,
  - per-artifact hashes,
  - dataset hash seed (`threadId + messageIds`).

### Prompt Refinements
- Future Phase 2 prompts should explicitly call out fallback depth semantics when reply headers are sparse in the source corpus.
- Add a hard requirement that manifest validation compares computed SHA-256 values against serialized artifact contents before upload.
- Specify expected curated artifact filenames (`threads.json`, `documents.json`, `manifest.json`) to avoid format drift between phases.
- Include a prompt line that “diversity constraints apply to available categories”; unavailable categories must be reported in manifest coverage, not silently ignored.

---

## Phase 3: CLI Loader Command

### What Worked
- Splitting Phase 3 into three boundaries (`s3-client.ts`, `cache.ts`, `enron/index.ts`) made behavior easy to test in isolation and avoided leaking transport concerns into CLI handlers.
- Manifest-first cache sync worked reliably: remote manifest hash drives refresh decisions, while local artifact SHA-256 + byte checks catch local corruption before reads.
- Deterministic parse emission (`id` + `messageId` ordering, NDJSON output) removed ordering drift and made `parse` output assertions stable.
- Mocked S3 integration tests with a real filesystem layer gave high-signal validation for miss/hit/invalidation behavior without external network dependence.

### What Didn't Work
- In test runtime contexts that inject default services, `@effect/platform` `FileSystem` assumptions can produce false negatives (`BadArgument: FileSystem.writeFile`) unless the test runner/runtime layering is explicit.
- Broad cache-manifest read error fallback (treating local manifest failures as cache miss) is resilient for corrupted cache state but can mask root-cause detail for some local I/O failures unless logs are added.

### Patterns Discovered
- For curated dataset loaders, treat `manifest.json` as the source of truth:
  - compare remote manifest hash to cached manifest hash,
  - validate each cached artifact against manifest metadata,
  - only trust cached payloads after both checks pass.
- Deterministic CLI data emission should be explicit in code (stable comparator + fixed serialization format), not assumed from upstream artifact order.
- Cache integration tests are most maintainable when they operate on URI->content maps and mutate only manifest/artifact payloads to simulate real invalidation scenarios.

### Prompt Refinements
- Future Phase 3 prompts should explicitly require parse output format (`NDJSON` vs JSON array) and ordering contract to avoid downstream ambiguity.
- Add an explicit instruction on whether `info`/`parse` should always re-check remote manifest vs offline-only cache inspection.
- Add a test harness note clarifying whether tests should run under `@beep/testkit` context helpers or raw `bun:test` so filesystem/service expectations are unambiguous.

---

## Phase 4: Knowledge Pipeline Integration

### What Worked
- A deterministic extraction harness in `tooling/cli` worked well for Phase 4:
  - stable document selection via `(document.id, messageId)` ordering,
  - local layer-composed extraction pipeline (no cross-package runtime coupling),
  - reproducible JSON report output for downstream review.
- Reusing the Phase 3 cache/S3 loader path (`EnronDataCache` + `S3DataSource`) kept data access consistent and avoided duplicate ingestion logic.
- Ontology-first validation (parse ontology once, then validate entity types/predicates against parsed IRI sets) gave high-signal quality checks with low implementation overhead.
- Running the harness on a bounded slice (`limit=25`) made iteration fast and produced stable quality results (`entity/predicate/evidence/non-hallucination` all at `1.0` in this deterministic run).

### What Didn't Work
- Deep imports from `@beep/knowledge-server/*` and `@beep/shared-domain/*` inside `@beep/repo-cli` created a large NodeNext compile cascade (extension/import resolution errors outside the CLI boundary).
- `@effect/cli` optional argument types (`Option<T>`) and `exactOptionalPropertyTypes` require explicit unwrapping/conditional object construction at command boundaries; passing `undefined` directly as optional properties caused repeated type failures.
- Effect diagnostics (`globalErrorInEffectFailure`, leaking requirements) were build-breaking in this workspace and required explicit tagged/string failures plus requirement resolution at layer construction.

### Patterns Discovered
- Keep `@beep/repo-cli` extraction tooling self-contained unless consuming stable public package entrypoints; deep source imports across package boundaries are fragile under different compiler modes.
- Effect service interfaces should expose business behavior, not infrastructure requirements; resolve infra dependencies (`S3DataSource`) when building the layer.
- With `exactOptionalPropertyTypes`, encode optional arguments by omission (conditional spreads), not by assigning `undefined`.
- Deterministic harnesses are most useful when they emit both:
  - coarse summary metrics for phase gating,
  - per-document validation detail for follow-on triage.

### Prompt Refinements
- Future Phase 4 prompts should state whether extraction harness code must remain build-clean within `@beep/repo-cli` (and avoid deep cross-package source imports unless explicitly approved).
- Add a prompt line to run `build` in addition to check/test during Phase 4, because this workspace treats multiple Effect diagnostics as build blockers.
- Add a prompt line to require explicit `Option<T>` unwrapping strategy for CLI handlers when using `@effect/cli` optional options.

---

## Phase 5: Meeting Prep Validation

### What Worked
- A deterministic Phase 5 runner (`specs/pending/enron-data-pipeline/scripts/meeting-prep-validation.ts`) made the full validation loop repeatable:
  - fixed scenario set (4 required use cases),
  - fixed source document IDs and search queries,
  - deterministic relation/relation-evidence seed IDs and timestamps.
- Executing the real handler path (`MeetingPrep.Generate` + `Evidence.List`) against SQL-backed repos surfaced real integration behavior, not mock assumptions.
- Evidence-chain checks were high signal when validated directly against curated document bodies and UTF-16 offsets:
  - all generated bullets had resolvable evidence,
  - all cited spans matched source content,
  - no cross-thread leakage was observed for the selected scenario queries.

### What Didn't Work
- `MeetingPrep.Generate` currently expects declaration-shaped actor metadata at insert time (`createdBy` / `updatedBy`), but reads `session.userId` as if it were directly assignable. In this harness, a plain user-id string caused runtime parse failures in `MeetingPrepBullet.Model.insert.make`.
- Full schema decoding of large curated artifacts (especially `threads.json`) created avoidable runtime overhead for validation-only workflows. Field-minimal validated extraction was materially faster.

### Patterns Discovered
- For meeting-prep validation, deterministic query scoping is critical:
  - select scenario queries that uniquely match intended evidence snippets,
  - then explicitly assert no cross-thread evidence appears in bullet citations.
- Phase-level quality reports are easier to audit when accompanied by machine-readable outputs (`meeting-prep-quality.json`) plus human summary (`meeting-prep-quality.md`).
- Bullet usefulness and evidence correctness are orthogonal:
  - evidence chain quality can pass while briefing usefulness remains low due generic template copy.

### Prompt Refinements
- Future Phase 5 prompts should explicitly require capturing both:
  - evidence-chain correctness metrics, and
  - briefing usefulness metrics (these can diverge significantly).
- Add a guardrail prompt note to verify actor/audit field compatibility in write-path handlers before running scenario loops, to avoid runtime failures after seed/setup work.
- For large curated datasets, prompt for field-minimal decoding/selection logic unless full-schema validation is the objective.
