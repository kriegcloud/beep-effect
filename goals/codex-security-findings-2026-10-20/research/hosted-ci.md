# Hosted CI attribution — PR #1930

Initial published head: `6fc9bbcafd6a78aa877e094bb55b7ce5de7acd52`.

## Introduced: Professional Desktop IPC Stdio

[Job 119021316807](https://github.com/beep-effect/beep-effect/actions/runs/39538727453/job/119021316807)
failed compiling the path-patched GLib crate under `build.warnings=deny`.
Cargo caps warnings for registry dependencies; the local source is now checked
under the workspace warning policy. The old upstream source emitted 34 compiler
warnings. Fix the reported source compatibility warnings and reproduce the
exact CI warning policy; do not reduce CI strictness. This repair joins the
Pillow/certifi update wave in the same PR.

## Unrelated source, pending retry: Labs

[Job 119021316965](https://github.com/beep-effect/beep-effect/actions/runs/39538727453/job/119021316965)
finished 56 tasks successfully and failed LeJeune Bundle.test.ts on a
30-second hook timeout. That application source is unchanged by this PR.
The new head will rerun the job; cause and final disposition remain pending.
No timeout threshold is raised and no successful job result is fabricated.

Raw logs are retained under the packet's ignored raw directory. Hosted proof
is distinct from the passing local Rust checks and scoped package results.

The introduced Rust warning failure is repaired in the added-alert wave.
Rust1.99.1 strict professional check/clippy and Semantica check pass; the
optimized iterator suite passes 15 tests under warning denial. Mechanical
compatibility changes are enumerated in the vendor provenance receipt.
Hosted rerun on the new committed head remains required.
