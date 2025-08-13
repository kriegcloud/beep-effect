# Designing a Dynamic Multi‑Step Form Workflow System

This document is a research plan and architectural blueprint for building a dynamic, TypeScript‑first, multi‑step workflow and form system with conditional branching, a fluent DSL, JSON serialization, schema‑driven validation, and a runtime engine suitable for browser and Node.js. It consolidates background research, compares options, and proposes a phased plan.


## 0) Goals, Deliverables, Non‑Goals

Goals
- Developer‑ergonomic TypeScript DSL to define workflows (steps, fields, branching) with strong types and easy maintenance.
- Canonical JSON representation for persistence, transport, versioning, and interop with UI renderers and validators.
- Execution engine that evaluates conditions and routes between steps dynamically.
- Schema‑driven validation with round‑trip friendly design and annotations preserved.
- Pluggable front‑end renderer that can generate forms from JSON configuration.
- Optimized for change: new fields, operators, and transitions should be added without breaking existing flows.

Deliverables
- Workflow definition model (TypeScript types and JSON schema for the model itself).
- Fluent TS DSL that produces the canonical JSON model and can be re‑hydrated from JSON.
- Execution engine adapter (preferably XState‑based) that consumes the JSON model and drives step transitions.
- Validation layer (Ajv + JSON Schema) and optional Effect Schema integration for developer types/decoding.
- UI rendering strategy and adapters (JSONForms or RJSF) with custom widget/renderer hooks.
- Versioning/migration strategy and test plan.

Non‑Goals (initial phase)
- Full visual drag‑and‑drop builder (will leverage same JSON model later).
- Arbitrary user‑defined JS functions in JSON (must remain data‑only for safety/serializability).


## 1) Core Questions to Answer
1. Graph vs FSM: what structure best represents steps with branching? How do we serialize it?
2. DSL design: how to ensure type‑safe references to step IDs and step data, while remaining serializable?
3. Schema strategy: Effect Schema vs Zod/io‑ts vs pure JSON Schema with Ajv. Round‑trip and annotations?
4. Conditional logic: representation in JSON (e.g., JsonLogic) and evaluation safely on client/server.
5. Execution engine: custom vs XState; guards, actions, and persistence of state between sessions.
6. Renderer: JSONForms vs RJSF vs custom; dynamic visibility and layout via UI schema.
7. Versioning/migrations of workflow definitions and long‑lived instances.
8. Monorepo packaging/build strategy with pnpm + tsc -b and path aliases.


## 2) Architecture Overview (Proposed)

High‑level components
- Workflow Model (canonical JSON): Steps, Fields, Transitions, Conditions. Versioned document.
- TypeScript DSL: Fluent builder producing the canonical JSON. Re‑hydration from JSON back to builder/runtime model.
- Validation: Ajv compiled validators for step data schemas and for workflow definition schema. Optional Effect Schema for code‑side types and decoding.
- Logic: JsonLogic for serializable conditions. Strict operator allow‑list and custom operators registry.
- Engine: XState machine generator from the workflow JSON. Guards evaluate JsonLogic rules against context/answers.
- Renderer: JSONForms (primary) or RJSF (alternative) consuming per‑step JSON Schema + optional UI Schema.

Key principles
- Separation of concerns: definition (what) vs execution (how) vs rendering (view).
- Data‑first: JSON is the source of truth for persistence and transport; code helpers are facades over it.
- Safe and portable: no function serialization; use JsonLogic or similar AST for conditions.
- Extensibility: plugin points for field types, validation keywords, and condition operators.


## 3) Workflow Representation: Graph vs FSM

Options
- Directed Graph of steps with conditional edges.
- Finite State Machine/Statechart (XState).

Recommendation
- Use XState for the runtime engine and persistence of execution state, but keep the canonical workflow definition as our own JSON graph model. Generate an XState machine at runtime from this JSON.
  - Pros: robust semantics (guards, actions, history), ecosystem tooling, actor model, serialization of state.
  - Caveat: guards are functions in XState; avoid serializing them by storing JsonLogic rules in our JSON and provide a single guard implementation that interprets rules.

References
- XState guides on guards and actions: stately.ai/docs/xstate (guards, choose actions).


## 4) Canonical Workflow JSON Model (v1 proposal)

Top‑level
- id: string (UUID/slug)
- version: semver for the workflow definition
- initial: stepId
- steps: Step[]
- transitions: Transition[]
- metadata: annotations (labels, descriptions, domain hints)

Step
- id: string
- title, description
- schema: JSON Schema (per‑step answer shape)
- uiSchema: optional UI schema (layout, visibility rules if renderer supports it)
- annotations: arbitrary key/value metadata

Transition
- from: stepId
- to: stepId
- when: JsonLogic rule (against an evaluation context: aggregate answers + domain context)
- priority: number (resolve multi‑match)
- metadata: annotations

Evaluation context
- answers: map stepId -> value
- currentStep answers
- external context (e.g., user/warehouse/environment) provided by host app

Note: Steps can be skipped if no transition condition matches; include an explicit default (otherwise) transition per step.


## 5) Conditional Logic Representation

Recommendation
- Use JsonLogic rules as data in transitions: { "==": [ { "var": "action" }, "Move" ] }.
- Evaluate with json-logic-js on browser and Node. Provide only a curated set of operators; register custom operators centrally.
- Do not allow arbitrary eval or Function constructor. Validate rule objects against a JsonLogic JSON Schema prior to use.

References
- jsonlogic.com and github.com/jwadhams/json-logic-js (apply rules, variables, custom operators, safe evaluation).


## 6) Schema and Validation Strategy

Constraints and observations
- Effect Schema supports JSON Schema generation with annotations (JSONSchema.make(schema)), but there is no official, general JSON Schema -> Effect Schema importer (see Effect issue discussions).
- Ajv is the de facto JSON Schema validator; supports drafts 2019‑09 and 2020‑12 and custom keywords.

Recommendation
- Canonical per‑step data contract is JSON Schema (draft 2020‑12). Use Ajv to compile validators on both client and server.
- In the TypeScript DSL, optionally define step data using Effect Schema for developer ergonomics and type inference, then emit JSON Schema via Effect’s JSONSchema module for the canonical model.
  - One‑way flow: Effect Schema -> JSON Schema -> persist. On load, prefer the persisted JSON Schema; do not require converting back to Effect Schema at runtime.
- Support annotations via JSON Schema keywords and Effect annotations to carry UI hints/help text.

Trade‑offs
- Full round‑trip between arbitrary JSON Schema and code schemas is not guaranteed by most libraries; treating JSON as canonical avoids impedance mismatch.

References
- Effect Schema JSON Schema generation docs.
- Ajv docs for draft 2019‑09/2020‑12 and custom keywords.


## 7) Execution Engine Design (XState adapter)

Approach
- Build an XState machine from Workflow JSON.
- For each transition from step A to step B with a JsonLogic rule R:
  - Define a generic guard cond: 'evalRule' and attach the rule in transition meta.
  - Provide guards: { evalRule: (ctx, evt, meta) => jsonLogic.apply(meta.transition.meta.rule, buildEvalContext(ctx)) }.
- Context holds: current answers, external domain context, and workflow metadata.
- Actions: on enter step, emit events (e.g., for UI to render). On submit step, validate with Ajv, assign answer to context, and transition using guards.

Persistence
- Persist XState state value + context to local storage or DB; XState state is JSON serializable. Provide migration hooks when definitions change.


## 8) Renderer Strategy

Primary: JSONForms
- Pros: JSON Schema + UI Schema; rich conditional visibility rules; extensible renderers; React integration; leverages Ajv.
- Fits our "schema‑first" approach; decouples layout (UI schema) from data schema.

Alternative: RJSF
- Pros: mature, customizable widgets/templates; strong community.
- Conditional visibility often encoded via anyOf/oneOf/dependencies; more schema‑driven than rule‑driven UI.

Plan
- Start with JSONForms for per‑step rendering using each step’s JSON Schema + UI Schema.
- Implement a renderer adapter interface so we can swap to RJSF if needed.


## 9) TypeScript DSL Design

Fluent builder
- Workflow.create('Inventory Adjustment')
  .step('start', s => s.field('action').enum(['Move','Consume','Adjust']).title('Action'))
  .route('start', 'moveDetails', r => r.when(eq(var('action'), 'Move')))
  .step('moveDetails', s => s.field('locationFrom').string().required() ...)
  .defaultRoute('start', 'end');

Type safety features
- Accumulate a union of known StepIds in generics; enforce that .route() targets exist.
- Field builders produce JSON Schema fragments; enforce unique field keys per step.
- Encode constraints (required, min/max) and annotations; infer TypeScript types for step data.

Serialization
- Builder operates over an internal plain‑data model; .toJSON() emits canonical Workflow JSON.
- fromJSON() constructs a runtime model for execution; no functions stored in JSON.


## 10) Versioning and Migrations

Strategy
- Every workflow JSON has a definition version: { schemaVersion: '1.0.0' }.
- Maintain a migration pipeline per workflow type to upgrade definitions between versions.
- For in‑flight instances, store execution state with definition version; provide migration functions to translate state/context.

Tools
- Keep migrations as pure functions with tests. Consider JSON Patch or custom transforms. Avoid fragile regex/codegen.


## 11) Security and Safety
- No eval/function deserialization; JsonLogic only with allow‑listed operators.
- Validate all workflow JSONs against a WorkflowDefinition JSON Schema before use.
- Guard against pathological rule depth/size; set evaluation limits and timeouts if needed.
- Sanitize any external context injected into evaluation.


## 12) Performance
- Pre‑compile Ajv validators per step and cache.
- Lazy‑load renderer widgets and heavy editors.
- Minimize re‑evaluation of rules; evaluate only on relevant data changes.
- Use XState’s pure actions and assignment helpers for efficient context updates.


## 13) Monorepo Packaging and Build (pnpm + tsc -b)

Packages (suggested)
- @beep/form-dsl: fluent builder, JSON (de)serialization, types.
- @beep/form-model: TypeScript types + JSON Schemas for WorkflowDefinition and related.
- @beep/form-runtime: XState adapter, execution engine, JsonLogic evaluation, Ajv integration.
- @beep/form-renderer-jsonforms: React components wiring JSONForms to our runtime.
- @beep/form-renderer-rjsf (optional): Alternative renderer adapter.
- @beep/form-examples: Example workflows and fixtures.

Build strategy
- TypeScript project references between packages; no bundler; emit types + ESM/CJS as needed.
- Maintain compilerOptions.paths for aliases like @beep/<pkg> and keep references in sync with workspace deps.
- Provide a workspace script to auto‑sync tsconfig references and paths from package.json (matching existing repo preference).


## 14) Testing Strategy
- DSL tests: type‑level assertions (tsd/expect‑type) and runtime serialization round‑trip.
- Validation tests: Ajv validation for each step schema with positive/negative cases; custom keywords if used.
- Logic tests: JsonLogic rules evaluation across sample contexts.
- Engine tests: XState transition paths, guard ordering, and persistence rehydration.
- Renderer tests: snapshot/DOM tests for basic schemas, conditional visibility rules.
- Integration tests: end‑to‑end run through sample multi‑branch workflows.


## 15) Implementation Plan and Milestones

Phase 0: Spikes (1–2 weeks)
- Spike 1: Define WorkflowDefinition JSON schema; build a small example (3 steps, 2 branches).
- Spike 2: JsonLogic guard adapter with XState; prove routing works.
- Spike 3: JSONForms rendering per step with Ajv validation and error surfacing.
- Spike 4: Effect Schema -> JSON Schema export for a step; compare with Ajv validation.

Phase 1: MVP (3–4 weeks)
- Package @beep/form-model with schema + types and validation helpers.
- @beep/form-dsl minimal builder with .step(), .field(), .route(), .toJSON().
- @beep/form-runtime XState generator + submit/next APIs; persistence to localStorage.
- @beep/form-renderer-jsonforms React integration; basic theming.
- Example workflow: Inventory Adjustment (Move/Consume/Adjust);
- Docs and quickstart.

Phase 2: Robustness (3–4 weeks)
- Migrator for definition versions; state rehydration.
- Plugin APIs: custom field types, custom JsonLogic operators, renderer mapping.
- CLI/tool to validate and pretty‑print workflows; graph visualization exporter.
- Path/references sync script for monorepo.

Phase 3: Advanced
- Visual builder (future): graph editor that emits our JSON; live preview using the runtime + renderer.
- Audit logging and analytics hooks.

Acceptance criteria (MVP)
- Define a branching workflow in TS DSL; serialize to JSON; load JSON and execute end‑to‑end in browser with JSONForms.
- Form data validated per step; invalid data blocks transition; valid data routes via JsonLogic.
- State persists across reloads; definition version recorded; tests pass.


## 16) Open Questions and Risks
- Effect Schema round‑trip: No general JSON Schema -> Effect Schema converter; we rely on JSON as canonical and code schemas as authoring convenience only.
- Renderer choice: JSONForms vs RJSF trade‑offs; JSONForms offers rule‑based UI but may need customization for complex layouts.
- Performance on very large workflows: may need virtualized rendering and batched rule evaluation.
- Authoring complex conditions: consider a higher‑level condition builder that compiles to JsonLogic to avoid hand‑writing JSON.


## 17) References
- Effect Schema JSON Schema generation and annotations: https://effect.website/docs/schema/json-schema/
- XState: guards/actions and state handling: https://stately.ai/docs/xstate-v4/xstate/xstate/transitions-and-choices/guarded-actions
- JsonLogic basics and API: https://github.com/jwadhams/json-logic-js and https://jsonlogic.com/
- JSONForms React integration and UI schema: https://github.com/eclipsesource/jsonforms
- React JSONSchema Form (RJSF): https://github.com/rjsf-team/react-jsonschema-form
- Ajv JSON Schema validator: https://github.com/ajv-validator/ajv
