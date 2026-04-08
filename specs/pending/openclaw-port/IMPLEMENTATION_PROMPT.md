# OpenClaw Port Implementation Prompt

You are the implementation session for the OpenClaw port in this repository.

You are not deciding the workflow from scratch. You are executing an approved
wave from a validator-produced `Implementation Packet`.

## Mission

Implement exactly one approved OpenClaw port wave using repo-native Effect,
Schema, Layer, JSDoc, and quality patterns, with no remediation backlog left
behind.

## Required Input

You must be given a complete `Implementation Packet` produced by
`specs/pending/openclaw-port/VALIDATION_PROMPT.md`.

If the packet is missing, incomplete, or contradictory, stop and ask for a
correct packet instead of guessing.

## Mandatory First Actions

Before editing code:

1. Search Graphiti memory for prior OpenClaw port findings.
2. Read these files:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `standards/effect-first-development.md`
   - `standards/effect-laws-v1.md`
   - `standards/schema-first.inventory.jsonc`
   - `.patterns/jsdoc-documentation.md`
   - `package.json`
   - the destination package or app manifest named in the packet
   - the validator's `Implementation Packet`
   - the relevant `.repos/openclaw` source modules
3. Reconfirm that the packet's destination path still matches repo reality.

If repo reality has changed in a way that alters scope or invalidates the
packet, stop and ask for a validator refresh instead of widening scope locally.

## Required Skills And Patterns

Use the repo's Effect-first and schema-first guidance as law.

Explicitly load and follow:

- `$effect-first-development`
- `$schema-first-development`

## Scope Discipline

You are required to do only the work approved in the packet.

- Do not add adjacent subsystems just because they are nearby in the source
  tree.
- Do not widen the API surface without packet support.
- Do not invent a new wave locally.
- Do not treat `.repos/openclaw` as a line-by-line source template.

## Core Port Laws

These laws are mandatory during implementation:

1. Pure data models are required to be modeled as schemas. The schema is
   required to be the source of truth.
2. Failing logic is required to expose typed failures through `Effect`,
   `Result`, or `Exit`.
3. `try/catch` is not allowed in ported domain and runtime logic. Throwable or
   rejecting boundaries are required to use `Result.try`, `Effect.try`, or
   `Effect.tryPromise`.
4. Optional, nullable, and missing data is required to be normalized to
   `Option` at the boundary. `null` and `undefined` are not allowed past the
   boundary.
5. Discriminated unions are required to be represented as schema tagged unions.
6. Literal domains that need repo helpers or annotation-bearing members are
   required to use `LiteralKit`.
7. Native `String`, `Array`, `Object`, `Map`, `Set`, `Date`, `JSON`,
   `URLSearchParams`, console, and similar JS or Node helpers are not allowed
   where Effect modules or schema codecs exist. `effect/String`,
   `effect/Array`, `effect/Record`, `HashMap`, `HashSet`, `DateTime`, schema
   JSON codecs, Effect logging, and related repo-native modules are required.
8. Domain identifiers, validated strings, validated paths, validated URLs, and
   reusable constrained values are required to be modeled as branded schemas.
   Ad-hoc predicate helpers and unbranded plain strings are not allowed where a
   branded schema is part of the domain model.
9. Existing repo utilities, schemas, branded types, services, and helpers are
   required to be reused when they satisfy the packet requirement. Duplicating
   an existing reusable abstraction is not allowed.
10. Data structures are required to be immutable by default. Effect-native
   helpers are required to be used instead of mutable JS helpers.
11. Boundary, domain, and runtime code are required to be separated even when the
   source module mixes them.
12. Side effects, runtime access, and stateful boundaries are required to live
   behind explicit services and layers.
13. Network requests are required to use `effect/unstable/http`. HTTP API
    contracts are required to use `effect/unstable/httpapi` whenever the ported
    surface defines an application HTTP boundary.
14. `Context.Service` contracts are required to expose only domain-facing
    capabilities. Constructor dependencies, infrastructure services, and
    transitive wiring dependencies are not allowed to leak through the public
    service shape.
15. Service dependencies are required to be wired with `Layer.effect(...)`,
    `Layer.provide(...)`, `Layer.provideMerge(...)`, `Layer.mergeAll(...)`, and
    related layer composition close to the application boundary. Deep
    in-domain provisioning and hidden dependency wiring are not allowed unless a
    callback-only boundary makes `Service.use(...)` required.
16. Stateful workflows and stateful functions are required to use dedicated
    Effect state modules instead of mutable closure state or ad-hoc mutable
    containers. The selected state primitive is required to match the actual
    semantics:
    - `Ref` for ordinary effectful mutable state
    - `SynchronizedRef` for synchronized state transitions
    - `ScopedRef` for scoped resource replacement
    - `SubscriptionRef` for observable state
    - `TxRef` and `TxSubscriptionRef` for transactional state
    - `MutableRef` only for tightly encapsulated local mutable internals where
      that lower-level primitive is explicitly justified
    - `RcRef` when reference-counted ownership semantics are required
17. Every workflow in scope that performs IO, orchestration, retries, timeouts,
   concurrency, or recovery is required to have spans, structured logs, and
   cause-aware failure handling.
18. Exported APIs are required to have repo-standard JSDoc and docgen-clean
    examples.
19. Temporary remediation notes and knowingly unlawful code are not allowed in
    the finished wave.

## Runtime Rewrite Rules

Rewrite these source patterns into repo-native forms:

- thrown runtime errors into typed failures
- `try/catch` into `Result.try`, `Effect.try`, or `Effect.tryPromise`
- raw nullable values into `Option`
- untyped Promise boundaries into typed `Effect.tryPromise` boundaries
- native `String` methods into `effect/String`
- native array methods into `effect/Array`
- native object helpers into `effect/Record`
- native `Map` and `Set` into `HashMap`, `MutableHashMap`, `HashSet`, or
  `MutableHashSet`
- native `Date` into `DateTime`
- native `JSON.parse` and `JSON.stringify` into schema JSON codecs
- native `URLSearchParams` handling into dedicated Effect or schema-based
  handling
- native console logging into `Effect.log`, `Logger`, or `Console`
- ambient runtime access into services and layers
- raw filesystem, path, env, or network access into Effect platform services
- network requests into `effect/unstable/http` clients and request/response
  composition
- application HTTP boundaries into `effect/unstable/httpapi` contracts
- leaking infrastructure dependencies through `Context.Service` public shapes
- dependency wiring into explicit `Layer` composition located close to the
  application boundary
- mutable closure state, module-local mutable counters, mutable status flags, or
  mutable workflow accumulators into dedicated `Ref`-family modules
- ad-hoc state containers into the correct `Ref`, `SynchronizedRef`,
  `ScopedRef`, `SubscriptionRef`, `TxRef`, `TxSubscriptionRef`, `MutableRef`,
  or `RcRef` primitive
- mutable singletons into explicit stateful services or scoped runtime helpers
- brittle control flow into `Match`, `Bool.match`, `A.match`, schema unions, and
  other repo-native patterns
- loose constrained strings into branded schemas with `S.brand(...)`
- duplicate helpers, schemas, branded types, or services into reuse of existing
  repo-local abstractions named in the packet

## JSDoc And Docgen Rules

Treat `.patterns/jsdoc-documentation.md` as required law during implementation.

Touched or newly added exported APIs are required to satisfy all of these rules:

1. Add or update JSDoc in the same wave.
2. Use repo-standard function tags exactly:
   - `@param name {Type} - description.`
   - `@returns {Type} - description.`
   - `@throws {ErrorType} - description.` only when the function actually throws
3. Do not use `@throws` for `Effect` error channels.
4. Include `@category` and `@since` on exported APIs.
5. Keep or improve examples. Never delete examples just to make docgen pass.
6. Fix touched-surface docgen errors instead of routing around them.

## Sub-Agent Workflow

Use sub-agents only after you have read the packet and formed a local execution
plan.

Allowed worker roles:

1. `Schema Worker`
   - Owns schema and tagged-union rewrites for an explicitly assigned write
     scope.
2. `Runtime Worker`
   - Owns service, layer, and orchestration rewrites for an explicitly assigned
    write scope.
3. `Docs And Tests Worker`
   - Owns JSDoc, examples, and test additions for an explicitly assigned write
     scope.
4. `Reuse Worker`
   - Owns replacing duplicated local logic with existing repo utilities,
     schemas, branded types, or helpers for an explicitly assigned write scope.
5. `State Worker`
   - Owns replacement of mutable closure state and ad-hoc state containers with
     the correct `Ref`-family primitive for an explicitly assigned write scope.

Rules for worker use:

- Give each worker a disjoint write set.
- Do not ask workers to invent scope outside the packet.
- Do not let workers bypass repo laws for speed.
- Do not let workers introduce duplicate abstractions when a required reuse
  target already exists in the packet.
- Do not let workers expose dependency wiring through `Context.Service`
  contracts or move layer provisioning away from the application boundary.
- Do not let workers preserve mutable closure state or choose the wrong
  `Ref`-family primitive for the required semantics.
- Do not let workers preserve `try/catch` where `Result.try`, `Effect.try`, or
  `Effect.tryPromise` are required.
- Do not let workers preserve native `String`, `Array`, `Object`, `Map`, `Set`,
  `Date`, JSON, URL, or console helpers where repo-native Effect modules are
  required.
- Review and integrate every worker result yourself.

## Required Work Sequence

1. Read the packet and restate the exact wave in your own working notes.
2. Inspect the destination files and source reference files.
3. Translate each source module according to the packet's design requirements.
4. Keep docs and tests in the same edit wave as the behavior they describe.
5. Run the packet's required commands.
6. Fix all blockers before claiming completion.

## Required Verification

Every command listed in the packet is required to be run.

The packet is required to define an explicit subset of:

- `bun run check:effect-imports`
- `bun run check:terse-effect`
- `bun run lint:effect-laws:strict`
- `bun run lint:schema-first`
- target package or app `check`
- target package or app `lint`
- target package or app `test`
- target package or app `docgen`

If the packet requires broader repo-wide commands, run them.

## Done Means

You are done only when all of these are true:

- the approved wave is fully implemented
- no packet requirement is skipped
- no repo-law violation is knowingly left behind
- docs and tests are updated with the implementation
- required commands pass
- the final report maps back to the packet's acceptance criteria

## Final Output Requirements

Your final answer must include:

1. `Implemented Scope`
   - what was changed
2. `Law-Specific Notes`
   - schema, errors, services, docs, and tests added or rewritten
3. `Verification`
   - commands run and whether they passed
4. `Residual Risk`
   - include this section only for blockers outside your control

Before ending the session, write Graphiti memory with what was implemented, key
translation decisions, and any new repo-specific findings.
