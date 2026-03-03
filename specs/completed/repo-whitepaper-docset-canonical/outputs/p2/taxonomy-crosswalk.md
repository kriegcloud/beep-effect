# P2 Taxonomy Crosswalk

## Objective

Normalize competing category systems into one canonical mapping model for D01-D12, with deterministic primary-axis assignment and explicit rationale.

## Canonical Axes (Normative)

| Axis ID | Canonical Axis | Canonical Meaning |
|---|---|---|
| AX-01 | Documentation Semantics | Annotation intent, tag behavior, and syntax-level documentation constraints. |
| AX-02 | Architectural Responsibility | Runtime/system responsibility and boundary placement. |
| AX-03 | Reasoning and Representation | Inference strategy, ontology semantics, and knowledge representation patterns. |
| AX-04 | Operational Assurance | Reliability, control-plane behavior, validation operation, and run-time safeguards. |
| AX-05 | Governance and Evidence | Auditability, risk ownership, roadmap decisions, and source-to-claim traceability. |

## Deterministic Mapping Rules

1. Every source category must map to exactly one `primary axis`.
2. A `secondary axis` is optional and used only when the source category has explicit cross-cutting behavior.
3. If multiple axes are plausible, choose the axis that best explains the category's primary decision boundary, then record rationale.
4. Unmapped source categories are not allowed at P2 exit.
5. Axis names must remain identical to the canonical list above.

## Deterministic Crosswalk

| Source System | Source Category | Primary Axis | Secondary Axis | Mapping Rationale |
|---|---|---|---|---|
| JSDoc tag-value taxonomy | StructuralTagValues | AX-01 Documentation Semantics | AX-02 Architectural Responsibility | Defines canonical documentation structure and applicability surfaces for code constructs. |
| JSDoc tag-value taxonomy | DocumentationTagValues | AX-01 Documentation Semantics | AX-05 Governance and Evidence | Encodes human-facing explanatory tags that also affect evidence clarity. |
| JSDoc tag-value taxonomy | TSDocTagValues | AX-01 Documentation Semantics | AX-05 Governance and Evidence | Defines spec-specific documentation semantics with policy implications for doc quality. |
| JSDoc tag-value taxonomy | TypeDocTagValues | AX-01 Documentation Semantics | AX-05 Governance and Evidence | Drives generated documentation behavior and presentation governance conventions. |
| JSDoc tag-value taxonomy | InlineTagValues | AX-01 Documentation Semantics | AX-05 Governance and Evidence | Represents inline linking semantics that influence citation and cross-reference fidelity. |
| JSDoc tag-value taxonomy | OrganizationalTagValues | AX-02 Architectural Responsibility | AX-01 Documentation Semantics | Captures module/member ownership intent and architecture-facing structure labels. |
| JSDoc tag-value taxonomy | EventDependencyTagValues | AX-02 Architectural Responsibility | AX-04 Operational Assurance | Expresses dependency/event coupling with operational implications for behavior and reliability. |
| JSDoc tag-value taxonomy | AccessModifierTagValues | AX-02 Architectural Responsibility | AX-01 Documentation Semantics | Represents visibility/control boundaries and how they are documented. |
| JSDoc tag-value taxonomy | TypeScriptTagValues | AX-02 Architectural Responsibility | AX-01 Documentation Semantics | Reflects TypeScript-specific boundary semantics such as overload usage context. |
| JSDoc tag-value taxonomy | ClosureTagValues | AX-01 Documentation Semantics | AX-04 Operational Assurance | Provides closure-compiler tag semantics, some of which encode side-effect/control guarantees. |
| JSDoc tag-value taxonomy | RemainingTagValues | AX-01 Documentation Semantics | AX-05 Governance and Evidence | Miscellaneous metadata tags are treated as documentation-first with governance tie-ins. |
| Canonical codegraph classification | domain | AX-02 Architectural Responsibility | none | Domain layer classification is a direct architectural-boundary label. |
| Canonical codegraph classification | data-access | AX-02 Architectural Responsibility | AX-04 Operational Assurance | Data-access defines architecture boundaries and reliability behavior under I/O constraints. |
| Canonical codegraph classification | validation | AX-04 Operational Assurance | AX-03 Reasoning and Representation | Validation is operational enforcement with explicit relationship to reasoning outputs. |
| Canonical codegraph classification | transformation | AX-02 Architectural Responsibility | AX-03 Reasoning and Representation | Transformation expresses architectural function and representation-shaping behavior. |
| Canonical codegraph classification | side-effect | AX-04 Operational Assurance | AX-02 Architectural Responsibility | Side-effect classes are primarily reliability/control concerns tied to boundary crossings. |
| Exploratory repo-codegraph-jsdoc taxonomy | domain model | AX-03 Reasoning and Representation | AX-02 Architectural Responsibility | Focuses on conceptual modeling primitives and representational semantics. |
| Exploratory repo-codegraph-jsdoc taxonomy | utility | AX-02 Architectural Responsibility | none | Utility labels generally capture placement/function rather than reasoning semantics. |
| Exploratory repo-codegraph-jsdoc taxonomy | use case | AX-02 Architectural Responsibility | AX-05 Governance and Evidence | Use-case labels define system responsibilities and are often tied to ownership/decision scope. |
| Exploratory repo-codegraph-jsdoc taxonomy | integration | AX-03 Reasoning and Representation | AX-02 Architectural Responsibility | Integration labels describe representation seams and architecture coupling points. |
| Knowledge docs ontology/control clusters | architecture | AX-02 Architectural Responsibility | AX-04 Operational Assurance | Architecture cluster defines system boundary logic with operational consequences. |
| Knowledge docs ontology/control clusters | ontology research | AX-03 Reasoning and Representation | AX-05 Governance and Evidence | Ontology research is representation-first and informs future governance decisions. |
| Knowledge docs ontology/control clusters | control (LLM/progress/persistence/idempotency) | AX-04 Operational Assurance | AX-02 Architectural Responsibility | Control documents are reliability/operability guidance for system execution paths. |
| Knowledge docs ontology/control clusters | audits | AX-05 Governance and Evidence | AX-04 Operational Assurance | Audits are evidence/governance artifacts with direct operational quality implications. |
| Knowledge docs ontology/control clusters | plans | AX-05 Governance and Evidence | AX-02 Architectural Responsibility | Plans assign roadmap ownership and architecture execution intent. |

## C-001 Closure Record

1. Conflict `C-001` is resolved by adopting the five canonical axes as the normative taxonomy backbone.
2. All previously competing taxonomy systems now map into this crosswalk with explicit rationale.
3. No additional taxonomy enum expansion is required for P2 exit.

## Validation Checklist

1. Every source category listed above has a primary axis assignment.
2. Axis names in all rows match one of `AX-01` to `AX-05`.
3. No source taxonomy is left unmapped.
4. Conflict register entry `C-001` references this file as closure evidence.
