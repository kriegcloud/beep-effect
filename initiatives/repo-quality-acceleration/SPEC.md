# Repo Quality Acceleration Specification

## Status

**Research bootstrap active**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-16
- **Updated:** 2026-05-16

## Mission

Make repository quality feedback faster while preserving the repo's canonical
quality guarantees.

The first optimization target is GitHub pull request feedback wall-clock time.
Local canonical commands remain first-class, but strict parity between CI and
local orchestration is not required. PR lanes may be tiered, scoped, or affected
when the complete quality proof still runs on push-to-main, scheduled runs, or a
clearly named full local command.

## Ownership

Quality acceleration is repo-operational tooling. The owning implementation
surface is `packages/tooling/tool/cli` through `@beep/repo-cli`, plus root
workflow and Turbo configuration when a change belongs at orchestration level.

This initiative must not route repo quality semantics through shared kernel,
foundation, or slice packages. Existing deterministic metadata packets may be
inputs, not owners:

- `initiatives/repo-context-topology`
- `initiatives/repo-codegraph-jsdoc`
- `initiatives/jsdoc-worker-eval`

## Source Baseline

The research phase must measure before ranking fixes.

Required evidence:

- recent GitHub Actions Check workflow run and job timings from `gh run`;
- per-lane setup time, verification time, skipped-lane behavior, and slowest
  current jobs;
- focused local timing probes for suspected slow lanes when they can run without
  forcing a full all-up quality pass;
- current repo-cli, Turbo, docgen, and workflow wiring from source.

The first baseline should avoid a full slow local quality run unless a focused
probe cannot answer the question.

## Quality Semantics

The initiative may propose tiered gates:

- PR checks may use affected package scopes, selective docgen modes, or bounded
  lane subsets when the risk is explicit.
- Push-to-main or scheduled/full gates must preserve the canonical all-up proof.
- Local commands should remain understandable and recoverable; speedups must not
  hide the command that proves the whole repo.
- Docgen warnings and non-fatal example diagnostics still count as quality
  defects when they touch the changed surface.

Any proposed relaxation must name the fallback full proof and the failure mode it
could miss.

## Explorer Tracks

Phase 0 uses five read-only explorer tracks:

1. **CI Timing And Setup Cost** - measure workflow/job/step timing, repeated
   install/cache overhead, and matrix topology costs.
2. **Turbo Cache And Scope** - inspect `turbo.json`, task inputs/outputs,
   remote/local cache behavior, `--affected`, `--summarize`, and task
   concurrency.
3. **Repo-Cli Orchestration** - inspect `@beep/repo-cli` quality commands,
   subprocess sequencing, Effect concurrency opportunities, and failure
   aggregation.
4. **Docgen And Selective Checking** - evaluate package-level docgen, affected
   docgen, quality reports, example typechecking, and symbol-map-backed
   selective checking feasibility.
5. **Quality Safety Semantics** - define which gates can be tiered, which must
   remain all-up, and which proofs are required before implementation.

Each explorer produces an evidence report only. Explorers must not edit source
files or workflow files during Phase 0.

## Concurrency Policy

Do not assume that every independent Effect can run with `concurrency` equal to
the number of effects.

Explorer and implementation recommendations must evaluate bounded, lane-aware
concurrency:

- CPU-bound TypeScript/docgen/check work;
- IO-heavy scans;
- subprocess fan-out;
- Docker or testcontainer-backed lanes;
- Turbo's own task graph and `--concurrency` controls.

The preferred failure model is hybrid aggregation: collect failures from
independent cheap or policy checks, but fail fast when continuing an expensive
dependent lane wastes time or muddies logs.

## Docgen Symbol-Map Track

Symbol-map-backed selective docgen and example typechecking is a research track,
not a v1 implementation commitment.

The feasibility report must define:

- how changed files and changed lines map to exported symbols;
- how dependent examples are found when a symbol changes transitively;
- which symbol-map artifacts are cacheable Turbo outputs or inputs;
- how stale indexes are detected;
- the fallback full package or full repo docgen proof.

The design must treat existing generated catalogs as descriptive metadata unless
a later phase explicitly promotes a new cache/index contract.

## Acceptance Criteria

Phase 0 is complete when:

- the baseline records current CI and focused local timing evidence;
- all five explorer reports exist and cite the repo paths or external primary
  docs they rely on;
- the synthesis ranks candidate interventions by estimated wall-clock impact,
  implementation cost, correctness risk, and verification burden;
- no source or workflow behavior has changed as part of the research phase.

Implementation phases are opened only after Phase 0 identifies a small ranked
set of changes with proof commands and rollback posture.

## External Reference Docs

Use official Turborepo docs as the primary external source for Turbo behavior:

- <https://turborepo.dev/docs/reference/run>
- <https://turborepo.dev/docs/crafting-your-repository/caching>
- <https://turborepo.dev/docs/reference/configuration>
