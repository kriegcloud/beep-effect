# JSDoc Quality Enforcement Grill-With-Docs Handoff Prompt

Copy this prompt into a fresh Codex session started in the target clone of the
repo. The clone path may differ from the source clone used to prepare this
handoff.

```text
You are working in a clone of the beep-effect repo. Do not assume a fixed
absolute path; first confirm the repo root with `pwd`, `git rev-parse
--show-toplevel`, and targeted file reads.

Use Plan Mode. This session is for a $grill-with-docs interview and decision
plan only. Do not implement code, do not edit files, do not update docs, and do
not mutate repo-tracked state. If the grill-with-docs skill says to update docs
inline, treat that as a later implementation-session instruction; in this Plan
Mode session, capture the intended doc updates in the final proposed plan
instead.

Use the `grill-with-docs` skill. If the skill is not auto-loaded, read
`.claude/skills/grill-with-docs/SKILL.md` from this clone and follow it:
ask one branch-closing question at a time, provide your recommended answer, and
wait for my answer before continuing. If a question can be answered by reading
the repo, inspect first instead of asking.

## Mission

Begin the `grill-with-docs` decision interview for the
`initiatives/jsdoc-quality-enforcement` initiative. The goal is to reach a
decision-complete implementation plan for improving exported-symbol JSDoc
quality, especially `@example` usefulness, without letting the next implementer
invent policy details.

Do not start implementation. Do not rewrite `.patterns`, skills, `SPEC.md`,
`PLAN.md`, `ops/manifest.json`, tooling code, or generated reports during this
session.

## Grounding Pass Before The First Question

Read these initiative artifacts first:

- `initiatives/jsdoc-quality-enforcement/README.md`
- `initiatives/jsdoc-quality-enforcement/SPEC.md`
- `initiatives/jsdoc-quality-enforcement/PLAN.md`
- `initiatives/jsdoc-quality-enforcement/research/README.md`
- `initiatives/jsdoc-quality-enforcement/research/docgen-tsmorph-quality-gate.md`
- `initiatives/jsdoc-quality-enforcement/research/standards-skills-alignment.md`
- `initiatives/jsdoc-quality-enforcement/research/codex-workflow-and-agentic-workers.md`
- `initiatives/jsdoc-quality-enforcement/research/synthesis-and-recommendations.md`

Then read the doctrine and standards surfaces needed for this initiative:

- `standards/ARCHITECTURE.md`
- `standards/architecture/README.md`
- `standards/architecture/GLOSSARY.md`
- `standards/architecture/DECISIONS.md`
- `standards/architecture/07-non-slice-families.md`
- `.patterns/jsdoc-documentation.md`
- `.claude/skills/jsdoc-annotation-specialist/SKILL.md`
- `.agents/skills/jsdoc-annotation-specialist/SKILL.md`
- `.aiassistant/skills/jsdoc-annotation-specialist/SKILL.md`

Inspect, do not modify, the likely implementation surfaces:

- `packages/tooling/tool/docgen`
- `packages/tooling/tool/cli/src/commands/Docgen`
- `packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts`
- `packages/tooling/library/repo-utils/src/TSMorph`
- root `package.json` scripts related to `docgen`, `docgen:affected`,
  `docs:aggregate`, and `jsdoc:inventory`

Treat architecture docs as target doctrine. If current code differs from
doctrine, classify the difference as current drift, transitional compatibility,
cleanup-on-touch, missing decision, or doctrine gap.

## Current Research Synthesis To Challenge

The prior research recommended this order:

1. Define the quality rubric before building tooling.
2. Keep `@beep/repo-docgen` deterministic: parse, required-doc checks,
   example validation, and markdown generation.
3. Put future orchestration and quality reports in `@beep/repo-cli`.
4. Use `@beep/repo-utils` TSMorph only as source/symbol evidence enrichment.
5. Build a report-only quality-subject handoff before asking a model to score.
6. Add Codex scoring/remediation only as advisory and bounded at first.
7. Defer hard quality gates and local model workers until repo-specific evals
   prove value.

Your job is not to accept that recommendation blindly. Grill it against the
repo doctrine, current tooling shape, and my preferences until we have a plan
that is decision-complete.

## Required Decision Branches

Ask these one at a time, with your recommended answer. Explore the repo before
asking whenever repo facts can answer part of the question.

1. Quality target:
   Should v1 score only `@example` usefulness, or the whole JSDoc block?

2. Universal `@example` requirement:
   Is the current requirement that every exported symbol has `@example`
   non-negotiable, or should v1 introduce explicit exception categories?

3. Rubric shape:
   Should the quality output be a 1-10 score, pass/warn/fail tiers, typed
   finding codes, or a combined schema?

4. Review-subject evidence:
   What fields must every quality subject carry before a model or human can
   judge it? Decide the minimum evidence contract, including parsed examples,
   description, tags, source anchor, signature, declaration kind, package, and
   stable identity/hash.

5. Ownership boundary:
   Which surface owns v1: `@beep/repo-cli` docgen subcommand, inventory tooling,
   `@beep/repo-docgen`, or a separate initiative-only tool? Challenge this
   against `standards/architecture/07-non-slice-families.md`.

6. TSMorph role:
   Should `@beep/repo-utils` TSMorph become a required part of the v1 data flow,
   or only an optional enrichment/cache layer after docgen enumerates subjects?

7. Guidance updates:
   Which guidance surfaces should eventually change: `.patterns`, one or more
   `jsdoc-annotation-specialist` skill copies, `AGENTS.md`, package README
   guidance, or none in v1? In Plan Mode, record intended changes only.

8. Report scope:
   Should v1 run package-local, changed-files-only, affected-packages, or
   repo-wide? Decide the default and the non-default modes.

9. Codex use:
   Should v1 stop at deterministic quality-subject reports, add advisory Codex
   scoring, or include bounded Codex remediation packets?

10. Local model workers:
    Should Qwen/local workers be excluded from v1 entirely, allowed as
    read-only experimental triage, or planned behind a disabled/eval-only mode?

11. Enforcement posture:
    When, if ever, do advisory quality findings become blocking? Decide whether
    v1 is report-only, warning-only, changed-files-blocking, package-opt-in, or
    repo-wide blocking.

12. Acceptance criteria:
    What must the implementer prove before the initiative can move from grill
    decisions to implementation? Include tests/checks, report examples, and
    verification commands.

## Final Output Contract

Do not produce the final plan until the decision tree above has been answered or
explicitly deferred by me. When ready, output exactly one `<proposed_plan>` block
that is decision-complete for the next implementation session.

The final proposed plan must include:

- title
- summary
- implementation changes grouped by subsystem
- public interfaces or report/schema shapes to add or change
- tests and verification commands
- assumptions/defaults
- explicit non-goals for v1
- any intended future doc/skill updates, without performing them in this Plan
  Mode session

Start now with the grounding pass, then ask the first branch-closing question.
```
