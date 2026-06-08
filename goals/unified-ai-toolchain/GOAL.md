# GOAL: Execute Unified AI Toolchain V2

Repo: `beep-effect` (`kriegcloud/beep-effect` on GitHub).

Outcome: make the V1-complete AI-sync schema package production-operable by
shipping V2 root CLI commands, broad dogfooding, schema-first reports, and
scheduled drift refresh PR automation.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/unified-ai-toolchain/README.md`
- `goals/unified-ai-toolchain/SPEC.md`
- `goals/unified-ai-toolchain/PLAN.md`
- `goals/unified-ai-toolchain/ops/manifest.json`

Read those first, then read `AGENTS.md`, `CLAUDE.md`, and governing standards
named by `SPEC.md`. Higher-priority repo standards outrank packet prose.

Scope:

- In: `goals/unified-ai-toolchain`, `packages/tooling/library/ai-sync`,
  `packages/tooling/tool/cli`, root scripts when needed, and the AI-sync
  scheduled workflow under `.github/workflows`.
- Out: V3 native file emission, `.ai-sync/project.jsonc` as a required source,
  additional-agent expansion, secret resolution, plugin installation, runtime
  agent control, and undocumented native-shape invention.

Workflow:

1. Inspect packet docs, current `@beep/ai-sync` APIs, repo CLI command patterns,
   and workflow precedents.
2. Implement V2 phases from `PLAN.md` in order.
3. Preserve unrelated worktree changes.
4. Keep `@beep/ai-sync` as the library and `beep ai-sync` as the operator UX.
5. Keep normal checks offline; reserve network access for strict drift and
   scheduled/manual refresh.
6. Update packet evidence/status when implementation changes readiness.

Acceptance:

- [ ] `beep ai-sync audit`, `check`, `drift`, and `refresh-pr` exist.
- [ ] Normal checks validate `.codex/config.toml`, `.mcp.json`,
      `.claude/settings.json`, `AGENTS.md`, and `CLAUDE.md`.
- [ ] JSON reports decode through `@beep/ai-sync` schemas.
- [ ] Rulesync config/MCP audit/import evidence is tested; ruler stays
      research-only.
- [ ] Weekly/manual drift refresh workflow opens or updates an automation PR
      only when generated artifacts change.
- [ ] V2 closeout evidence is archived under `history/outputs/`.

Verification:

```sh
test "$(wc -m < goals/unified-ai-toolchain/GOAL.md)" -le 4000
jq . goals/unified-ai-toolchain/ops/manifest.json
bun run beep ai-sync audit --json
bun run beep ai-sync check --json
bun run beep ai-sync drift --strict --json
bun run --cwd packages/tooling/library/ai-sync check
bun run --cwd packages/tooling/library/ai-sync test
bun run check
git diff --check -- goals/unified-ai-toolchain packages/tooling/library/ai-sync packages/tooling/tool/cli .github/workflows
```

Stop and report before implementing V3 native file writes, adding new agents,
printing secret-like values, changing architecture doctrine, or routing Auto-PR
through Yeet publish while Yeet remains proof-mode.
