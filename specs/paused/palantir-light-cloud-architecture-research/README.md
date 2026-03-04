# Palantir-Light Cloud Architecture Research

> Objective: Produce a decision-complete AWS-first cloud and IaC architecture specification for a Palantir-light platform, with evidence-backed research artifacts and validation outputs.

## Quick Navigation

- [Quick Start](./QUICK_START.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Handoff P0 — Research Plan Research](./handoffs/HANDOFF_P0.md)
- [Handoff P1 — Execute Research Plan](./handoffs/HANDOFF_P1.md)
- [Handoff P2 — Review & Validate Results](./handoffs/HANDOFF_P2.md)
- [P0 Orchestrator Prompt](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [P1 Orchestrator Prompt](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [P2 Orchestrator Prompt](./handoffs/P2_ORCHESTRATOR_PROMPT.md)
- [Outputs Manifest](./outputs/manifest.json)

## Purpose

**Problem:** The current app and infrastructure are explicitly throwaway for long-term architecture decisions. We need a canonical, auditable research process to choose the right cloud provider strategy, IaC operating model, and production-grade control plane for capabilities including Effect v4 RPC/HTTP/MCP services, provenance and auditing, ontology-driven ABAC, local-first collaboration, durable agent workflows, and enterprise observability/security.

**Solution:** Create a structured research spec with a strict three-stage artifact pipeline:

1. Research plan research
2. Execute research plan and persist evidence artifacts
3. Review and validate findings with go/no-go readiness criteria

**Why now:** Architecture choices at this stage determine delivery speed, compliance trajectory, operational burden, and migration risk for all subsequent implementation phases.

## Scope and Non-Goals

**In scope:**

- Cloud and IaC strategy definition (AWS-first hybrid, split-stack IaC)
- Provider/risk/cost/compliance research with cited evidence
- Policy, provenance, runtime, observability, and collaboration architecture research
- Validation workflow that explicitly checks architecture claims

**Out of scope:**

- Implementing production infrastructure in this spec
- Editing `apps/web` product code
- Final production runbooks for operations teams
- Vendor contract/procurement execution

## Baseline Constraints

- Cloud strategy: AWS-first hybrid
- Compliance target: SOC2 Type II path
- IaC operating model: split-stack (SST + Terraform/OpenTofu)
- Production stance: converge mostly to AWS-managed services
- Residency: US-only for sensitive data initially
- Existing Palantir ontology reverse-engineering outputs are primary research inputs, not implementation truth

## Architecture Decision Records

| ID | Decision | Rationale |
|---|---|---|
| ADR-001 | Use an explicit three-phase research pipeline (P0/P1/P2) | Enforces traceability from assumptions to final recommendation |
| ADR-002 | Keep all plan/research/validation artifacts under `outputs/` | Enables deterministic auditability and easier status tracking |
| ADR-003 | Treat completed Palantir ontology spec as primary blueprint input | Preserves already extracted domain and control-plane knowledge |
| ADR-004 | Adopt AWS-first hybrid baseline | Aligns with compliance/control requirements and operational consistency |
| ADR-005 | Use split-stack IaC model | SST remains productive for app-layer orchestration while Terraform/OpenTofu covers provider gaps |
| ADR-006 | Require source-backed evidence for all major decisions | Prevents architecture drift based on assumptions or stale memory |
| ADR-007 | Include graph-derived fact extraction in P1 artifacts | Captures runtime/control-plane findings from existing knowledge graph |
| ADR-008 | Validate architecture claims in a dedicated P2 stage before implementation | Avoids premature build-out on unvalidated assumptions |
| ADR-009 | Enforce explicit policy/provenance/audit scenarios in validation | Keeps governance and compliance requirements first-class |
| ADR-010 | Maintain manifest-driven output indexing | Guarantees reproducible navigation and phase completeness checks |

## Data/Artifact Schemas

All phases must use the following artifact interfaces.

```ts
type ResearchQuestion = {
  id: string
  question: string
  importance: "high" | "medium" | "low"
  owner: string
  status: "planned" | "in-progress" | "answered" | "deferred"
  decisionImpact: "high" | "medium" | "low"
}

type ProviderScorecard = {
  provider: string
  criterionScores: Record<string, number>
  weightedScore: number
  evidenceRefs: Array<string>
  decision: "accept" | "reject" | "conditional"
}

type ControlMappingEntry = {
  controlId: string
  requirement: string
  architectureComponent: string
  evidenceRef: string
  gap: "none" | "minor" | "material"
}

type ValidationCheck = {
  id: string
  scenario: string
  expected: string
  evidenceRef: string
  result: "pass" | "fail" | "partial" | "pending"
  notes: string
}

type RiskEntry = {
  id: string
  risk: string
  severity: "critical" | "high" | "medium" | "low"
  likelihood: "high" | "medium" | "low"
  mitigation: string
  owner: string
  status: "open" | "mitigating" | "closed"
}

type ManifestPhase = {
  status: "not-started" | "scaffolded" | "in-progress" | "complete"
  outputs: Record<string, string>
  stats: Record<string, unknown>
  lastUpdated: string
}
```

## Output Directory Structure

```text
outputs/
  manifest.json
  p0-research-plan/
    research-plan.md
    capability-requirements-matrix.md
    provider-evaluation-rubric.md
    assumptions-and-constraints.md
    research-backlog.md
    source-map.md
  p1-research-execution/
    provider-shortlist-analysis.md
    aws-first-reference-architecture.md
    iac-operating-model.md
    policy-plane-design.md
    provenance-audit-architecture.md
    runtime-workflow-architecture.md
    local-first-collaboration-architecture.md
    observability-and-sre-architecture.md
    compliance-control-mapping.md
    cost-and-capacity-model.md
    graphiti-fact-extracts.md
    source-citations.md
  p2-validation/
    validation-plan.md
    validation-results.md
    gap-analysis.md
    risk-register.md
    final-recommendation.md
    implementation-readiness-checklist.md
```

## Success Criteria

- [ ] Canonical spec scaffold exists at `specs/pending/palantir-light-cloud-architecture-research`
- [ ] `README.md` contains all required sections in required order
- [ ] All required handoff and orchestrator prompt files exist
- [ ] P0 output artifacts are fully populated from current planning context
- [ ] P1 and P2 output artifacts are seeded with structured headings and evidence placeholders
- [ ] `outputs/manifest.json` enumerates every output file and phase status
- [ ] P2 validation plan includes all required architecture validation scenarios

## Phase Breakdown

| Phase | Focus | Outputs | Agent(s) | Sessions |
|---|---|---|---|---|
| P0 | Research Plan Research | Requirements, rubric, assumptions, backlog, source map | 1 | 1 |
| P1 | Execute Research Plan | Provider, architecture, policy, provenance, runtime, SRE, compliance, cost artifacts | 1-3 | 1-3 |
| P2 | Review & Validate Results | Validation plan/results, gap analysis, risks, recommendation, readiness checklist | 1 | 1 |

## Phase Exit Criteria

| Phase | Done When |
|---|---|
| P0 | Research plan outputs are complete, decision gates are explicit, and backlog is prioritized |
| P1 | All research execution artifacts contain source-backed analysis and evidence references |
| P2 | Validation scenarios are evaluated, recommendation is stated, and readiness checklist is complete |

## Complexity Assessment

```text
Phases:       3  x2  = 6
Agents:       2  x3  = 6
CrossPkg:     1  x0.5= 0.5
ExtDeps:      4  x3  = 12   (AWS services, SST, Terraform/OpenTofu, external provider docs)
Uncertainty:  3  x5  = 15   (provider tradeoffs, compliance mapping, runtime architecture)
Research:     3  x2  = 6
                      ----
Total:              45.5 -> Medium/High
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Research artifacts drift from baseline constraints | High | Medium | Enforce P0 assumptions document and phase gate checks |
| Provider recommendations lack evidence quality | High | Medium | Require evidence refs in every scorecard and decision section |
| Policy/provenance design under-specified | Critical | Medium | Dedicated policy/provenance architecture artifacts + P2 validation scenarios |
| Over-indexing on one platform without rubric discipline | Medium | Medium | Weighted rubric with rejection gates |
| Manifest drift (missing outputs) | Medium | Medium | Post-setup verification and manifest completeness check |
| Temporal staleness of provider details | Medium | High | Require fresh source checks during P1 execution |

## Dependencies

### System

- Bun (for repo tooling)
- Node.js runtime
- `jq`, `rg`, standard shell tools

### Research Inputs

- Completed Palantir ontology spec outputs
- Current SST, cloud provider, and Effect v4 architecture references
- Graphiti memory graph (`palantir-ontology`) for supplemental runtime/control facts

### External

- Official provider documentation (AWS, SST, Terraform/OpenTofu, selected managed services)
- Compliance references for SOC2 control mapping

## Verification Commands

```bash
find specs/pending/palantir-light-cloud-architecture-research -type f | sort

test -f specs/pending/palantir-light-cloud-architecture-research/outputs/manifest.json && echo OK

jq '.phases' specs/pending/palantir-light-cloud-architecture-research/outputs/manifest.json

rg -n "Success Criteria|Phase Breakdown|Phase Exit Criteria|Risk Assessment|Dependencies" \
  specs/pending/palantir-light-cloud-architecture-research/README.md

rg -n "Deliverables|Success criteria|Verification commands" \
  specs/pending/palantir-light-cloud-architecture-research/handoffs/HANDOFF_P*.md
```

## Key Files

| Path | Purpose |
|---|---|
| `README.md` | Canonical spec definition and phase model |
| `QUICK_START.md` | Fast orientation and phase handoff entry points |
| `REFLECTION_LOG.md` | Rolling insights and corrections during execution |
| `handoffs/HANDOFF_P0.md` | P0 execution details and checkpoints |
| `handoffs/HANDOFF_P1.md` | P1 execution details and checkpoints |
| `handoffs/HANDOFF_P2.md` | P2 validation details and checkpoints |
| `outputs/manifest.json` | Complete output index and phase status |

## Related Specs

- [Reverse Engineering the Palantir Ontology](/home/elpresidank/YeeBois/projects/beep-effect/specs/completed/reverse-engineering-palantir-ontology/README.md)
- [SST Infrastructure for Knowledge Graph Explorer](/home/elpresidank/YeeBois/projects/beep-effect/specs/pending/sst-infrastructure/README.md)
- [Effect v4 Knowledge Graph Explorer](/home/elpresidank/YeeBois/projects/beep-effect/specs/pending/claude-effect-v4-knowledge-graph-app/README.md)
