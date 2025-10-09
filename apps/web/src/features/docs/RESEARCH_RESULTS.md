# Research Result

# Designing a Dynamic Multi‑Step Form Workflow System

This document provides a comprehensive research plan and architectural blueprint for building a dynamic, TypeScript-first, multi-step workflow and form system. The system will support conditional branching, a fluent domain-specific language (DSL), JSON serialization, schema-driven validation, and a runtime engine that runs in both the browser and Node.js. It consolidates background research, compares design options, and proposes a phased implementation plan.

## Goals, Deliverables, and Non‑Goals

**Goals:**

- Provide a developer-ergonomic TypeScript DSL to define workflows (steps, fields, branching) with strong static types and easy maintainability.
- Define a canonical JSON representation of workflows for persistence, transport, versioning, and interoperability with UI renderers and validators.
- Implement an execution engine that evaluates conditions and dynamically routes between steps based on user input.
- Enable schema-driven validation of form data with a design that preserves annotations (for help text, etc.) and supports round-tripping between JSON and code.
- Support a pluggable front-end form renderer that can generate UI from the JSON workflow configuration.
- Optimize the system for change: adding new fields, operators, or transitions should not break existing flows (extensible and backward-compatible design).

**Deliverables:**

- **Workflow definition model:** TypeScript interfaces and a JSON Schema for the workflow model (steps, fields, transitions, conditions).
- **Fluent TypeScript DSL:** A library to define workflows in code, which produces the canonical JSON model and can also re-hydrate from JSON.
- **Execution engine adapter:** A runtime that consumes the JSON workflow and drives step transitions (likely built on XState statecharts).
- **Validation layer:** JSON Schema-based validation (using Ajv) for form data and for the workflow definition itself, with possible integration of Effect Schema for static types and decoding.
- **UI rendering adapters:** Integration with a form renderer library (such as JSONForms or RJSF) that can automatically generate forms for each step from the JSON Schema, with support for custom widgets/renderers.
- **Versioning and migration tools:** Strategy and tooling to handle version upgrades of workflow definitions and migrating in-progress workflow instances.

**Non-Goals (initial phase):**

- Building a full visual drag‑and‑drop workflow editor (this can be a future enhancement leveraging the same JSON model).
- Allowing arbitrary user-defined JavaScript functions in the JSON configuration (all logic remains data-only for safety and serializability).

## Core Questions to Answer

1. **Graph vs. FSM:** What structure best represents the flow of steps with conditional branching? Should we model the workflow as a directed graph of step nodes, or as a Finite State Machine/Statechart? And how will this structure be serialized to JSON?
2. **DSL design:** How do we design a fluent TypeScript DSL that ensures type-safe references to step IDs and step data (to catch errors at compile time), while still being able to serialize the workflow to pure JSON?
3. **Schema strategy:** What schema definition approach should we use for form data at each step – e.g. *Effect Schema* vs. *Zod* vs. *io-ts* vs. pure JSON Schema? How do we ensure that any annotations and constraints are preserved through serialization (round-trip between code and JSON)?
4. **Conditional logic:** How do we represent conditional branching logic in a serializable way for JSON? For example, should we use a library like JsonLogic for conditions? How do we evaluate these conditions safely on client and server at runtime?
5. **Execution engine:** Should we implement a custom workflow engine or leverage an existing state machine library like XState? How will we handle guard conditions, actions, and persistence of state (e.g. allowing a user to resume a partially completed workflow)?
6. **Renderer:** Which form rendering library should we integrate with (e.g., JSONForms vs. React JSONSchema Form)? How will we handle dynamic visibility of fields, custom layouts, and UI schema considerations in the chosen renderer?
7. **Versioning and migration:** How will we version the workflow definitions and manage migrations for workflows that are long-lived or in-flight when definitions change?
8. **Monorepo and packaging:** How should we organize the code (likely a monorepo with bun and TypeScript project references)? How will we structure the packages (e.g., separate packages for DSL, runtime, renderer, etc.) and manage build/compile steps efficiently?

## Architecture Overview (Proposed)

### High-Level Components

- **Workflow Model:** A canonical JSON structure representing the workflow definition. This includes the list of steps (each with an ID, schema, etc.), transitions between steps (with conditions), the initial step, and metadata. This JSON model is the single source of truth for the workflow’s logic.
- **TypeScript DSL:** A fluent API that developers use to build the workflow model in code. The DSL will output the canonical JSON model and should also allow re-loading from JSON to an in-memory representation for execution or editing. The DSL provides compile-time safety by leveraging TypeScript’s type system so that references to steps and fields are validated.
- **Validation Layer:** A schema-driven validator for both the workflow definitions and the user input at each step. We will use JSON Schema (draft 2019-09 or 2020-12) as the format for step data schemas and Ajv as the validation engine. The workflow definition itself will also have a JSON Schema for validation. (Effect Schema may be used in the DSL for developer convenience, as discussed later.)
- **Conditional Logic Engine:** A mechanism to evaluate branching conditions. This will likely be based on JsonLogic (a small rules engine format) to represent conditions in JSON. JsonLogic rules can be evaluated in a safe, deterministic way on both frontend and backend[jsonlogic.com](https://jsonlogic.com/#:~:text=1.%20Terse.%202.%20Consistent.%20%60%7B,no%20write%20access%20to%20anything). We will maintain a curated set of allowed operations for these rules (no arbitrary code execution).
- **Execution Engine:** A runtime component that takes the workflow JSON and manages the state machine as the user progresses through the form steps. We propose using XState to interpret the workflow as a statechart, because XState provides a robust, well-tested foundation for state management (with support for guards, actions, parallel states, history, etc.). The execution engine will handle moving from one step to the next based on transition conditions, and it will maintain the workflow state (current step and context of answers) which can be serialized for persistence.
- **UI Renderer:** A front-end component that renders the actual forms for each step. The renderer will consume the JSON Schema (and optional UI schema) for the current step and generate a form UI with input fields, using a library such as JSONForms or React JSONSchema Form (RJSF). This component will also handle conditionally showing/hiding fields within a step if needed, based on rules or a UI schema.

### Key Principles

- **Separation of Concerns:** We will separate the *definition* of the workflow (what the steps are and what the logic is) from the *execution* (how the workflow runs) and from the *presentation* (how the form is rendered to users). This means the JSON workflow model is purely declarative (no code), the execution engine interprets that model, and the UI layer is interchangeable. Notably, XState enforces a separation of a machine’s static config (states, events, transitions) from the dynamic implementation (guards, actions)[stately.ai](https://stately.ai/docs/xstate-v4/xstate/basics/options#:~:text=Statecharts%20require%20that%20a%20machine,its%20states%2C%20events%20and%20transitions), which aligns with our approach.
- **Data-First Design:** The canonical representation is data (JSON), not code. All logic (conditions, state transitions, validation rules) will be captured in data structures. This makes it easier to version, persist, and inspect the workflows, and also helps with portability (in the future, the workflow could be designed or edited by non-developers via a UI).
- **Safe and Portable Logic:** We will avoid any use of `eval` or serialization of actual code in JSON. Conditional logic will be represented as data (e.g. JsonLogic expressions), which are safe to evaluate and have no side effects[jsonlogic.com](https://jsonlogic.com/#:~:text=1.%20Terse.%202.%20Consistent.%20%60%7B,no%20write%20access%20to%20anything). This ensures that workflows can be safely shared between front-end and back-end and even stored in databases without security risks. Because the rules are in JSON, they can be validated, transformed, or even generated via tools, and are easily portable across environments[news.ycombinator.com](https://news.ycombinator.com/item?id=42483871#:~:text=%28guards%2C%20actions%20etc,and%20mock%20a%20program%20between).
- **Extensibility:** The system should be built with extension points. For example, it should be easy to add new field types or custom validation keywords in the JSON Schema, or to register new operators for conditions. The TypeScript DSL should allow extending with custom step or field definitions. The renderer should allow plugging in custom UI components for certain field types.
- **Change Resilience:** Workflows will evolve over time. Our design will emphasize backward compatibility and versioning. Adding a new step or new branch should not break existing saved workflows. The JSON model will be versioned, and we will provide migration strategies to upgrade older workflow definitions or state snapshots to newer versions.

## Workflow Representation: Graph vs. State Machine

**Options:** There are two main ways to conceptualize the workflow structure:

- *Directed Graph (graph of steps):* Each step is a node, and transitions (with conditions) are edges connecting one step to another. This model is straightforward for visualization and understanding branching logic as a flowchart/graph. However, we would need to implement a custom interpreter to walk the graph and evaluate conditions.
- *Finite State Machine/Statechart:* Model the workflow as a state machine where each step is a state, and conditional transitions are state transitions (with guards). XState is a library that can represent this in a JSON or JavaScript configuration. A statechart can naturally express conditional transitions (guards) and more complex patterns (like nested states or parallel states) if needed.

**Recommendation:** Use a hybrid approach: **define our own workflow graph model in JSON, but utilize XState to execute it**. In practice, the canonical JSON will represent steps and transitions (like a graph), and at runtime we will generate an XState machine from this model. This gives us the best of both worlds: we maintain a simplified graph definition for clarity, and leverage XState’s robust runtime semantics for execution. XState provides well-defined semantics for guards (conditions), actions, and state persistence, and it has a rich ecosystem of tools. By generating the XState machine at runtime, we avoid hand-writing low-level machine configurations and instead focus on our higher-level model.

- *Justification:* XState has proven capabilities for complex workflows and supports serializable state out of the box. Statecharts in XState can be persisted and later restored from a JSON snapshot of the state (state value and context). Indeed, XState’s design separates the machine’s config (states, events, transitions) from its implementation (functions for guards/actions)[stately.ai](https://stately.ai/docs/xstate-v4/xstate/basics/options#:~:text=Statecharts%20require%20that%20a%20machine,its%20states%2C%20events%20and%20transitions). We will capitalize on this by keeping our workflow logic in data form (the JSON model) and injecting minimal code as needed for evaluation. Since XState allows guards to be specified as functions in the machine options, we will use a generic guard function that interprets our JSON logic conditions; this way, the decision logic remains data-driven and serializable.
- *Guards in XState:* Normally, XState guard conditions are implemented as JavaScript predicate functions provided in the machine options[stately.ai](https://stately.ai/docs/xstate-v4/xstate/basics/options#:~:text=Guards). We want to avoid embedding code in our persisted model. Instead, each transition in our JSON model will carry a JsonLogic condition object. At runtime, the XState machine will use a single generic guard function that evaluates the JsonLogic rule attached to a transition. This means our machine configuration remains pure data (with a reference to the guard name and the rule), and the actual guard checking happens via our interpreter function. (Notably, XState cannot serialize function guards to JSON, which is why we design our machine to not depend on any pre-defined function references in the persisted config.)
- *Serialization:* The workflow JSON (graph model) is our source of truth. XState will be an execution detail. We will not attempt to store or version the entire XState machine definition. Instead, we always have the ability to re-generate an XState machine from the workflow JSON when needed. This ensures portability and ease of debugging. An advantage of having the workflow logic in JSON is that it can be easily validated, transformed, and passed around between systems[news.ycombinator.com](https://news.ycombinator.com/item?id=42483871#:~:text=%28guards%2C%20actions%20etc,and%20mock%20a%20program%20between), making our system more interoperable.

In summary, **we treat the workflow as a directed graph in design, but execute it via an XState statechart**. This provides clarity in the definition and power in execution. We will create a JSON Schema to formally describe the workflow JSON structure (see next section), which will serve as a contract for what a valid workflow definition looks like.

## Canonical Workflow JSON Model (v1 Proposal)

We define a **canonical JSON structure** that captures the workflow. Below is a proposal for the shape of this JSON model (version 1):

**Top-Level Workflow Properties:**

- **id:** *string* – Unique identifier for the workflow (could be a UUID or human-friendly slug).
- **version:** *string* – A version identifier (e.g., semantic version) for the workflow definition format or the specific workflow content (e.g., `"1.0.0"`). This helps with migration and compatibility.
- **initial:** *string* – The step ID of the starting step of the workflow.
- **steps:** *array* – A list of Step objects (see Step definition below) that make up the workflow.
- **transitions:** *array* – A list of Transition objects (see Transition definition below) defining the possible moves between steps.
- **metadata:** *object (optional)* – Arbitrary key-value annotations about the workflow (e.g., title, description, category, etc., for human context or organizational purposes).

**Step Properties:** Each step represents a form (or an action) in the workflow. A Step object contains:

- **id:** *string* – Unique identifier of the step. This is what transitions will reference as `from` or `to`.
- **title:** *string (optional)* – Human-readable title for the step (to display to users).
- **description:** *string (optional)* – Additional description or help text for the step.
- **schema:** *object* – A JSON Schema (Draft 2020-12) defining the expected shape of the data (form fields) for this step. This includes the fields, their types, and validation constraints. Each property in the schema corresponds to an input field in the form.
- **uiSchema:** *object (optional)* – A UI schema providing layout or UI hints for the renderer. For example, this could specify the order of fields, grouping of fields, or widget types. (The UI schema is particularly relevant for integration with JSONForms or RJSF.)
- **annotations:** *object (optional)* – Arbitrary metadata for the step (could include things like internal tags, or any extension data needed by custom logic).

**Transition Properties:** Transitions define the movement from one step to another when a step is completed. A Transition object contains:

- **from:** *string* – The step ID from which this transition originates.
- **to:** *string* – The step ID to which this transition leads if the condition is satisfied.
- **when:** *object (optional)* – A condition expressed as a JsonLogic rule (or similar) that determines if this transition should be taken. The rule will be evaluated against the **evaluation context** (described below). If no `when` condition is provided, the transition is treated as an unconditional/default transition from that step.
- **priority:** *number (optional)* – A numeric priority to resolve conflicts if multiple transitions from the same step could be valid at the same time. A lower number could indicate higher priority (or vice versa, depending on convention). This helps ensure deterministic selection among multiple possible outgoing paths.
- **metadata:** *object (optional)* – Annotations or labels for the transition (e.g., to indicate in human terms what the branch represents, which can be useful for documentation or analytics).

**Evaluation Context:** The context in which transition conditions (`when` rules) are evaluated will include:

- **answers:** *object* – A map of step IDs to the answers (data object) provided for those steps. Essentially, this is the aggregate of all data collected so far in the workflow (the workflow’s state).
- **currentStepAnswers:** *object* – The answers from the current step being submitted (this could also be part of `answers`, but it may be convenient to reference the latest input directly).
- **externalContext:** *object (optional)* – Any external data or context that the host application provides to influence the workflow. For example, user profile data or environment data that is not collected via the form but could affect branching logic.

Using this evaluation context, a transition’s `when` condition (JsonLogic rule) can, for example, check `{"var": "answers.start.action"}` to route based on an earlier answer, or inspect `externalContext` like a user’s role. We will ensure that the JsonLogic evaluator has access only to a controlled subset of this context (no global variables or code execution, only the data we pass in).

**Default Transitions:** If a step has multiple transitions defined, the engine will evaluate them in order of priority. We allow a way to specify a default transition to cover the case when no condition matches. This can be done by either: having a transition with no `when` (interpreted as an “always” path), or using a JsonLogic rule that is always true (like a rule that is simply `true`). For clarity, we might encourage explicitly marking a transition as default. In our model, if a step’s transitions are all conditional, we will require one catch-all condition (or else the step could be a dead-end). If a step has no outgoing transitions at all, it is treated as a terminal step of the workflow.

This JSON model will be formalized in a JSON Schema (a meta-schema for workflows) so that workflow definitions themselves can be validated. The aim is to keep this model relatively simple and data-only, so it’s easy to inspect and version. By having a schema for the workflow definition, we can validate at design-time or load-time that a given workflow JSON is well-formed (e.g. all `from`/`to` references are valid step IDs, no duplicate step IDs, etc.).

## Conditional Logic Representation

**Recommendation:** Use **JsonLogic** to represent conditional logic in the workflow, as it provides a JSON-based, safe way to express rules. JsonLogic rules are JSON objects that represent boolean expressions. For example, a rule `{"==": [ { "var": "action" }, "Move" ]}` means “the `action` field equals 'Move'”. This approach has several benefits:

- **Serializable & Shareable:** Since conditions are pure data (no custom code), they can be serialized to JSON, stored, and transmitted. This aligns with our data-first approach where even the logic is in JSON form. It means workflows (with their branching rules) can be saved in a database or sent over an API without special handling.
- **Safe Evaluation:** The JsonLogic interpreter (e.g., the `json-logic-js` library) evaluates these rules without using `eval` and without allowing side effects. As the JsonLogic documentation notes, it has no loops, no functions, and no ability to mutate data; it never invokes arbitrary code[jsonlogic.com](https://jsonlogic.com/#:~:text=1.%20Terse.%202.%20Consistent.%20%60%7B,no%20write%20access%20to%20anything). Rules only have read access to the data provided and cannot perform disallowed operations. This is essential for security when the logic might come from an external source or untrusted input.
- **Cross-Environment Consistency:** We can run the same JsonLogic rules in the browser and on the server (there are implementations in many languages). This ensures that branching logic is consistent across client-side navigation and server-side validation or processing. We avoid duplicating logic in two places (one in UI, one on server) because the rule itself can be shared.
- **Extensibility of Conditions:** JsonLogic comes with a basic set of operators (`==`, `<`, `>`, `and`, `or`, etc.) and we can register custom operators if needed. We will maintain an allow-list of operators to avoid any that might be unsafe or non-deterministic. For instance, if JsonLogic offered a math random operator (it doesn’t by default), we’d disallow that for determinism. We can also add domain-specific operators in a controlled manner if required. By default, we will likely stick to core operators and perhaps a few custom ones (like a string contains, etc.).
- **Validation of Rules:** We will define a JSON Schema for the allowed shape of our JsonLogic conditions (i.e. which operators and patterns are permitted). This means whenever a workflow JSON is loaded, we can validate that all `when` conditions conform to the allowed pattern (no unexpected keys or dangerous constructs). This static validation is an additional guardrail to ensure we only execute safe logic.

**Usage in our system:** Each transition in the workflow JSON will have a `when` property containing a JsonLogic rule (object). At runtime, when moving out of a step, the engine will evaluate each transition’s rule by calling `jsonLogic.apply(rule, evaluationContext)`. The first transition whose rule returns truthy (after sorting by priority) will determine the next step. If none match and there is a default transition, we take the default. If none match and no default is specified, the workflow might end or throw an error (we will define this scenario as an invalid workflow definition to be caught in testing).

By using JsonLogic, we ensure the logic is transparent and testable. We could even build a small library of common condition snippets or a TypeScript helper API so that developers don’t have to hand-write JSON for logic. For example, a helper like `whenEquals('action', 'Move')` could internally produce the JsonLogic JSON for equality. This would be a developer-experience enhancement on top of the core system.

**Example:** Suppose we have a step "start" with a field `"action"` that can be `"Move"`, `"Consume"`, or `"Adjust"`. We want to branch to different steps based on this action. In our workflow JSON, we might have:

```json
json
Copy
"transitions": [
  { "from": "start", "to": "moveDetails",
    "when": { "==": [ { "var": "answers.start.action" }, "Move" ] } },
  { "from": "start", "to": "consumeDetails",
    "when": { "==": [ { "var": "answers.start.action" }, "Consume" ] } },
  { "from": "start", "to": "adjustDetails",
    "when": { "==": [ { "var": "answers.start.action" }, "Adjust" ] } }
]

```

And perhaps a default transition from "start" to an "end" step if none of those matched (though in this example, one will always match because the field is required and must be one of the three values).

In summary, **JsonLogic** offers a safe, declarative way to encode our conditional branching. We will use the official `json-logic-js` library for evaluation of rules. To maintain safety:

- We will **not** allow any form of dynamic code execution in conditions.
- We will sanitize the input data that goes into `jsonLogic.apply` (for example, ensure no special object prototypes are present that could cause issues).
- We will document the allowed operators and provide utilities for writing these rules in code to reduce errors in manual JSON writing.

## Schema and Validation Strategy

Each workflow step needs to define a schema for the data it collects (the form fields). Our strategy must ensure type safety for developers, robust runtime validation of inputs, and the ability to persist and transmit these schemas.

**Schema Definition Approaches:** We considered a few options for authoring and using schemas in a TypeScript environment:

- **Effect Schema (from the Effect-TS library):** A newer schema library that can define codecs (bidirectional transformations) and generate JSON Schemas from its definitions. It provides powerful features like branded types, annotations, and integration with functional programming paradigms. Notably, `@effect/schema` has a `JSONSchema` module that can produce a JSON Schema object from an Effect Schema definition[effect.website](https://effect.website/docs/schema/json-schema/#:~:text=). This means we could define a schema in TypeScript (with full type inference) and then serialize it for use in our JSON model. A caveat is that converting arbitrary JSON Schema back into an Effect Schema is not generally supported, so the flow is one-directional (code -> JSON). We would treat the JSON Schema as canonical after generation.
- **Zod or io-ts:** These are popular TypeScript runtime schema validators (Zod being very developer-friendly, io-ts more functional). Both can define shapes and validate data at runtime. However, they either lack first-class JSON Schema generation (Zod has community projects for it; io-ts doesn’t natively output JSON Schema) or have limitations in round-trip conversion. Using them might require maintaining parallel JSON Schemas or adopting additional tools to convert, which introduces risk of mismatch or additional build steps.
- **TypeBox:** A library that lets you define a schema in code and *automatically infers* the TypeScript type while *producing JSON Schema*. It’s essentially a JSON Schema builder for TypeScript, similar in spirit to what we want. The trade-off is that it might not have as rich runtime validation as Effect Schema, but it ensures the JSON Schema and TypeScript types stay in sync by construction[thisdot.co](https://www.thisdot.co/blog/end-to-end-type-safety-with-json-schema#:~:text=,be%20compiled%20to%20JSON%20Schema).
- **Pure JSON Schema with Ajv:** We could write JSON Schema directly for each step’s data structure and use Ajv to validate. This is the most direct approach: JSON Schema is the standard for describing JSON data shapes, and Ajv is a powerful validator. Writing JSON Schema by hand gives full control and is immediately serializable (since it’s already JSON). The downside is developer experience: JSON Schema syntax is verbose and not as integrated with TypeScript’s type system (though we can use `json-schema-to-ts` or similar to derive types from schemas if needed).

**Recommendation:** Use **JSON Schema (Draft 2020-12)** as the canonical format for step schemas, and use **Ajv** for validation at runtime. To aid developer experience in writing these schemas, allow the use of a code-first approach (like Effect Schema or TypeBox) in the DSL to define the shape of step data in a type-safe way, then derive the JSON Schema from that definition.

- During development, a developer can write an Effect Schema for a step’s input (with full static type inference and compile-time checks) and then call `JSONSchema.make()` to get the JSON Schema object for that step[effect.website](https://effect.website/docs/schema/json-schema/#:~:text=). We attach this JSON Schema to the workflow model. This way, the developer gets static type checking (the TypeScript type of the form data) and we still end up with a JSON Schema for the engine and UI.
- The JSON Schema is stored in the workflow JSON and is the source of truth for validation. We do **not** need to convert this JSON Schema back into an Effect Schema at runtime. Instead, we use Ajv to validate user data against it. If we need to parse or transform data (e.g., coerce strings to numbers), Ajv can handle some of that (Ajv has options for coercion and defaults), or we could do a post-validation transformation if necessary.
- By making JSON Schema the lingua franca, we ensure compatibility with a wide range of tools. Ajv has excellent support for the latest JSON Schema drafts and even JSON Type Definition (JTD)[github.com](https://github.com/ajv-validator/ajv#:~:text=The%20fastest%20JSON%20schema%20Validator,RFC8927). It supports all necessary features: references (`$ref`), custom keywords, conditional subschemas, etc. Ajv is also highly performant – it compiles schemas to fast JavaScript functions for validation[github.com](https://github.com/ajv-validator/ajv#:~:text=The%20fastest%20JSON%20schema%20Validator,RFC8927), and is considered one of the fastest JSON Schema validators available.

**Round-trip and Annotations:** One challenge is round-tripping between code and JSON Schema. We likely won’t attempt a full automated round-trip (i.e., take an arbitrary JSON Schema and produce code types automatically at runtime). Instead, our flow is one-directional (code -> JSON Schema) for development, and then use the JSON Schema at runtime. If a workflow JSON is edited or originates outside of code, we can still use Ajv to validate it or even generate a TypeScript type from the JSON Schema using codegen tools. In other words, JSON is the source of truth, and any code definition is just a means to get there initially. This approach of either code-first or schema-first (but not both simultaneously) is common[thisdot.co](https://www.thisdot.co/blog/end-to-end-type-safety-with-json-schema#:~:text=,be%20compiled%20to%20JSON%20Schema), and we choose a code-first generation for developer convenience.

We will also ensure that *annotations* in the schema (like field descriptions, labels, examples) are preserved through the process. Effect Schema allows adding annotations (e.g. `.withDescription("...")`) that get carried into the JSON Schema. We will leverage that so that things like field help text or placeholder can be authored once in code and appear in the JSON Schema for the UI to use. For anything not expressible via the code library, we can post-process the JSON Schema object (for example, add a `description` property manually if needed).

**Ajv Integration:** We will set up Ajv validators for each step’s schema. Likely, we will compile schemas once when the workflow is loaded. Ajv supports all needed features, including the latest draft-2020-12 of JSON Schema which we plan to use[github.com](https://github.com/ajv-validator/ajv#:~:text=The%20fastest%20JSON%20schema%20Validator,RFC8927). Draft-2020-12 includes useful features for forms, such as the `dependentRequired` and `dependentSchemas` (formerly "dependencies") improvements and more powerful conditionals. Ajv will be configured in strict mode (to catch schema mistakes) and we will use it to not only validate user input but also to validate our workflow JSON (against the workflow meta-schema).

In summary, we will **define step data schemas in code using a library like Effect Schema or TypeBox, generate JSON Schemas for inclusion in the workflow JSON, and use Ajv for runtime validation**. The **JSON Schema is the canonical contract** for each step’s data. This approach balances developer experience (with TypeScript type safety during design) and system reliability (with a standard schema for runtime). It avoids the pitfalls of trying to convert arbitrary JSON Schema back into code, which is a complex problem with no general solution (projects typically choose either to generate types from schemas or schemas from code, and we have chosen the latter path for now[thisdot.co](https://www.thisdot.co/blog/end-to-end-type-safety-with-json-schema#:~:text=,be%20compiled%20to%20JSON%20Schema)).

## Execution Engine Design (XState Adapter)

The execution engine is responsible for taking the static workflow definition (JSON) and managing the active flow as the user proceeds through it. We plan to implement this as an **adapter that generates an XState state machine from the workflow JSON**.

### Approach

- **Machine Generation:** For a given workflow JSON, we will programmatically construct an XState machine configuration. Each step in the workflow becomes a state in the statechart, and each transition in the workflow becomes a state transition (with a guard) in the machine config. The initial state of the machine will be the workflow’s `initial` step. We can represent each step as an *atomic state* (since each step is like a distinct form page). We likely won’t need nested states for the initial implementation (unless we later introduce sub-workflows, which is advanced). The machine config will be a direct reflection of the `steps` and `transitions` defined in the JSON.
- **Guards Implementation:** As discussed, we will use a generic guard function to handle all conditional transitions. In XState, a transition can be specified with a `cond` (condition) that refers to a guard implementation by name[stately.ai](https://stately.ai/docs/xstate-v4/xstate/basics/options#:~:text=Guards). We will define a guard (e.g., named `"evaluateCondition"`) once in the machine options. Each transition in the machine config will reference this guard, and we’ll attach the specific JsonLogic rule via XState’s `meta` or `data` on that transition. For example:

    ```jsx
    javascript
    Copy
    // Pseudocode for a state with conditional transitions
    states: {
      start: {
        on: {
          NEXT: [
            { target: 'moveDetails', cond: 'evaluateCondition', meta: { rule: { "==": [ {"var":"answers.start.action"}, "Move" ] } } },
            { target: 'consumeDetails', cond: 'evaluateCondition', meta: { rule: { "==": [ {"var":"answers.start.action"}, "Consume" ] } } },
            { target: 'adjustDetails', cond: 'evaluateCondition', meta: { rule: { "==": [ {"var":"answers.start.action"}, "Adjust" ] } } }
          ]
        }
      },
      // ... other states
    }

    ```

    And in the machine options:

    ```jsx
    javascript
    Copy
    guards: {
      evaluateCondition: (context, event, { cond, state }) => {
        const rule = cond.meta.rule;
        return jsonLogic.apply(rule, buildEvaluationContext(context));
      }
    }

    ```

    In this scheme, every conditional transition uses the same guard function (`evaluateCondition`), and we rely on XState’s ability to pass the guard meta (where we stored our rule) to the guard function. The `buildEvaluationContext(context)` would prepare the `answers` and `externalContext` from the machine’s context for the JsonLogic evaluation. By doing this, **the decision logic remains data-driven** and we don’t embed individual predicate functions in the machine definition.

- **Context Structure:** The XState machine’s context will hold the dynamic data of the workflow execution. Key parts of context include:
    - `answers` – an object mapping step IDs to the answers given for those steps.
    - Perhaps a `currentStep` (though XState’s own state value indicates this, it might be convenient to duplicate in context).
    - Any `externalContext` we need (injected at machine startup).
    - Possibly a reference to the workflow `id` or definition version for debugging.

    When a user submits a step’s form, we will send an event (e.g. `NEXT` with payload) to the machine. We’ll have an XState action on that event to validate and then assign the payload into `context.answers` under the appropriate step ID. If validation fails, we won’t send the event (or we can design the machine to handle a `NEXT_INVALID` event to stay in place). XState provides an `assign` utility to update context in an immutable, safe way.

- **Actions:** We will define XState actions for tasks like assigning form data to context and any other side effects. Our goal is to keep side effects minimal:
    - On a `NEXT` (submit) event in a state, an action will run to validate the data (using Ajv with the step’s schema) and, if valid, save it to `context.answers`. If invalid, we might prevent the transition (possibly by guarding the `NEXT` event itself or by not sending `NEXT` at all from the UI until valid).
    - On entering a new step state, we could execute an action (e.g., to initialize some default values or log an event for analytics). These actions can be configured in the machine, but many UI-related effects (like focusing the first field) will be handled in the presentation layer rather than in the machine logic.
    - On reaching a terminal step (end of workflow), we might trigger an action that calls a callback to notify the application that the workflow is complete (with the collected data).

    We will likely use XState’s built-in mechanisms for actions and context updates rather than a lot of custom code, to leverage its reliability.

- **Persistence:** One advantage of XState is that the state (the active state and context) is serializable. We will leverage this for persistence. For instance, to allow a user to save progress and resume later, we can serialize the XState service’s state. This typically involves capturing the machine’s state value (which state it’s in) and the context (answers given so far). XState can provide a `state.toJSON()` or we can manually store `{ value: state.value, context: state.context }`. To resume, we can take that saved state and use XState’s `State.create` or a similar API to restore a State, then start a new service with that state. We must ensure the workflow definition version matches or migrate the state if not (discussed in versioning). The key point is the machine’s state and context are plain data, so we can persist them easily (e.g., in localStorage or a database).
- **History & Backtracking:** In the initial implementation, we will likely treat the workflow as moving forward only (like a typical form wizard). We might not implement a back button or arbitrary jumping between steps unless explicitly needed. However, our model could allow it by including transitions that go backward. If back navigation is a requirement, we can either manage it by storing a stack of visited steps or by leveraging XState’s history state feature. For MVP, we keep it simple and forward-moving.
- **Error Handling:** We will design the engine such that any error in processing (like an unexpected missing transition) is handled gracefully. If a step has no valid outgoing transition at runtime, the engine might consider the workflow finished or throw an error. We will enforce via validation that every non-terminal step has at least one outgoing path defined. If our guard function throws (for example, if a JsonLogic rule is malformed), we will catch that and treat it as the condition being false (and log an error for developers). Essentially, the engine should not crash on a user due to a workflow logic issue; it should fail safely or end the flow.

By using XState under the hood, we benefit from its well-tested state handling and can integrate with its ecosystem (like XState visualizer or devtools for debugging). Importantly, XState’s approach of separating static config from dynamic options (like guard implementations) allows us to generate the config from our JSON and supply the generic guard logic separately[stately.ai](https://stately.ai/docs/xstate-v4/xstate/basics/options#:~:text=Statecharts%20require%20that%20a%20machine,its%20states%2C%20events%20and%20transitions)[stately.ai](https://stately.ai/docs/xstate-v4/xstate/basics/options#:~:text=Guards). This matches our need to keep the workflow definition purely declarative.

### Persistence and Resilience

We want the execution engine to support pausing and resuming workflows, as well as to be resilient to changes:

- **State Persistence:** After each step completion, or at certain checkpoints, we can serialize the current state (state value + context) and store it. For a client-side app, this could be localStorage or IndexedDB. For a server-managed flow, it could be a database record keyed by user or session. The stored snapshot, combined with a version of the workflow definition, allows resuming later by re-loading the definition and restoring state.
- **Resuming Execution:** To resume, we load the workflow definition (perhaps from the same version as when it was saved) and recreate the XState machine, then use the saved state to rehydrate it. XState’s `interpret(...).start(state)` can start a service from an existing state. We will need to ensure that the machine definition we generate is identical to the one that produced the saved state (hence the importance of versioning).
- **Version Mismatch:** If the workflow definition has changed since the state was saved, we have a couple of options. If we stored the exact version or even the original definition with the state, we could either (a) continue using the old definition to complete the flow, or (b) migrate the state to the new definition structure. For MVP, a simple strategy is to detect the mismatch and either warn the user or start over. In later iterations, we can implement state migration logic for certain compatible changes (see Versioning section).

By designing the engine with these considerations, we aim to make the workflow system robust for real-world use where users might abandon and return later or where definitions might evolve.

Additionally, using XState opens up future possibilities like invoking external services during a step (e.g., to fetch data or trigger an API when entering a step) and using XState’s ability to manage such side effects. Though our initial scope keeps the steps user-driven and synchronous, our architecture won’t preclude adding such capabilities later.

## Renderer Strategy (UI Rendering of Forms)

The front-end form renderer will dynamically generate the UI for each step based on the step’s schema (and optional UI schema). We need a solution that can interpret JSON Schema and render appropriate form fields, handle user input and validation, and react to dynamic conditions (like showing/hiding fields).

Two leading contenders we identified are **JSONForms** (by EclipseSource) and **React JSONSchema Form (RJSF)**. Both are capable libraries with slightly different philosophies:

**Primary Choice – JSONForms:** We lean towards using JSONForms for the following reasons:

- **Schema + UI Schema Approach:** JSONForms cleanly separates the data schema (JSON Schema) from the UI schema (presentation hints and rules). This fits perfectly with our schema-first approach. It will generate form fields for each schema property by default, and we can control layout and visibility via the UI schema.
- **Dynamic Rule Support:** JSONForms has built-in support for *rules* that allow dynamic behaviors such as hiding or disabling fields based on conditions on the data[jsonforms.io](https://jsonforms.io/docs/uischema/rules/#:~:text=Rules%20allow%20for%20dynamic%20aspects,or%20disabling%20UI%20schema%20elements). These rules are specified in the UI schema as conditions (which themselves are JSON Schemas evaluated against the form data). For example, you can say: *if property X has value "No", hide property Y*. JSONForms will listen to changes and automatically apply the effect (HIDE, SHOW, ENABLE, DISABLE) when the condition matches[jsonforms.io](https://jsonforms.io/docs/uischema/rules/#:~:text=Rules%20allow%20for%20dynamic%20aspects,or%20disabling%20UI%20schema%20elements)[jsonforms.io](https://jsonforms.io/docs/uischema/rules/#:~:text=A%20rule%20basically%20works%20by,effect). This means for within-step conditional logic, we have a mechanism out-of-the-box.
- **Validation Integration:** JSONForms uses Ajv for validating the form data against the JSON Schema. This means our schema constraints (required fields, patterns, min/max, etc.) will automatically produce validation messages in the UI without extra effort. We can use the same Ajv instance for both the engine and JSONForms to ensure consistency of validation rules.
- **Customizability:** JSONForms is designed to be extended. We can register custom renderers for specific schema elements or custom controls. For example, if we have a custom field type (say a multi-select dropdown or a file uploader), we can implement a renderer for it and JSONForms will use it when it encounters that schema pattern or UI schema hint. This extensibility is important for integrating with design systems or handling complex fields.
- **Multi-Framework Support:** JSONForms has bindings for React (the one we will use), as well as Angular and Vue. While we will start with React, it’s good to know that the core concepts are not tied to React and could be used elsewhere if needed.

Using JSONForms, our renderer workflow will be:

1. For the current step, take its JSON Schema (and possibly a UI schema) from the workflow definition.
2. Pass these to the `<JsonForms>` React component (from `@jsonforms/react`) along with:
    - An `data` object (the current answers for that step, or an empty object if new).
    - An `onChange` handler to update local state as the user edits fields.
    - The Ajv validator (pre-configured with the schema) for validation.
    - Renderers and cells (if using custom ones or the provided material UI set).
3. JSONForms will render the form. We can configure whether validation happens live or only on submit. Likely, we validate on blur or on submit to avoid overwhelming the user with errors while typing.
4. The user fills in the form. On clicking "Next" (or submit), we trigger our workflow engine’s `NEXT` event. We can call JSONForms’ `validate()` to double-check, or rely on Ajv/JSONForms having updated an `errors` state.
5. If validation passes, the engine transitions to the next step. We then unmount or reset JSONForms with the new step’s schema.

We will create a React component (within our `@beep/workflow-renderer-jsonforms` package) that wraps this logic. For example, a `<WorkflowFormRenderer>` component that takes a reference to the running workflow (or current step info) and internally uses JSONForms to render and handle submission.

**Alternative – React JSONSchema Form (RJSF):** We also consider RJSF as an option or backup:

- RJSF is a popular library that also generates forms from JSON Schema. It tends to be monolithic (one schema in, one form out, with optional UI schema for customization). It supports validation (also via Ajv in v5+), and custom widgets.
- Dynamic behavior in RJSF is typically achieved through schema constructs like oneOf, anyOf, and `dependencies`. For instance, showing extra fields based on a prior answer can be done with schema dependencies: using the `oneOf` approach where the value of a field triggers different subschemas[rjsf-team.github.io](https://rjsf-team.github.io/react-jsonschema-form/docs/json-schema/dependencies/#:~:text=Dynamic). In the RJSF documentation, they show an example: a question "Do you have any pets?" with answers "No", "Yes: One", "Yes: More than one" and then using a `dependencies` with `oneOf` to conditionally add follow-up questions for each case[rjsf-team.github.io](https://rjsf-team.github.io/react-jsonschema-form/docs/json-schema/dependencies/#:~:text=%27Do%20you%20have%20any%20pets%3F%27%3A,oneOf%3A)[rjsf-team.github.io](https://rjsf-team.github.io/react-jsonschema-form/docs/json-schema/dependencies/#:~:text=,properties%3A). This works, but it pushes logic into the schema itself and can become complex for many conditions.
- RJSF’s `uiSchema` is primarily for styling and widget selection, not for conditional logic (aside from some limited capabilities like hiding a field by not including it in the schema unless a condition is met).
- We might use RJSF if we find JSONForms is lacking in some aspect or if a team is more familiar with it. Our architecture will allow swapping the renderer with minimal changes. For example, we could implement a `@beep/workflow-renderer-rjsf` that provides a similar `<WorkflowFormRenderer>` but internally uses RJSF’s `<Form>` component.

In either case, some considerations:

- **Dynamic Fields & Layout:** We will handle dynamic showing/hiding of whole steps via the workflow transitions. Within a step, if fields need to appear/disappear based on input, JSONForms rules cover that elegantly. If using RJSF, we might encode such logic in the schema using `dependencies` or accept that the step should be granular enough to not need that.
- **Custom Widgets:** We will identify any custom field types we need (for example, a date picker). JSONForms provides a Material UI set by default; if we have a design system, we might implement custom renderers to match it. Similarly, RJSF has themes that can align with Bootstrap, Material, etc., or custom widgets.
- **Validation UX:** We plan to leverage the built-in validation from the schema. Both JSONForms and RJSF will display errors next to fields by default. We should ensure that if a user attempts to proceed with invalid data, they are shown the errors. With JSONForms, since we control the submit, we can run `validate()` or check the errors before sending the `NEXT` event.
- **Theming and Styles:** JSONForms can be used with Material UI, or we can style it ourselves. RJSF similarly can be themed. We will decide on a UI kit (Material UI is a common default, but we might adapt to our app’s style). This is more of an implementation detail for the front-end team.

For the initial implementation, **JSONForms is our choice** due to its alignment with our data-driven philosophy and built-in support for dynamic UI via rules[jsonforms.io](https://jsonforms.io/docs/uischema/rules/#:~:text=Rules%20allow%20for%20dynamic%20aspects,or%20disabling%20UI%20schema%20elements). We will implement our renderer integration with JSONForms first. We will keep RJSF in mind and potentially create an adapter for it to demonstrate flexibility.

## TypeScript DSL Design

We will design a fluent TypeScript DSL to define workflows in code. The DSL should make it easy for developers to declare steps, fields, and transitions with compile-time checks catching mistakes (like typos in step IDs or field names). It will essentially be a builder pattern that constructs the workflow model (the JSON structure described above).

**Fluent Builder API:** The DSL might be used as follows (illustrative example):

```tsx
typescript
Copy
import { Workflow, step, field, route } from '@beep/workflow-dsl';
import * as Schema from '@effect/schema/Schema';

const inventoryWorkflow = Workflow.create('Inventory Adjustment')
  .step('start', step => step
    .schema({
      action: Schema.enums(['Move', 'Consume', 'Adjust']),  // using Effect Schema
      reason: Schema.Optional(Schema.String)
    })
    .title('Start')
    .description('Select an action and provide a reason')
  )
  .step('moveDetails', step => step
    .schema({
      locationFrom: Schema.String,
      locationTo: Schema.String,
      quantity: Schema.Number
    })
    .title('Move Details')
  )
  .step('consumeDetails', step => step
    .schema({
      warehouse: Schema.String,
      quantity: Schema.Number
    })
    .title('Consume Details')
  )
  .step('adjustDetails', step => step
    .schema({
      adjustmentValue: Schema.Number,
      note: Schema.Optional(Schema.String)
    })
    .title('Adjust Details')
  )
  .step('end', step => step
    .schema({})  // end step might not collect data
    .title('Confirmation')
  )
  .transition('start', 'moveDetails', route => route.whenEquals('action', 'Move'))
  .transition('start', 'consumeDetails', route => route.whenEquals('action', 'Consume'))
  .transition('start', 'adjustDetails', route => route.whenEquals('action', 'Adjust'))
  .transition('moveDetails', 'end')
  .transition('consumeDetails', 'end')
  .transition('adjustDetails', 'end')
  .build();

```

In this hypothetical API:

- `Workflow.create('Name')` initializes a new workflow builder (optionally setting some metadata like name or version).
- `.step('stepId', step => { ... })` adds a step with the given ID. Inside the callback, we configure that step (set schema, title, etc.). Here we're using an imagined `.schema({...})` that accepts an object of Effect Schema definitions for fields, which internally will generate the JSON Schema. Alternatively, `.field(name, schema)` could be used to add fields one by one.
- `.transition(from, to, route => { ... })` adds a transition. Inside the callback, we might have methods like `.when(condition)` or helpers like `.whenEquals(field, value)` to easily set up a JsonLogic rule (in this case, generating `{ "==": [ { "var": "answers.fromStep.field"}, value ] }`). If no condition is provided, it's an unconditional transition.

**Type Safety Features:** A major goal is to leverage TypeScript’s type system to catch errors:

- The DSL can enforce that step IDs are unique and that transitions refer to existing steps. We might achieve this by having the `WorkflowBuilder` keep a union of known step IDs in its type parameters and use generic constraints on `.transition` methods.
- Field definitions can be strongly typed. If using Effect Schema or TypeBox, the TypeScript type of each step’s data can be inferred. We could potentially map step IDs to their data types in the workflow’s type, so that something like `WorkflowType['start']` gives the shape of data for step "start". This could be useful for consumers of the workflow (e.g., to know what data type to supply when programmatically interacting with it).
- The `.whenEquals('action', 'Move')` method can check that "action" is indeed a field in the `from` step’s schema, and even that "Move" is a valid value for that field (perhaps by leveraging literal types if `action` was an enum type).
- The DSL should also ensure that required fields, optional fields, etc., align with the schema definitions.

Under the hood, the DSL will construct an in-memory representation of the workflow (likely as instances of classes like `WorkflowBuilder`, `StepBuilder`, etc.). When `.build()` is called, it will produce a plain JavaScript object that matches the JSON structure (or even directly a JSON string, but probably an object that can be `JSON.stringify`-ed). This object will include the JSON Schemas for each step (already converted from Effect Schema or whichever library was used).

We will also provide the inverse operation for completeness: e.g. `Workflow.load(json)` that takes a JSON structure and returns a `Workflow` instance or a similar runtime representation (this might not reconstruct the builder chain exactly, but at least allow interacting with the loaded workflow, perhaps for editing in a future visual tool or for feeding into the engine).

**Example of Type Safety in DSL:** If a developer writes `.transition('start', 'finish')` but "finish" was never defined as a step, the DSL’s TypeScript types should produce an error. We can accomplish that by keeping track of defined step IDs in a generic type parameter. Each `.step()` call could use a conditional type to add that ID to the union of known IDs. The `.transition()` method can then be generically constrained to only accept `to` that is in that union. Similarly, for fields, we might have the `StepBuilder` carry a type that is the partial schema of that step, so that a `.whenEquals('someField', ...)` can be type-checked. This is an advanced use of TypeScript, but it is achievable and will greatly reduce runtime errors.

The DSL is all about making the workflow definitions **clear, maintainable, and safe**. Developers can use it to define complex flows without directly wrangling JSON. At the same time, by generating the JSON, we ensure the definition can be saved, versioned, and interpreted by the engine.

We'll need to document the DSL thoroughly and provide examples, since it will be a primary interface for developers using this system.

## Versioning and Migrations

Workflows and the system will evolve over time. We need a strategy for versioning workflow definitions and migrating both the definitions and any in-progress workflow instances when things change.

**Versioning Strategy:**

- Each workflow definition JSON will carry a **version** field. This version is specific to the workflow’s logic and schema. We will use semantic versioning (MAJOR.MINOR.PATCH). A change that breaks compatibility with existing instances (e.g., removing a step or changing a field’s meaning) would increment the MAJOR version. Additive changes (like adding a new optional field or a new branch that doesn’t affect old paths) might be MINOR, and minor fixes (typo corrections, description changes) might be PATCH.
- We should also maintain a **model schema version** (version of the overall workflow JSON format). For example, our entire system might define that we are on workflow JSON schema version 1. If in the future we introduce new features in the model (like a new property in transitions), that could be a schema version bump. This could be encoded separately, or we could embed it in the version (e.g., 1.0.0 might imply schema version 1). Explicitly, we might have something like `"schemaVersion": 1` in the JSON to differentiate from workflow logic version. In the initial implementation, these might coincide, but we keep the concept in mind.

**Migrating Workflow Definitions:**

- We will maintain migration scripts or functions for upgrading workflow definitions from one version to the next. For example, if version 2.0.0 of a workflow changes the ID of a step or splits a step into two, we’d write a migration function that takes a v1.0.0 definition and outputs a v2.0.0 definition (with perhaps some placeholders or default values for new pieces).
- These migration functions can be composed to migrate from any older version to the current. We could implement a simple registry where if you load a workflow JSON and its version is lower than the current, the system knows how to stepwise upgrade it. If a gap is too large (like migrating from 1.x to 3.x skipping 2), we’d apply 1->2 and then 2->3 sequentially.
- If a change is purely additive and backward-compatible, migration might just be adding default values or bumping the version number. If a change is breaking (like a field renamed), migration must handle transforming old data (e.g., copy `oldField` value to `newField`).
- We will likely store not just the version in the JSON, but maybe also keep old definitions around or have the migration logic available as part of our library. Since workflow definitions are data, one could always choose not to migrate an old definition and let existing instances finish with it while new instances use the new version. Our system should at least detect version mismatches and react appropriately (either by migrating or by disallowing mixture of versions).

**Migrating Running Workflow Instances:**

- Each saved workflow state (for an in-progress instance) should record the version of the workflow definition it is following. If we attempt to resume an instance with a newer version of the definition, we face the question of migration.
- *Forward Compatibility:* Ideally, we design workflows to be forward-compatible where possible (e.g., adding a new optional step that only new instances will go through). But if a user is mid-flow and we add a step before they reach the end, do we insert that step into their journey or skip it? This is a product decision. In many cases, you might let them finish the old version and apply changes only to new sessions.
- If we do want to migrate an in-flight instance, we have to update its data and position to fit the new definition. For example, if we inserted a new step B between A and C, and the user was at C in the old version, on migration we might decide they should complete B (if critical), or mark B as skipped. This can be very case-specific. We might provide hooks for workflow designers to handle such migrations (like define default values for new fields or decide how to handle inserted steps).
- For MVP, a simpler approach: if a workflow changes in a non-backward-compatible way, we treat in-flight instances of the old version as deprecated – either they must be completed on the old version (by keeping the old definition around), or they cannot be resumed once the system is upgraded. This isn’t ideal for a production scenario but could be acceptable in an early stage. Our plan, however, is to aim for the ability to at least continue old instances on old logic if not migrated.

**Tooling:**

- We will implement version tracking and possibly a command-line tool to assist in migrating definitions. For example, a script could take JSON files and bump them to the latest version, or validate that all required migration steps are applied.
- We will write tests for migration functions to ensure no data is lost or mis-transformed across versions.

**Example Scenario:**

Imagine a workflow v1.0 has steps A -> C (A goes directly to C). In v2.0, we introduce a new step B in between (A -> B -> C) to collect additional data.

- The definition migration will add step B and change the transition from A to point to B, then B to C.
- For a user who is halfway (just finished A and was at C in v1.0): if they try to resume under v2.0, one strategy is to detect that they haven’t done B. We could insert B as the current step before C. Since they had no data for B, we might prefill default answers or simply present the form. Alternatively, one could say that particular user continues with the old route (skip B).
- This complexity suggests that sometimes it’s easier to version the workflow ID itself (like treat v2 as a separate workflow) and not mix instances. However, that leads to data fragmentation (two workflows).
- Our system design will accommodate either approach: by having clear version markers and migration capability, it’s up to the application to decide whether to auto-migrate users or finish old ones as-is.

**Version Compatibility Policy:** We will document that certain changes require new workflow IDs (if the changes are drastic), versus minor version updates that are handled via migrations. This sets expectations for developers using the system.

In summary, **versioning will be explicit and every workflow definition is tagged with a version.** We will strive to maintain backward compatibility, and where not possible, provide migration paths or at least detection of mismatches. Proper versioning and migration support will make the system maintainable in long-term usage where forms and logic can change frequently.

## Monorepo Structure and Build Process

We plan to use a **monorepo** (managed with bun) to organize the various modules of this project. A monorepo will make it easier to coordinate changes across the DSL, engine, and renderer packages and ensure they stay in sync.

**Proposed Packages:**

- **`@beep/workflow-model`:** This package will contain the core types and schemas for the workflow model. It includes TypeScript interfaces/types for Step, Transition, WorkflowDefinition, etc., and a JSON Schema (meta-schema) to validate workflow JSON definitions. It might also include constants or utility functions related to the model (like a function to validate a workflow JSON against the schema).
- **`@beep/workflow-dsl`:** This is the fluent DSL for defining workflows. It will depend on `workflow-model` for the types and schema generation. It provides the builder classes or functions (like `Workflow.create()`, `step()`, etc.). This package is what developers use at design-time to create workflow definitions programmatically.
- **`@beep/workflow-runtime`:** This contains the execution engine. It depends on `workflow-model` (to understand the JSON structure) and possibly on packages like XState, json-logic-js, Ajv. It provides functions or classes to load a workflow JSON, start an instance, step through it, validate data, and so on. It could also expose a function to directly integrate with XState’s `interpret`. The runtime is largely framework-agnostic (doesn’t assume a browser or Node environment specifically, aside from needing a JS runtime).
- **`@beep/workflow-renderer-jsonforms`:** This package provides the integration with JSONForms for the front-end. It depends on `workflow-runtime` (to send events to the machine, etc.) and on JSONForms libraries. It exports React components/hooks to easily use the workflow in a React app. For example, a `<WorkflowStepper workflow={...} />` that internally uses JSONForms to render the current step and has Next/Back buttons wired to the runtime. We might also include some default styling or theming in this package.
- **`@beep/workflow-renderer-rjsf` (optional):** If we decide to support RJSF as an alternative, this would be a similar integration package but using RJSF. This might not be implemented initially, but structuring the code to allow it means not hard-coding JSONForms specifics into the core runtime.
- **`@beep/workflow-examples`:** A collection of example workflows and possibly a demo application. This could include sample code using the DSL to define workflows, and a simple web app that runs one of the workflows (for development/testing purposes). This might not be published as a library but kept in the repo as a reference and testbed.

**Monorepo Tools:** We'll likely use **bun** for its workspace features and ease of use. Each package will have its own `package.json` and `tsconfig.json`. We’ll configure TypeScript project references so that, for example, `workflow-dsl` references `workflow-model`, `workflow-runtime` references `workflow-model`, etc. This ensures that running `tsc -b` (build with references) compiles things in the right order.

**Build Outputs:** We will compile each package to both CommonJS and ESM outputs (to support Node and modern bundlers). This can be done with a tool like `tsup` or just multiple `tsc` configs. We will generate type declaration files (`.d.ts`) for all.

**Development Flow:** With the monorepo, developers can work across packages. For instance, if we change the `workflow-model` types, TypeScript will immediately flag any inconsistencies in `workflow-dsl` or `workflow-runtime` due to references. We can run a single build command to build everything or run watch mode on all packages concurrently. Linting and testing can be configured repo-wide (e.g., an ESLint config at the root and Jest or Vitest for tests).

**Package Structure Example:**

```
bash
Copy
packages/
  workflow-model/
    src/...
    package.json
    tsconfig.json
  workflow-dsl/
    src/...
    package.json
    tsconfig.json
  workflow-runtime/
    src/...
    package.json
    tsconfig.json
  workflow-renderer-jsonforms/
    src/...
    package.json
    tsconfig.json
  workflow-examples/
    src/...
    package.json
    tsconfig.json

```

We might use a naming convention like `@beep/...` for package names. If this system is part of a larger product named "Beep", for example.

**Monorepo Scripts:** In the root `package.json`, we will have scripts such as:

- `build` – build all packages (e.g., `bun run -r build` to run build in each or use bun to orchestrate).
- `lint`, `test` – run linters or tests across packages.
- `dev` – possibly start an example app for live development.

We will also consider using storybook or a demo page to visually test the forms.

**Dependencies:** By splitting into multiple packages, we allow the possibility for users to pick and choose (e.g., someone could use the DSL and runtime without our renderer, if they want to integrate with a different UI). Internally, of course, all will be used together.

We’ll ensure that the build produces correct `.d.ts` files for type definitions and that our published packages have correct `main`, `module`, and `types` fields in package.json for Node and bundler usage.

## Testing Strategy

Testing is crucial for a system like this, which involves a lot of moving parts (state machine logic, form validation, etc.). We will implement tests at multiple levels:

- **Unit Tests for Core Logic:** This includes testing the workflow model (e.g., validation of a workflow JSON structure), the DSL output, and the engine’s logic. For example:
    - Test that the DSL’s `.build()` produces the expected JSON given a certain fluent definition.
    - Test that invalid usage of the DSL (like duplicate step IDs or referencing unknown steps) either doesn’t compile (type error) or throws an error at runtime in `.build()`.
    - Test the JsonLogic evaluation for various conditions. Supply a context and rule and assert the outcome (including edge cases like rules that reference missing data).
    - Test the engine’s transition logic: given a workflow JSON with known transitions, simulate sending events and verify that the resulting state is correct. We can use XState’s `interpret` in tests to step through the machine, or directly call our runtime methods if we abstract it.
    - Test validation: feed correct and incorrect data to the engine for a given step and ensure that validation passes or fails accordingly.
- **Integration Tests (DSL + Engine):** Define a workflow via the DSL in a test, then use the engine to run through it programmatically. For instance, a test could define a simple branching workflow, then simulate a user going through one branch by calling something like:

    ```tsx
    ts
    Copy
    const wf = inventoryWorkflow.build();
    const service = startWorkflow(wf);
    service.send({ type: 'NEXT', data: { action: 'Move' } });
    expect(service.state.value).toBe('moveDetails');

    ```

    And so forth, verifying that the correct next step is reached and that the context has the submitted data.

- **UI Component Tests:** If possible, use a testing library like React Testing Library to mount our `<WorkflowFormRenderer>` component (with JSONForms or RJSF) and simulate user interactions:
    - Render the component with a given workflow definition.
    - Fill in some fields (perhaps by selecting elements and firing events) and click the Next button.
    - Assert that the engine moved to the expected next step (which might be reflected by a change in the rendered form title or fields).
    - Test validation messages appear when invalid data is entered.

        These tests can be run with JSDOM; JSONForms should work in that environment since it’s plain React.

- **Cross-Version Tests:** As we implement versioning, we will write tests that load an old version definition, run migration, and ensure the new definition is as expected. Also test that an in-flight state from an old version is handled (either by migration or by detection).
- **Performance Tests (if feasible):** Write a test that generates a large workflow (for example, 50 steps with some random branching) and measure how long initialization and one pass through it takes. This can help catch any performance bottlenecks in our engine (though at 50 steps it should be fine, if we see issues at 100+ we might need to tune).
- **Type Tests:** Using TypeScript’s type testing (with tools like `@ts-expect-error` comments or a library like tsd), verify that the DSL’s types behave correctly:
    - Ensure that referencing an unknown step ID in `transition` results in a compile error.
    - Ensure that after defining steps, the known step IDs are correct.
    - Check that `.whenEquals('field', value)` only accepts appropriate field names and value types.

We will integrate these tests into continuous integration. Every pull request should run the test suite. This is especially important as the system grows; the state machine logic and DSL complexity require a safety net to avoid regressions.

Additionally, we might use XState’s own state machine testing utilities or model-based testing to generate possible event sequences and verify that no illegal states are reachable.

Finally, we will test the end-to-end flow in a real browser manually (and possibly with a Cypress e2e test): load the example app, go through the form UI as a user, and ensure everything works (this doubles as a demo and a final integration test).

## Implementation Plan and Milestones

We will implement the project in phases, each with specific milestones:

### Phase 0: Research & Prototyping (1–2 weeks)

Before coding the full system, we will conduct small prototype experiments to validate our choices:

- **Prototype JSON->XState:** Build a quick example where a hardcoded JSON workflow definition (with 2-3 steps and a branch) is converted into an XState machine. Ensure that we can evaluate JsonLogic conditions in guards and that the machine transitions correctly. This proves out the core engine approach.
- **Prototype JSONForms integration:** Create a minimal React app that uses JSONForms to render a simple JSON Schema and collects data. Try out a rule in the UI schema to hide a field based on another field’s value[jsonforms.io](https://jsonforms.io/docs/uischema/rules/#:~:text=Rules%20allow%20for%20dynamic%20aspects,or%20disabling%20UI%20schema%20elements). This will make sure JSONForms meets our needs for dynamic forms.
- **Effect Schema to JSON Schema:** Write a sample using Effect Schema to define a schema and then generate JSON Schema from it[effect.website](https://effect.website/docs/schema/json-schema/#:~:text=). Verify that Ajv can validate data against the generated schema, ensuring our schemas will indeed be usable for validation and rendering.

These prototypes will guide adjustments to the plan if we encounter any issues (for example, if JSONForms rules were insufficient, maybe we’d plan more logic in the engine instead).

### Phase 1: MVP Implementation (3–4 weeks)

Deliver a minimum viable product that includes the end-to-end flow:

- **Set up the Monorepo:** Initialize the repository with the package structure (`workflow-model`, `workflow-dsl`, `workflow-runtime`, `workflow-renderer-jsonforms`, etc.). Configure TypeScript, linters, formatter, CI pipeline.
- **Implement Workflow Model & Schema:** In `workflow-model`, define TypeScript types for WorkflowDefinition, Step, Transition, etc. Write a JSON Schema for the workflow definition. Include basic validation functions (perhaps using Ajv) to validate a workflow JSON.
- **Implement DSL (basic):** In `workflow-dsl`, implement a basic version of the fluent API. Support defining steps with a provided JSON Schema or via a simple helper, and defining transitions with simple conditions (maybe only equality at first for simplicity). Ensure that `build()` produces a correct WorkflowDefinition object. The focus here is on getting the DSL working, not on exhaustive type safety (which can be refined later).
- **Implement Runtime Engine:** In `workflow-runtime`, integrate XState. Write a function that takes a WorkflowDefinition and returns an XState `StateMachine` or an interpreted service. Implement the generic guard that evaluates JsonLogic. Use Ajv to compile validators for each step’s schema and use them in the transition actions. Provide methods like `startWorkflow(def)` returning a service, and maybe convenience methods like `submitStep(service, data)` that handle sending the event.
- **Implement JSONForms Renderer Integration:** In `workflow-renderer-jsonforms`, create a React component (or hook) that ties the runtime with JSONForms. It should:
    - Take a workflow definition (or maybe an already started service).
    - Internally keep track of the current step (subscribe to the XState service or use `useMachine` hook).
    - Render a `<JsonForms>` component with the current step’s schema and an `onSubmit` that sends the data to the runtime.
    - Show validation errors (JSONForms will handle field errors; we might handle a form-level error if no transition matches).
- **End-to-end Demo:** In `workflow-examples`, implement the example workflow (like the Inventory Adjustment example) using the DSL. Then create a simple React app that uses the `<WorkflowFormRenderer>` to run that workflow. This will demonstrate the system working: the form should appear, user choices should navigate to different subsequent forms, and at the end maybe display the collected data.
- **Documentation:** Write a README and basic documentation for how to use the DSL and runtime.

*Milestone (Phase 1 Complete):* We should be able to run the example workflow through a web UI. If we choose "Move" in the first step, it goes to the Move Details form, etc. The data should validate (e.g., if quantity is required and not provided, it shows an error and doesn’t advance). This proves the core functionality.

### Phase 2: Enhanced Features and Hardening (4–6 weeks)

Now that the MVP is working, we enhance it with more features, improve type safety, and increase robustness:

- **Complete DSL Features:** Expand the DSL to cover more use cases:
    - Support optional fields, default values, and various field types (string, number, boolean, enums, arrays, objects).
    - Improve the type inference: ensure that the `Workflow.create` generic type carries the mapping of step IDs to types.
    - Implement DSL methods for common condition types: `.when(conditionFn)` with a builder for JsonLogic (if needed), `.whenNotEquals`, etc., possibly even range comparisons.
    - Ensure that using a field in a condition that doesn’t exist or using a wrong value type leads to a TypeScript error.
- **Validation Improvements:** Add custom validation support if needed. For example, demonstrate how one could add a custom Ajv keyword or a custom JsonLogic operator if the domain requires (this could be part of extensibility).
- **Renderer Enhancements:** Add support for more complex UI needs:
    - If we want to allow back navigation, implement a back button in the renderer component and a corresponding event in the state machine (transitions for going back if state history is kept).
    - Add the ability to inject external context easily (e.g., via a prop to the renderer that the engine will include in evaluation context).
    - Style the forms a bit more nicely (maybe integrate Material UI properly or our own styles).
    - If using JSONForms, possibly configure it to only render certain elements (like no submit button, since we handle that).
- **Testing and Quality:** Increase test coverage significantly. Include edge cases (like no transitions, multiple transitions firing, validation failures, etc.). Run the type tests to ensure our TypeScript typings work as intended.
- **Performance Profiling:** If any part seems slow (for example, if each step submission recompiles schemas unnecessarily), optimize it. Perhaps cache compiled schemas or reuse the XState machine instance for multiple uses if applicable.
- **Migrations and Versioning Infrastructure:** Implement a simple scenario of version upgrade:
    - For example, bump the example workflow to version 1.1 by adding a field, and write a migration that adds that field with a default value for older definition.
    - Provide a function to migrate a given workflow JSON to latest (which uses the chain of migrations).
    - Not fully bulletproof, but establishing the pattern so future changes to the model or workflows can be handled.
- **Prepare for Publishing:** If we intend to release these packages, set up package.json fields, possibly automate npm publishing with CI, ensure LICENSE, etc.

*Milestone (Phase 2 Complete):* The system should be ready for use in a real project. A developer can define a workflow with the DSL, run it in their app with our renderer, and trust that it will handle typical scenarios. We should have documentation written for each package (or a consolidated docs site) and a good suite of tests.

### Phase 3: Future Work (ongoing)

After the core system is built and stable, we can consider advanced features and tools:

- **Visual Editor (Future):** Create a UI tool for building workflows visually. This could be a graph editor where nodes represent steps and arrows represent transitions. Given our JSON model, such a tool would manipulate that JSON under the hood. It’s a project on its own and would benefit from the groundwork we laid (since everything is JSON and schema-driven).
- **Workflow Analytics:** Add hooks or events from the runtime that allow logging progression (e.g., an event when a step is completed or when a branch is taken). This data could feed analytics to see how users traverse the workflows.
- **Multi-User Workflows:** If needed, extend the model to handle assignments or roles (e.g., a step that must be completed by an admin vs a user). This could tie into external context usage or be metadata on steps.
- **Parallel Paths:** Investigate supporting parallel states (XState can do this). For instance, two sections of a form that can be filled in any order. This would complicate the model (statecharts vs simple graph) and the UI (maybe tabs that can be filled independently). Not a priority unless a use-case demands it.
- **Internationalization:** If the same workflow needs to be presented in multiple languages, we might need to externalize text like step titles and field labels. Our model could support that by, for example, allowing `title` to be a key and having a separate resource file, or by duplicating the definition per locale. This is something to design when needed.
- **Improved Developer Experience:** Possibly integrate with VSCode extensions or provide code snippets to make writing workflows easier. Also, generating documentation from a workflow (like a markdown or PDF that lists all steps and paths) could be a useful tool.

At this stage, we will have a solid foundation and can prioritize these enhancements based on user feedback and evolving requirements.

## Open Questions and Risks

While the plan covers a broad range, there are some open questions and potential risks:

- **Complex Condition Authoring:** Writing JsonLogic by hand can be cumbersome for complex logic. We may need to provide better tooling or DSL support for conditions. If not, there's a risk that developers make mistakes in the JSON that are hard to debug. We mitigate this by offering helper functions in the DSL and thorough examples/documentation. In the future, a visual rule builder or a more natural language approach could be considered.
- **DSL Type Complexity:** Implementing the DSL with full type safety (especially around ensuring correct step and field references) will involve advanced TypeScript. There is a risk of hitting TypeScript’s complexity limits, which could make the DSL code or usage hard to understand. We need to balance type strictness with usability. We will test the DSL in real usage to ensure the types help more than hinder. If needed, we might relax certain checks if they cause issues (with the trade-off of runtime checks instead).
- **Dependency Maintenance:** We rely on several third-party libraries (XState, Ajv, JSONForms, json-logic-js). We need to track their updates for compatibility. For example, XState v5 is on the horizon (v4 is our target initially); migration to v5 might be non-trivial but presumably offers improvements. We should keep an eye on JSONForms and RJSF updates too. The risk is if one of these libraries has a breaking change or a performance issue. To mitigate, we encapsulate their usage behind our own interfaces as much as possible, so we could swap out if needed (especially the form renderer).
- **Performance on Large Workflows:** We assume typical workflows will be maybe 5-20 steps. If someone tries 100+ steps with complex logic, performance might suffer (in evaluation or in rendering). We should identify and document limits, and perhaps test and optimize for higher ranges if needed. XState can handle a large number of states, but the visualization and debugging become harder. JSONForms rendering a very large schema might be slow; splitting into steps helps, but if a single step has a huge number of fields, we might need to advise using multiple steps.
- **User Experience:** The success of this system also lies in the end-user experience of the forms. We have to ensure the forms are accessible, the error messages are clear, and the dynamic behavior is smooth. Using established libraries like JSONForms helps, but we will still need to fine-tune the UI. A risk is that an overly generic renderer might not meet specific UX expectations. Our plan to allow custom renderers/widgets mitigates this by enabling customization where needed.

In conclusion, the design is ambitious but grounded in established technologies and patterns. By tackling it in phases and keeping the architecture modular, we can manage the complexity. Testing and community feedback will be key to refining the system. We believe this design will yield a powerful and flexible workflow engine that meets the goals of type safety, dynamic behavior, and maintainability.

## References

- Effect-TS Schema Documentation – *“The `JSONSchema.make` function aims to produce an optimal JSON Schema representing the input part of the decoding phase.”*[effect.website](https://effect.website/docs/schema/json-schema/#:~:text=) – Demonstrates how we can derive a JSON Schema from an Effect Schema definition.
- XState Documentation (Guards) – *“Guards allow you to check something before you proceed, enabling you to implement if/else logic in XState.”*[stately.ai](https://stately.ai/docs/xstate-v4/xstate/basics/options#:~:text=Guards) – Highlights how XState uses guard functions for conditional transitions.
- JsonLogic Official Site – *“Secure. We never `eval()`. Rules only have read access to data you provide, and no write access to anything.”*[jsonlogic.com](https://jsonlogic.com/#:~:text=1.%20Terse.%202.%20Consistent.%20%60%7B,no%20write%20access%20to%20anything) – Underlines the safety of JsonLogic for evaluating conditions in JSON form.
- JSONForms Documentation (UI Schema Rules) – *“Rules allow for dynamic aspects for a form, e.g. by hiding or disabling UI schema elements.”*[jsonforms.io](https://jsonforms.io/docs/uischema/rules/#:~:text=Rules%20allow%20for%20dynamic%20aspects,or%20disabling%20UI%20schema%20elements) – Shows that JSONForms supports declarative rules for dynamic form behavior (hide/show/disable).
- React JSONSchema Form Docs (Conditional Dependencies) – *“The JSON Schema standard says that the dependency is triggered if the property is present... For this, we support a very restricted use of the `oneOf` keyword.”*[rjsf-team.github.io](https://rjsf-team.github.io/react-jsonschema-form/docs/json-schema/dependencies/#:~:text=Dynamic) – Explains how RJSF uses schema dependencies and `oneOf` to handle conditional subforms.
- Ajv GitHub README – *“The fastest JSON schema Validator. Supports JSON Schema draft-04/06/07/2019-09/2020-12...”*[github.com](https://github.com/ajv-validator/ajv#:~:text=The%20fastest%20JSON%20schema%20Validator,RFC8927) – Confirms that Ajv supports the latest JSON Schema drafts (2019-09 and 2020-12) which we plan to use for our schemas.
- This Dot Labs Blog on Type Safety – Discusses generating types from schemas vs. building schemas in code and notes that projects typically choose one direction for schema->types or types->schema, each with trade-offs[thisdot.co](https://www.thisdot.co/blog/end-to-end-type-safety-with-json-schema#:~:text=,be%20compiled%20to%20JSON%20Schema). Supports our one-way generation approach for maintaining type safety.
- Hacker News Discussion on XState JSON Config – *“One advantage of it being a JSON format is that you can validate/transform and pass it around... and it can easily be understood, written, extended and used everywhere... could see usefulness to having an easily portable standard to describe and mock a program between languages.”*[news.ycombinator.com](https://news.ycombinator.com/item?id=42483871#:~:text=%28guards%2C%20actions%20etc,and%20mock%20a%20program%20between) – Emphasizes the benefit of having workflow logic in a portable JSON format, aligning with our data-first design.
