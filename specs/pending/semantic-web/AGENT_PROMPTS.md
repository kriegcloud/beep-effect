# @beep/semantic-web — Agent Prompts

## Phase Start Rule

If a phase starts in Plan Mode, do not edit spec artifacts yet. First read the required inputs, confirm which defaults are already locked, resolve remaining ambiguities through non-mutating exploration and targeted user questions, and produce a decision-complete phase plan. Only write or refine the phase output artifact when operating outside Plan Mode.

## Prompt: P0 Orchestrator (Package Topology and Boundaries)

You are formalizing the package topology for `@beep/semantic-web`. Read the README, `design/foundation-decisions.md`, the exploratory research notes, `packages/common/semantic-web/src/iri.ts`, `packages/common/schema/src/internal/ProvO/ProvO.ts`, `packages/common/semantic-web/README.md`, `packages/common/semantic-web/src/index.ts`, and the local prior art under `.repos/beep-effect/packages/common/semantic-web`. Produce or refine `outputs/p0-package-topology-and-boundaries.md`.

You must verify:

- the public module map is explicit
- the boundary with `@beep/schema` is explicit
- `idna/` remains internal to the `uri/` family in v1
- the stable root export surface is curated and minimal rather than broad
- `@beep/schema` compatibility shims are contingency-only rather than a default rollout step
- upstream libraries are classified as `adapter target`, `implementation reference`, or `research-only reference`
- exploratory artifacts are marked as preserved, refined, or superseded instead of disappearing silently
- locked defaults are preserved unless conflicting local evidence is cited explicitly

## Prompt: P1 Orchestrator (Core Schema and Value Design)

You are defining the core public schema and value families for `@beep/semantic-web`. Read `outputs/p0-package-topology-and-boundaries.md`, `design/semantic-schema-metadata.md`, the current `IRI` and `ProvO` proof modules, and the Effect v4 module selection note. Produce or refine `outputs/p1-core-schema-and-value-design.md`.

You must verify:

- `IRI` and `URI` remain separate public concepts in v1
- `Schema.toEquivalence(...)` is the default equality surface for schema-modeled values
- Effect `Graph`, `Hash`, and `Equal` are not treated as RDF semantic identity
- public schema families that require semantic metadata are explicit
- JSON Schema is not treated as a substitute for SHACL or OWL semantics

## Prompt: P2 Orchestrator (Adapter and Representation Design)

You are defining the adapter and representation posture for `@beep/semantic-web`. Read `outputs/p0-package-topology-and-boundaries.md`, `outputs/p1-core-schema-and-value-design.md`, the upstream semantic-web subtree references, and the exploratory Effect v4 note. Produce or refine `outputs/p2-adapter-and-representation-design.md`.

You must verify:

- JSON-LD is first-class at the document, framing, and streaming adapter layers
- `jsonld-streaming-parser.js`, `jsonld-streaming-serializer.js`, and `shacl-engine` are treated as adapter targets
- `jsonld.js`, `jsonld-context-parser.js`, and `rdf-canonize` are treated as implementation references
- `traqula` and `comunica` remain research-only in v1 and do not shape the stable adapter contract
- `JsonPatch`, `JsonPointer`, and generic XML encoding stay in their restricted roles

## Prompt: P3 Orchestrator (Service Contract and Metadata Design)

You are defining service contracts, provenance posture, and metadata policy for `@beep/semantic-web`. Read `outputs/p1-core-schema-and-value-design.md`, `outputs/p2-adapter-and-representation-design.md`, `design/provenance-and-evidence.md`, `design/semantic-schema-metadata.md`, and the PROV-O assessment. Produce or refine `outputs/p3-service-contract-and-metadata-design.md`.

You must verify:

- the minimal stable PROV profile and extension tier are explicit
- evidence anchoring and bounded provenance projections are explicit
- lifecycle time semantics are kept as explicit domain fields where needed
- Web Annotation is treated as an adapter seam rather than a hard dependency
- service contracts and metadata requirements are clear enough for later implementation without reopening the design

## Prompt: P4 Orchestrator (Implementation Plan and Verification Strategy)

You are producing the implementation sequencing and verification contract for `@beep/semantic-web`. Read all prior phase outputs, `package.json`, `packages/common/semantic-web/package.json`, and `turbo.json`. Produce or refine `outputs/p4-implementation-plan-and-verification-strategy.md`.

You must verify:

- implementation order is phased and dependency-aware
- acceptance criteria are concrete
- package-scoped verification commands use `bun`
- the stable root export surface stays curated and minimal during rollout
- temporary `@beep/schema` compatibility shims are only introduced if migration inventory proves they are required
- failure classification expectations are explicit
- the document stays at the planning/spec level and does not turn into implementation notes
