# Rubrics: Enron Data Pipeline

> Quality assessment criteria for each phase of the spec.

---

## Phase 0: Research & Dataset Acquisition

| Criterion | Weight | 1 (Poor) | 3 (Good) | 5 (Excellent) |
|-----------|--------|----------|----------|---------------|
| Dataset evaluation depth | 20% | Single format checked | 2-3 formats compared | 4+ formats with detailed tradeoffs |
| Library evaluation rigor | 20% | 1 library mentioned | 2-3 libraries with feature comparison | 4+ libraries with benchmarks, API examples |
| S3 upload verification | 30% | Upload attempted, unverified | `aws s3 ls` confirms objects | Full integrity check with size verification |
| Documentation quality | 20% | Minimal notes | Clear evaluation docs with rationale | Comprehensive docs with code samples, decision matrix |
| Handoff completeness | 10% | Missing one handoff file | Both files exist, minimal content | Both files complete with token budgets tracked |

**Minimum passing score**: 3.0 weighted average

---

## Phase 1: Email Parsing Infrastructure

| Criterion | Weight | 1 (Poor) | 3 (Good) | 5 (Excellent) |
|-----------|--------|----------|----------|---------------|
| Schema correctness | 15% | Missing fields | All required fields present | Fields with proper types, validations, transformations |
| Parser robustness | 25% | Handles well-formed only | Handles common edge cases | Handles multipart, encoding, malformed gracefully |
| Thread reconstruction | 20% | Simple linear threads | Handles branches, orphans | Handles loops, forwards, broken references |
| Document bridge fidelity | 15% | Basic field mapping | Metadata preserved, IDs stable | Span support, idempotent, full metadata |
| Test coverage | 15% | Happy path only | Edge cases covered | Fixtures from real Enron data, property tests |
| Effect patterns compliance | 10% | Some violations | Mostly compliant | Full compliance (namespace imports, TaggedError, etc.) |

**Minimum passing score**: 3.0 weighted average

---

## Phase 2: Subset Curation & S3 Upload

| Criterion | Weight | 1 (Poor) | 3 (Good) | 5 (Excellent) |
|-----------|--------|----------|----------|---------------|
| Scoring algorithm quality | 25% | Single factor | Multi-factor with weights | Configurable multi-factor with diversity constraints |
| Subset diversity | 25% | All similar threads | Mix of thread types | Intentional coverage of financial, action, multi-party, deep |
| Manifest quality | 15% | Message count only | Thread/message counts, criteria | Full metadata, content hashes, reproducibility info |
| S3 upload correctness | 20% | Files uploaded | Verified with `aws s3 ls` | Content hash validation, manifest matches actual data |
| Test coverage | 15% | Scoring function tested | Selection pipeline tested | Edge cases, diversity verification |

**Minimum passing score**: 3.0 weighted average

---

## Phase 3: CLI Loader Command

| Criterion | Weight | 1 (Poor) | 3 (Good) | 5 (Excellent) |
|-----------|--------|----------|----------|---------------|
| Command completeness | 20% | Download only | Download + info | Download + info + parse + curate |
| Cache correctness | 25% | Basic file cache | Hash-validated cache | Manifest-based invalidation, concurrent-safe |
| S3 integration | 15% | Hard-coded paths | Configurable S3 prefix | Generic DataSource abstraction |
| Error handling | 15% | Crashes on error | Tagged errors with messages | Recovery suggestions, partial downloads handled |
| CLI UX | 10% | No output | Progress indicators | Progress bars, stats summary, colored output |
| Test coverage | 15% | Manual testing only | Unit tests for cache | Integration tests for S3 fallback, cache invalidation |

**Minimum passing score**: 3.0 weighted average

---

## Phase 4: Knowledge Pipeline Integration

| Criterion | Weight | 1 (Poor) | 3 (Good) | 5 (Excellent) |
|-----------|--------|----------|----------|---------------|
| Ontology quality | 15% | Minimal classes | Covers main entity types | Full WM ontology mapping with property hierarchies |
| Extraction coverage | 25% | Pipeline runs | Entities and relations produced | High-quality entities with correct types and confidence |
| Evidence accuracy | 25% | Spans exist | Spans reference correct text | Spans are precise, minimal, verifiable |
| Entity resolution | 15% | Basic dedup | Cross-thread resolution | Correct canonical selection, no false merges |
| Documentation | 10% | Bullet points | Statistics and examples | Comprehensive report with failure analysis |
| Pipeline stability | 10% | Crashes occasionally | Handles all emails | Graceful degradation on edge cases |

**Minimum passing score**: 3.0 weighted average

---

## Phase 5: Meeting Prep Validation

| Criterion | Weight | 1 (Poor) | 3 (Good) | 5 (Excellent) |
|-----------|--------|----------|----------|---------------|
| Scenario coverage | 20% | 1 scenario | 3 scenarios | 5+ diverse scenarios |
| Briefing quality | 25% | Generic summaries | Relevant, specific points | Actionable items with context and evidence |
| Evidence chain validity | 25% | Some links work | All links reference real sources | Precise spans, verifiable claims, no hallucinations |
| Quality report depth | 20% | Pass/fail only | Metrics and examples | Comprehensive analysis with improvement recommendations |
| Pipeline improvements identified | 10% | None | 2-3 suggestions | Prioritized roadmap with specific pipeline changes |

**Minimum passing score**: 3.0 weighted average

---

## Cross-Phase Quality Criteria

These criteria apply to ALL phases:

| Criterion | Requirement |
|-----------|-------------|
| Effect patterns | Namespace imports, TaggedError, no native methods |
| REFLECTION_LOG | Updated after every phase with structured learnings |
| Dual handoff | Both HANDOFF_P[N+1].md and P[N+1]_ORCHESTRATOR_PROMPT.md created |
| Token budget | Handoff documents under 4,000 tokens |
| Type checking | `bun run check` passes for affected packages |
| Tests | `bun run test` passes for affected packages |
| Idempotency | Re-running any phase produces identical output |
