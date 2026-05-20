# Adoption And Consumer Integration

## Objective

This design defines how future initiatives inherit this governance packet.

## Consumer Inheritance Model

A downstream initiative is required to inherit these surfaces from this packet:

- repo-law canon
- agent catalog
- workflow lifecycle
- packet contracts
- verification model
- reusable prompt assets

A downstream initiative is required to define only:

- domain scope
- domain source-of-truth inputs
- domain-specific acceptance criteria
- domain-specific wave or slice breakdown
- domain-specific reusable abstractions

## Consumer Prohibitions

A downstream initiative is not allowed to:

1. restate generic repo laws as local policy text
2. weaken the exception standard
3. widen the workflow lifecycle
4. remove required adversarial auditors
5. claim decision completeness without the required packet fields

## Bootstrap Workflow

Every new downstream initiative is required to follow this order:

1. reference this packet in its README or bootstrap prompt
2. identify domain-specific sources and target surfaces
3. emit a domain-specific overlay on top of the generic prompt assets
4. inherit the universal category loop and verification contract
5. keep generic governance text out of local prompts unless the text is initiative-specific

## OpenClaw Mapping

Earlier planning targeted an `openclaw-port` consumer, but no checked-in
downstream initiative packet currently exists:

- this packet owns the generic validator and implementer posture
- the next consumer initiative owns its source inventory, slice selection, and destination-specific rules
- new bootstrap prompts are required to point to this packet rather than duplicating governance text

## Adoption Consequence

Future initiatives are required to be thinner, easier to maintain, and easier to audit because generic governance stays centralized here.
