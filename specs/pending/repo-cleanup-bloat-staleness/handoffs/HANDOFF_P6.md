# Handoff P6 — Reuse-Discovery Design And Contract

## Goal

Extend this cleanup spec with a durable, reusable methodology for finding duplicate code and high-confidence reuse opportunities without immediately turning the phase into an autonomous repo-wide rewrite loop.

## Required Inputs

- `../README.md`
- `../outputs/manifest.json`
- `../outputs/cleanup-checklist.md`
- `../outputs/p5-final-closeout.md`
- the approved P6/P7 extension plan captured in the current session

## Required Output

- `../outputs/p6-reuse-discovery-design-and-contract.md`

## Required Decisions

- whether the extension stays inside this spec package or forks into a new spec
- the exact `beep reuse` command surface and JSON contract
- the partitioning model for future subagent orchestration
- the first-pass catalog strategy for existing reuse candidates
- whether embeddings or RAG are required now or deferred behind a seam
- whether Codex SDK integration is full-loop execution or smoke-only in v1

## Required Command Set

- targeted repo inspection commands as needed
- no destructive cleanup commands are required in P6

## Exit Gate

P6 closes only when the methodology, command contracts, partition model, and implementation boundaries are explicit enough for P7 to execute without inventing policy mid-stream.
