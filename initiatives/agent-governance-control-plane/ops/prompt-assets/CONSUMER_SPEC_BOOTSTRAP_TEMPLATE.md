# Consumer Initiative Bootstrap Template

Use this template when creating a new downstream initiative that depends on the agent governance control plane.

## Required Consumer Fields

- consumer initiative name
- domain objective
- domain source-of-truth inputs
- destination surface
- domain-specific acceptance criteria
- domain-specific wave or slice model

## Inherited Governance

The downstream initiative is required to inherit from `initiatives/agent-governance-control-plane`:

- repo-law canon
- agent catalog
- workflow lifecycle
- packet contracts
- verification contract
- reusable prompt assets

## Consumer Rule

The downstream initiative is not allowed to duplicate generic governance text. The downstream initiative is required to point to this packet and add only domain-specific overlays.
