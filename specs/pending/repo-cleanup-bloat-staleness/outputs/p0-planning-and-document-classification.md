# P0: Planning And Document Classification

## Status

**COMPLETED**

## Objective And Scope

P0 exists to remove local invention before destructive cleanup starts. This phase does not delete workspaces; it locks the execution contract for P1-P5, classifies which documents are active versus historical, and names the exact root surfaces the implementation phases must treat as first-class cleanup targets.

## Planning Artifacts

- `outputs/grill-log.md`
- `outputs/cleanup-checklist.md`
- `outputs/codex-plan-mode-prompt.md`
- `outputs/manifest.json`

## Evidence-Backed Decisions

- Use a dedicated pending spec package for durable artifacts.
- Treat `grill-me` as mandatory during planning.
- Log grilling questions, recommendations, answers, and evidence-backed resolutions.
- Preserve historical/security/research documents by default.
- Treat managed repo commands as part of cleanup completeness.
- Use a canonical phased spec with one Codex session per phase.
- Treat `apps/clawhole`, `apps/web`, `apps/crypto-taxes`, and `packages/ai/sdk` as live workspaces until P1 removes them.
- Treat root aliases, TypeScript references, identity composers, standards inventories, security exceptions, and test or lint wiring as active cleanup surfaces for the implementation phases.
- Treat repo-local `@beep/docgen` ownership as current repo reality; P2 verifies and cleans stale assumptions rather than assuming docgen is external.

## Repo Evidence Summary

- `package.json` still includes `apps/*` and `packages/ai/*` workspaces, and the target directories still exist on disk.
- `tsconfig.packages.json` and `tsconfig.quality.packages.json` still reference all four removal targets.
- `tsconfig.json` still defines path aliases for `@beep/clawhole` and `@beep/ai-sdk`.
- `packages/common/identity/src/packages.ts` still exports identities for `@beep/clawhole`, `@beep/crypto-taxes`, and `@beep/docgen`.
- `playwright.config.ts` still boots `@beep/web`.
- `osv-scanner.toml` still contains a `crypto-taxes`-specific security exception.
- `tstyche.json`, `package.json` `lint:ox`, `tooling/configs`, `tooling/cli`, and `standards/schema-first.inventory.jsonc` still contain `packages/ai/sdk` references.
- `tooling/docgen/package.json`, `tooling/cli/package.json`, `tsconfig.json`, and `tooling/docgen/docgen.json` prove current repo-local `@beep/docgen` ownership.

## Document Classification Policy

| Class | Default Action | Examples |
|---|---|---|
| Active surface | Clean, remove, or regenerate stale references in the owning implementation phase | current configs, live prompts, current READMEs, generated docs, active standards inventories, CI or test config |
| Historical evidence | Preserve by default | completed specs, security reports, archived research, retrospective notes |
| Ambiguous dual-role doc | Preserve content, then update navigation or add a note only if current-state use would otherwise mislead execution | documents with both historical evidence and live navigation roles |

## Phase Boundaries

| Phase | Boundary | Included Surfaces |
|---|---|---|
| P0 | Planning only | policy, tracker state, document classification, verification contract |
| P1 | Remove target workspaces and regenerate managed repo surfaces | workspace directories, root workspaces, TS refs, aliases, managed config, generated docs, direct active references |
| P2 | Prove docgen ownership and remove stale docgen assumptions | `tooling/docgen`, `tooling/cli`, docgen configs, generated docs, stale `@effect/docgen` assumptions if any remain |
| P3 | Prune repo-wide dependency, security, and platform drift left after removals | dependency catalog entries, overrides, ignored vulns, orphaned platform or test config |
| P4 | Build ranked stale-code inventory and run approval loop | candidates only, one approved deletion at a time in fresh executor sessions |
| P5 | Final verification and repo-knowledge closeout | quality gates, curated TrustGraph sync, final readiness summary |

## Verification Contract

- Run only the commands required by the active phase's touched surfaces, using the command matrix below.
- Treat command failure as a blocker when the failure is caused by the phase work; if a failure is pre-existing or unrelated, capture the evidence in the phase output and checklist instead of silently downgrading the gate.
- Summarize every command result in the active phase output, including no-op outcomes.
- Stop at the phase exit gate even when the next phase is obvious.

## Phase Status And Manifest Rules

| Rule | Contract |
|---|---|
| Authoritative phase pointer | `outputs/manifest.json` `active_phase` |
| Phase start | Move the current phase to `IN_PROGRESS` |
| Phase completion | Move the current phase to `COMPLETED` and advance `active_phase` to the next phase unless the user explicitly pauses |
| Blocked phase | Mark the phase `BLOCKED` and record the blocker in the phase output and checklist |
| Checklist mirror | Update `outputs/cleanup-checklist.md` in the same session as every manifest status change |
| Out-of-phase discoveries | Log them to the checklist or the next relevant phase output instead of widening scope opportunistically |

## Default Execution Rules

| Rule | Default |
|---|---|
| Commit cadence | one commit per completed implementation phase in P1-P3 and one commit per approved candidate in P4 |
| Push policy | no push without explicit user confirmation |
| P4 deletion approval | each candidate requires an explicit `yes` before deletion |
| Historical docs | preserve by default unless navigation breaks or current-state claims become misleading |

## Resolved Policy Decisions

- Starting P1, P2, or P3 counts as approval for all in-scope destructive edits and deletions in that phase.
- P4 remains the only phase that requires per-candidate `yes` approval before deletion.
- The default commit cadence is accepted with no override.

## Verification Command Matrix To Confirm

| Command | Expected Trigger |
|---|---|
| `bun run config-sync` | workspace graph, TS refs, aliases, or managed docgen config changes |
| `bun run version-sync --skip-network` | workspace deletion or dependency graph drift |
| `bun run docgen` | workspace docs or docgen config changes |
| `bun run lint` | any implementation-phase repo changes |
| `bun run check` | any implementation-phase repo changes |
| `bun run test` | any implementation-phase repo changes |
| `bun run check:full` | root TS wiring or workspace references change |
| `bun run lint:repo` | root package graph changes |
| `bun run audit:high` | dependency or security-exception surfaces change |
| `bun run trustgraph:sync-curated` | final closeout |

## Document Classification Matrix

| Surface | Classification | Planned Action | Notes |
|---|---|---|---|
| `package.json`, `tsconfig.packages.json`, `tsconfig.quality.packages.json`, `tsconfig.json`, `bun.lock` | Active surface | Update in the owning implementation phase | These are authoritative repo wiring surfaces |
| `playwright.config.ts`, `tstyche.json`, `osv-scanner.toml`, tooling lint config, schema-first inventory | Active surface | Update or regenerate when target refs disappear | These refs will survive plain directory deletion |
| `specs/completed/security/*.md` and older research or pending specs mentioning removed paths | Historical evidence | Preserve by default | Keep unless a broken link or misleading operator instruction forces a narrow edit |
| Current cleanup spec files in `specs/pending/repo-cleanup-bloat-staleness/` | Active surface | Keep synchronized with manifest and checklist | These are the live operator docs for this cleanup |
| Any document mixing active operator guidance with historical evidence | Ambiguous dual-role doc | Escalate and log if a simple note or navigation fix will not resolve the ambiguity | Do not rewrite historical content by reflex |

## Commands Run So Far

| Command Type | Scope | Result |
|---|---|---|
| `bun run codex:hook:session-start` | repo startup context | success |
| `bun run trustgraph:status` | durable repo knowledge availability | success; status available but no curated sync state yet |
| targeted `sed`, `find`, and `rg` | spec inputs plus live repo references | success; confirmed live workspace refs and current cleanup surfaces |
| `git status --short` | worktree safety | success; worktree clean |

## Open Questions

- None.

## Residual Risks Or Blockers

- The targeted TrustGraph context query did not add useful repo facts, so P0 is relying on direct codebase inspection for the cleanup contract.

## Handoff Notes For P1

- P1 must treat workspace deletion as only part of the job; root refs, aliases, standards inventory entries, Playwright wiring, ignored vulns, test globs, and lint ignores already need attention.
- Historical and security documents referencing removed code should be preserved unless they become broken or misleading as current operator guidance.
- Starting P1 now counts as approval for its in-scope destructive work; do not widen into P2 or P3 in the same session unless explicitly instructed.

## Exit Gate

P0 is complete when the grilling transcript and planning output are explicit enough that P1 can proceed without inventing policy locally.
