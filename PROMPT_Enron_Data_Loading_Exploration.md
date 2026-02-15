# Exploration Prompt: Loading the Enron Email Dataset for TodoX Pipeline Testing

## Context

You are working in a TypeScript monorepo (`beep-effect`) built on Effect-TS. The monorepo uses vertical slice architecture. The product under development is **TodoX**, an AI-powered B2B SaaS tool for wealth management firms.

TodoX's MVP is a **read-only Gmail sync → knowledge graph → meeting-prep** product. The core pipeline is:

1. **Gmail sync** → ingest emails as durable, versioned document snapshots
2. **Extraction** → identify entities and relationships using a wealth-management ontology (Household, Client, Account, Life Event, Action Item, Meeting)
3. **Knowledge graph** → store entities/relationships with evidence pinned to source text spans inside emails
4. **Meeting prep** → generate structured briefings where every bullet links back to evidence

We need to load the **Enron Email Corpus** as a realistic test dataset to validate this pipeline before we generate synthetic wealth-management-specific data. The Enron corpus is the only large-scale public corpus of real corporate email and has structural properties we need: multi-party threading, forwarded chains, buried action items, financial discussion, CC/BCC patterns, and natural messiness.

---

## Available Enron Dataset Versions

There are several versions of the Enron dataset. Please evaluate which is best for our use case and how to load it:

### 1. CMU Version (Canonical)
- **URL**: https://www.cs.cmu.edu/~enron/ (May 7, 2015 version)
- **Format**: ~1.7GB tarball, extracted as filesystem: `maildir/{username}/{folder}/` with individual message files
- **Content**: ~500K messages from ~150 users, text-only (no attachments)
- **Also on**: Kaggle (`wcukierski/enron-email-dataset` — single 1.4GB CSV), HuggingFace (`LLM-PBE/enron-email`)

### 2. EDRM v2
- **URL**: https://archive.org/details/edrm.enron.email.data.set.v2.xml
- **Format**: ~73GB, XML + PST files organized by custodian
- **Content**: ~1.7M messages WITH native attachments (spreadsheets, PDFs, documents)
- **Deduplicated text-only**: Available separately (~596MB)
- **Deduplicated attachments only**: Available separately (~8GB)

### 3. Nuix-Cleaned EDRM v1
- **URL**: nuix.com/enron
- **Format**: PST files, PII/health/financial info scrubbed
- **Content**: ~1.3M items, cleansed version

### 4. HuggingFace / Kaggle Pre-processed
- **HuggingFace**: `LLM-PBE/enron-email` — ready to load with `datasets` library
- **Kaggle**: Single CSV with columns: `file`, `message` (raw RFC 2822 text)

### 5. Parakweet Speech Act Annotations
- Enron sentences labeled with speech acts (request, commit, etc.)
- Separate annotation layer that maps to the CMU corpus

---

## What We Need To Figure Out

### A. Format Selection
Which version/format gives us the best balance of:
- Realistic email structure (headers, threading via `Message-ID` / `In-Reply-To` / `References`)
- Manageable size for local dev (we don't need all 500K messages — a well-chosen subset of 1-5K threaded messages is ideal)
- Parseable into our document model (each email → a durable document with stable identity, metadata, body text)

### B. Parsing Strategy
How should we parse raw email data into our internal document representation? Consider:
- RFC 2822 header parsing (From, To, CC, Date, Subject, Message-ID, In-Reply-To, References)
- Thread reconstruction from `In-Reply-To` and `References` headers
- Body text extraction (handle multipart MIME, quoted replies, forwarded messages, signature stripping)
- Stable ID generation (we need idempotent ingestion — re-running should not create duplicates)

### C. Subset Selection
How do we select a high-quality subset that maximizes pipeline testing value? We want threads that exhibit:
- Multi-party conversations (3+ participants in a thread)
- Action items / requests buried in replies
- Financial discussion (accounts, positions, risk, compensation — analogous to wealth management)
- Forwarded chains with context
- At least some threads with 5+ messages depth
- A mix of terse one-liners and substantial multi-paragraph messages

### D. Mapping to TodoX Ontology
How would we create a test harness that maps Enron entities to our ontology for ground-truth validation?
- **Household** → could map to Enron department/team clusters
- **Client** → individual email participants
- **Account** → financial instruments / deals discussed in threads
- **Life Event** → major corporate events (earnings, reorgs, departures)
- **Action Item** → requests, follow-ups, deadlines mentioned in emails

### E. Storage Strategy (S3 + Local Cache)

We have an **AWS S3 bucket** available for storing test datasets. The cost is negligible (~$0.04/month for the CMU corpus, under $0.25/month even with EDRM text + attachments). Raw datasets and any pre-processed artifacts should live in S3 rather than in git.

**Important: We have the `aws-api` MCP server configured in both Claude and Claude Code (Codex).** This means you can directly interact with our S3 bucket — listing, uploading, downloading — via MCP tool calls. Use this for any S3 operations rather than assuming manual CLI steps.

**Proposed S3 layout:**
```
s3://{bucket}/todox/test-data/
  enron/raw/              ← full CMU maildir dump (or chosen format)
  enron/curated/          ← selected high-value subset, pre-parsed to JSON
  enron/annotations/      ← speech act labels if we pull those in
  synthetic/thompson/     ← generated WM demo dataset (future)
```

**Local cache pattern:** The loader should check for a local cache directory first (e.g., `~/.cache/todox-test-data/` or a gitignored `.data/` at repo root). On first run or cache miss, pull from S3. Subsequent runs work entirely from local disk — no S3 egress on every `pnpm test`. This is a natural fit for an Effect `Layer` that resolves the data source: check local → fall back to S3 → parse → emit documents.

**Data prep workflow using MCP tooling:** The one-time data preparation steps (downloading the raw corpus, parsing, curating the subset, uploading to S3) can be orchestrated directly through Claude Code using the `aws-api` MCP server. This means the initial data pipeline doesn't need custom upload scripts — we can interactively curate and push artifacts to S3 during development, then the runtime loader only needs to pull from S3 (with local caching).

### F. Integration Architecture
How should this fit into the monorepo? Consider:
- Should this be a standalone package (e.g., `packages/enron-loader`) or a script in a test fixtures directory?
- How do we make this work with our existing Effect-TS patterns? The loader should compose with our pipeline as an alternative data source alongside the Gmail sync.
- Should the loader emit the same types/interfaces as our Gmail sync adapter so downstream pipeline stages are agnostic to the source?
- The loader should implement the local-cache-first → S3-fallback pattern described above.
- Consider whether the S3 client should be its own Effect `Service` that other packages can reuse (we'll likely need S3 access for other things beyond test data).

### G. Data Pipeline Sketch
Sketch out the full data flow across both the one-time prep phase and the runtime phase:

**One-time prep (can be done interactively via Claude Code + MCP):**
```
Download raw corpus → Parse all emails → Score/rank threads → Select curated subset → Transform to TodoX document model → Upload curated JSON to S3
```

**Runtime (loader in the monorepo):**
```
Check local cache → (miss?) Pull from S3 → Deserialize JSON → Emit as TodoX Document stream → Feed to extraction pipeline
```

For each stage, what libraries or approaches would you recommend in the TypeScript/Effect-TS ecosystem?

---

## Technical Constraints

- **Runtime**: Node.js (not browser)
- **Language**: TypeScript with strict mode
- **Framework**: Effect-TS (use `Effect`, `Stream`, `Schema`, `Layer` patterns where appropriate)
- **AWS access**: Available via `aws-api` MCP server in Claude/Codex, and via `@aws-sdk/*` packages in Node.js code
- **No Python in production pipeline** — Python scripts are fine for one-time data prep, but the loader itself should be TypeScript
- **Idempotency**: Re-running the loader against the same source data must produce identical output
- **Evidence model**: Each parsed email must support span-level evidence linking (character offsets into the body text)

---

## Deliverables Expected

1. **Recommendation** on which dataset version to use and why
2. **Architecture sketch** for the loader (package structure, key modules, type definitions)
3. **Parsing approach** with specific library recommendations for RFC 2822 / MIME parsing in Node.js
4. **Thread reconstruction algorithm** sketch
5. **Subset selection strategy** — either a script to identify high-value threads or criteria for manual curation
6. **Type definitions** that bridge Enron email data to our TodoX document model
7. **Effect-TS integration pattern** showing how the loader composes as a `Layer` or `Service` alongside the Gmail adapter
8. **S3 storage design** — finalize the bucket layout, key naming conventions, and the local-cache-first resolution pattern as an Effect Layer
9. **Data prep runbook** — step-by-step sequence for the one-time prep phase (download → parse → curate → upload to S3), noting which steps can be executed via Claude Code with the `aws-api` MCP server vs. which need local scripts

---

## Bonus: Synthetic Overlay Strategy

After we validate the pipeline with real Enron data, we plan to generate synthetic wealth-management email threads (the "Thompson household" demo dataset). If you see opportunities to design the loader in a way that makes it trivial to swap between Enron test data and synthetic WM data, call that out. The synthetic data will be generated as JSON matching our document model and stored alongside the Enron curated set in S3 (under `synthetic/thompson/`), so the loader abstraction should accommodate both sources cleanly — ideally just a different S3 prefix or config flag that selects which dataset to load through the same `DataSource` interface.
