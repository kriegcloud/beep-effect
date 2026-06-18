# GOAL: build the @beep/form effect-first form substrate

Repo: `/home/elpresidank/YeeBois/projects/beep-effect5`.

Outcome: `@beep/form` (`packages/foundation/ui-system/form`) exists — a
schema-first, effect-v4, `@tanstack/react-form` v1.33 form kit binding fields to
`@beep/ui` primitives, with a story + `play` test per field, `@effect/vitest`
units for the core, JSDoc on all exports, a working demo form, and green quality
gates.

This is a compact `/goal` launcher. The packet files are the contract:

- `goals/form/README.md`
- `goals/form/SPEC.md` (normative — locked decisions, acceptance, stop conditions)
- `goals/form/PLAN.md` (P0→Close phases + exit criteria)
- `goals/form/ops/manifest.json`
- `goals/form/research/` (P0: codebase grounding, widget libs, design review)

Read those first, then `AGENTS.md`, `CLAUDE.md`, and the standards named in
`SPEC.md` (`standards/ARCHITECTURE.md`, `standards/architecture/07-non-slice-families.md`).
Higher-priority repo standards outrank packet prose. **Decisions are locked — do
not re-grill. If a finding contradicts a locked decision, STOP and surface it.**

Scope:

- In: new `packages/foundation/ui-system/form`; **additive** changes to
  `@beep/ui` (new MUI-x date/time primitives; new P3 heavy primitives) and
  `@beep/schema` (date-adapter reconciliation into the `DateTimeUtcFromValid`/
  `LocalDate` concept); root `catalog` pins; `apps/storybook` wiring + stories.
- Out: `foundation/capability`, any slice (`domain`/`client`/`server`/
  `use-cases`), drivers, app runtime layers, MUI form inputs (MUI = dates only),
  any schema→form auto-generator, replacing `@beep/ui`'s existing non-MUI
  `date-picker.tsx`.

Dependency envelope (MUST NOT exceed): `@beep/ui`, `@beep/schema`, `@beep/utils`,
`@tanstack/react-form`, `@effect/atom-react`, `@base-ui/react`,
`@mui/x-date-pickers` (dates only), `effect`.

Workflow:

1. Scaffold via `bun run beep create-package form --family foundation --kind
   ui-system --with-stories-tsconfig` (dry-run first). Do NOT hand-roll; do NOT
   use the slice scaffolder.
2. Implement per `PLAN.md` phases (P1 core+simple → P2 dates → P3 heavy).
3. Validation: effect v4 `Schema.toStandardSchemaV1` → tanstack `validators`;
   map issues to `@beep/ui` `FieldError` by path. Defaults: `schema.make({})`.
4. Non-form field state uses scoped atoms (`@effect/atom-react` +
   `effect/unstable/reactivity`), mirroring `@beep/ui` `date-picker.tsx`.
   `@tanstack/react-form` owns all form/field/validation/submission state.
5. Preserve unrelated worktree changes; keep decisions tied to file/command
   evidence; update packet status/evidence.
6. At Close, write `history/reflections/<YYYY-MM-DD>-<agent>.md` via `/reflect`;
   `bun run beep lint reflection-artifacts` must pass.

Acceptance:

- [ ] `SPEC.md` acceptance criteria are satisfied.
- [ ] Required verification commands pass, or unrelated failures are reproduced
      and recorded separately.
- [ ] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/form/GOAL.md)" -le 4000
jq . goals/form/ops/manifest.json
git diff --check -- goals/form
bun run beep yeet verify
```

Stop and report before changing public API, schema, data migration, auth, infra,
security behavior, dependencies, lockfiles, generated files, or destructive
state beyond what `SPEC.md` requires.

Done only when acceptance passes and verification is complete, or a blocker is
reported with file/command evidence.
