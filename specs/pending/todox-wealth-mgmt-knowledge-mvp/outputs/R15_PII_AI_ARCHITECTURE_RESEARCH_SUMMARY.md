# R15 PII + AI Architecture Research Summary (User-Provided)

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
**Source of truth (raw)**: `inputs/PII_AI_RESEARCH_RAW.md`  
**Source**: user-provided research excerpt (2026-02-09)  
**Purpose**: translate the research into actionable MVP vs post-MVP architectural decisions and gates  

## Executive Summary (What We Should Do)

For this repo and the WM MVP, the best near-term architecture is:

- **LLM generates plans/queries from schema + metadata**, not raw values.
- A **trusted executor** runs those queries and returns **minimized, evidence-grounded results** (citations) to the UI.
- For content extraction from emails, keep raw content **server-side**, but apply:
  - strict log redaction
  - strict result minimization
  - durable evidence spans (`documentId + documentVersionId + offsets`)

This yields a credible compliance story without forcing premature E2E encryption or homomorphic encryption.

## Patterns From the Research (Mapped to Our MVP)

### 1) Token abstraction / schema-only SQL generation (MaskSQL pattern)

Core idea:
- Replace sensitive identifiers and literal values with placeholders.
- LLM sees only placeholders + schema structure.
- A local reconstruction layer rehydrates for execution.

Fit for us:
- Useful for **querying relational stores** (docs/knowledge) while avoiding raw values in prompts.
- Less directly applicable to **LLM-based extraction** unless we also tokenize the email text (which can destroy extraction utility).

MVP recommendation:
- Use schema-only prompting for **GraphRAG/meeting-prep queries** and any structured lookups.
- Do not attempt to MaskSQL-tokenize the entire email body for extraction in MVP.

### 2) “Safe buttons” / pre-approved query templates (MCP Toolbox pattern)

Core idea:
- AI cannot invent arbitrary SQL.
- It can only select from a curated menu of parameterized queries/tools.

Fit for us:
- Strong compliance posture for WM.
- Works naturally with `@effect/rpc` tools: define a small set of RPC endpoints that represent “approved queries.”

MVP recommendation:
- Treat every critical-path retrieval as an explicit RPC/tool:
  - `GraphRAG.Query`
  - `Evidence.List`
  - `MeetingPrep.Generate`
  - `Connections.Link/ReLink`
- No “arbitrary SQL from LLM” anywhere in the MVP path.

### 3) Privacy vaults / tokenization (Skyflow/Protecto category)

Core idea:
- Store original PII in a vault.
- Expose tokens with referential integrity to systems/LLMs.

Fit for us:
- A strong future posture, but heavy operational surface area.
- Could be phased in later once the MVP semantics stabilize (especially around evidence offsets and retrieval).

MVP recommendation:
- Do not introduce a third-party privacy vault before the demo is proven.
- Keep the spec open to adding it in P4+ if requirements tighten.

### 4) Semantic layers (dbt/Snowflake/Databricks category)

Core idea:
- LLM queries against a curated semantic model (metrics/dimensions).

Fit for us:
- More relevant for analytics/BI than for knowledge evidence and provenance.

MVP recommendation:
- Not required for the MVP narrative.
- Could be a later addition for “advisor KPI” dashboards once the graph is reliable.

### 5) Confidential computing / enclaves

Core idea:
- Hardware-enforced isolation for inference with minimal overhead.

Fit for us:
- Relevant if we run proprietary models or need very high sensitivity inference.

MVP recommendation:
- Not required to ship the demo narrative.
- Add as a P4 investigation track if enterprise clients demand it.

## Practical Gates (MVP vs Post-MVP)

### P0/P1 (MVP Demo) Gates

- **Minimization**
  - Do not ship raw email content to any LLM call unless required for extraction.
  - For meeting prep and Q&A, use GraphRAG context slices and citations rather than full bodies.
- **Evidence-first**
  - Every claim displayed must link to `documentId + documentVersionId + offsets`.
- **No arbitrary queries**
  - LLM is not allowed to emit executable SQL or code; only selects from approved RPC/tools.
- **Log safety**
  - Strictly prohibit logging of raw email bodies/attachments/subjects.
  - Use `Redacted` for credential-like values and any captured headers.

### P2 (Hardening) Gates

- **Two-sided guardrails**
  - Input-side: prevent obviously sensitive values from being placed into prompts.
  - Output-side: detect and redact sensitive values in generated outputs when not evidence-cited.
- **Audit**
  - Meeting prep persisted with citations; evidence access is auditable.

### P3/P4 (Staging/Prod) Gates

- **Defense in depth**
  - RLS + query filters (per D-14) and proof via cross-org tests.
- **Secrets & key management**
  - KMS/Secret Manager backed secrets; rotation runbooks.
- **Optional advanced posture**
  - Consider privacy vault tokenization or confidential computing only if the operational overhead is justified by customer requirements.

## Repo-Specific Integrations / Notes

- Gmail schemas are available in this repo at:
  - `tmp/gmail-schemas/gmail-schemas.ts`
  This enables field-level schema modeling, but **does not** solve PII in email body/subject/attachments by itself.

- `S.Redacted` is useful for **log safety**, not encryption-at-rest. The spec should keep those concerns separate.

## Decision Status

These research-driven gates are now encoded in the P0 decision record:

- D-15: safe-buttons-only tool boundary (no free-form executable SQL/code).
- D-16: prompt minimization policy (hybrid by workflow).
- D-17: output disclosure policy (evidence-cited and necessary only by default).
