# Quick Start: Enron Data Pipeline

> 5-minute triage for new agents entering this spec.

---

## Problem

TodoX needs real email data to validate its knowledge extraction pipeline (Gmail sync -> extraction -> knowledge graph -> meeting prep). The Enron corpus is the only publicly available large-scale corporate email dataset with the structural properties we need.

## Solution

Build a CLI command (`bun run repo-cli enron`) that loads curated Enron emails through the knowledge extraction pipeline, validating end-to-end from raw RFC 2822 email to meeting prep briefings.

## Current Phase

**Phase 0: Research & Dataset Acquisition**

## Progress

| Phase | Status | Description |
|-------|--------|-------------|
| P0 | Pending | Research & Dataset Acquisition |
| P1 | Blocked by P0 | Email Parsing Infrastructure |
| P2 | Blocked by P1 | Subset Curation & S3 Upload |
| P3 | Blocked by P2 | CLI Loader Command |
| P4 | Blocked by P3 | Knowledge Pipeline Integration |
| P5 | Blocked by P4 | Meeting Prep Validation |

## Fast Path to Context

**For quick execution**:
1. Read `README.md` "Overview" section (lines 29-55) for problem/solution framing
2. Copy-paste `handoffs/P0_ORCHESTRATOR_PROMPT.md` into a new session to execute

**For understanding full workflow**:
1. Read `MASTER_ORCHESTRATION.md` for state machine, transition guards, and decision points
2. Read `AGENT_PROMPTS.md` for reusable sub-agent prompt templates
3. Read `RUBRICS.md` for quality assessment criteria per phase
4. Read `handoffs/HANDOFF_P0.md` for current phase context

## Key Constants

| Key | Value |
|-----|-------|
| S3 Bucket | `arn:aws:s3:::static.vaultctx.com` |
| S3 Prefix | `todox/test-data/enron/` |
| CLI Package | `tooling/cli` |
| Knowledge Server | `packages/knowledge/server` |
| Dataset | CMU Enron corpus (May 2015 version) |
| Target Subset | 1-5K threaded messages |

## Next Action

Execute Phase 0 by copy-pasting: `handoffs/P0_ORCHESTRATOR_PROMPT.md`
