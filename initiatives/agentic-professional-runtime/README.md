# Agentic Professional Runtime

## Status

Active product-definition initiative.

## Mission

Define the local-first agentic professional-services runtime that beep-effect
will prove through two real product slices:

- Agentic Solo Practice Law Firm
- Todox.ai Wealth Management Runtime

The runtime is the center of gravity. The Law Firm and Todox products are the
first two proofs that force the shared kernel, slice topology, local native app,
data model, and agent integration story to become concrete.

## Read This First

### Root

- [SPEC.md](./SPEC.md) - authoritative product and architecture contract
- [PLAN.md](./PLAN.md) - staged rollout and follow-up plan
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing surface
- [history/sources.md](./history/sources.md) - source inventory and authority

### Product Docs

- [docs/product-vision-law-practice.md](./docs/product-vision-law-practice.md)
- [docs/product-vision-todox.md](./docs/product-vision-todox.md)
- [docs/product-feature-map.md](./docs/product-feature-map.md)
- [docs/shared-capabilities.md](./docs/shared-capabilities.md)

### Data And Architecture

- [docs/data-model-shared-core.md](./docs/data-model-shared-core.md)
- [docs/data-model-law-practice.md](./docs/data-model-law-practice.md)
- [docs/data-model-wealth-management.md](./docs/data-model-wealth-management.md)
- [docs/architecture-map.md](./docs/architecture-map.md)

## Product Thesis

Professional services will not be won by one more SaaS wrapper around a model.
The useful product is a local-first runtime that lets a professional bring their
own agent clients, tools, data sources, and model credentials into a governed
workspace where every durable assertion carries evidence, provenance, lifecycle,
and cost.

Law and wealth management are different regulated domains, but they share the
same runtime pressure:

- private client data
- document-heavy knowledge work
- email, calendar, and thread context
- evidence-backed professional judgment
- assistants that can propose work but should not silently become the licensed
  professional
- external systems of record that should be connected, not replaced

## Locked Decisions

- One initiative, two product proofs.
- Native desktop first, using archived Tauri/editor apps as capability
  references only.
- Org-first tenancy: a solo practice is a one-person organization.
- First proof is the runtime data loop, not a standalone installer.
- The authoritative knowledge primitive is claim plus evidence plus provenance.
- Internal Effect/TypeScript SDK first; MCP is an adapter over that contract.
- Agents may read and create candidate writes. Acceptance promotes candidate
  work into authoritative runtime state.
- The runtime owns runtime truth only. Existing CRM, email, calendar, billing,
  custodian, document, and practice-management systems remain external systems
  of record.

## Related Packets

This initiative references existing packets without merging them:

- `initiatives/knowledge-workspace`
- `initiatives/ip-law-knowledge-graph`
- `initiatives/law-kg-prd`
- `initiatives/repo-architecture-automation`

Those packets remain source context and evidence. This packet is the active
authority for the professional runtime product direction.
