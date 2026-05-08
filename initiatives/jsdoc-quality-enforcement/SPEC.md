# JSDoc Quality Enforcement Spec

## Status

Bootstrap

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-08
- **Updated:** 2026-05-08

## Purpose

Create a canonical research packet for improving how this repo enforces and
teaches useful JSDoc on exported symbols.

The motivating problem is that mandatory `@example` tags can satisfy type and
docgen checks while still providing little reader value when examples are only
trivial assignments or `console.log` snippets. This initiative gathers research
on better standards, agent guidance, review loops, and automation paths before
any implementation work is authorized.

## Source Surfaces

Initial research should account for these repo surfaces:

- `.patterns/jsdoc-documentation.md`
- `.agents/skills/jsdoc-annotation-specialist/SKILL.md`
- `.aiassistant/skills/jsdoc-annotation-specialist/SKILL.md`
- `.claude/skills/jsdoc-annotation-specialist/SKILL.md`
- `packages/tooling/tool/docgen`
- `packages/tooling/tool/cli`
- `packages/tooling/library/repo-utils/src/TSMorph`

External or fast-moving references, such as Codex SDK behavior, Codex CLI
features, local model capabilities, and `ts-morph` APIs, must be verified by
the research agent at research time.

## Research Report Contract

Synthesized research reports belong in [research/](./research). Use kebab-case
file names and include:

- the research question
- scope and non-scope
- repo evidence and source anchors
- external evidence, when relevant
- viable options
- tradeoffs and risks
- recommendation
- open questions for a future `grill-with-docs` session

Raw generated outputs, transcripts, or bulky evidence should only be preserved
under [history/outputs/](./history/outputs) when they are useful provenance.

## Initial Research Lanes

- Current JSDoc and docgen enforcement reality.
- Existing pattern and skill guidance quality.
- Agentic scoring and remediation feasibility using docgen analysis, `ts-morph`,
  Codex orchestration, and local model workers.
- Codex workflow surfaces such as review behavior, hooks, rules, skills, and
  `AGENTS.md` guidance.
- Cost, caching, batching, and incremental adoption strategy for repo-wide
  documentation quality review.

## Non-Goals

- Do not implement a documentation scoring or remediation pipeline in this
  packet.
- Do not rewrite the JSDoc standard, skills, or docgen package before the
  research reports are synthesized.
- Do not treat any proposed external tool behavior as current fact without
  verification.

## Acceptance Criteria

- This packet names the initiative purpose and source surfaces.
- Research agents have a clear home for synthesized reports.
- Future implementation work has enough structure to begin with research rather
  than another blank-page prompt.
