---
name: claude-frontend-lane
description: Use Claude Code as a bounded frontend design, implementation, and browser-QA companion from a Codex-led session. Trigger on Claude-assisted frontend work, frontend-design, claude-in-chrome, Chrome or DevTools QA, visual polish, shadcn/MUI composition, and Codex-to-Claude handoffs.
---

# Claude Frontend Lane

Use this skill when a Codex-led session should hand a bounded frontend surface to
Claude Code for design, implementation, or browser QA while keeping Codex
responsible for architecture, Effect logic, package boundaries, and final
integration.

This is a lane-coordination skill, not a repo architecture package and not a
generic nested-agent pattern.

## Ownership Split

Codex owns:

- Effect logic, schemas, services, actions, ports, errors, and package
  boundaries.
- Deciding whether a UI primitive belongs in an app or `@beep/ui`.
- Reviewing Claude's diff before final acceptance.
- Running targeted quality gates and fixing architecture drift.

Claude owns, when explicitly handed the lane:

- Frontend component implementation inside the named app scope.
- Visual polish, interaction fit, responsive checks, and accessibility review.
- Browser QA using Chrome or DevTools tooling when available.
- Design critique using `frontend-design` when available.

## Default Boundaries

- Default write scope is app-first: `apps/codedank-web/**`,
  `apps/oip-web/**`, or the named app surface in the handoff.
- `packages/foundation/ui-system/ui/**` may be edited only when the mission
  brief explicitly says the behavior is a product-agnostic shared primitive,
  hook, style, or component that belongs in `@beep/ui`.
- Claude should not edit Effect services, schemas, domain models, server
  adapters, package manifests, lockfiles, repo-wide config, or architecture docs
  unless the mission brief explicitly grants that scope.
- Use the same checkout for sequential handoffs. Before Claude edits, Codex
  should check the dirty tree and name the files or directories Claude owns.
- Use a sibling worktree only for substantial parallel implementation or when
  same-checkout ownership cannot be made clear.

## Codex Workflow

1. Inspect the current repo state:
   `git status --short --branch`.
2. Identify the exact app, route, component, and allowed write paths.
3. Classify shared UI changes:
   app-specific product behavior stays in the app; product-agnostic primitives
   may move to `@beep/ui` only by explicit decision.
4. Preflight Claude without changing plugin config:
   - `claude -p --no-session-persistence --max-budget-usd 0.25 --tools ''`
     with the prompt on stdin for small smoke or critique probes.
   - `claude plugin list` to observe whether `frontend-design`,
     Chrome/DevTools, or related browser QA plugins are enabled.
   - `claude mcp list` only when MCP state matters to the lane.
5. For small text critique, use a no-tools `claude -p` probe.
6. For real implementation or browser QA, create a mission brief and hand it to
   an interactive Claude Code session with explicit write scope.
7. After Claude returns, review the diff, normalize repo patterns, and run
   targeted verification.

Do not use `--bare` for probes that depend on the user's normal Claude Code
login. Bare mode intentionally skips OAuth and keychain reads.

## No-Tools Probe Pattern

Use stdin so `--tools ''` cannot consume the prompt argument:

```bash
claude -p --no-session-persistence --max-budget-usd 0.25 --tools '' <<'PROMPT'
Reply with exactly: OK
PROMPT
```

Use no-tools probes for:

- Frontend critique of a pasted snippet or design brief.
- Rewriting a Claude mission brief.
- Asking Claude to sanity-check interaction language or visual direction.

Do not use no-tools probes for repo edits, broad file review, or Chrome QA.

## Mission Brief Template

```text
You are the Claude frontend lane for this Codex-led repo session.

Goal:
- <one-sentence user-visible outcome>

Repo:
- /home/elpresidank/YeeBois/projects/beep-effect2

Allowed write scope:
- <exact app paths>
- <optional @beep/ui paths, only if explicitly allowed>

Do not edit:
- Effect services, schemas, server adapters, architecture docs, package
  manifests, lockfiles, or unrelated dirty files.

Use these project rules:
- App-specific product behavior stays in the app.
- Product-agnostic reusable UI primitives may go in @beep/ui only when this
  brief explicitly allows it.
- Prefer existing @beep/ui and shadcn components before custom markup.
- Preserve repo import aliases and package boundaries.

Frontend/design lane:
- Use frontend-design if enabled.
- Use Chrome/DevTools or claude-in-chrome QA if enabled.
- If those plugins are unavailable, report that and continue with local browser
  or static QA where possible.

Acceptance criteria:
- <specific visual and interaction requirements>
- <responsive states>
- <loading/empty/error states if relevant>
- <accessibility expectations>

Return report:
- Changed files
- Browser/plugin QA performed
- Screens or viewports checked
- Visual risks or tradeoffs
- Unresolved questions
- Follow-up Codex integration needed
```

## Claude Return Contract

Claude should return:

- `Changed files`: exact paths edited.
- `QA performed`: browser, viewport, and interaction checks, plus whether
  `frontend-design` and Chrome/DevTools tooling were enabled.
- `Result`: what now works from the user's perspective.
- `Risks`: visual, accessibility, responsiveness, dependency, or package-boundary
  concerns.
- `Needs Codex`: any Effect, schema, routing, package, or verification work that
  Codex must handle.

## Codex Closeout

After Claude's lane completes:

- Re-run `git status --short --branch` and inspect Claude's diff.
- Confirm Claude stayed inside the allowed write scope.
- Normalize imports, package boundaries, shared UI placement, and Effect-adjacent
  integration.
- Run targeted gates based on touched surfaces:
  - app changes: app `check`, `test`, `lint`, and a browser QA pass.
  - `@beep/ui` changes: package `check`, `test`, `lint`, and Storybook checks
    when the change affects shared primitives or visual behavior.
  - root `check` or broader quality only when shared surfaces, package
    boundaries, or risk justify it.
- Summarize the Claude lane separately from Codex integration in the final
  response.

## Escalation Rules

Escalate back to Codex before continuing when:

- The work needs Effect service, schema, action, port, or driver changes.
- The desired UI requires a new dependency or package manifest edit.
- The change wants to move app behavior into `@beep/ui` without an explicit
  product-agnostic primitive decision.
- Claude finds dirty files inside its proposed write scope that were not part
  of the handoff.
- Browser QA requires enabling or changing Claude plugin/MCP configuration.
