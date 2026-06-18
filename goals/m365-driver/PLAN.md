# M365 Driver Plan

## Status

Status: `pending`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | pending | Confirm the `@beep/hubspot`/`@beep/box` precedents and the Graph `v1.0` endpoints/scopes in `SPEC.md`; scaffold `@beep/m365` via `bun run create-package`. | Package scaffolded; endpoints/scopes confirmed; new deps registered in the root catalog. |
| P1 Implement | pending | Build config/service/errors + MSAL auth + read verbs (Files/Sites + Mail/Calendar), Schema-decoded. | Acceptance criteria are met. |
| P2 Verify | pending | Run unit decoders + the credential-gated live smoke test; capture evidence. | Verification green (smoke skipped without creds) or blockers documented. |
| P3 Close | pending | Prepare PR, review response, write the closeout reflection, final readiness if requested. | Packet status/evidence updated; a closeout reflection exists. |

## P3 Closeout Checklist

Before marking the packet closed (and `status` → `completed-retained` / `complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `goals/_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling**
   (what worked, what didn't, what was frustrating, what you wished existed), the
   **implementation** (improvement opportunities), and the **goal/prompt** (would
   you revise it?). Capture TODOs worth codifying. Its YAML frontmatter must
   validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`, so a missing/invalid reflection blocks closeout).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.
- Mirror `@beep/hubspot` (raw HTTP + Schema + bearer) and `@beep/box`
  (config/service/errors + `S.Redacted`); do not reinvent.

## Verification Commands

```sh
test "$(wc -m < goals/m365-driver/GOAL.md)" -le 4000
jq . goals/m365-driver/ops/manifest.json
rg -n "m365-driver|GOAL.md|agentLaunchers|packetAnchorDocument" goals/m365-driver
git diff --check -- goals/m365-driver
```
