# S44 projection identity review fix (2026-10-23)

Refs #1862; PR #2171, review thread `PRRT_kwDOPbO_N86vx4lb`.

The activation probe now requires the response role to equal the name parsed
from the corresponding source frontmatter. It requires three distinct,
nonempty string constraints, each occurring in that parsed source body after
the existing discovery-alias normalization and whitespace folding. The prompt
asks for complete verbatim binding constraints. Expected constraint text is
never hard-coded or supplied in the user prompt.

Every successful live response also drives two negative checks through the
same validator: a mismatched specialist role and an invented constraint.
Both must raise `ValueError`; a successful negative check fails the run.
The regenerated [results](2026-10-23-agent-projection-results.json) record
identity/source validation and both rejection outcomes for each specialist.

The rerun uses the unchanged native TOML developer instructions, pinned
`codex exec --model gpt-6.1-sol -c 'model_reasoning_effort="medium"'`,
`--ephemeral`, a read-only sandbox, host `timeout 180`, and stdin `/dev/null`.
Native SHA-256 preservation and canonical source/native equivalence remain
mandatory. This tests activation and source excerpts, with the same evidence
limits as the [original receipt](2026-10-23-agent-projection-nested-doctrine.md).

Base sync: merged `origin/main` once. Git merged the Decision Log cleanly;
both the S44 projection row and the incoming rows remain at the table end,
with dates in nondecreasing order. No manual SPEC edit was needed.

Left open: F-DOCKER, F-CLAUDE, F-NATIVE-LINKS, F-JUNIE, F-CURSOR,
F-GROK-COMPAT, F-CLAUDEM. #1862 remains open. Later review changes belong
in follow-up issues under the lane's round-two cutoff.

The first strict run rejected the modularization response because it included
a harness-level delegation instruction absent from the specialist source.
The validator was kept unchanged; the prompt was clarified to exclude rules
outside the specialist definition before rerunning the full set.

Validation for this review wave:

- `bun install`: pass, Bun 1.4.4 (also rerun after the base merge).
- Seven pinned live probes: pass; all native hashes unchanged.
- Fourteen negative checks: pass (wrong role and invented constraint per role).
- Python syntax parse and `git diff --check`: pass.
- `bun run lint:oxlint`: pass, zero findings.
- `bun run beep quality changeset-graph`: pass, zero missing references.
- `bun run beep knowledge refs --check`: pass.
- No workspace package, TypeScript test, or exported code was edited in this
  review wave; package verification, `test-tsgo`, and `docgen:local` are not
  triggered. The original twenty full package audits/docgen remain recorded
  in the original receipt; they were not rerun for this Python-only fix.
