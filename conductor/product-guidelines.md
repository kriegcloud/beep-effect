# Product Guidelines: Effect Ontology

## 1. Technical Style and Tone
- **Mathematical Precision:** Documentation and internal communications must be formal and precise, emphasizing the mathematical foundations (e.g., catamorphism, monoids, DAGs).
- **Conciseness:** Value directness and clarity. Avoid unnecessary fluff; let the types and logic speak for themselves.
- **Rationale-Centric:** When explaining complex logic, prioritize the "why" and the mathematical principles behind the "what."

## 2. Code Quality and Type Safety
- **High-Fidelity Typing:** Use `effect/schema` and branded types extensively to model domain entities. Types should be as narrow and descriptive as possible to prevent runtime errors.
- **Referential Transparency:** Core logic (graph folding, rendering, transformations) must be implemented as pure functions.
- **Rock-Solid Testing:** 
    - **Invariants:** Use property-based testing (e.g., `fast-check` via `@effect/vitest`) to validate mathematical invariants and monoid laws.
    - **Imperatives:** Ensure high unit test coverage for all service implementations and workflows.
- **Effect Best Practices:** Adherence to idiomatic Effect patterns (e.g., `Effect.gen`, `pipe`, `Layer.provide`) is non-negotiable.

## 3. Architecture and Modularity
- **Domain-Layer Isolation:** Core domain logic must remain decoupled from infrastructure and external services.
- **Service-Based DI:** All external capabilities (LLMs, Databases, NLP) must be injected via `Effect.Layer`.
- **Functional Pipelines:** Express logic as composable pipelines. Avoid imperative state management.
- **Strict Module Structure:** Adhere to the established directory structure:
    - `Domain/`: Schemas and model definitions.
    - `Service/`: Interface definitions and implementations for external capabilities.
    - `Workflow/`: High-level orchestration of services.
    - `Runtime/`: Layer composition and application entry points.

## 4. Data Quality and Validation
- **SHACL Validation:** All extracted knowledge graphs must be validated against SHACL shapes derived from the ontology.
- **Source Traceability:** Every extracted entity and relationship must maintain a link to the original text chunk for provenance.
- **Consistency Checking:** Implement automated checks to detect logical contradictions or violations of ontology constraints during extraction.

## 5. Documentation and Naming
- **Symbolic Naming:** Use descriptive, action-oriented names that reflect the functional nature of the code (e.g., `foldGraphTopologically`, `applyAlgebra`).
- **Internal Docs:** Maintain `README.md` and inline comments that explain the mathematical rationale behind implementation choices.
