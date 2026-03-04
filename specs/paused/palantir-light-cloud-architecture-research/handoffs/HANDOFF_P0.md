# Handoff P0: Research Plan Research

## Goal

Build complete planning artifacts for cloud/IaC research, including requirements, rubric, assumptions, research questions, and source mapping.

## Deliverables

1. `specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/research-plan.md`
2. `specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/capability-requirements-matrix.md`
3. `specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/provider-evaluation-rubric.md`
4. `specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/assumptions-and-constraints.md`
5. `specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/research-backlog.md`
6. `specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/source-map.md`

## Success criteria checklist

- [ ] Capability requirements are documented with measurable acceptance targets
- [ ] Provider rubric includes weighted criteria and rejection gates
- [ ] Assumptions and constraints are explicit and versioned
- [ ] Research backlog is prioritized and uses `ResearchQuestion` structure
- [ ] Source map links questions to concrete evidence channels

## Blocking issues

- Missing or ambiguous requirements for high-impact capabilities
- Unknown compliance constraints beyond current SOC2 Type II baseline
- Conflicting assumptions between prior specs and current direction

## Constraints

- Keep cloud defaults: AWS-first hybrid, split-stack IaC, US-only residency
- Do not write implementation instructions for app code in P0 artifacts
- Use only artifact paths under `outputs/p0-research-plan/`

## Implementation order

1. Confirm baseline constraints and assumptions
2. Build capability matrix
3. Define scoring rubric with weighting and rejection rules
4. Build research backlog with owners and decision impact
5. Map backlog items to source channels
6. Finalize integrated research plan

## Verification commands

```bash
find specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan -type f | sort

rg -n "ResearchQuestion|decision gate|weighted" \
  specs/pending/palantir-light-cloud-architecture-research/outputs/p0-research-plan/*.md
```

## Known gotchas

1. Backlog questions that are not decision-impactful create noise.
2. Rubric criteria must align with P2 validation scenarios to avoid rework.
3. If assumptions are not versioned, P1 conclusions become hard to audit.
