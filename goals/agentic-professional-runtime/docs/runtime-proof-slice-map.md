# Runtime Proof Slice Map

## Purpose

This document maps the v1 runtime data loop onto the architecture without
scaffolding packages yet. It is role-level topology, not a file tree.

## Slice Ownership In The Proof

### tenancy

Owns:

- organization seed records
- user seed records
- membership and role context
- principal identity for human reviewers
- organization policy scope

The proof uses org-first tenancy for both products. The solo law practice is a
one-person organization.

### workspace

Owns:

- workspace seed records
- thread and turn records
- imported email artifact records
- candidate project and task records
- approval gate records
- work queue projections

`Project`, `Task`, and `ApprovalGate` are shared runtime work concepts.
Vertical slices provide context; they do not own the shared work queue.

### agents

Owns:

- deterministic fixture agent definition
- fixture extraction skill definition
- model/provider binding placeholder
- candidate-write capability contract
- usage attribution inputs

The fixture agent is deterministic. A real LLM adapter is deferred.

### epistemic

Owns:

- candidate claims
- evidence records
- source span references
- activity provenance
- lifecycle state
- usage records
- knowledge graph and context packet projections

Claims remain separate from summaries and read models.

### law-practice

Owns:

- legal client context
- legal contact context
- matter context
- patent asset context

The law fixture links candidate work to an existing matter and patent asset.
It does not implement docketing or filing automation.

### wealth-management

Owns:

- household context
- client context
- party context
- account reference context

The wealth fixture links candidate work to an existing household, client, and
account reference. It does not implement portfolio accounting or custodian
actions.

## Shared-Kernel Candidates

The proof continues to pressure-test these shared concepts:

- organization identity
- principal reference
- source-kind vocabulary
- artifact reference
- evidence reference
- candidate lifecycle vocabulary
- activity actor reference

Promotion into `shared/*` still requires the normal promotion record when code
lands. The docs do not waive that requirement.

## Deferred Topology

P3 should convert this role map into implementation choices:

- exact package names
- required role packages
- public and server subpaths
- test subpaths
- fixture promotion paths
- package-local validation surfaces

Do not scaffold all slice roles just because they appear in this map. Follow the
minimum viable slice rule in `standards/architecture/13-onboarding-the-minimum-viable-slice.md`.
