# Storybook App Plan

## Status

Status: `complete`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Packet Bootstrap | complete | Create the execution-capable packet and capture grilled decisions. | Packet files exist with `SPEC.md` as anchor. |
| P1 App Migration | complete | Create `apps/storybook`, move Storybook host files, and keep stories package-local. | Root commands target `@beep/storybook`; `@beep/ui` no longer owns Storybook runtime. |
| P2 Validation Ownership | complete | Wire Storybook app check/lint/build/browser tests with external story inputs. | UI and Storybook Turbo lanes pass. |
| P3 CI | complete | Add dedicated Storybook workflow. | Workflow builds, browser-tests, and uploads `storybook-static`. |
| P4 Infra Preview | complete | Add Vercel-only Pulumi wiring for `beep-storybook`. | Infra tests pass and preview credential blocker recorded. |
| P5 Closeout | complete | Run verification matrix and record evidence. | Packet status/evidence reflects final result. |

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.
- Avoid `packages/tooling/**` edits unless a gate proves they are required,
  because another agent may be working there.
- Do not enroll `packages/shared/ui` or slice UI packages in this packet.
- Do not request or expose raw secrets for Pulumi/Vercel proof.

## Verification Commands

```sh
test "$(wc -m < goals/storybook-app/GOAL.md)" -le 4000
jq . goals/storybook-app/ops/manifest.json
rg -n "storybook-app|@beep/storybook|apps/storybook|agentLaunchers|packetAnchorDocument" goals/storybook-app
git diff --check -- goals/storybook-app
bun run config-sync:check
bun run version-sync
bunx turbo run check lint test --filter=@beep/ui
bunx turbo run check lint storybook:build test:storybook --filter=@beep/storybook
bun run storybook:build
bun run test:storybook
bunx turbo run check lint test --filter=@beep/infra
```
