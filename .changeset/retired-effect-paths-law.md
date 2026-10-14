---
"@beep/repo-cli": minor
---

Add `beep laws retired-effect-paths`, a law that scans every git-tracked text
file for an Effect module path retired by the upstream top-level module move
and prints the current path for each finding. `--check` fails on any finding
and `--json` emits the schema-shaped summary. The root `lint:retired-effect-paths`
script runs it as a cheap-gates lane and in the medium policy phase.
