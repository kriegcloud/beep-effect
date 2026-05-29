---
---

Migrate all hand-wired schema annotations from `S.annotate($I.annote(...))` (and the
direct `schema.annotate($I.annote(...))` method form) to `$I.annoteSchema(...)` across
the repo, and correct the standards/skill docs that taught the old pattern. Internal
refactor only — no public API or release impact.
