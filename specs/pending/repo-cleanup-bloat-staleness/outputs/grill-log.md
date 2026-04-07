# Repo Cleanup Grill Log

## Purpose

This log captures planning questions, recommended answers, user answers, and codebase-evidence resolutions for the staged repo cleanup.

## Status Legend

- `resolved`
- `unresolved`
- `superseded by codebase evidence`

## Entry Contract

For each entry:

- assign a stable id like `G001`
- record the question
- record Codex's recommended answer
- record the user answer if the question was asked
- if codebase exploration resolved the question, record the evidence instead
- mark the current status

## Seeded Decisions

### G001

- **Question:** Should the durable execution tracker live inside a dedicated pending spec package instead of as a loose root-level output file?
- **Recommended Answer:** Yes. The repo already uses `specs/pending/<slug>/outputs/` as a durable home for long-running planning and execution artifacts.
- **User Answer:** Yes.
- **Evidence:** Existing pending specs such as `specs/pending/ip-law-knowledge-graph/` and `specs/pending/agent-governance-control-plane/` store tracked artifacts under `outputs/`.
- **Status:** `resolved`

### G002

- **Question:** Should `grill-me` be treated as mandatory in the Codex planning prompt now that it is available at the repo level?
- **Recommended Answer:** Yes. The planning loop should explicitly require `grill-me` so the refinement behavior is consistent instead of optional.
- **User Answer:** Yes.
- **Evidence:** Repo-local skill files now exist for Codex, Claude, and JetBrains AI Assistant.
- **Status:** `resolved`

### G003

- **Question:** Should grilling questions and answers be durably logged in this spec package rather than only living in the transient chat transcript?
- **Recommended Answer:** Yes. The grilling transcript should be preserved as a first-class planning artifact so future sessions can resume with the same assumptions and decisions.
- **User Answer:** Yes.
- **Evidence:** User requested that Codex questions and user answers be logged and captured in an output markdown document.
- **Status:** `resolved`

### G004

- **Question:** Should the improved Codex Plan mode prompt itself be stored as a spec output artifact?
- **Recommended Answer:** Yes. The operator prompt should live beside the other planning artifacts so the spec package is self-contained.
- **User Answer:** Yes.
- **Evidence:** User requested that the improved prompt be put in an output.
- **Status:** `resolved`

### G005

- **Question:** Should the cleanup preserve historical, security, and research documents that reference removed code, instead of bulk-rewriting all documents?
- **Recommended Answer:** Yes. Active docs, generated docs, inventories, and current prompts should be cleaned, but completed specs, security reports, and historical research should be preserved unless they create broken navigation or misleading current-state claims.
- **User Answer:** Yes.
- **Evidence:** Completed security and research documents intentionally reference removed paths as evidence, including `specs/completed/security/...` notes and historical planning prompts.
- **Status:** `resolved`

### G006

- **Question:** Should repo-maintenance commands such as `config-sync`, `version-sync --skip-network`, and `docgen` be part of the cleanup itself rather than treated as optional follow-up?
- **Recommended Answer:** Yes. This repo has first-class managed config and docs workflows, so workspace deletion is incomplete until managed artifacts are regenerated.
- **User Answer:** Yes.
- **Evidence:** Root scripts include `config-sync`, `version-sync`, and `docgen`, and `tsconfig-sync` explicitly manages root refs, aliases, `tstyche`, `syncpack`, and package docgen configuration.
- **Status:** `resolved`

### G007

- **Question:** Should dependency catalog pruning, security exception cleanup, and platform or test config cleanup be a first-class cleanup phase?
- **Recommended Answer:** Yes. Removing workspaces here can leave stale root catalog entries, vuln exceptions, Playwright wiring, CI hooks, and other repo-level drift unless this is handled explicitly.
- **User Answer:** Yes.
- **Evidence:** Root catalog and config still reference workspace-specific dependencies and app-level surfaces such as `next`, SDK-related packages, `osv-scanner.toml`, and Playwright config targeting `@beep/web`.
- **Status:** `resolved`

### G008

- **Question:** Should this cleanup spec be converted from one large prompt into the repo's canonical phased-spec pattern with separate orchestrator prompts and scoped Codex sessions?
- **Recommended Answer:** Yes. This cleanup now spans enough repo-wide concerns that separate phase sessions will keep state, approvals, and verification boundaries cleaner.
- **User Answer:** Yes.
- **Evidence:** Stronger pending specs in this repo already use root operator docs, handoffs, per-phase orchestrator prompts, phase outputs, and a manifest to keep long-running work coherent.
- **Status:** `resolved`
