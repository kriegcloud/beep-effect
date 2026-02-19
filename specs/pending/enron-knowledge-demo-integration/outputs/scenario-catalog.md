# Scenario Catalog (Deterministic, Curated-Only)

## Source of Truth

Scenario definitions are fixed from:

- `specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.json` (`scenarioSelection`)

Curated ingest source remains:

- `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`

Ontology source for ingest payload:

- `tooling/cli/src/commands/enron/test-ontology.ttl`

## Deterministic Rules

1. Scenario ordering: lexical ascending by `scenarioId` (`scenario-1` .. `scenario-4`).
2. Scenario set is closed for this demo: only the four rows below are valid.
3. Ingest selection is full-thread for the selected scenario thread.
4. Full-thread extraction cap: 25 docs maximum per scenario ingest.
5. If full thread has >25 docs, sort by `(document.id, metadata.messageId)` ascending and take first 25.

## Scenario Set

| Scenario ID | Use Case | Source Thread ID | Source Document ID | Source Title | Query Seed | Categories | Participants | Message Count | Depth | Rationale |
|---|---|---|---|---|---|---|---:|---:|---:|---|
| `scenario-1` | pre-meeting agenda/follow-up | `thread:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a` | `email:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a` | `Re: Senator Joe Dunn's Conference Call` | `Conference Call` | `actionItems,multiParty,deepThread` | 4 | 1 | 1 | Explicit scheduling and follow-up asks for a call. |
| `scenario-2` | deal/financial discussion | `thread:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88` | `email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88` | `Re: Duke Exchange Deal` | `Duke Exchange Deal` | `financial,actionItems,deepThread` | 2 | 1 | 1 | Deal/ticket and monetary settlement context. |
| `scenario-3` | org-role/ownership change | `thread:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42` | `email:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42` | `Re: Re2: SCE Legislative Language` | `Rod Wright` | `financial,actionItems,multiParty,deepThread` | 19 | 1 | 1 | Power/ownership shift in regulatory context. |
| `scenario-4` | multi-party negotiation/action tracking | `thread:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607` | `email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607` | `Re: Fuel Supply Agreement` | `Fuel Supply Agreement` | `actionItems,multiParty,deepThread` | 4 | 1 | 1 | Multi-party contract negotiation with explicit sequencing. |

## Ingest Payload Shape (Per Scenario)

`batch_start` payload must be built as:

- `organizationId`: active org from auth context
- `ontologyId`: deterministic demo ontology id
- `ontologyContent`: contents of `tooling/cli/src/commands/enron/test-ontology.ttl`
- `documents`: array of `{ documentId, text }` from full-thread curated docs, capped to 25 via deterministic sort

## UI Metadata Requirements

Each scenario card should render:

- `scenarioId`, `useCase`, `sourceTitle`
- `querySeed`
- `categories`, `participants`, `messageCount`, `depth`
- ingest status (`not-started`, `pending`, `extracting`, `resolving`, `completed`, `failed`, `cancelled`)
- last ingest timestamp and latest `batchId` (if known)
