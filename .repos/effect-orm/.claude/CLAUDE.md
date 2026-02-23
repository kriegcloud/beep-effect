<claude-guidelines>

<effect-thinking>
Effect<Success, Error, Requirements>

a |> f |> g |> h  ≡  pipe(a, f, g, h)
f ∘ g ∘ h         ≡  flow(f, g, h)
f(g(x))           →  pipe(x, g, f)           -- avoid nested calls

dual :: (self, that) ↔ (that)(self)
pipe(x, f(y))     ≡  f(x, y)                 -- data-last in pipelines
f(x, y)           →  pipe(x, f(y))           -- prefer pipeline form

∥(a, b, c)        ≡  Effect.all([a, b, c], { concurrency: "unbounded" })

R ⊃ {Service₁, Service₂} → Layer.provide(Service₁Live, Service₂Live)

E = Error₁ | Error₂ | Error₃ → catchTag("Error₁", handler)

yield* effect    ≡  ← effect (bind)
Effect.gen(function*() { ... })

need(time)       → Clock
need(randomness) → Random
need(filesystem) → FileSystem
need(http)       → HttpClient
</effect-thinking>

<layer-memoization>
-- MemoMap := Map<Layer (by ===), [Effect, Finalizer]>
-- one MemoMap per ManagedRuntime.make, shared across entire build

-- Layer.provide(A, B) / Layer.merge(A, B) store ref(A), ref(B)
-- MemoMap recurses into sub-layers, each resolved by its own ref
-- same imported const = same ref = built exactly once per runtime

-- THEREFORE:
-- provide(VM₁, SvcLive) ∧ provide(VM₂, SvcLive) → SvcLive built once
-- no "shared bundle" needed — MemoMap deduplicates by reference

-- anti-pattern: intermediate bundles to force sharing
-- ✗ Bundle = mergeAll(A, B, C) → provide(X, Bundle)
--   unnecessary intermediates, bloated tree, harder to reason about
-- ✓ provide(X, A, B) ∧ provide(Y, A, C) → shared A, separate B/C

-- minimize R on exported layers
-- push Layer.provide inside .live.ts → export Layer<Svc, E, ∅>
-- consumer sees zero or minimal requirements
-- dependency tree stays flat and auditable

-- ¬fear(duplication) ∧ ¬fear(split-world)
-- two subsystems with separate instances = fine
-- MemoMap sharing is opt-in (same ref), not a global constraint
-- Layer.fresh(L) → explicit opt-out, always rebuilds

flat Layer.provide     over  intermediate "Deps" bundles
pre-wired exports      over  leaking requirements to consumers
separate instances     over  forced sharing across boundaries
</layer-memoization>

<uncertainty>
unclear(requirements) → ask(user) → proceed
ambiguous(approach) → present({options, tradeoffs}) → await(decision)
blocked(task) → report(blocker) ∧ suggest(alternatives)
risk(action) ≤ low → prefer(action) over prefer(inaction)
</uncertainty>

<skills>
known(domain) ∧ known(patterns) → retrieve(skill) → apply
¬known(domain) → explore → identify(skills) → retrieve → apply
act(training-only) := violation

∀task: verify(skill-loaded) before implement
</skills>

<gates>
gates(typecheck, test) := DELEGATE(agent) ∧ ¬run-directly(orchestrator)
significant(changes)   := |files| > 1 ∨ architectural(impact)
</gates>

<commands>
/modules         → list(ai-context-modules)
/module {path}   → content(module(path))
/module-search   → filter(modules, pattern)
/debug {desc}    → ∥(4 × diagnose) → validate(consensus)
</commands>

<sources>
patterns     → skills (auto-suggested)
internals    → .context/ (grep)
</sources>

<code-standards>

<style>
nested-loops        → pipe(∘)
conditionals        → Match.typeTags(ADT) ∨ $match
domain-types        := Schema.TaggedStruct
imports             := ∀ X → import * as X from "effect/X"
{Date.now, random}  → {Clock, Random}
</style>

<effect-patterns>
Effect.gen          over  Effect.flatMap chains
pipe(a, f, g)       over  g(f(a))
Schema.TaggedStruct over  plain interfaces
Layer.provide       over  manual dependency passing
catchTag            over  catchAll with conditionals
Data.TaggedError    over  new Error()

as any              →  Schema.decode ∨ type guard
Promise             →  Effect.tryPromise
try/catch           →  Effect.try ∨ Effect.catchTag
null/undefined      →  Option<A>
throw               →  Effect.fail(TaggedError)
</effect-patterns>

<ui>
¬borders → lightness-variation
depth := f(background-color)
elevation := Δlightness ∧ ¬stroke
</ui>

<documentation>
principle := self-explanatory(code) → ¬comments

forbidden := {
  inline-comments,
  @example blocks,
  excessive-jsdoc
}

unclear(code) → rewrite(code) ∧ ¬comment(code)
</documentation>

</code-standards>

<code-field>
-- inhibition > instruction

pre(code)           := stated(assumptions)
claim(correct)      := verified(correct)
handle(path)        := ∀path ∈ {happy, edge, adversarial}

surface-before-handle := {
  assumptions(input, environment),
  break-conditions,
  adversarial(caller),
  confusion(maintainer)
}

forbidden := {
  code ← ¬assumptions,
  claim(correct) ← ¬verified,
  happy-path ∧ gesture(rest),
  import(¬needed),
  solve(¬asked),
  produce(¬debuggable(3am))
}

correctness ≠ "works"
correctness := conditions(works) ∧ behavior(¬conditions)

-- correct code > passing types > passing tests
-- types and tests are evidence of correctness, not correctness itself
-- cheating either gate = worse than failing it

bypass(types) := { as any, as unknown, @ts-ignore, @ts-expect-error }
bypass(types) → forbidden — fix the code, not the type system

test(implementation) := ∅  — empty pattern, proves nothing
test(behavior)       := meaningful
-- tests verify WHAT the system does, never HOW it does it
-- testing implementation = testing you wrote what you wrote
-- refactor-safe tests only: change internals, tests still pass
</code-field>

</claude-guidelines>
