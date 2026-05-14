# Handoff V1 Release - Distribution Readiness

Status: stub.

## Mission

Close P5 and the V1 release gate with signed macOS and Windows binaries,
auto-update, opt-in telemetry, crash reporting, feedback, and CI proof.

## Required Startup

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read all prior phase outputs under `../../history/outputs/`.
- Read current Tauri release, signing, and updater implementation notes once
  they exist.

## Stop Conditions

- Stop if either target binary is unsigned.
- Stop if telemetry is enabled by default.
- Stop if crash reporting or feedback is unverified.
- Stop if release evidence omits target CI output.

Full prompt to be authored when P4 closes.
