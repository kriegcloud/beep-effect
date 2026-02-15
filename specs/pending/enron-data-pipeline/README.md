# Enron Email Data Pipeline

> Load the Enron email corpus as a realistic test dataset for the TodoX knowledge extraction pipeline. End-to-end validation from raw email ingestion through entity extraction, knowledge graph population, and meeting prep generation.

---

## Phase Completion Requirements

> **CRITICAL**: A phase is NOT considered complete until ALL of the following are satisfied:

1. **Deliverables**: All phase deliverables pass type checking (`bun run check`) and tests (`bun run test`)
2. **Reflection**: `REFLECTION_LOG.md` is updated with phase learnings (what worked, what didn't, patterns discovered)
3. **Handoff**: Next phase handoff documents are created:
   - `handoffs/HANDOFF_P{N+1}.md` - Detailed handoff with 4-tier memory structure
   - `handoffs/P{N+1}_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt for starting next phase

---

## Quick Navigation

| Document | Purpose | Target Audience |
|----------|---------|-----------------|
| **[README.md](README.md)** (this file) | Spec overview | All contributors |
| **[QUICK_START.md](QUICK_START.md)** | 5-minute triage | New agents |
| **[MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md)** | Full workflow, guards, decisions | Phase orchestrators |
| **[AGENT_PROMPTS.md](AGENT_PROMPTS.md)** | Reusable sub-agent prompt templates | Phase orchestrators |
| **[RUBRICS.md](RUBRICS.md)** | Quality assessment criteria per phase | Reviewers |
| **[REFLECTION_LOG.md](REFLECTION_LOG.md)** | Cumulative learnings | Future iterations |
| **[handoffs/](handoffs/)** | Phase transition documents | Phase orchestrators |
| **[outputs/](outputs/)** | Phase artifacts | All contributors |

---

## Overview

### Problem

TodoX's MVP pipeline is: **Gmail sync -> extraction -> knowledge graph -> meeting prep**. We need a realistic, large-scale email corpus to validate this pipeline end-to-end before generating synthetic wealth-management data. The Enron email corpus is the only publicly available large-scale real corporate email dataset, with structural properties we need: multi-party threading, forwarded chains, buried action items, financial discussion, and natural messiness.

### Solution

Build a CLI command (`bun run repo-cli enron`) in `tooling/cli` that:
1. Downloads/caches the Enron CMU corpus from S3 (`arn:aws:s3:::static.vaultctx.com`)
2. Parses RFC 2822 emails into TodoX document models
3. Curates a high-value subset optimized for pipeline testing
4. Feeds documents through the knowledge extraction pipeline
5. Validates end-to-end: raw email -> knowledge graph -> meeting prep

### Current State

The knowledge slice has a **working extraction pipeline** (`knowledge-server`):
- LLM-powered mention extraction, entity classification, relation extraction
- GraphRAG with embedding similarity search (pgvector)
- Entity resolution with cross-batch deduplication
- Batch orchestration with failure policies
- SPARQL query engine, RDF provenance, RDFS reasoning
- ~14,700 lines of tests (all using mock LLM layers)

**What's missing**: No real-world data has been fed through the pipeline. All tests use synthetic/mock data. This spec provides the first end-to-end integration test with realistic email data.

---

## Complexity Assessment

```
Phase Count:       6 phases    x 2 = 12
Agent Diversity:   5 agents    x 3 = 15
Cross-Package:     3 (cli, knowledge, shared) x 4 = 12
External Deps:     3 (S3, email parsing, LLM) x 3 =  9
Uncertainty:       3 (medium)  x 5 = 15
Research Required: 4 (heavy)   x 2 =  8
────────────────────────────────────────
Total Score:                      71 -> Critical Complexity
```

**Structure**: Full orchestration with MASTER_ORCHESTRATION, per-task checkpoints, continuous reflection.

---

## Dataset Decision

**Selected**: CMU Version (May 7, 2015) — the canonical Enron corpus.

**Rationale**:
- ~500K messages, ~1.7GB — well-understood, widely cited
- Text-only (no attachment complexity for MVP)
- Available on Kaggle as single CSV (`wcukierski/enron-email-dataset`) for easy initial parsing
- RFC 2822 headers preserved (Message-ID, In-Reply-To, References for threading)
- Manageable subset selection: we need 1-5K threaded messages, not all 500K

**Storage**: `s3://static.vaultctx.com/todox/test-data/enron/`

**Rejected alternatives**:
- EDRM v2 (73GB, overkill for MVP)
- Nuix-Cleaned (PST format, harder to parse)
- HuggingFace pre-processed (loses raw RFC 2822 headers needed for threading)

---

## S3 Layout

```
s3://static.vaultctx.com/todox/test-data/
  enron/
    raw/                    <- Full CMU maildir dump (or Kaggle CSV)
    curated/                <- Selected high-value subset, parsed to JSON
    curated/manifest.json   <- Subset metadata (thread count, message count, selection criteria)
    annotations/            <- Speech act labels (future, if pulled in)
  synthetic/
    thompson/               <- Generated WM demo dataset (future phase)
```

---

## Phase Overview

### Phase 0: Research & Dataset Acquisition
**Goal**: Download the Enron corpus, evaluate formats, select the best approach for parsing.
**Deliverables**: Raw dataset in S3, format evaluation document, library recommendations.
**Size**: 3 work items | ~1 session

### Phase 1: Email Parsing Infrastructure
**Goal**: Build RFC 2822 parser, thread reconstructor, and document model bridge in `tooling/cli`.
**Deliverables**: `EnronParser` service, `ThreadReconstructor`, type definitions bridging Enron -> TodoX.
**Size**: 5 work items | ~1 session

### Phase 2: Subset Curation & S3 Upload
**Goal**: Score/rank threads, select high-value subset, upload curated JSON to S3.
**Deliverables**: Thread scoring algorithm, curated subset in S3, manifest file.
**Size**: 4 work items | ~1 session

### Phase 3: CLI Loader Command
**Goal**: Build the runtime `enron` CLI command with local-cache-first -> S3-fallback pattern.
**Deliverables**: `enron` subcommand in `tooling/cli`, cache management, document stream emission.
**Size**: 5 work items | ~1 session

### Phase 4: Knowledge Pipeline Integration
**Goal**: Feed curated emails through the extraction pipeline, validate entity/relation output.
**Deliverables**: Integration test harness, ontology mapping, extraction validation.
**Size**: 5 work items | ~1 session

### Phase 5: Meeting Prep Validation
**Goal**: Generate meeting prep briefings from extracted knowledge, validate evidence linking.
**Deliverables**: Meeting prep generation test, evidence chain validation, quality report.
**Size**: 4 work items | ~1 session

---

## Phase 0: Research & Dataset Acquisition

### Tasks

#### P0.1: Evaluate Dataset Formats
**Agent**: `web-researcher`
**Action**: Research Enron dataset versions. Confirm CMU version availability, Kaggle CSV format, download mechanics.
**Output**: `outputs/dataset-evaluation.md`

#### P0.2: Download & Upload Raw Dataset to S3
**Agent**: Orchestrator (interactive, using `aws-api` MCP)
**Action**: Download the Kaggle CSV (or CMU maildir), upload to `s3://static.vaultctx.com/todox/test-data/enron/raw/`.
**Output**: Raw dataset in S3, upload confirmation.

#### P0.3: Evaluate Email Parsing Libraries
**Agent**: `web-researcher`
**Action**: Research Node.js RFC 2822 / MIME parsing libraries. Evaluate `mailparser`, `postal-mime`, `emailjs-mime-parser` for our needs (header extraction, thread reconstruction, body text extraction, signature stripping).
**Output**: `outputs/parsing-library-evaluation.md`

### Success Criteria
- [ ] Raw Enron dataset uploaded to `s3://static.vaultctx.com/todox/test-data/enron/raw/`
- [ ] Format evaluation document produced
- [ ] Parsing library selected with rationale
- [ ] REFLECTION_LOG.md updated

---

## Phase 1: Email Parsing Infrastructure

### Tasks

#### P1.1: Define Enron Email Schema
**Agent**: `effect-code-writer`
**Action**: Create Effect Schema definitions for parsed emails:
- `EnronEmail` (from, to, cc, bcc, date, subject, messageId, inReplyTo, references, body, folder, user)
- `EnronThread` (threadId, messages, participants, depth, dateRange)
- `EnronDocument` (bridges to TodoX document model — stable ID, metadata, body text with span support)

**Location**: `tooling/cli/src/commands/enron/schemas.ts`

#### P1.2: Build RFC 2822 Parser
**Agent**: `effect-code-writer`
**Action**: Create `EnronParser` service using selected parsing library. Handles:
- RFC 2822 header extraction (From, To, CC, Date, Subject, Message-ID, In-Reply-To, References)
- Body text extraction (handle multipart MIME, strip signatures, handle quoted replies)
- Stable ID generation (deterministic hash of Message-ID for idempotent ingestion)
- Batch parsing from CSV or maildir format

**Location**: `tooling/cli/src/commands/enron/parser.ts`

#### P1.3: Build Thread Reconstructor
**Agent**: `effect-code-writer`
**Action**: Create `ThreadReconstructor` service that:
- Groups messages by `In-Reply-To` / `References` headers
- Handles broken threading (missing references, forwarded messages)
- Computes thread depth, participant count, date range
- Assigns stable thread IDs

**Location**: `tooling/cli/src/commands/enron/thread-reconstructor.ts`

#### P1.4: Build TodoX Document Bridge
**Agent**: `effect-code-writer`
**Action**: Create transformation from `EnronEmail` -> TodoX document model that the knowledge extraction pipeline consumes. Must support:
- Stable document identity (idempotent re-ingestion)
- Body text with character offset support (for evidence span linking)
- Metadata mapping (sender -> participant, subject -> title, etc.)

**Location**: `tooling/cli/src/commands/enron/document-bridge.ts`

#### P1.5: Unit Tests
**Agent**: `test-writer`
**Action**: Write tests for parser, thread reconstructor, and document bridge using sample email fixtures.

### Success Criteria
- [ ] `EnronEmail`, `EnronThread`, `EnronDocument` schemas defined
- [ ] RFC 2822 parser handles real Enron email format
- [ ] Thread reconstruction groups messages correctly
- [ ] Document bridge produces valid TodoX documents
- [ ] All tests pass: `bun run check && bun run test`
- [ ] REFLECTION_LOG.md updated

---

## Phase 2: Subset Curation & S3 Upload

### Tasks

#### P2.1: Build Thread Scoring Algorithm
**Agent**: `effect-code-writer`
**Action**: Create `ThreadScorer` that ranks threads by pipeline testing value:
- Multi-party conversations (3+ participants) → higher score
- Thread depth (5+ messages) → higher score
- Financial discussion (keywords: deal, position, risk, compensation, account, portfolio) → higher score
- Action items / requests (keywords: please, need, deadline, follow up, action) → higher score
- Forwarded chains → higher score
- Mix of message lengths (both terse and substantial) → higher score

**Location**: `tooling/cli/src/commands/enron/thread-scorer.ts`

#### P2.2: Select Curated Subset
**Agent**: `effect-code-writer`
**Action**: Build selection pipeline:
1. Parse all emails -> reconstruct threads
2. Score all threads
3. Select top N threads (targeting 1-5K messages total)
4. Ensure diversity: financial, action-items, multi-party, deep threads
5. Generate manifest with selection metadata

**Location**: `tooling/cli/src/commands/enron/curator.ts`

#### P2.3: Upload Curated Subset to S3
**Agent**: `effect-code-writer`
**Action**: Serialize curated subset as JSON, upload to `s3://static.vaultctx.com/todox/test-data/enron/curated/`. Generate `manifest.json` with thread/message counts, selection criteria, and content hashes for cache validation.

#### P2.4: Validation
**Agent**: `test-writer`
**Action**: Write tests for thread scoring algorithm. Verify subset characteristics match target criteria.

### Success Criteria
- [ ] Thread scoring ranks threads by testing value
- [ ] Curated subset of 1-5K messages selected
- [ ] Subset uploaded to `s3://static.vaultctx.com/todox/test-data/enron/curated/`
- [ ] `manifest.json` generated with metadata
- [ ] All tests pass
- [ ] REFLECTION_LOG.md updated

---

## Phase 3: CLI Loader Command

### Tasks

#### P3.1: Build S3 Client Service
**Agent**: `effect-code-writer`
**Action**: Create Effect `S3DataSource` service for the CLI:
- Download from `s3://static.vaultctx.com/todox/test-data/`
- Uses `@aws-sdk/client-s3` with Effect wrapping
- Supports streaming large files
- Reusable for future synthetic datasets

**Location**: `tooling/cli/src/commands/enron/s3-client.ts`

#### P3.2: Build Local Cache Layer
**Agent**: `effect-code-writer`
**Action**: Create Effect `DataCache` service:
- Cache directory: `~/.cache/todox-test-data/` (or gitignored `.data/` at repo root)
- Check local cache first -> S3 fallback on miss
- Cache validation via content hash from manifest
- Cache invalidation when manifest changes

**Location**: `tooling/cli/src/commands/enron/cache.ts`

#### P3.3: Build CLI Command
**Agent**: `effect-code-writer`
**Action**: Create `enron` subcommand for the `beep` CLI:
```
bun run repo-cli enron download    # Download curated subset to local cache
bun run repo-cli enron info        # Show dataset info (message count, thread count, cache status)
bun run repo-cli enron parse       # Parse and emit documents (for piping to extraction)
bun run repo-cli enron curate      # Run full curation pipeline (Phase 2 codified)
```

**Location**: `tooling/cli/src/commands/enron/index.ts`

#### P3.4: Wire into CLI Entry Point
**Agent**: `effect-code-writer`
**Action**: Register `enronCommand` in `tooling/cli/src/index.ts`.

#### P3.5: Integration Tests
**Agent**: `test-writer`
**Action**: Test cache-first -> S3-fallback flow, command output format, document emission.

### Success Criteria
- [ ] `bun run repo-cli enron download` fetches curated subset
- [ ] `bun run repo-cli enron info` shows dataset stats
- [ ] Local cache prevents redundant S3 downloads
- [ ] Cache invalidation works when manifest changes
- [ ] All tests pass
- [ ] REFLECTION_LOG.md updated

---

## Phase 4: Knowledge Pipeline Integration

### Tasks

#### P4.1: Create Wealth Management Test Ontology
**Agent**: `effect-code-writer`
**Action**: Create a test OWL/Turtle ontology mapping Enron entities to the TodoX wealth management ontology:
- **Household** -> Enron department/team clusters
- **Client** -> Individual email participants
- **Account** -> Financial instruments / deals discussed
- **LifeEvent** -> Major corporate events (earnings, reorgs, departures)
- **ActionItem** -> Requests, follow-ups, deadlines in emails
- **Meeting** -> Scheduled meetings referenced in threads

**Location**: `tooling/cli/src/commands/enron/test-ontology.ttl` (Turtle format)

#### P4.2: Build Extraction Test Harness
**Agent**: `effect-code-writer`
**Action**: Create a test harness that:
1. Loads curated Enron subset via the CLI loader
2. Composes the knowledge-server extraction pipeline Layer
3. Feeds documents through `ExtractionPipeline` (or `BatchOrchestrator`)
4. Collects extraction results (entities, relations, evidence spans)
5. Reports extraction statistics

**Location**: `tooling/cli/src/commands/enron/extraction-harness.ts`

#### P4.3: Run Extraction Against Curated Subset
**Agent**: Orchestrator (interactive)
**Action**: Execute the extraction harness against the curated subset. This requires:
- PostgreSQL + pgvector running (`bun run services:up`)
- LLM API key configured
- Knowledge tables migrated (`bun run db:push`)

Document results, failure modes, and pipeline bottlenecks.

#### P4.4: Validate Extraction Quality
**Agent**: `effect-code-writer`
**Action**: Build validation checks:
- Entity types align with ontology classes
- Relations use valid ontology predicates
- Evidence spans map back to source text accurately
- Entity resolution correctly deduplicates across threads
- No hallucinated entities (entities not grounded in source text)

#### P4.5: Document Findings
**Agent**: `doc-writer`
**Action**: Write `outputs/extraction-results.md` documenting pipeline performance on real data.

### Success Criteria
- [ ] Test ontology created and parseable by `OntologyParser`
- [ ] Extraction harness feeds documents through pipeline
- [ ] Extraction produces entities and relations from Enron emails
- [ ] Evidence spans correctly reference source text
- [ ] Quality validation passes
- [ ] Results documented in `outputs/extraction-results.md`
- [ ] REFLECTION_LOG.md updated

---

## Phase 5: Meeting Prep Validation

### Tasks

#### P5.1: Select Test Scenarios
**Agent**: `codebase-researcher`
**Action**: Identify 3-5 Enron threads that simulate realistic meeting prep scenarios:
- Pre-meeting email chain (upcoming meeting with agenda items)
- Deal discussion thread (financial terms, counterparties, deadlines)
- Organizational change thread (departures, reorgs, new roles)
- Multi-party negotiation thread (competing interests, action items)

#### P5.2: Generate Meeting Prep Briefings
**Agent**: Orchestrator (interactive)
**Action**: Use the `MeetingPrep` RPC to generate briefings from extracted knowledge for each test scenario. This exercises the full pipeline: email -> extraction -> knowledge graph -> GraphRAG -> meeting prep.

#### P5.3: Validate Evidence Chains
**Agent**: `effect-code-writer`
**Action**: Verify that every bullet in the meeting prep:
- Links back to a specific evidence span in a source email
- The evidence span text supports the bullet claim
- Citations reference real documents in the curated subset

#### P5.4: Quality Assessment & Report
**Agent**: `doc-writer`
**Action**: Write `outputs/meeting-prep-quality.md` assessing:
- Factual accuracy of briefings
- Evidence chain completeness
- Coverage of key discussion points
- Actionable items identified
- Areas where the pipeline struggled

### Success Criteria
- [ ] 3-5 meeting prep briefings generated from Enron data
- [ ] Evidence chains validate (bullets link to source spans)
- [ ] Quality assessment documented
- [ ] Identified improvements for pipeline refinement
- [ ] REFLECTION_LOG.md updated

---

## Data Source Abstraction (Bonus)

The loader should be designed so swapping between Enron test data and synthetic WM data is trivial. The `DataSource` interface should accept a config flag or S3 prefix that selects which dataset to load:

```typescript
// Conceptual interface — the loader should support both:
// bun run repo-cli enron download       # Enron curated subset
// bun run repo-cli testdata download --source=thompson  # Future synthetic WM data
```

This means the S3 client, cache layer, and document emission pipeline should be generic over the dataset source, with Enron-specific parsing as one adapter. The CLI command structure should accommodate future `testdata` or `synthetic` commands that reuse the same infrastructure.

---

## Technical Constraints

- **Runtime**: Bun (not browser)
- **Language**: TypeScript with strict mode, Effect-TS patterns throughout
- **AWS**: S3 bucket `arn:aws:s3:::static.vaultctx.com`, accessible via `aws-api` MCP and `@aws-sdk/client-s3`
- **No Python**: TypeScript only for committed code. Python fine for one-time data prep.
- **Idempotency**: Re-running the loader must produce identical output
- **Evidence model**: Each parsed email must support span-level evidence linking (character offsets)

---

## Agent Delegation Matrix

| Task Type | Agent | Capability |
|-----------|-------|------------|
| Dataset research | `web-researcher` | read-only |
| Codebase exploration | `codebase-researcher` | read-only |
| Effect documentation | `mcp-researcher` | read-only |
| Source code implementation | `effect-code-writer` | write-files |
| Test writing | `test-writer` | write-files |
| Documentation | `doc-writer` | write-files |
| Architecture review | `architecture-pattern-enforcer` | write-reports |
| Error fixing | `package-error-fixer` | write-files |

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| `@beep/knowledge-server` | Internal | Extraction pipeline, GraphRAG, entity resolution |
| `@beep/knowledge-domain` | Internal | Entity schemas, RPC definitions |
| `@beep/knowledge-tables` | Internal | Database tables (pgvector) |
| `@beep/tooling-cli` | Internal | CLI framework, command registration |
| `@beep/tooling-utils` | Internal | Repo utilities, filesystem helpers |
| `@aws-sdk/client-s3` | External | S3 access for dataset storage |
| `mailparser` or `postal-mime` | External | RFC 2822 email parsing (TBD in P0) |
| PostgreSQL + pgvector | Infrastructure | Required for extraction pipeline |
| OpenAI or Anthropic API | Infrastructure | Required for LLM-powered extraction |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Enron emails too messy for parser | Medium | Medium | Start with well-formed subset, iterate parser |
| LLM extraction quality on real data | Medium | High | Iterate prompts, use high-quality model for eval |
| Thread reconstruction breaks on edge cases | Medium | Low | Graceful degradation, log unthreadable messages |
| S3 access issues | Low | Low | AWS MCP server configured, bucket exists |
| Knowledge pipeline has integration bugs | Medium | High | This spec's purpose is to find them |

---

## Reference Files

### Knowledge Pipeline
```
packages/knowledge/server/src/Extraction/ExtractionPipeline.ts
packages/knowledge/server/src/Extraction/MentionExtractor.ts
packages/knowledge/server/src/Extraction/EntityExtractor.ts
packages/knowledge/server/src/Extraction/RelationExtractor.ts
packages/knowledge/server/src/GraphRAG/GraphRAGService.ts
packages/knowledge/server/src/Workflow/BatchOrchestrator.ts
packages/knowledge/server/src/Runtime/LlmLayers.ts
packages/knowledge/server/src/Runtime/ServiceBundles.ts
```

### CLI Framework
```
tooling/cli/src/index.ts                    # Entry point, command registration
tooling/cli/src/commands/sync.ts            # Simple command pattern
tooling/cli/src/commands/create-slice/      # Complex command pattern
tooling/cli/src/commands/verify/            # Subcommand pattern
```

### Prompt Document
```
PROMPT_Enron_Data_Loading_Exploration.md     # Original exploration prompt
```

---

## Phase Dependencies

```
P0 (Research) ──> P1 (Parsing Infrastructure) ──> P2 (Subset Curation)
                                                        │
                                                        v
                  P5 (Meeting Prep) <── P4 (Knowledge Integration) <── P3 (CLI Loader)
```

**Critical Path**: P0 -> P1 -> P2 -> P3 -> P4 -> P5 (strictly sequential)
**Parallelizable**: None (each phase depends on previous output)

See [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) for transition guards and decision points.

---

## Verification Quick Reference

| Phase | Package | Type Check | Test | Additional |
|-------|---------|------------|------|------------|
| P0 | N/A | N/A | N/A | `aws s3 ls s3://static.vaultctx.com/todox/test-data/enron/raw/` |
| P1 | `@beep/tooling-cli` | `bun run check --filter @beep/tooling-cli` | `bun run test --filter @beep/tooling-cli` | - |
| P2 | `@beep/tooling-cli` | `bun run check --filter @beep/tooling-cli` | `bun run test --filter @beep/tooling-cli` | S3 curated upload verified |
| P3 | `@beep/tooling-cli` | `bun run check --filter @beep/tooling-cli` | `bun run test --filter @beep/tooling-cli` | `bun run repo-cli enron download` |
| P4 | `@beep/knowledge-server` | `bun run check --filter @beep/knowledge-server` | `bun run test --filter @beep/knowledge-server` | `bun run services:up` required |
| P5 | `@beep/knowledge-server` | `bun run check --filter @beep/knowledge-server` | `bun run test --filter @beep/knowledge-server` | LLM API key required |

---

## Getting Started

**Start Phase 0 by reading:**
```
specs/pending/enron-data-pipeline/handoffs/HANDOFF_P0.md
```

**Launch Phase 0 execution:**
```
specs/pending/enron-data-pipeline/handoffs/P0_ORCHESTRATOR_PROMPT.md
```
