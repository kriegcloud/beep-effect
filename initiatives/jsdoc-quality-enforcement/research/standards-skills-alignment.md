# Standards Skills Alignment

## Question

Why can the current `.patterns/jsdoc-documentation.md` standard and
`jsdoc-annotation-specialist` skills still lead agents to produce low-value but
technically compliant JSDoc examples, and which guidance-surface improvements
are viable later without changing standards or implementation in this research
lane?

## Scope

This report reviews the repo-local JSDoc guidance surfaces only:

- `.patterns/jsdoc-documentation.md`
- `.agents/skills/jsdoc-annotation-specialist/SKILL.md`, which resolves through
  `.agents/skills -> ../.claude/skills`
- `.claude/skills/jsdoc-annotation-specialist/SKILL.md`
- `.aiassistant/skills/jsdoc-annotation-specialist/SKILL.md`
- Current repo examples sampled only to demonstrate the gap

No standards, skills, manifests, production code, or initiative planning files
were changed. This report treats "compliant" as satisfying the current
structure/grammar/compilation-oriented guidance, not as proof that an example is
decision-useful to a human or agent.

## Repo Evidence

The initiative explicitly wants synthesized, decision-oriented research reports
with source links, not implementation changes
(`initiatives/jsdoc-quality-enforcement/research/README.md:28-34`). The
initiative overview frames the work as research-first around useful JSDoc and
meaningful `@example` tags, and says not to treat the packet as approval to
build a scoring or remediation pipeline yet
(`initiatives/jsdoc-quality-enforcement/README.md:9-15`).

The primary standard already states the right intent: tags should earn their
place only when they encode information that a human or agent cannot recover
from the TypeScript signature alone
(`.patterns/jsdoc-documentation.md:13-23`). It also requires examples to compile,
forbids unsafe example patterns, and forbids removing examples to silence
docgen (`.patterns/jsdoc-documentation.md:27-34`). The problem is that these are
mostly floor checks. An example can import the right modules, call the exported
symbol, avoid `any`, and compile while still teaching almost nothing about
when, why, or how to use the API.

The required-tag rule makes every export carry `@example`, `@category`, and
`@since` (`.patterns/jsdoc-documentation.md:74-81`). The minimal template then
shows a generic "call the function, store `result`, log it" pattern
(`.patterns/jsdoc-documentation.md:96-117`). That is useful as syntax scaffolding
but also easy for agents to copy as the entire quality target. The skill repeats
the same minimum block shape, including a placeholder
`const result = MyModule.myFunction(args)`
(`.agents/skills/jsdoc-annotation-specialist/SKILL.md:38-57`).

The higher-value guidance exists but is softer. Conditional tags are supposed to
appear only when they add information beyond the signature
(`.patterns/jsdoc-documentation.md:83-95`), and the high-value reference calls
out `@remarks` for semantics, invariants, gotchas, and ordering guarantees
(`.patterns/jsdoc-documentation.md:150-159`). The custom `@effects` guidance is
especially strong because it explains that `Effect<A, E, R>` does not say what
gets written, published, or invalidated
(`.patterns/jsdoc-documentation.md:252-263`). However, the enforceable workflow
in the skill emphasizes finding exports, verifying required tags, grammar,
schema annotations, and `bun run docgen`
(`.agents/skills/jsdoc-annotation-specialist/SKILL.md:22-36`). It does not give
agents a concrete "example value" rubric beyond avoiding empty or unsafe
snippets.

The specialist checklist catches missing examples, missing categories, bad
aliases, empty `Effect.gen` bodies, forbidden patterns, and docgen failures
(`.claude/skills/jsdoc-annotation-specialist/SKILL.md:310-362`). It also says
prose-padding `@param` and `@returns` is a bug
(`.claude/skills/jsdoc-annotation-specialist/SKILL.md:91-106`). But it does not
ask the agent to classify what the example is proving: happy path, failure path,
edge case, resource provision, data-first/data-last use, schema decode/encode
round trip, side effect boundary, migration path, or domain invariant.

The agent-context guidance creates a second gap. When generating call sites, the
skill says to lift the TS signature, `@deprecated`, `@effects`,
`@precondition`, `@invariant`, `@throws`, and `@remarks`, but explicitly skips
`@example` (`.claude/skills/jsdoc-annotation-specialist/SKILL.md:263-285`). That
is sensible for avoiding copy-paste examples in generated code, but it also
means examples can become a docgen compliance artifact instead of agent-facing
decision support unless the surrounding guidance makes their purpose explicit.

There is also guidance-surface drift. `.agents/skills` resolves to the current
`.claude/skills` copy, whose category guidance points at canonical kebab-case
slugs and the code source of truth
(`.claude/skills/jsdoc-annotation-specialist/SKILL.md:193-223`). The
`.aiassistant` copy still says "lowercase" and lists older values such as
`error handling` and `resource management` with spaces
(`.aiassistant/skills/jsdoc-annotation-specialist/SKILL.md:193-223`). That drift
is category-focused, but it matters here because agents reading different
surfaces learn that compliance is a checklist of surface forms, not a single
standard of documentation value.

Current repo examples show the gap. `resetAllowlistCache` documents useful
context in prose by saying the snapshot-backed runtime has no mutable cache, but
the example only imports and calls the no-op
(`packages/tooling/policy-pack/repo-configs/src/eslint/EffectLawsAllowlist.ts:41-55`).
`getAllowlistDiagnostics` stores diagnostics and immediately `void`s them
(`packages/tooling/policy-pack/repo-configs/src/eslint/EffectLawsAllowlist.ts:57-70`).
Both examples satisfy the mechanical shape but do not show when diagnostics
matter, what a non-empty diagnostic looks like, or how a caller should branch on
it.

The hotspot predicates show a similar pattern: examples call a single known
matching path and then `void` the boolean
(`packages/tooling/policy-pack/repo-configs/src/eslint/NoNativeRuntimeHotspots.ts:62-94`).
They do not show the false path, normalization expectations, or the practical
difference between exact-file allowlist matching and regex hotspot matching. The
docs around the constants contain useful initiative context
(`packages/tooling/policy-pack/repo-configs/src/eslint/NoNativeRuntimeHotspots.ts:10-24`),
but the examples themselves are still mostly "the symbol can be called."

Type aliases expose a different pressure. The standard says every export needs
an example (`.patterns/jsdoc-documentation.md:74-81`), while the type-alias
convention shows `{@link}` and `{@inheritDoc}` without an example
(`.patterns/jsdoc-documentation.md:225-245`). In current code, the
`EffectSchema` type alias satisfies the required example by assigning an
`Effect.succeed("done")` value and then `void`ing it
(`packages/foundation/modeling/schema/src/EffectSchema.ts:82-98`). This is
technically plausible but low-value: the alias example does not add much beyond
the inherited schema docs or the type annotation itself.

Finally, the parser configuration is permissive in places where the standards
are stricter. `tsdoc.json` still registers and supports `@module` and
`@template` (`tsdoc.json:6-7`, `tsdoc.json:64-65`) even though the standard and
skills tell agents to replace them with `@packageDocumentation` and
`@typeParam` (`.patterns/jsdoc-documentation.md:41-51`,
`.claude/skills/jsdoc-annotation-specialist/SKILL.md:76-89`). This is not
directly an example-quality problem, but it reinforces that tooling acceptance
and guidance intent are not identical.

## External Evidence

TSDoc defines `@example` as a block that should illustrate how to use the API and
allows a title on the same line as the tag. Its richer example includes separate
input, usage, and result sections, which is a useful model for examples that
teach a scenario rather than merely call a symbol:
<https://tsdoc.org/pages/tags/example/>.

TypeDoc's `@example` documentation is intentionally syntactic: the tag marks the
following text as an example of how to use the function, and TypeDoc renders
code-fenced and non-code text accordingly. It does not judge whether the example
is meaningful: <https://typedoc.org/documents/Tags._example.html>.

TypeDoc also documents that custom tags can be registered and rendered, but
unsupported or custom tags are primarily a parsing/rendering concern. This
supports using tags such as `@effects`, `@precondition`, and `@invariant` as
structured context, but the semantic quality of their content must come from
repo guidance or review rather than TypeDoc itself:
<https://typedoc.org/documents/Tags.html>.

API Extractor's TSDoc syntax guide separates brief summaries, longer
`@remarks`, additional blocks such as `@example`, and modifier tags. It also
warns that only the closest doc comment before an exported declaration is parsed.
That supports the repo's existing separation of summary, remarks, examples, and
release/category metadata, but again leaves example usefulness as a content
standard rather than a parser guarantee:
<https://api-extractor.com/pages/tsdoc/doc_comment_syntax/>.

## Options

Option 1: Add an example-value rubric to `.patterns` and mirror it in the
specialist skills later. The rubric would say that each non-trivial example
should answer at least one concrete reader question: how to construct valid
input, how to decode or encode, how failure is handled, how data-first and
data-last forms differ, how a layer/service is provided, what side effect is
triggered, what edge case matters, or what migration path replaces a deprecated
symbol. It should also discourage `void result` as the only observable behavior
except for narrow type-only examples.

Option 2: Add symbol-kind playbooks. Schemas need decode/encode or validation
examples. Predicates need true and false cases when the distinction is not
obvious. Effect-returning functions need success plus the most important typed
failure or required layer. Constants/config exports need an example showing how
the value is consumed, not just indexed. Type aliases need a separate decision:
either inherit documentation without forced examples, or show a real API
boundary where the alias matters.

Option 3: Align the skill surfaces before tightening enforcement. Because
`.agents` resolves to `.claude` but `.aiassistant` has older category language,
future guidance changes should either be generated from one source or landed in
all surfaces together. Otherwise agents can continue to satisfy whichever copy
they read first.

Option 4: Add an "example review" checklist item rather than a new standard.
The skill could ask: "What non-obvious behavior does this example demonstrate?"
and "Would the example still be useful if the reader already saw the function
signature?" This is low-cost and fits the current post-pass workflow, but it is
less enforceable than a formal rubric.

Option 5: Defer automation until after the guidance is sharper. A future checker
could flag sole `void result` examples, examples with only one predicate path,
examples without expected output, or type aliases with duplicate boilerplate.
That should wait until the repo agrees on valid exceptions, because mechanical
scoring can easily punish concise good docs.

## Tradeoffs And Risks

A stricter example-value rubric improves consistency but can inflate comments on
simple helpers. Some exports genuinely need only a short example, and making
every symbol demonstrate a failure path or expected output would create noise.

Example titles and input/result sections are high-signal for complex APIs, but
they make examples longer and can invite narrative text that docgen does not
compile. The guidance should keep code fences compile-ready while allowing a
small amount of prose outside the fence for scenario names and expected results.

Banning `void result` outright would catch many low-value examples, but it would
also create false positives for type-level examples where a compile-time
assignment is the whole point. A better rule is that `void result` cannot be the
only evidence of value unless the example is explicitly type-check-oriented.

Relaxing the "every export has `@example`" rule for type aliases or simple
constants would reduce boilerplate, but it weakens a simple invariant that is
easy for agents and tools to remember. Keeping the invariant means the standard
needs clearer symbol-kind examples so agents do not invent filler.

Aligning `.aiassistant`, `.agents`, and `.claude` is low-risk, but maintaining
multiple copies will keep creating drift unless there is a single source or a
copy/check workflow. This research does not propose implementing that workflow.

Agent-facing retrieval is a separate risk. If `@example` remains skipped for
call-site generation, then examples primarily serve humans and doc browsing. If
examples are later lifted into agent context, low-value examples can directly
pollute generated code. The repo should decide that consumption model before
investing in complex example scoring.

## Recommendation

Treat the current guidance as a good compliance baseline, not a complete quality
standard. The viable next move is a guidance-surface update, not implementation:
add a small "high-value `@example` contract" to `.patterns`, mirror it in the
`jsdoc-annotation-specialist` skills, and explicitly distinguish
syntax-compliant examples from decision-useful examples.

The contract should be short and operational:

- Each non-trivial example must demonstrate at least one usage decision not
  obvious from the signature.
- Prefer named scenarios for non-trivial symbols, especially examples with
  failure handling, resource provision, or edge cases.
- Show an observable result, assertion, branch, or expected output when possible.
- Avoid examples whose only action after calling the symbol is `void result`,
  except for documented type-check-only cases.
- Use symbol-kind playbooks for schemas, predicates, Effect-returning functions,
  services/layers, constants/config, error classes, and type aliases.

Do not add enforcement yet. First use the sampled repo examples above as test
cases for the rubric: a good rubric should explain why those examples are
allowed, should be improved, or should receive a narrow exception.

## Open Questions

- Should every exported type alias and simple constant still require an
  `@example`, or should `{@inheritDoc}` plus `@category`/`@since` be sufficient
  for some symbol kinds?
- Should `@example` remain skipped when agents generate call sites, or should a
  compact example summary/title be lifted when choosing or using APIs?
- Which symbol kinds require both success and failure examples, and which only
  need one representative path?
- Should examples prefer runtime assertions, comments with expected output, or
  prose outside the code fence to show observability?
- Who owns synchronization across `.patterns`, `.agents`/`.claude`, and
  `.aiassistant` so future guidance changes do not drift again?
