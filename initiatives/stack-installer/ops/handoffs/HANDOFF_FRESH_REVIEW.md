# Fresh Review Handoff

Status: stub.

## Mission

Review the stack installer packet and current implementation state with fresh
eyes before continuing a later phase. Produce findings first, then recommend
next work.

## Required Startup

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read all existing `../../history/outputs/*.md`.
- Inspect live code only for surfaces claimed by the current phase output.

## Stop Conditions

- Stop if the packet claims implementation that does not exist.
- Stop if credentials or user secrets appear in evidence.
- Stop if a phase is credited without its proof artifacts.
- Stop if app/tooling composition owns contracts that should be slice-owned.

Full prompt to be authored when a fresh review is requested.
