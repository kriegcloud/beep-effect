# Consumer Spec Bootstrap Template

Use this template when creating a new consumer spec that depends on the agent governance control plane.

## Required Consumer Fields

- consumer spec name
- domain objective
- domain source-of-truth inputs
- destination surface
- domain-specific acceptance criteria
- domain-specific wave or slice model

## Inherited Governance

The consumer spec is required to inherit from `specs/pending/agent-governance-control-plane`:

- repo-law canon
- agent catalog
- workflow lifecycle
- packet contracts
- verification contract
- reusable prompt assets

## Consumer Rule

The consumer spec is not allowed to duplicate generic governance text. The consumer spec is required to point to this package and add only domain-specific overlays.
