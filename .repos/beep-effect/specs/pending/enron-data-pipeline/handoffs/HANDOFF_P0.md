# Phase 0 Handoff: Research & Dataset Acquisition

## Working Memory (Current Tasks)

### Mission
Evaluate Enron dataset versions, download the selected format, upload raw data to S3, and select the email parsing library for Phase 1.

### Critical Constraints
- S3 bucket: `arn:aws:s3:::static.vaultctx.com`
- S3 prefix: `todox/test-data/enron/raw/`
- The `aws-api` MCP server is available for S3 operations
- No Python in committed code — TypeScript only for the runtime loader
- Selected dataset: **CMU Version** (canonical Enron corpus)

### Blocking Issues
None — this is the first phase.

### Success Criteria
- [ ] Raw Enron dataset uploaded to `s3://static.vaultctx.com/todox/test-data/enron/raw/`
- [ ] `outputs/dataset-evaluation.md` produced
- [ ] `outputs/parsing-library-evaluation.md` produced
- [ ] Parsing library selected with rationale
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings

---

## Episodic Memory (Previous Phase Summary)

This is the initial phase. Key context:

- **Knowledge slice state**: Extraction pipeline is fully implemented in `knowledge-server` with LLM-powered mention/entity/relation extraction, GraphRAG, entity resolution, batch orchestration. ~14.7K lines of tests, all using mock LLM layers. No real-world data has been tested.
- **CLI structure**: `tooling/cli` uses `@effect/cli` with ~15 existing commands. New commands go in `tooling/cli/src/commands/` and are registered in `index.ts`.
- **6 prior knowledge specs** completed (architecture foundation through reasoning engine).

---

## Semantic Memory (Constants)

| Key | Value |
|-----|-------|
| S3 Bucket ARN | `arn:aws:s3:::static.vaultctx.com` |
| S3 Raw Prefix | `todox/test-data/enron/raw/` |
| S3 Curated Prefix | `todox/test-data/enron/curated/` |
| CLI Package | `tooling/cli` |
| Knowledge Server | `packages/knowledge/server` |
| Target Subset Size | 1-5K threaded messages |
| Dataset | CMU Enron corpus (May 2015 version) |

---

## Procedural Memory (Links)

- Spec README: `specs/pending/enron-data-pipeline/README.md`
- Original prompt: `PROMPT_Enron_Data_Loading_Exploration.md`
- CLI entry point: `tooling/cli/src/index.ts`
- CLI command pattern: `tooling/cli/src/commands/sync.ts` (simple example)
- Knowledge extraction pipeline: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- Effect patterns: `.claude/rules/effect-patterns.md`

---

## Task Breakdown

### P0.1: Evaluate Dataset Formats
**Agent**: `web-researcher`
**Research questions**:
1. Is the CMU Enron corpus still available at `https://www.cs.cmu.edu/~enron/`?
2. What is the Kaggle CSV format exactly? (columns, encoding, size)
3. Are there pre-parsed JSON versions available anywhere?
4. What are the licensing/usage terms?

**Output**: `outputs/dataset-evaluation.md`

### P0.2: Download & Upload Raw Dataset to S3
**Interactive task** using `aws-api` MCP server:
1. Download the dataset (Kaggle CSV recommended for simplicity — single file, ~1.4GB)
2. If Kaggle requires auth, use the CMU maildir tarball instead
3. Upload to `s3://static.vaultctx.com/todox/test-data/enron/raw/`
4. Verify upload with `aws s3 ls`

**Note**: The CMU maildir is a tarball of ~500K individual files in `maildir/{username}/{folder}/` structure. The Kaggle version is a single CSV with columns `file` and `message` (raw RFC 2822 text). For ease of initial parsing, the CSV is preferred.

### P0.3: Evaluate Email Parsing Libraries
**Agent**: `web-researcher`
**Evaluate these Node.js libraries**:

| Library | Key Features | Concerns |
|---------|-------------|----------|
| `mailparser` | Most popular, full MIME support, handles attachments | Heavy, may be overkill for text-only |
| `postal-mime` | Lightweight, browser-compatible, modern API | Less battle-tested |
| `emailjs-mime-parser` | Low-level MIME parsing | May require more manual work |
| Custom parser | Just regex RFC 2822 headers + body split | Fragile, but simplest |

**Selection criteria**:
- Must extract: From, To, CC, BCC, Date, Subject, Message-ID, In-Reply-To, References
- Must handle multipart MIME (even text-only emails may have multipart structure)
- Must handle quoted-printable and base64 encoding
- Should handle signature detection/stripping
- TypeScript types preferred
- Minimal dependency footprint

**Output**: `outputs/parsing-library-evaluation.md`

---

## Verification

After Phase 0:
```bash
# Verify S3 upload
# (Use aws-api MCP or aws CLI)
aws s3 ls s3://static.vaultctx.com/todox/test-data/enron/raw/

# Verify outputs exist
ls specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md
ls specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md
```
