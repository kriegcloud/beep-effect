# P0 Orchestrator Prompt — Research Plan Research

## Context

You are starting Phase 0 of the Palantir-light cloud architecture research spec. The objective is to lock requirements, constraints, and decision rubric before execution research begins.

## Mission

Produce complete planning artifacts for P0 using the required schemas and baseline constraints.

## Required outputs

1. `outputs/p0-research-plan/research-plan.md`
2. `outputs/p0-research-plan/capability-requirements-matrix.md`
3. `outputs/p0-research-plan/provider-evaluation-rubric.md`
4. `outputs/p0-research-plan/assumptions-and-constraints.md`
5. `outputs/p0-research-plan/research-backlog.md`
6. `outputs/p0-research-plan/source-map.md`

## Constraints

- Source quality: use primary/internal project context first, then official docs
- Evidence standards: every major decision gate must include evidence expectations
- Must align with defaults: AWS-first hybrid, SOC2 Type II, split-stack IaC, US-only residency
- Use `ResearchQuestion` records in backlog

## Completion checklist

- [ ] All six P0 output files exist and are populated
- [ ] Rubric has explicit weights and rejection gates
- [ ] Backlog includes prioritized `ResearchQuestion` entries
- [ ] Source map links each high-impact question to evidence channels
