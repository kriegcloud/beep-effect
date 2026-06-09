---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: editor-mcp-hooks
status: researched
updated: 2026-06-08
---

# Editor MCP Hooks Research Report

## Summary

- Feature family: editor-mcp-hooks
- Fallow docs URLs: https://docs.fallow.tools/integrations/mcp, https://docs.fallow.tools/integrations/claude-hooks, https://docs.fallow.tools/integrations/vscode, https://docs.fallow.tools/integrations/node-bindings
- Local commands: `bun run fallow -- --help`
- Current status: research-only; canonical enforcement stays in repo-cli JSON envelopes.

## Baseline

- Command: `bun run fallow -- --help`
- Exit status: 0
- Runtime: subsecond help probe.
- Counts: no repo editor/MCP hook baseline collected.
- Artifact path: none planned for P0.

## Repo Fit

- Doctrine target refs: `AGENTS.md`
- Existing repo lane overlap: agent hooks are attractive for local back-pressure, but this repo already centralizes durable quality through Yeet.
- Config surfaces: future `.claude/settings.json`, MCP client settings, VS Code extension settings, Node bindings.
- Generated metadata needed: safety contract for local hook blocking, raw output capture, bypass/waiver, and parity with Yeet.
- Important caveat: editor/MCP hooks are personal tooling surfaces; they cannot be the authoritative repo quality path.

## False Positives And Suppressions

- False-positive status: unknown.
- Owner: `@beep-team`
- Evidence: official docs and help probe.
- Suppression class: `integration-deferred`
- Expiry or review date: required if a future local hook bypass is recorded.
- Preferred fix path: implement repo-cli wrappers first; later editor hooks may call those wrappers instead of raw Fallow.

## Yeet And CI

- `beep quality fallow` command: none in P1; target remains research-only.
- Yeet category: `repo-law` only if a later packet adopts hook telemetry.
- Parser: `fallow/editor-mcp-hooks/v1`
- Default blocking: false
- CI mode: none.
- Failure envelope behavior: no P1 wrapper planned.

## Promotion Gate

- Required commands: `bun run fallow -- --help`
- Required evidence refs: `research/editor-mcp-hooks.md`
- Required reviewer roles: Quality Gate Reviewer
- Rollback notes: keep editor, MCP, and hook integrations out of the canonical path.
