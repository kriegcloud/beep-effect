# Adoption And Consumer Integration

## Objective

This design defines how future specs inherit this governance package.

## Consumer Inheritance Model

A consumer spec is required to inherit these surfaces from this package:

- repo-law canon
- agent catalog
- workflow lifecycle
- packet contracts
- verification model
- reusable prompt assets

A consumer spec is required to define only:

- domain scope
- domain source-of-truth inputs
- domain-specific acceptance criteria
- domain-specific wave or slice breakdown
- domain-specific reusable abstractions

## Consumer Prohibitions

A consumer spec is not allowed to:

1. restate generic repo laws as local policy text
2. weaken the exception standard
3. widen the workflow lifecycle
4. remove required adversarial auditors
5. claim decision completeness without the required packet fields

## Bootstrap Workflow

Every new consumer spec is required to follow this order:

1. reference this package in its README or bootstrap prompt
2. identify domain-specific sources and target surfaces
3. emit a domain-specific overlay on top of the generic prompt assets
4. inherit the universal category loop and verification contract
5. keep generic governance text out of local prompts unless the text is consumer-specific

## OpenClaw Mapping

`specs/pending/openclaw-port` is the first intended consumer:

- this package owns the generic validator and implementer posture
- OpenClaw owns the source-module inventory, wave selection, and destination-specific rules
- future OpenClaw prompt simplification is required to point to this package rather than continuing to duplicate governance text

## Adoption Consequence

Future specs are required to be thinner, easier to maintain, and easier to audit because generic governance stays centralized here.
