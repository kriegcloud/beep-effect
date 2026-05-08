# Synthesis And Recommendations

## Question

What routes are most promising for improving exported-symbol JSDoc quality in
this repo, especially `@example` usefulness, without prematurely implementing a
scoring pipeline or rewriting standards?

Short answer: the strongest route is a staged, deterministic-first quality
program. Improve the guidance rubric first, enrich the existing docgen analysis
handoff so every review subject carries the evidence needed to judge quality,
then add a report-only Codex-assisted review loop in `@beep/repo-cli`. Keep
`@beep/repo-docgen` deterministic. Treat hooks, `/review`, GitHub review, and
local model workers as supporting surfaces, not the core enforcement boundary.

## Scope And Non-Scope

This synthesis reads and combines the three research reports in this folder:

- [docgen-tsmorph-quality-gate.md](./docgen-tsmorph-quality-gate.md)
- [standards-skills-alignment.md](./standards-skills-alignment.md)
- [codex-workflow-and-agentic-workers.md](./codex-workflow-and-agentic-workers.md)

It does not update `SPEC.md`, `PLAN.md`, `ops/manifest.json`, standards, skills,
production code, repo config, or generated docs. It does not run local models,
prototype scripts, smoke tests, or implementation experiments.

## Repo Evidence And Source Anchors

- The initiative is research-first and explicitly withholds approval to build a
  scoring or remediation pipeline yet (`initiatives/jsdoc-quality-enforcement/README.md`,
  `initiatives/jsdoc-quality-enforcement/PLAN.md`).
- The research contract requires synthesized reports in `research/`, with source
  anchors, options, tradeoffs, recommendations, and future `grill-with-docs`
  questions (`initiatives/jsdoc-quality-enforcement/research/README.md`).
- The JSDoc doctrine already says documentation should help humans and agents,
  and tags should add information not recoverable from the TypeScript signature
  (`.patterns/jsdoc-documentation.md:13-23`).
- The same doctrine also requires every export to carry `@example`, `@category`,
  and `@since`, while the minimal example template shows a generic
  `const result = ...` and `console.log(result)` pattern
  (`.patterns/jsdoc-documentation.md:74-117`). That creates a compliance-shaped
  target agents can satisfy without demonstrating useful API behavior.
- The `jsdoc-annotation-specialist` workflow is strong on required tags, TSDoc
  grammar, schema annotations, import aliases, and docgen commands, but it lacks
  a concrete rubric for what a valuable example proves
  (`.claude/skills/jsdoc-annotation-specialist/SKILL.md:22-36`,
  `.claude/skills/jsdoc-annotation-specialist/SKILL.md:310-362`).
- `.agents` and `.claude` share the current specialist skill, while
  `.aiassistant` has category-guidance drift. That drift reinforces the need for
  one synchronized guidance contract before adding stricter enforcement.
- `@beep/repo-docgen` already parses descriptions, examples, categories,
  `@see`, `@since`, and related doc fields, and it validates examples
  deterministically.
- `@beep/repo-cli` already owns `docgen analyze` / `docgen check` orchestration
  and writes `JSDOC_ANALYSIS.md` / `JSDOC_ANALYSIS.json`, but the current
  analysis model records tag presence and deterministic issues, not parsed
  example bodies or enough evidence for quality scoring.
- `@beep/repo-utils` TSMorph provides useful symbol/source evidence, signatures,
  docstrings, hashes, and read-only inspection, but its current outline collector
  is not docgen-equivalent for all export shapes. It should enrich review
  subjects, not silently replace docgen analysis without extension.
- `@beep/repo-cli` already depends on `@openai/codex-sdk`, so Codex orchestration
  is plausible inside tooling when the initiative is ready. The current research
  does not treat that as permission to build it now.

## External Evidence

Current official Codex docs support a layered workflow, not a single magic
switch:

- [Codex CLI](https://developers.openai.com/codex/cli) and
  [non-interactive mode](https://developers.openai.com/codex/noninteractive)
  support repo-local inspection, automation, JSONL event streams, and scripting.
- [`/review`](https://developers.openai.com/codex/cli/slash-commands) is useful
  for behavior-change and missing-test review, but it is not documented as a
  repo-specific JSDoc policy engine.
- [AGENTS.md](https://developers.openai.com/codex/guides/agents-md) is the right
  durable instruction surface, but it has practical size and inheritance limits.
- [Rules](https://developers.openai.com/codex/rules) and
  [hooks](https://developers.openai.com/codex/hooks) can guide or interrupt
  workflows, but hooks are experimental and not a complete enforcement boundary.
- [Skills](https://developers.openai.com/codex/skills) and
  [subagents](https://developers.openai.com/codex/subagents) fit focused
  documentation review workflows, especially for read-only evidence gathering and
  bounded package-level review.
- The [Codex SDK](https://developers.openai.com/codex/sdk) can orchestrate local
  Codex threads and is a better fit than ad hoc shell prompts once a typed
  quality-subject schema exists.
- Qwen's official and Hugging Face materials make local coding workers plausible
  for read-only triage, but not proven for repo-specific JSDoc judgment or tool
  compatibility: [Qwen3-Coder announcement](https://qwenlm.github.io/blog/qwen3-coder/),
  [Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct),
  and [Qwen3-Coder-Next-Base](https://huggingface.co/Qwen/Qwen3-Coder-Next-Base).

## Viable Options

1. Guidance-only tightening.
   Improve `.patterns` and the specialist skills with an explicit example-value
   rubric, bad-example contrast, symbol-kind playbooks, and synchronized
   category guidance. This is the lowest-risk first move and should happen
   before any quality scoring becomes blocking.

2. Deterministic-first quality-subject extraction.
   Extend the `@beep/repo-cli` analysis handoff, or add a sibling quality
   subject model, so every exported-symbol review item carries parsed examples,
   description text, category, remarks, links, source location, signature,
   declaration source, package, and content hash.

3. Report-only Codex quality scoring.
   After deterministic docgen findings are clean, run a second-stage review that
   emits scores, rationales, evidence anchors, and advisory findings. Keep it
   report-only until the rubric has been tested against real packages.

4. Codex-assisted remediation.
   Once the subject schema and rubric are stable, let `@beep/repo-cli` use
   `codex exec --json` or `@openai/codex-sdk` for bounded package/file/export
   batches. Deterministic docgen and inventory commands still prove the result.

5. Workflow guardrails.
   Use `AGENTS.md`, focused skills, hooks, rules, `/review`, GitHub review, and
   subagents to make the workflow easier to follow. These improve alignment but
   should not be treated as the compliance source of truth.

6. Local model workers.
   Keep Qwen or other local coding models as a later research/eval lane. The
   first defensible experiment would be read-only triage against existing
   inventory rows, compared against deterministic findings and human-reviewed
   Codex output.

## Tradeoffs And Risks

- Current `docgen analyze` output is excellent for deterministic findings but
  too thin for qualitative scoring until it exposes parsed example bodies and
  complete clean review subjects.
- If `@beep/repo-docgen`, direct CLI ts-morph analysis, and `@beep/repo-utils`
  TSMorph each grow separate subject models, drift is likely.
- A numeric score can create false confidence unless it is paired with a rubric
  version, rationale, source anchors, and typed advisory findings.
- Hard-gating too early will teach agents to optimize for the score instead of
  helping readers.
- `/review`, GitHub review, hooks, and rules are useful support surfaces, but
  their official docs do not support treating them as deterministic policy
  enforcement.
- Local model workers introduce quality, provider, tool-call, latency, hardware,
  and data-handling unknowns. They should not enter the required path before a
  repo-specific eval exists.
- Guidance changes that only add more required text could make docs noisier. The
  rubric must reward examples that prove real usage scenarios, failure modes,
  invariants, resource requirements, or integration boundaries.

## Recommendation

Proceed in this order after a future `grill-with-docs` decision session:

1. Define the rubric before building tooling.
   Decide whether the first score judges only `@example` usefulness or the whole
   JSDoc block. Add bad-example contrast and "what this example proves" guidance
   later, after the research packet is accepted.

2. Keep package ownership clean.
   `@beep/repo-docgen` should remain deterministic: parse, check required docs,
   type-check/run examples, and generate docs. `@beep/repo-cli` should own
   orchestration, package discovery, report writing, Codex handoff, and any
   future quality command. `@beep/repo-utils` TSMorph should enrich subjects with
   stable symbol/source evidence.

3. Build a report-only quality-subject handoff before any model scoring.
   The next implementation should be able to enumerate all intended review
   subjects and show their parsed examples, docs, signatures, categories, and
   anchors without asking a model to judge anything yet.

4. Add Codex scoring only as advisory at first.
   Use a structured quality report with rubric version, score, rationale,
   finding codes, and open questions. Run it only after deterministic docgen is
   clean.

5. Let Codex assist remediation in bounded batches.
   Once the advisory reports are useful, route small work packets to Codex and
   require deterministic verification afterward.

6. Defer local model workers and hard quality gates.
   Local models are promising for cheap triage but should remain optional and
   read-only until measured. Hard gates should wait until the rubric has survived
   real package review and false-positive analysis.

Most promising route: guidance rubric plus deterministic quality-subject
extraction, followed by report-only Codex review in `@beep/repo-cli`.

Least promising route: trying to customize `/review`, hooks, or local model
workers into the primary enforcement boundary. They can help, but they cannot
replace repo-native deterministic analysis and explicit evidence.

## Open Questions For Future Grill-With-Docs

Ask these one at a time, stopping after each answer to update the decision tree:

1. Should the first quality score judge only `@example` usefulness, or the whole
   JSDoc block?
2. Are there export kinds that should be exempt from required `@example`, or is
   the current universal requirement non-negotiable?
3. What must every review subject carry before a model is allowed to judge it?
4. Should quality findings start as package-local reports, changed-files reports,
   or repo-wide reports?
5. What score shape is useful: numeric score, pass/warn/fail tiers, typed
   finding codes, or a combined schema?
6. Which command surface owns the first implementation: a new `docgen` subcommand
   in `@beep/repo-cli`, an inventory extension, or a separate research-only
   command?
7. When, if ever, should advisory quality findings become blocking?
8. Should local model workers be evaluated at all before the Codex-only workflow
   proves useful?
