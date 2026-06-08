# GOAL: Implement Fallow Quality Enforcement

Repo: `/home/elpresidank/YeeBois/projects/beep-effect6`.

Outcome: turn the Fallow pilot into a repo-native quality subsystem that gives
coding agents fast, structured, enforceable feedback without replacing Knip
until parity is proven.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/fallow-quality-enforcement/README.md`
- `goals/fallow-quality-enforcement/SPEC.md`
- `goals/fallow-quality-enforcement/PLAN.md`
- `goals/fallow-quality-enforcement/ops/manifest.json`
- `goals/fallow-quality-enforcement/research/feature-matrix.jsonc`
- `goals/fallow-quality-enforcement/research/knip-parity.jsonc`
- `goals/fallow-quality-enforcement/tasks/tasks.jsonc`

Read those first, then read `AGENTS.md`, `CLAUDE.md`,
`standards/ARCHITECTURE.md`, `standards/architecture/README.md`,
`standards/architecture/07-non-slice-families.md`,
`standards/effect-first-development.md`, and
`standards/effect-laws-v1.md`.

Scope:

- In: this goal packet, Fallow research reports, `beep quality fallow ...`,
  Yeet packet normalization, advisory CI artifacts, generated Fallow boundary
  policy, Fallow suppression policy, and Knip parity evidence.
- Out: removing Knip, making runtime coverage blocking, hidden `fallow fix`
  mutations, or creating architecture doctrine outside canonical standards.

Workflow:

1. If not already on it, switch to `feat/fallow-quality-enforcement` while
   preserving dirty worktree changes.
2. Treat `apps/canvas/src/App.tsx` and `apps/canvas/src/main.tsx` as unrelated
   pre-existing dirty files unless the user says otherwise.
3. Run `bun goals/fallow-quality-enforcement/ops/validate-packet.ts`.
4. Complete P0 reports and update matrix artifacts before P1 implementation.
5. Keep Fallow advisory until matrix gates promote individual lanes.

Acceptance:

- [ ] Packet validator passes.
- [ ] P0 feature reports exist for every matrix feature family.
- [ ] Knip parity rows are measured before any Knip retirement proposal.
- [ ] Any blocking Fallow promotion enters `quality github-checks pre-push`.
- [ ] Required critic rounds return `0 required findings`.

Verification:

```sh
test "$(wc -m < goals/fallow-quality-enforcement/GOAL.md)" -le 4000
bun goals/fallow-quality-enforcement/ops/validate-packet.ts
git diff --check -- goals/fallow-quality-enforcement
```

