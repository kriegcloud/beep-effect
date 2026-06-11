# Agent Reflection Loop Plan

## Status

Status: `active` — P1 in progress.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Survey the frontier of reflection in agentic coding. | Cited report in `research/`. |
| P1 Goal-closeout reflection system | active | Topology + `ReflectionFrontmatter` schema + advisory/enforcement lint rule + `/reflect` skill. | Rule routes + runs (`blocking_findings=0`); template + README + skill landed; tsgo + test green. |
| P2 Yeet self-healing reflection | pending | `failure→reflect→repair` bound to Yeet `closeout`/a `yeet reflect` step, grounded in `QualityIssue`s. | Designed + implemented in a follow-up slice. |
| P3 Memory consolidation | pending | Distill reflections into `memory/` / Graphiti (ExpeL-style ADD/EDIT/UPVOTE/DOWNVOTE). | Designed + implemented in a follow-up slice. |

## P1 Checklist

- [x] `_template/history/reflections/{.gitkeep,_TEMPLATE.md}`.
- [x] `goals/README.md` File Roles row + `_template` PLAN/GOAL/manifest wiring (`reflectionRequired: true`).
- [x] `Lint/ReflectionArtifact.ts` — `ReflectionConfidence`/`ReflectionTrigger`/`ReflectionFindingCategory` (LiteralKit), `ReflectionFinding`/`ReflectionFrontmatter`, frontmatter decoder, runner.
- [x] Route the subcommand: `Lint.command.ts` + `Quality/Tasks.ts` (`LintPolicySubcommand` + composite step) + `bin-main.ts` (`LINT_POLICY_SUBCOMMANDS`).
- [ ] `commands/Yeet/internal/QualityIssueIndex.ts` — `reflection-artifact-compliance` category + routing to the `reflect` skill.
- [ ] `.claude/skills/reflect/SKILL.md`.
- [ ] `test/reflection-lint.test.ts`.
- [ ] `standards/architecture/GLOSSARY.md` reflection entry.
- [ ] Dogfood: this packet's own `history/reflections/<date>-claude.md`.

## P3 Closeout Checklist

See `_template/PLAN.md`. Write `history/reflections/<YYYY-MM-DD>-<agent>.md` via
`/reflect`; `bun run beep lint reflection-artifacts` must pass (this packet is
`reflectionRequired: true`).

## Verification Commands

```sh
bunx tsgo -b packages/tooling/tool/cli/tsconfig.json
bun run beep lint reflection-artifacts
bunx vitest run packages/tooling/tool/cli/test/reflection-lint.test.ts
test "$(wc -m < goals/agent-reflection-loop/GOAL.md)" -le 4000
jq . goals/agent-reflection-loop/ops/manifest.json
```
