# Friction receipts

## 2026-10-14: Effect Vitest inventory refresh rewrote unrelated exceptions

- Doing: recording one new test fixture's dynamic `Reactivity.layer` provision.
- Evidence: `bun run beep lint effect-vitest --write` added the intended EV002
  row but also changed existing `AgentMessage.layer.test.ts` exception statuses
  to open and shifted unrelated test line IDs. The packet retained only the new
  row with its explicit reason; a subsequent `lint effect-vitest` reported zero
  introduced findings.
- Would have prevented it: a scoped inventory write mode that updates only the
  named test file and preserves existing reviewed exception dispositions.

## 2026-10-14: fresh worktree package check lacks built declarations

- Doing: running `quality package-verify @beep/repo-cli --quick` after the
  managed receiver repair.
- Evidence: the lint step passed after touched-file formatting; the check step
  reported `TS6305` for missing dependency `dist` declarations across the
  CLI package. Focused managed and attached tests and scoped docgen passed.
- Would have prevented it: package verification building the declaration
  closure or naming a prerequisite build before showing cascaded source errors.
