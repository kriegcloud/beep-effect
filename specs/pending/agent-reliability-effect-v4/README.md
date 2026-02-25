# Agent Reliability Effect v4 (90-Day, Reliability-First)

> Canonical pending spec for improving Codex + Claude reliability on Effect v4 while building durable KG-driven learning loops.

## Quick Navigation

- [Quick Start](./QUICK_START.md)
- [Master Orchestration](./MASTER_ORCHESTRATION.md)
- [Agent Prompts](./AGENT_PROMPTS.md)
- [Rubrics](./RUBRICS.md)
- [Reflection Log](./REFLECTION_LOG.md)

## Purpose

**Problem:** Agent reliability regresses in this repo due to Effect v4 beta drift, stale v3 habits, and context bloat.

**Solution:** Refactor the existing reliability scaffold into a benchmark-gated, Effect-v4-truth-grounded system with adaptive overlays, bounded skills, and a Graphiti closed loop.

**Why it matters:** This keeps delivery velocity high now while building an enduring architecture for long-term agentic development.

## Source-of-Truth Contract

All Effect API and migration decisions in this spec are constrained to local truth sources:

1. `.repos/effect-smol/LLMS.md`
2. `.repos/effect-smol/MIGRATION.md`
3. `specs/completed/effect-v4-knowledge-graph/outputs/p6-verification/report.md`
4. `specs/completed/shared-memories/README.md`

External Effect docs are out of scope for implementation decisions in this spec.

## Success Criteria (Day 90)

1. Mixed-task success rate improves by at least +20pp versus baseline.
2. Wrong Effect v3/v4 API incidents per completed task drop by at least 70%.
3. First-pass `check+lint` pass rate doubles versus baseline.
4. Median token cost per successful task drops by at least 15%.
5. Closed loop exists: run -> failure classification -> Graphiti ingestion -> next-run reuse.

## Scope

In scope:

- Codex + Claude only.
- Mixed tasks across `apps/web`, `tooling/cli`, and `packages/*`.
- Agent config architecture, benchmark harness, KG feedback loop, reliability labs.

Out of scope (first 90 days):

- Cursor/Windsurf parity.
- Full enterprise ontology platformization.
- Universal all-agent abstraction layer.

## Phase Breakdown

| Phase | Window | Focus | Required Outputs |
|---|---|---|---|
| P0 | Days 1-7 | Scaffolding + source contract freeze | `outputs/p0-source-of-truth-contract.md`, `outputs/p0-current-state-audit.md`, `outputs/p0-benchmark-protocol.md` |
| P1 | Days 8-20 | Harness hardening (refactor existing scaffold + typed-error enforcement for `tooling/*/src`) | `outputs/p1-harness-design.md`, `outputs/p1-effect-v4-verification.md` |
| P2 | Days 21-35 | Real benchmark execution layer | `outputs/p2-runner-contract.md`, baseline report artifacts |
| P3 | Days 36-50 | Adaptive overlays + max-3 skill enforcement | `outputs/p3-adaptive-ab-report.md` |
| P4 | Days 51-65 | Effect v4 reliability detector + correction layer | `outputs/p4-effect-v4-detector-report.md`, `benchmarks/agent-reliability/effect-v4-corrections.json` |
| P5 | Days 66-78 | KG closed loop (failure -> memory -> reuse) | `outputs/p5-kg-impact-report.md`, episodes artifacts |
| P6 | Days 79-90 | Console + playbook + promotion lock | `outputs/p6-final-scorecard.md`, `docs/agent-reliability-playbook.md` |

## Locked Benchmark Protocol

1. 18 tasks exactly.
2. 2 agents (`codex`, `claude`).
3. 4 conditions (`current`, `minimal`, `adaptive`, `adaptive_kg`).
4. 2 trials per tuple.
5. 288 total runs.
6. Success requires all acceptance commands pass + zero critical wrong-API incidents + allowlist respected.
7. Promotion requires measurable gain or incident reduction without safety regression.
8. Cost uses committed static USD pricing map.

## Required Interfaces

Preserve existing schemas and add:

- `tooling/agent-eval/src/schemas/AgentRunTranscript.ts`
- `tooling/agent-eval/src/schemas/EffectV4EvidenceFact.ts`
- `tooling/agent-eval/src/schemas/FailureSignature.ts`

Root scripts required:

- `agent:bench`
- `agent:bench:report`
- `agent:bench:compare`
- `agent:bench:ingest`

## Risks and Controls

1. Over-constraint and velocity loss -> adaptive overlays + benchmark gating.
2. Context bloat -> packet caps and max-3 skill policy.
3. False confidence from narrow tasks -> rotate 20% every two weeks.
4. KG noise accumulation -> typed ingestion + weekly dedupe.
5. Harness drift -> pin benchmark windows and compare upgrades in isolation.

## Dependencies

- Existing Graphiti stack and MCP availability.
- Existing effect-v4 KG corpus (`group_id: effect-v4`) and repo memory (`group_id: beep-dev`).
- Local `.repos/effect-smol` archive as Effect API/migration truth.

## Related Specs

- `specs/completed/shared-memories`
- `specs/completed/effect-v4-knowledge-graph`
- `specs/completed/reverse-engineering-palantir-ontology`
