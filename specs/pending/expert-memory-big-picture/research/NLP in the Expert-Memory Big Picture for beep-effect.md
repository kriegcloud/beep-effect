# NLP in the Expert-Memory Big Picture

## Purpose

Explain where NLP belongs in this repository's expert-memory architecture, what it should and should not own, and how to stage it without weakening the deterministic and evidence-first posture already established elsewhere in the reading set.

## Local Evidence Base

This note is grounded in the current expert-memory and semantic-web material in this repo:

- [Expert Memory Big Picture](../README.md)
- [Expert Memory Kernel](../EXPERT_MEMORY_KERNEL.md)
- [Claims And Evidence](../CLAIMS_AND_EVIDENCE.md)
- [Trust, Time, And Conflict](../TRUST_TIME_AND_CONFLICT.md)
- [Local-First V0 Architecture](../LOCAL_FIRST_V0_ARCHITECTURE.md)
- [Repo Expert-Memory Local-First V0](../../repo-expert-memory-local-first-v0/README.md)
- [@beep/semantic-web](../../semantic-web/README.md)
- [IP Law Knowledge Graph](../../ip-law-knowledge-graph/README.md)
- the vendored legacy knowledge slice package docs: [`server/README.md`](../../../../.repos/beep-effect/packages/knowledge/server/README.md), [`client/README.md`](../../../../.repos/beep-effect/packages/knowledge/client/README.md), and [`ui/README.md`](../../../../.repos/beep-effect/packages/knowledge/ui/README.md)

## Core Thesis

In this codebase, NLP should be treated as an enrichment and translation layer between natural-language artifacts and durable expert-memory structures. It is useful when it improves retrieval, extraction, alignment, and ergonomics, but it should not become the source of truth.

The durable system still lives in the layers described elsewhere in this folder:

- deterministic substrate
- claims and evidence
- semantic kernel
- provenance and temporal lifecycle
- retrieval packets
- control plane

That means NLP belongs in the pipeline as a bounded proposal engine. It can suggest a query interpretation, candidate claim, entity match, summary, or ontology mapping, but acceptance still depends on deterministic evidence, explicit provenance, and domain rules.

## What NLP Is For In This Repo

### 1. Bridge human text into structured memory

Whenever the source material is prose rather than code structure, the system needs a bridge from raw language into normalized artifacts such as:

- spans
- mentions
- candidate entities
- candidate relations
- candidate claims
- query rewrites

This is the most natural role for NLP in expert memory. It is how notes, docs, tickets, statutes, and similar sources become material that the rest of the stack can validate and reason over.

### 2. Improve retrieval quality without abandoning groundedness

The repo-memory direction already favors bounded, source-grounded answers over freeform semantic chat. NLP fits that posture when it improves:

- tokenization and normalization of mixed code-and-doc text
- identifier splitting and query cleanup
- ranking and recall
- user-query classification into typed retrieval actions

Used this way, NLP makes the existing retrieval system more forgiving and expressive without replacing typed queries, citations, or retrieval packets.

### 3. Align natural language with semantic-web structures

The semantic-web work in this repo is about explicit value models, provenance posture, metadata, and service boundaries. NLP can help map natural phrasing onto those structures by proposing:

- vocabulary label matches
- ontology term candidates
- metadata normalization
- entity linking candidates

It should not replace the ontology, schema family boundaries, or provenance model. It is an alignment layer, not the semantic contract itself.

### 4. Produce candidate claims, not canonical facts

The strongest recurring theme in the expert-memory material is that durable state should center on claims, evidence, provenance, and time rather than on raw edges or opaque model output. NLP therefore belongs on the candidate side of the boundary:

- "this sentence may express claim C"
- "this mention may refer to entity E"
- "this query may mean lookup type Q with slots S"

Only after grounding, validation, and provenance capture should those candidates become durable records.

## Where NLP Fits By Subsystem

### Repo expert-memory v0

For the local-first repo expert, the best near-term NLP uses are narrow and practical:

- normalize mixed prose and identifier queries
- classify user intent into existing deterministic query types
- improve ranking with better text preprocessing or hybrid retrieval
- summarize grounded results only after citations and evidence spans are fixed

What does not fit the current v0 posture:

- freeform semantic repo chat without typed retrieval plans
- ungrounded extraction that writes directly into canonical state
- opaque ranking that cannot be related back to actual files, symbols, or evidence

### Semantic-web foundation work

For `@beep/semantic-web`, NLP is supportive rather than central. Its role is to help humans and adapters meet the semantic model cleanly:

- normalize labels and descriptions
- suggest term mappings
- assist metadata generation
- support evidence-aware ingestion later

It should not define package ownership, RDF identity, provenance rules, or schema boundaries.

### Domain knowledge work such as IP-law

For law and other prose-heavy domains, NLP becomes more important earlier because the input starts as text. Even there, the repo's architecture suggests a staged posture:

1. ingest and segment source text
2. extract candidate spans, mentions, and claims
3. attach evidence and provenance
4. validate against domain rules and semantic models
5. expose natural-language querying only through structured query planning and grounded answers

That matches the expert-memory goal better than skipping directly to open-ended Q&A.

### Legacy knowledge slice prior art

The vendored legacy knowledge slice is still useful because it shows the shape of a full text-to-knowledge pipeline:

- chunking and context retrieval
- extraction and merge stages
- retrieval and citation pressure
- embedding and versioning concerns

The reusable lesson is not "copy the old pipeline literally." It is that NLP belongs alongside provenance, control, and evidence from the start, not bolted on after storage decisions are already fixed.

## Operating Rules

The following rules keep NLP aligned with the rest of the expert-memory design:

1. Treat NLP output as proposal data until it is grounded.
2. Attach provenance and evidence before promoting NLP-derived output into durable memory.
3. Keep deterministic preprocessing separate from model-based inference so failures are diagnosable.
4. Version prompts, tokenizers, embeddings, and extraction models because their behavior is part of the artifact lineage.
5. Do not confuse ranking confidence with semantic truth or identity.
6. Prefer bounded query planning and retrieval over open-ended answer generation.
7. Preserve a deterministic fallback path for critical retrieval and validation flows.

## Recommended Rollout Order

### Phase 1: deterministic language hygiene

Start with the parts that improve retrieval quality without adding major uncertainty:

- sentence and span normalization where needed
- query cleanup
- identifier-aware tokenization
- document and code-text normalization

### Phase 2: bounded retrieval enrichment

Once the deterministic base is stable, add retrieval-oriented NLP that still returns grounded results:

- hybrid ranking
- controlled query expansion
- ontology-aware term matching
- optional embeddings with explicit versioning

### Phase 3: candidate extraction with provenance

Only after the retrieval and evidence story is solid should the system start writing NLP-derived candidate structures such as:

- extracted claims
- mention candidates
- relation candidates
- evidence-anchor suggestions

This phase should always preserve the distinction between extracted candidates and accepted durable state.

### Phase 4: natural-language interfaces over typed plans

The final ergonomic layer is a natural-language front door that compiles into typed query plans and grounded outputs. That is the right place for user-facing NL interaction in this architecture, because the retrieval and evidence contract already exists underneath it.

## Practical Heuristic

Use NLP to make the system easier to ask, easier to align, and easier to enrich.

Do not use NLP to erase:

- deterministic evidence
- explicit provenance
- typed retrieval contracts
- time and contradiction handling
- clear boundaries between candidate state and accepted state

## Open Questions

- How much on-device NLP should the local-first v0 carry before startup time and packaging costs become unacceptable?
- Which domains deserve entity linking and ontology-aware expansion early, and which can stay keyword-first longer?
- What confidence and evidence thresholds should govern promotion from extracted candidate to accepted claim?
- Which NLP artifacts should be persisted as first-class audit inputs versus treated as disposable intermediate state?
