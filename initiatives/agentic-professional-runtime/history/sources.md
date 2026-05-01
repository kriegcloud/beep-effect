# Source Inventory

## Purpose

This file records source material used to create the Agentic Professional
Runtime initiative. It is evidence, not the authoritative contract. When this
file conflicts with `SPEC.md`, the spec wins.

## Repo Sources

| Source | Role |
|---|---|
| `standards/ARCHITECTURE.md` | Binding topology, dependency, shared-kernel, and slice rules. |
| `standards/architecture/02-shared-kernel.md` | Shared-kernel promotion rules and non-goals. |
| `standards/architecture/10-cross-slice-coordination.md` | Cross-slice event and process ownership rules. |
| `standards/architecture/12-observability.md` | Span, logging, and usage-boundary guidance. |
| `standards/architecture/13-onboarding-the-minimum-viable-slice.md` | Minimum legal slice shape. |
| `initiatives/repo-architecture-automation` | Lean-slate posture, archive branch, fixture-first topology proof. |
| `initiatives/knowledge-workspace` | Prior event-sourced workspace and graph design context; marked as needing refresh. |
| `initiatives/ip-law-knowledge-graph` | IP law ontology and graph grounding reference. |
| `initiatives/law-kg-prd` | Earlier lawyer-facing product seed. |

## Archived Branch Sources

| Source | Role |
|---|---|
| `archive/pre-repo-architecture-automation-2026-04-27:apps/desktop` | Tauri/native desktop sidecar reference. |
| `archive/pre-repo-architecture-automation-2026-04-27:apps/editor-app` | Local-first editor workspace shell reference. |
| `archive/pre-repo-architecture-automation-2026-04-27:packages/editor` | Editor domain/client/runtime reference. |
| `archive/pre-repo-architecture-automation-2026-04-27:packages/runtime` | Sidecar/runtime protocol reference. |
| `archive/pre-repo-architecture-automation-2026-04-27:packages/repo-memory` | Prior local memory runtime and retrieval packet reference. |

Archived sources are capability references only. They are not active topology.

## Notion Sources

These pages were fetched through the Notion connector during planning:

| Page | Role |
|---|---|
| `Zock's Takedown` | Todox competitive positioning and evidence-first memory thesis. |
| `Mariner AI Strategy - Talking Points - TODOX Proposal - Tia & Ben Apr 2026` | Todox rollout, adoption, pricing, and BYO software positioning. |
| `Todox.ai V2` | Concise product thesis for BYOS wealth-management runtime. |
| `Sample tasks/questions that AI should be able to answer and/or execute on` | Seed wealth workflow examples. |
| `Todox Data Model v2` | Source material for shared-core and wealth overlay data model synthesis. |

The repo docs synthesize these pages rather than copying them wholesale.

## User Decisions From Grill Session

- One program, two product proofs.
- Professional runtime as the product spine.
- Organization-first tenancy.
- Runtime data loop first.
- Synthetic fixtures in repo.
- Claim plus evidence as authoritative memory primitive.
- Four runtime slices plus two vertical slices.
- Internal architecture/product docs first.
- Initiative name: `agentic-professional-runtime`.
- Shared core data model plus vertical overlays.
- Local SDK first; MCP later as adapter.
- Agents get read plus candidate-write authority.
- Runtime truth only, not replacement for existing apps.
- Asymmetric product depth: Todox deeper initially, Law v0 overlay.
- Admin autonomy allowed first; professional advice remains candidate output.
- Email/calendar/docs first; phone later.
- Project plus Task plus ApprovalGate for v1 work.
- Activity plus current views for persistence truth.
- Reference older packets, do not merge them.
- Full initiative packet ceremony.
- Named slice topology, not generator-ready scaffold.
- Slice names: `tenancy`, `workspace`, `agent-capability`, `epistemic`,
  `law-practice`, `wealth-management`.
- Law focus: IP solo practice operations.
- Wealth focus: advisor runtime.
- Native desktop first.
- Archived apps are capability references only.
- First-run onboarding belongs in the native app.
- Platform targets: macOS and Windows product, Linux development/operator.
- Claude Desktop and OpenClaw first external clients.
- BYO user model credentials with organization policy.
- Local-first v1, sync later.
- Storage-neutral docs with PGlite/Postgres-compatible Drizzle likely first.
- Usage records first, dashboards later.
- Law ontology practical-first reference posture.
- Todox Notion model synthesized into repo docs.
