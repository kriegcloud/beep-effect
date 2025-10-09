# Chat GPT 5 Pro Research mode stories & tasks

# Dynamic Multi‑Step Workflow Form System — User Stories & Implementation Tasks

> Scope: Breakdown derived from the provided research/architecture plan for a TypeScript‑first, data‑driven multi‑step workflow/form system (DSL → JSON model → runtime → renderer), featuring JsonLogic conditions, Ajv validation, an XState‑backed engine, and JSONForms integration.
>

**Metadata legend:**

*(Task Type: … | Output: … | Depends on: …)*

---

## DSL (Domain‑Specific Language) Design

> Fluent, type‑safe builder that emits the canonical workflow JSON and (optionally) re‑hydrates from JSON; enforces step/field references at compile‑time; provides helpers for conditions.
>
- **User Story:** *As a workflow designer (developer), I can define workflows via a fluent TS DSL so I get compile‑time safety for steps, fields, and transitions while producing canonical JSON for runtime/renderer.*
    - Design the DSL surface (builder pattern) for `Workflow.create() → .step() → .transition() → .build()`. *(Task Type: Backend/Language Design | Output: TS API & docs | Depends on: Workflow model types)*
    - Implement `StepBuilder` to capture `id`, `title`, `description`, `schema`, `uiSchema`, `annotations`. *(Task Type: Backend | Output: TS code | Depends on: DSL API design)*
    - Enforce unique step IDs and typed cross‑references via generics (union of known step IDs carried in builder state). *(Task Type: Backend/Types | Output: TS types | Depends on: StepBuilder)*
    - Add transition API with helpers (`whenEquals`, `whenIn`, `whenAnd`, etc.) that emit JsonLogic JSON without user‑written raw JSON. *(Task Type: Backend | Output: TS code | Depends on: JsonLogic shape)*
    - Provide `.build()` that returns the canonical JSON (no functions); include validation error reporting with precise locations. *(Task Type: Backend | Output: TS code | Depends on: Workflow JSON schema & validator)*
- **User Story:** *As a developer, I can define step schemas code‑first and have them converted to JSON Schema automatically.*
    - Add schema adapters: Effect Schema → JSON Schema; optionally TypeBox passthrough. *(Task Type: Backend | Output: TS adapters | Depends on: Schema strategy)*
    - Preserve annotations (description, examples, labels) in generated JSON Schema. *(Task Type: Backend | Output: TS code | Depends on: Schema adapters)*
- **User Story:** *As a developer, I can extend the DSL with plugins for custom field types or condition helpers without forking core.*
    - Define a plugin interface for: custom schema decorators, custom condition helpers, and step/transition metadata enrichers. *(Task Type: Architecture | Output: TS interfaces | Depends on: DSL core)*
    - Build a sample plugin (e.g., `enumFromApi()` helper or `whenMatchesRegex()`) to prove extension points. *(Task Type: Backend | Output: TS plugin | Depends on: Plugin interface)*
- **User Story:** *As a developer, I can load/inspect an existing workflow JSON in code to programmatically edit or lint it.*
    - Implement `Workflow.load(json)` that returns a typed in‑memory representation with safe mutation utilities; re‑emits canonical JSON. *(Task Type: Backend | Output: TS code | Depends on: Workflow JSON schema & types)*

**Technical Tasks**

- Provide Typedoc & examples for common patterns (branching by enum; multi‑page wizard). *(Task Type: Documentation | Output: MD + code samples | Depends on: DSL MVP)*
- Add type tests (tsd) ensuring incorrect step/field references fail at compile time. *(Task Type: Testing | Output: tsd tests | Depends on: DSL types)*

    *(Grounded in the document’s DSL goals and example builder sketch.)*


---

## Canonical Workflow JSON Model & Serialization

> Single source of truth: steps, transitions with JsonLogic when, priorities, initial state, and metadata; formal JSON Schema for definitions.
>
- **User Story:** *As the system, I need a canonical JSON model to persist, transport, validate, and interpret workflows (no code embedded).*
    - Author the **WorkflowDefinition JSON Schema** (v1) covering `id`, `version`, `schemaVersion`, `initial`, `steps[]`, `transitions[]`, `metadata`. *(Task Type: Validation | Output: JSON Schema | Depends on: Model spec)*
    - Define **Step** and **Transition** subschemas, including `priority`, default transitions (missing `when` → unconditional), and references (`from`/`to`). *(Task Type: Validation | Output: JSON Schema | Depends on: Model spec)*
    - Implement a validator utility `validateWorkflow(def)` using Ajv (strict mode). *(Task Type: Backend | Output: TS code | Depends on: JSON Schema, Ajv setup)*
- **User Story:** *As a developer, I get immediate feedback if a workflow JSON is malformed or contains dead‑ends.*
    - Add semantic checks: unique IDs, all references resolvable, at least one outgoing path per non‑terminal step, no unreachable steps. *(Task Type: Backend | Output: TS validation code | Depends on: Parsed model)*
- **User Story:** *As the runtime, I can serialize/deserialize workflow definitions safely.*
    - Implement `serializeWorkflow(def)` and `parseWorkflow(json)` with stable ordering of arrays where relevant (for deterministic diffs). *(Task Type: Backend | Output: TS code | Depends on: Model types)*

*(Captures the “graph‑like model as JSON” contract and default/priority semantics.)*

---

## Schema Strategy & Validation (JSON Schema + Ajv)

> JSON Schema (Draft 2020‑12) as canonical; Ajv as runtime validator; code‑first authoring via Effect Schema for DX.
>
- **User Story:** *As a developer, I can write step data schemas in TS and ship JSON Schema to the engine/renderer.*
    - Implement Effect Schema → JSON Schema generator wrapper with tests. *(Task Type: Backend | Output: TS adapter | Depends on: Effect Schema, JSON Schema draft 2020‑12)*
- **User Story:** *As the engine/UI, I can validate user input consistently across browser/server using Ajv.*
    - Create a shared Ajv factory (`createAjv({draft: "2020-12", strict: true, coerceTypes: true})`). *(Task Type: Backend | Output: TS code | Depends on: Ajv)*
    - Compile per‑step validators once on workflow load; cache by schema `$id`/hash. *(Task Type: Backend | Output: TS code | Depends on: Ajv factory)*
- **User Story:** *As a designer, I can add custom validation keywords (e.g., business rules) safely.*
    - Provide extension API to register Ajv custom keywords (namespaced), with tests. *(Task Type: Backend | Output: TS code | Depends on: Ajv factory)*
- **User Story:** *As a user, I get clear validation messages.*
    - Map Ajv errors → user‑friendly messages; integrate with renderer error surfaces. *(Task Type: Frontend/UX | Output: TS mapping utils | Depends on: Renderer wiring)*

*(Aligns with doc’s “JSON is canonical; code‑first optional; Ajv strict mode”.)*

---

## Conditional Logic Engine (JsonLogic)

> Branching via data‑only JsonLogic rules; allow‑listed operators; validated rule shapes; shared evaluation on client/server.
>
- **User Story:** *As a workflow author, I can express branching conditions declaratively in JSON and reuse them in all environments.*
    - Integrate `json-logic-js`; implement a **rule schema** limiting operators (allow‑list) and validating rule shapes at load‑time. *(Task Type: Backend/Security | Output: TS + JSON Schema | Depends on: Workflow JSON model)*
- **User Story:** *As the engine, I can evaluate rules over a controlled evaluation context.*
    - Implement `buildEvaluationContext({answers, currentStepAnswers, externalContext})` and sanitize inputs (no prototypes, no functions). *(Task Type: Backend/Security | Output: TS code | Depends on: Runtime context design)*
- **User Story:** *As a developer, I have expressive TS helpers instead of hand‑rolled JsonLogic.*
    - Provide typed helpers (e.g., `whenEquals(stepId, "field", value)`) that target `answers.<step>.<field>` paths safely. *(Task Type: Backend | Output: TS helpers | Depends on: DSL type map)*

*(Encodes the “safe and portable logic” strategy and rule validation.)*

---

## Runtime Execution Engine (XState Adapter)

> Generate an XState machine from workflow JSON; single generic guard reads JsonLogic from transition meta; actions assign/validate; serializable state.
>
- **User Story:** *As the system, I can execute the workflow by moving between steps based on validated input and conditions.*
    - Implement **machine generator**: steps → states (atomic), transitions → `on.NEXT[]` with `cond: 'evaluateCondition'` and `meta.rule`. *(Task Type: Backend | Output: TS code | Depends on: Workflow JSON, JsonLogic, XState)*
    - Implement **generic guard** `evaluateCondition` that fetches `rule` from transition meta and runs it over the evaluation context. *(Task Type: Backend | Output: TS code | Depends on: Conditional engine)*
    - Define `NEXT`, `BACK`, `RESET`, `LOAD_SNAPSHOT` events; create TypeScript event payloads. *(Task Type: Backend | Output: TS types | Depends on: Machine config)*
- **User Story:** *As a user, my inputs are validated and saved before advancing; invalid input blocks progress with clear feedback.*
    - Add `assign` action to persist step answers into `context.answers` after Ajv validation; prevent transition on invalid. *(Task Type: Backend | Output: TS code | Depends on: Ajv validators)*
- **User Story:** *As a user, I can resume where I left off; as the app, I can persist workflow state safely.*
    - Implement `serializeState({value, context})` and `restoreState(snapshot)`; wire to XState `interpret(...).start(savedState)`. *(Task Type: Backend | Output: TS code | Depends on: Machine generator)*
- **User Story:** *As a product, I avoid dead‑ends and prioritize transitions deterministically.*
    - Sort same‑origin transitions by `priority`; enforce presence of a default or catch‑all branch when needed. *(Task Type: Backend | Output: TS code | Depends on: Workflow validation)*
- **User Story (optional):** *As a user, I can navigate back safely.*
    - Implement BACK behavior (state history or explicit reverse transitions) guarded by data consistency rules. *(Task Type: Backend | Output: TS code | Depends on: Machine config)*
- **User Story:** *As an integrator, I can react to lifecycle events (entered step, submitted step, finished workflow).*
    - Expose hooks/callbacks on state transitions for analytics/side‑effects (non‑blocking). *(Task Type: Backend | Output: TS API | Depends on: Machine service wrapper)*

*(Follows the doc’s hybrid “graph definition → XState execution”, generic guard via meta, and persistence design.)*

---

## Form Renderer Integration (JSONForms primary)

> UI renders current step from JSON Schema + UI schema; leverages Ajv; supports within‑step rules; customizable widgets/themes.
>
- **User Story:** *As an end‑user, I see a dynamic form for the current step; on submit, I advance per workflow logic.*
    - Build `<WorkflowFormRenderer>` React component that subscribes to the engine (via `useMachine` or service), renders JSONForms with current step schema and UI schema, and dispatches `NEXT` on submit. *(Task Type: Frontend | Output: React/TS code | Depends on: Runtime engine, Ajv)*
    - Configure JSONForms with shared Ajv instance; pass per‑step validator; render field‑level errors. *(Task Type: Frontend | Output: React/TS code | Depends on: Ajv factory)*
- **User Story:** *As a designer, I can hide/disable fields within a step based on user input.*
    - Support JSONForms **UI schema rules** for show/hide/enable/disable; document rule patterns. *(Task Type: Frontend | Output: Docs + config examples | Depends on: JSONForms)*
- **User Story:** *As a team, we can adopt our design system and add custom widgets.*
    - Implement renderer registry: map JSON Schema patterns to custom controls (e.g., date picker, file upload). *(Task Type: Frontend | Output: React components | Depends on: JSONForms integration)*
- **User Story:** *As a user, accessibility and keyboard navigation work across all steps.*
    - Add A11y checks (labels, roles, focus management on step change) and Axe tests. *(Task Type: Frontend/Testing | Output: Tests + fixes | Depends on: Renderer MVP)*

*(Matches the doc’s JSONForms preference and dynamics via UI schema rules; RJSF considered alternate.)*

---

## Persistence & Resume

> Serializable engine state; storage adapters (localStorage/DB); robust resume logic; external context injection.
>
- **User Story:** *As a user, I can leave and resume a workflow later on the same or different device.*
    - Define a **snapshot format** `{ workflowId, version, state: { value, context }, savedAt }`. *(Task Type: Backend | Output: TS types | Depends on: Engine serialization)*
    - Implement pluggable storage adapters: `localStorage`, IndexedDB, and generic server API adapter. *(Task Type: Backend | Output: TS code | Depends on: Snapshot format)*
    - Validate that the loaded workflow definition/version matches the snapshot; expose graceful handling policy if not (see Versioning). *(Task Type: Backend | Output: TS code | Depends on: Versioning policy)*
- **User Story:** *As a developer, I can inject external context (e.g., user role) on start and keep it immutable through a session.*
    - Extend engine start API to accept `externalContext`; freeze it in `context` and expose to rule evaluation. *(Task Type: Backend | Output: TS code | Depends on: Conditional engine)*

*(Directly implements the doc’s “state is serializable” and resume considerations.)*

---

## Versioning Strategy & Migrations

> Semantic versioning on workflow definitions; separate schemaVersion; definition and state migration functions; policy for in‑flight instances.
>
- **User Story:** *As a maintainer, I can evolve workflows safely with explicit versioning and automated migrations where feasible.*
    - Adopt semver for workflow **definition** `version` and add model **schemaVersion**; document compatibility policy. *(Task Type: Architecture/Docs | Output: Policy doc | Depends on: JSON model)*
    - Implement **definition migration registry**: functions `v1 → v1.1`, `v1.1 → v2`, composable upgrade runner. *(Task Type: Backend | Output: TS code | Depends on: Workflow JSON schema)*
    - Provide **state migration hooks** for in‑flight instances (e.g., insert new step B between A→C) with defaults or “finish on old version” fallback. *(Task Type: Backend | Output: TS code | Depends on: Engine state format)*
- **User Story:** *As an operator, I can detect and act on version mismatches at resume time.*
    - Implement mismatch detector and configurable behavior: (a) run with old def, (b) migrate def/state, (c) restart. *(Task Type: Backend | Output: TS code | Depends on: Migration registry)*
- **User Story:** *As a developer, I can run a CLI to validate and migrate JSON files in bulk.*
    - Ship `beep-wf migrate/validate` CLI commands with dry‑run and report. *(Task Type: DevEx | Output: Node CLI | Depends on: Migration & validation APIs)*

*(Encapsulates the doc’s versioning & migration plan, including in‑flight strategy tradeoffs.)*

---

## Monorepo Architecture & Project Structure

> Packages: workflow-model, workflow-dsl, workflow-runtime, workflow-renderer-jsonforms; bun workspaces; TS project refs; ESM/CJS.
>
- **User Story:** *As a contributor, I can develop across packages with fast builds and clear boundaries.*
    - Initialize bun workspace; set up package folders and TS project references. *(Task Type: DevOps | Output: Repo scaffolding | Depends on: Package plan)*
    - Set up CI (e.g., Bitbucket/GitHub) to run typecheck, build, tests across workspaces. *(Task Type: DevOps | Output: CI pipeline | Depends on: Build & test scripts)*
- **User Story:** *As a consumer, I can install only what I need (engine without renderer, etc.).*
    - Ensure package boundaries and peerDeps are correct; avoid leaking renderer deps into runtime. *(Task Type: Packaging | Output: package.json metadata | Depends on: Build configs)*
- **User Story:** *As a learner, I can run a working demo app.*
    - Create `@beep/workflow-examples` with an Inventory Adjustment workflow and a minimal React app wiring runtime + JSONForms. *(Task Type: Frontend | Output: Demo app | Depends on: DSL, Runtime, Renderer)*

*(Reflects the recommended package split and tooling.)*

---

## Testing Strategy

> Unit tests (model/DSL/runtime/rules), integration (DSL→engine), UI tests (renderer), type tests, cross‑version tests, perf smoke tests.
>
- **User Story:** *As QA, I can rely on automated tests that cover branching, validation, and persistence.*
    - Unit tests: DSL `.build()` happy/invalid paths; JsonLogic evaluation; Ajv validation; priority/default resolution. *(Task Type: Testing | Output: Tests | Depends on: DSL, Conditional, Validation)*
    - Integration: define workflow via DSL, run through engine with event sequences (Move/Consume/Adjust branches). *(Task Type: Testing | Output: Tests | Depends on: Runtime + DSL)*
    - UI tests: mount `<WorkflowFormRenderer>`, simulate input/submit, assert next step and errors (React Testing Library + JSDOM). *(Task Type: Testing | Output: Tests | Depends on: Renderer MVP)*
    - Type tests: ensure wrong step/field references are TS errors (tsd/@ts-expect-error). *(Task Type: Testing | Output: Type tests | Depends on: DSL types)*
    - Cross‑version tests: migrate definitions and (optionally) state snapshots; verify correctness. *(Task Type: Testing | Output: Tests | Depends on: Migration APIs)*
    - Perf smoke: generate workflow with 50–100 steps; measure init/submit latencies; track thresholds. *(Task Type: Testing | Output: Bench harness | Depends on: Runtime)*

*(Matches the document’s multi‑level test plan, including model‑based coverage.)*

---

## Security & Safety

> No eval; allow‑listed JsonLogic ops; strict Ajv; sanitized context; resilient engine failure modes.
>
- **User Story:** *As a platform owner, I can safely execute untrusted workflow JSON without executing code.*
    - Enforce “data‑only” contract in schema (no functions in persisted config); validate rule shapes; disallow unknown props (Ajv strict). *(Task Type: Security/Validation | Output: Schemas + checks | Depends on: JSON model)*
    - Sanitize evaluation context and deep‑freeze external context; guard against prototype pollution. *(Task Type: Security | Output: TS utilities | Depends on: Conditional engine)*
- **User Story:** *As a user, the system fails safe (no crashes) on malformed rules or missing transitions.*
    - Catch rule evaluation errors and treat as `false` + log; validate transitions upfront to avoid dead‑ends. *(Task Type: Backend | Output: TS code | Depends on: Runtime/Validation)*

*(Directly reflects the doc’s “safe and portable logic” stance.)*

---

## Observability & Analytics (Foundational)

> Hooks for progression events; optional logging/metrics; groundwork for analytics and future visual tooling.
>
- **User Story:** *As an analyst, I can understand user progression and drop‑offs.*
    - Emit events: `STEP_ENTER`, `STEP_SUBMIT`, `BRANCH_TAKEN`, `WORKFLOW_COMPLETE` with workflow/step IDs only (no PII in logs). *(Task Type: Backend | Output: Event API | Depends on: Runtime service wrapper)*
- **User Story (future):** *As a designer, I can visualize workflows and traverse paths.*
    - Export definition → graph format (e.g., DOT/JSON graph) for future editor/visualizer. *(Task Type: DevEx | Output: Formatter | Depends on: JSON model)*

*(Anticipates the doc’s analytics and future visual editor aspirations.)*

---

## Documentation & Developer Experience

> Clear docs, guides, examples, and CLI; encourage schema/DSL best practices; migration playbooks.
>
- **User Story:** *As a developer, I can adopt the system quickly with copy‑pasteable examples.*
    - Author quick‑start: define a 3‑step workflow in DSL, run in React with JSONForms. *(Task Type: Docs | Output: README/tutorial | Depends on: MVP)*
    - Write “patterns” guide: branching by enum, default transitions, dynamic fields via UI schema, external context usage. *(Task Type: Docs | Output: MD | Depends on: Renderer & Runtime)*
- **User Story:** *As a maintainer, I can keep dependencies healthy and updated.*
    - Document upgrade notes (e.g., XState v4→v5 plans), changelogs; set up Dependabot/automation. *(Task Type: DevOps | Output: Config + docs | Depends on: CI)*

*(Addresses the doc’s emphasis on extensibility, change resilience, and DX.)*

---

## Implementation Sequencing (High‑Level Dependencies)

1. **Model & Validation** → 2. **DSL (MVP)** → 3. **Conditional Engine** → 4. **Runtime (XState adapter)** → 5. **Renderer (JSONForms)** → 6. **Persistence & Resume** → 7. **Versioning/Migrations** → 8. **Testing hardening** → 9. **Docs & Examples**. *(Derived from the phased plan in the document.)*

---

## Package‑Level Task Map (Concise)

- **`@beep/workflow-model`**
    - JSON Schemas (workflow, rule), TS types, Ajv validators, semantic checks, serialize/parse. *(Backend/Validation)*
- **`@beep/workflow-dsl`**
    - Builder API, type‑safe transitions/fields, schema adapters, plugin API, `.build()`/`.load()`, helpers. *(Backend/Types)*
- **`@beep/workflow-runtime`**
    - Machine generator, generic guard, Ajv integration, events/actions, snapshotting, hooks. *(Backend)*
- **`@beep/workflow-renderer-jsonforms`**
    - React components/hooks, JSONForms wiring, UI schema rules support, custom renderer registry, A11y. *(Frontend)*
- **Tooling/CLI**
    - `beep-wf validate/migrate`, diffs, reports. *(DevEx)*

---

## Risk‑Reduction Tasks (from Open Questions)

- **Rule authoring complexity:** deliver DSL helpers, examples, and (later) a visual rule builder spike. *(Backend/Docs | Output: Helpers + guide)*
- **DSL type complexity:** add type‑tests; provide “strict” and “relaxed” modes (compile‑time vs runtime checks) to balance ergonomics. *(Backend/Types | Output: Configurable types)*
- **Dependency churn (XState/Ajv/JSONForms):** thin adapters around 3P libs; one place to swap/upgrade; CI matrix. *(Architecture/DevOps | Output: Adapter layers + CI)*

---

### Acceptance Snapshot (per component)

- **DSL:** Define sample Inventory workflow in ~20 LOC; invalid transition to unknown step fails at compile time.
- **Model/Validation:** Invalid workflow JSON (duplicate step ID) is rejected with precise path.
- **Runtime:** Choosing “Move” in step `start` navigates to `moveDetails`; state snapshot restores after reload.
- **Renderer:** Field‑level errors appear on submit; UI rule hides dependent field when toggle is off.
- **Versioning:** CLI upgrades v1.0 → v1.1 by inserting new optional field with default; old snapshots either migrate or finish on legacy def per policy.

---

If you’d like, I can turn this into a **phased Jira board** (epics → stories → tasks with dependencies) or generate **starter code stubs** for each package to accelerate kickoff.
