# Handoff P4 — Enforcement And Verification Contract

## Goal

Define the law-to-command and law-to-auditor enforcement model.

## Required Inputs

- `../outputs/p0-foundation-and-law-canon.md`
- `../outputs/p1-agent-topology-and-role-contracts.md`
- `../outputs/p2-workflow-lifecycle-and-phase-gates.md`
- `../outputs/p3-artifact-contracts-and-prompt-assets.md`
- `../../../package.json`

## Required Output

- `../outputs/p4-enforcement-and-verification-contract.md`

## Required Decisions

- universal verification surfaces
- law coverage matrix
- failure classification model
- closure rules for new and pre-existing failures

## Exit Gate

P4 closes only when every law family maps to at least one command or explicit manual auditor review.
