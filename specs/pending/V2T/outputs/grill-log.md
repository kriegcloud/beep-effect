# V2T Canonical Spec - Grill Log

This file is append-only. Record high-signal questions, recommendations, answers, and package-shape decisions here so future sessions do not have to rediscover them.

## 2026-04-10 Bootstrap Decisions

### Q1 - What artifact shape should the V2T canonical spec use?

- Recommendation: use a full canonical spec package consistent with repo precedent
- Answer: use a full canonical spec package
- Resolution: created root docs, handoffs, a manifest, and the five phase artifacts

### Q2 - How should the five phase artifacts be named?

- Recommendation: honor the requested exact filenames
- Answer: use `RESEARCH.md`, `DESIGN_RESEARCH.md`, `PLANNING.md`, `EXECUTION.md`, and `VERIFICATION.md`
- Resolution: the manifest points p0-p4 directly at those root-level files

### Q3 - Where should the canonical spec live?

- Recommendation: canonicalize in-place under `specs/pending/V2T`
- Answer: keep it in-place
- Resolution: preserved the existing PRD inputs and built the package around them

## Default Assumptions Chosen From Repo Reality

- The first execution slice is the local-first workflow, not a claim of finished autonomous media generation quality.
- `apps/V2T` is the canonical app workspace.
- Shared speech-input UI and root Graphiti tooling are prior art to reuse rather than duplicate.

## 2026-04-10 Review Corrections

### Q4 - Does the repo have a root-level canonical spec registry that V2T still needs to wire into?

- Recommendation: no, treat the repair as package-local because repo precedent is convention-based rather than centrally registered
- Answer: no root-level registry was found in `package.json`, `turbo.json`, or nearby tooling
- Resolution: repaired the package-local handoff router, manifest, and entry prompt instead of inventing root config changes

### Q5 - Which sidecar seam should the canonical spec treat as authoritative?

- Recommendation: use the existing `@beep/VT2` sidecar package and scripts as the current control-plane seam
- Answer: `packages/VT2` is the current sidecar seam
- Resolution: updated the research, design, planning, handoffs, and prompts to point at `packages/VT2/src/protocol.ts`, `packages/VT2/src/Server/index.ts`, and the app-side sidecar scripts

### Q6 - Should the bootstrap repair change root markdown lint policy for specs?

- Recommendation: no, keep the repo-wide ignore in place for this pass and record the limitation explicitly
- Answer: leave root markdown lint policy unchanged
- Resolution: the repair stayed inside `specs/pending/V2T` and documented that `.markdownlint-cli2.jsonc` still ignores `specs/**`
