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

Status note (2026-06-11): law is the sole active vertical; wealth-management
is demoted to a dormant proof fixture (see the SPEC status amendment).

Status note (2026-06-18): the law-practice office-action rung-0 loop merged to
`main` in PR #262. It now ingests a synthetic/public office action through
`@beep/file-processing` + `@beep/tika`, maps span-bearing
`GroundedExtraction[]` into law entities, and gates a candidate distinction
through the epistemic public surface. The next law vertical rung is to replace
the fixed candidate set with langextract-service/LLM extraction while
preserving deterministic tests and the privilege wall.

## Read This First

### Root

- [SPEC.md](./SPEC.md) - authoritative product and architecture contract
- [PLAN.md](./PLAN.md) - staged rollout and follow-up plan
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing surface
- [history/sources.md](./history/sources.md) - source inventory and authority

### Product Docs

- [docs/vision-map.html](./docs/vision-map.html) - interactive capability-lane
  vision map (open in a browser)
- [docs/product-vision-law-practice.md](./docs/product-vision-law-practice.md)
- [docs/product-vision-todox.md](./docs/product-vision-todox.md)
- [docs/product-feature-map.md](./docs/product-feature-map.md)
- [docs/shared-capabilities.md](./docs/shared-capabilities.md)

### Runtime Proof

- [docs/runtime-data-loop.md](./docs/runtime-data-loop.md)
- [docs/runtime-fixture-catalog.md](./docs/runtime-fixture-catalog.md)
- [docs/sdk-context-packet-contract.md](./docs/sdk-context-packet-contract.md)
- [docs/approval-and-autonomy-policy.md](./docs/approval-and-autonomy-policy.md)
- [docs/runtime-proof-slice-map.md](./docs/runtime-proof-slice-map.md)
- [docs/p3-slice-implementation.md](./docs/p3-slice-implementation.md)
- [fixtures/runtime-data-loop](./fixtures/runtime-data-loop)

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
- The v1 runtime data loop starts with normalized incoming email fixtures.
- The canonical paired scenarios are Law patent intake and Wealth cash request.
- The authoritative knowledge primitive is claim plus evidence plus provenance.
- Evidence in v1 uses stable source span IDs.
- Internal Effect/TypeScript SDK first; MCP is an adapter over that contract.
- Agents may read and create candidate writes. Acceptance promotes candidate
  work into authoritative runtime state.
- The first proof uses a deterministic fixture agent, not a real LLM dependency.
- P3 promotes the fixture proof into real package topology and an app-level
  contract test harness.
- The v1 approval policy is strict: agent output remains candidate state until
  human review.
- The runtime owns runtime truth only. Existing CRM, email, calendar, billing,
  custodian, document, and practice-management systems remain external systems
  of record.

## Related Packets

This initiative references existing packets without merging them:

- `goals/knowledge-workspace`
- `goals/ip-law-knowledge-graph`
- `goals/canonical-slice-factory`
- `goals/oppold-corpus-pipeline` — salvages and organizes the real practice
  corpus that feeds this runtime's corpus-ingestion lane (added 2026-06-11)

Those packets remain source context and evidence. This packet is the active
authority for the professional runtime product direction.

## Notes

- 2026-06-29: gold-intake research note added at
  research/gold-intake-agent-skills-ethical-wall.md (see for agent Skills,
  cost-tiered tool routing, the not-legal-advice disclaimer gate, and
  ethical-wall `CurrentUser` identity).
