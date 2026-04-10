# V2T - P3 Execution

## Status

NOT_STARTED

## Execution Objective

Implement the first committed V2T slice in `apps/V2T`, `packages/VT2`, and their supporting seams without widening scope beyond the contracts locked in `RESEARCH.md`, `DESIGN_RESEARCH.md`, and `PLANNING.md`.

## Required Outcomes

- replace the placeholder app shell with the agreed workflow
- persist projects, sessions, transcripts, composition packets, and export artifact records
- extend the existing `@beep/VT2` control plane unless a deliberate migration is explicitly documented
- keep all external providers behind explicit adapters
- reuse shared repo primitives where they already fit
- document every meaningful deviation from `PLANNING.md`

## Execution Rules

- use effect-first and schema-first patterns
- prefer typed errors and explicit service boundaries
- do not let React components own provider-specific logic
- do not invent an app-local server path if the current `packages/VT2` sidecar seam can carry the slice
- stop at the first-slice boundary instead of slipping into speculative polish
- capture command results and touched surfaces in this document as work progresses

## Execution Record Template

### Implemented Surfaces

- pending

### Commands Run

- pending

### Deviations From Plan

- none yet

### Residual Risks

- pending

## Exit Gate

P3 is complete when the committed slice exists in code, targeted verification passes, and this document explains what shipped versus what remains deferred.
