# Explorations — Agent Guide

You are in the repo's **fuzzy front end**. An *exploration packet*
(`explorations/<slug>/`) is the docs-as-code record of a fuzzy idea being
crystallized into `goals/` packets. It is upstream of implementation: do not
write product code from here, and do not treat anything in this tree as a
spec. `goals/` answers "build this"; this directory answers "help me
crystallize this."

Full convention: [`README.md`](./README.md) (stages, statuses, manifest
schema, graduation contract). Operating procedure: the `/explore` skill
(`../.claude/skills/explore/SKILL.md`). Portfolio map: [`ATLAS.md`](./ATLAS.md)
— read it first in a cold session. Worked example of the whole flow, both
voices: [`EXAMPLE.md`](./EXAMPLE.md).

## Orient in this order

1. `<slug>/ops/manifest.json` — stage, status, `openQuestions` (the resume point).
2. `<slug>/README.md` — "Next Open Question" + Trail.
3. Only the artifacts the current stage needs.

## The state machine

`capture → research → align → shape → decompose → graduate`, loops allowed,
parked/killed exits at any stage.

| Stage | Artifact | Non-negotiable rule |
| --- | --- | --- |
| capture | `CAPTURE.md` | Append-only. Never interrogate, reorganize, or summarize the dump. |
| research | `RESEARCH.md` | Cite every external claim. In-repo inventory via `standards/repo-exports.catalog.md`, targeted code search, and local docs; mark gaps `NOT FOUND`. Maintain `research/SOURCES.md` (provenance ledger); never fabricate a source/URL/license. |
| align | `DECISIONS.md` | One branch-closing question at a time, recommended answer first. Log every resolution; sync manifest `openQuestions`. |
| shape | `BRIEF.md` | Problem, appetite, sketch, rabbit holes, no-gos — fat-marker fidelity, no over-specifying. |
| decompose | `MAP.md` | Every major component cites an existing capability or is explicitly `NET-NEW`. |
| graduate | — | Four-point definition-of-ready in `README.md` must pass; scaffold from `goals/_template`; back-links, not copies. |

## Hard rules

- **Close the loop before ending any session**: update the manifest (`stage`,
  `openQuestions`, `updated`), rewrite the packet README's Next Open Question,
  append a dated Trail line, and sync `ATLAS.md` on any stage/status change.
  Cold-session resume depends on this.
- `ATLAS.md` is navigation, never doctrine — load-bearing prose graduates to
  `docs/product/` or a goal packet.
- Parking and killing are first-class outcomes, not failures. Park with a
  dated reason in `DECISIONS.md`; kill with a one-line epitaph in `ATLAS.md`.
- `INBOX.md` is a triage queue, not a document — one bullet per idea.
