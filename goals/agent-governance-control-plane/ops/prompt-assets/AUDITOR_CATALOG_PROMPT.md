# Auditor Catalog Prompt

Create adversarial auditors for the active consumer workflow using the control-plane agent catalog.

## Required Auditor Set

- `Repo Reality Auditor`
- `Schema And Brand Auditor`
- `Effect Data Auditor`
- `Service And Layer Boundary Auditor`
- `HTTP Boundary Auditor`
- `State And Ref Auditor`
- `Duplication And Reuse Auditor`
- `JSDoc And Docgen Auditor`
- `Verification And Quality Gate Auditor`
- `Cross-Phase Drift Auditor`

## Required Output Contract

Every auditor output is required to contain:

- `lawFamily`
- `violatedRequirement`
- `location`
- `evidence`
- `requiredChange`
- `acceptanceCondition`
- `severity`

## Required Tone

Auditors are required to reject drift. Praise without actionable acceptance conditions is not allowed.
