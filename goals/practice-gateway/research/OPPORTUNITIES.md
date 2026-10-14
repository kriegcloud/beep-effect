# Practice Gateway — Friction Receipts

## 2026-10-14 — `beep architecture add concept` cannot add a concept to an existing slice

- **Doing:** adding the `SetupRequirement` and `PracticeProfile` value
  concepts to `packages/law-practice/domain`, per the AGENTS.md Touch table
  ("New slice / concept / role file → `bun run beep architecture`").
- **Evidence:** `bun run beep architecture add concept law-practice
  SetupRequirement --domain-kind values --stage core` exits 1 with
  `Architecture operation would overwrite a differing file:
  packages/law-practice/domain/src/values/index.ts`. Before failing it wrote
  three files that do not belong to a real slice: `domain/AGENTS.md`
  ("Synthetic SetupRequirement aggregate domain models for the architecture
  proof corpus ... PROOF ORACLE"), `domain/LICENSE`, `domain/test/.gitkeep`.
  The `--dry-run` plan shows the concept files carry the proof corpus's
  `WorkPriority` template content and that `values/index.ts` and
  `package.json` exports are write-if-missing, so a successful run would
  still not register the concept.
- **Impact:** the mandated route is unusable outside the proof corpus; the
  partial write leaves misleading files to clean up by hand.
- **Would have prevented it:** plan all writes and fail before writing any;
  for an existing slice, append the concept to `values/index.ts` and the
  package exports instead of treating them as whole-file templates; emit an
  empty concept skeleton rather than proof-corpus content.
- **Workaround used:** removed the stray files and hand-authored the concept
  in the generator's layout (`values/<Concept>/{index.ts,<Concept>.model.ts}`
  plus barrel and export registration).
