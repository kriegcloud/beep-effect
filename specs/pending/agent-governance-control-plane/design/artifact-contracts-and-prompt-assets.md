# Artifact Contracts And Prompt Assets

## Objective

This design defines the reusable artifacts and prompt assets future specs and sessions are required to consume.

## Required Artifact Contracts

### Category Charter

Required fields:

- category name
- category objective
- active phase
- required inputs
- required output
- acceptance criteria
- blocking risks

### Research Dossier

Required fields:

- inspected sources
- repo-reality findings
- reusable precedents
- contradictions discovered
- locked assumptions

### Execution Packet

Required fields:

- confirmed scope
- destination surface
- governing laws
- required reuse targets
- service and layer boundary rules
- state model rules
- HTTP boundary rules
- documentation rules
- required commands
- acceptance criteria
- exception ledger

### Refinement Report

Required fields:

- auditors run
- blockers found
- blockers resolved
- exceptions logged
- remaining risks

### Verification Report

Required fields:

- commands executed
- command outcomes
- manual audits performed
- law coverage summary
- readiness statement

### Reuse Inventory

Required fields:

- candidate reusable abstraction
- owning package or path
- required use decision
- rationale
- disallowed duplicate target

### Dependency Boundary Report

Required fields:

- service contract reviewed
- leaked dependency check result
- layer placement check result
- required boundary changes

### Exception Ledger

Required fields:

- law citation
- scope location
- owner
- rationale
- removal condition
- target closure phase

## Required Prompt Assets

This package is required to ship these reusable prompt assets:

- `VALIDATION_ORCHESTRATOR_PROMPT`
- `IMPLEMENTATION_EXECUTOR_PROMPT`
- `AUDITOR_CATALOG_PROMPT`
- `CATEGORY_WORKFLOW_TEMPLATE`
- `CONSUMER_SPEC_BOOTSTRAP_TEMPLATE`

## Prompt Asset Rule

Prompt assets are required to be generic and reusable. Consumer specs are required to supply domain context and domain-specific acceptance criteria instead of copying and editing the generic governance contract.

## Artifact Consequence

These contracts define the minimum information future sessions are required to exchange. A packet missing any required field is not decision complete.
