# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 (Research & Dataset Acquisition) of the `enron-data-pipeline` spec.

### Context

TodoX is an AI-powered B2B SaaS tool for wealth management firms. Its MVP pipeline is: **Gmail sync -> extraction -> knowledge graph -> meeting prep**. We need the Enron email corpus as realistic test data. The knowledge extraction pipeline in `packages/knowledge/server` is fully implemented with LLM-powered extraction, GraphRAG, entity resolution, and batch orchestration (~14.7K lines of tests). No real-world data has been tested yet.

We've selected the **CMU Enron corpus** (the canonical version) as our dataset. It will be stored in S3 at `s3://static.vaultctx.com/todox/test-data/enron/`.

### Your Mission

Complete 3 tasks:

**Task 1: Evaluate Dataset Formats** (`web-researcher` agent)
- Confirm CMU Enron corpus availability and download mechanics
- Evaluate Kaggle CSV vs CMU maildir vs HuggingFace pre-processed
- Document format details, sizes, licensing
- Output: `specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md`

**Task 2: Download & Upload Raw Dataset to S3**
- Download the selected Enron format (prefer Kaggle CSV for simplicity: single ~1.4GB file)
- Upload to `s3://static.vaultctx.com/todox/test-data/enron/raw/`
- Use the `aws-api` MCP server for S3 operations
- Verify upload succeeded

**Task 3: Evaluate Email Parsing Libraries** (`web-researcher` agent)
- Research Node.js RFC 2822 / MIME parsing libraries: `mailparser`, `postal-mime`, `emailjs-mime-parser`
- Must extract: From, To, CC, BCC, Date, Subject, Message-ID, In-Reply-To, References
- Must handle multipart MIME, quoted-printable, base64
- Should handle signature detection
- TypeScript types preferred, minimal dependencies
- Output: `specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md`

### Critical Patterns

- This phase is research-heavy. Delegate research to `web-researcher` agents.
- Use `aws-api` MCP for S3 operations (it's configured in the environment).
- S3 bucket: `arn:aws:s3:::static.vaultctx.com`
- No code to write in this phase — only research outputs and S3 uploads.

### Reference Files

- Full spec: `specs/pending/enron-data-pipeline/README.md`
- Handoff: `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P0.md`
- Original prompt: `PROMPT_Enron_Data_Loading_Exploration.md`

### Verification

```bash
# Verify S3 upload
# Use aws-api MCP: list objects in s3://static.vaultctx.com/todox/test-data/enron/raw/

# Verify outputs
ls specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md
ls specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md
```

### Success Criteria

- [ ] Raw Enron dataset uploaded to S3
- [ ] `outputs/dataset-evaluation.md` produced with format comparison
- [ ] `outputs/parsing-library-evaluation.md` produced with library recommendation
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] `handoffs/HANDOFF_P1.md` created (Phase 1 context document)
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created (Phase 1 launch prompt)

### Handoff Document

Read full context in: `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P0.md`
