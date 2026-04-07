# Handoff P0 — Planning And Document Classification

## Goal

Lock the execution contract before destructive cleanup begins.

## Required Inputs

- `../README.md`
- `../QUICK_START.md`
- `../outputs/manifest.json`
- `../outputs/cleanup-checklist.md`
- `../outputs/grill-log.md`
- `../outputs/codex-plan-mode-prompt.md`
- `../../../../AGENTS.md`
- `../../../../package.json`
- repo files needed to resolve grilling questions with evidence

## Required Output

- `../outputs/p0-planning-and-document-classification.md`

## Required Decisions

- phase boundaries
- document-preservation policy
- verification command matrix
- phase-status and manifest-update rules
- verification contract
- commit cadence
- deletion approval policy

## Exit Gate

P0 closes only when the grilling transcript, preservation policy, and execution contract are explicit enough that P1 can proceed without local invention.
