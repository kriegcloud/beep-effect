# Knowledge vs Effect-Ontology Full Audit

> Comprehensive architectural audit comparing beep-effect knowledge slice against the effect-ontology reference implementation to achieve complete feature parity.

---

## Status

**PLANNED** - Foundation spec for knowledge slice evolution

---

## Domain Context: AI-Native Wealth Management

### Target Use Case

The beep-effect knowledge slice serves **todox**, an AI-native wealth management platform for **Ultra-High-Net-Worth Individual (UHNWI)** clients ($30M+ net worth). Unlike effect-ontology's generic ontology extraction focus, beep-effect's knowledge system must:

1. **Unify Disparate Data Sources** - Synthesize information from:
   - CRM systems (Salesforce)
   - Custodians (Schwab, Fidelity)
   - Communication (Gmail, Outlook)
   - Calendar & scheduling systems
   - Document repositories (Notion, SharePoint)
   - Financial planning tools

2. **Model Complex Household Relationships** - Track:
   - Multi-generational family structures
   - Trust/beneficiary hierarchies
   - Entity ownership chains (LLCs, family offices)
   - Professional advisor networks (attorneys, CPAs, estate planners)

3. **Maintain Compliance-Grade Provenance** - Support:
   - FINRA/SEC audit trails
   - Fiduciary documentation
   - Suitability evidence chains
   - Complete attribution for AI-generated insights

4. **Power GraphRAG for AI Advisors** - Enable:
   - Context-rich retrieval for LLM queries
   - Relationship-aware entity resolution
   - Temporal reasoning (past/present/planned states)
   - Multi-hop reasoning across entity graphs

### Differentiation from effect-ontology

| Aspect | effect-ontology | beep-effect (todox) |
|--------|-----------------|---------------------|
| **Primary Goal** | Generic ontology extraction research | Production wealth management platform |
| **Entity Focus** | Academic/research entities | Financial entities, people, organizations, accounts |
| **Data Sources** | Single documents/texts | Multiple live integrations (CRM, custodian, email, calendar) |
| **Compliance** | Not a concern | Critical (FINRA/SEC, fiduciary duty) |
| **Entity Resolution** | Standard deduplication | Cross-system identity linking (owl:sameAs) |
| **Scale** | Research workloads | Production SLA requirements |
| **Users** | Researchers | Wealth advisors serving UHNWI clients |

### Alignment Strategy

**Adopt Same Architecture, Adapt for Domain**:

1. **Same Tech Stack**: Use identical Effect packages (@effect/workflow, @effect/cluster, @effect/ai, etc.)
2. **Same Patterns**: Implement same resilience, durability, and streaming patterns
3. **Same Service Design**: Follow Effect.Service patterns with accessors and Layer composition
4. **Domain-Specific Schemas**: Wealth management entity types, relationship predicates, compliance metadata
5. **Domain-Specific Ontology**: Financial domain concepts rather than generic extraction

This ensures we benefit from effect-ontology's proven architecture while serving our specific use case.

---

## Purpose

This specification performs a **complete audit** of `.repos/effect-ontology/packages/@core-v2/` to:

1. **Catalog every capability** in effect-ontology (services, patterns, modules, contracts)
2. **Map to beep-effect knowledge slice** equivalents (or document gaps)
3. **Identify required Effect ecosystem packages** and their usage patterns
4. **Produce deliverables** that enable systematic spec creation for feature parity

### Why This Spec Exists

The previous `knowledge-ontology-comparison` spec missed critical infrastructure:
- Event infrastructure (EventBridge, EventBroadcastRouter, EventStreamRouter)
- Cluster patterns (BackpressureHandler, ExtractionEntityHandler)
- Resilience patterns (CircuitBreaker, rate limiting integration)
- Runtime composition (ClusterRuntime, ActivityRunner)
- Progress streaming contract (20+ event types)

This audit ensures **nothing is missed** by systematically cataloging every file and pattern.

---

## Audit Methodology

### Phase 1: Complete Source Inventory

**Objective**: Catalog every source file in effect-ontology with purpose and dependencies.

**Scope**: All files in `.repos/effect-ontology/packages/@core-v2/src/`

**Output**: `EFFECT_ONTOLOGY_INVENTORY.md`

| Directory | File | Purpose | Effect Packages | Dependencies |
|-----------|------|---------|-----------------|--------------|
| Domain/Error/ | * | Error definitions | Schema | None |
| Domain/Model/ | * | Domain models | Schema, Data | Errors |
| ... | ... | ... | ... | ... |

### Phase 2: Capability Categorization

**Objective**: Group capabilities into functional categories.

**Categories**:
1. **Core Domain** - Models, schemas, errors, value objects
2. **Extraction Pipeline** - Text processing, LLM extraction, grounding
3. **Entity Resolution** - Clustering, similarity, deduplication
4. **RDF/Reasoning** - RDF store, SPARQL, RDFS inference
5. **Durability** - Workflows, activities, persistence
6. **Events** - Event bus, broadcasting, streaming, logging
7. **Resilience** - Circuit breaker, rate limiting, backpressure
8. **Runtime** - Layer composition, cluster, activity runners
9. **Contracts** - RPC definitions, progress streaming, SSE
10. **Telemetry** - Tracing, metrics, cost calculation
11. **Utilities** - IRI handling, text processing, similarity scoring

**Output**: `CAPABILITY_CATEGORIES.md`

### Phase 3: Gap Analysis

**Objective**: Compare each capability against beep-effect knowledge slice.

**Assessment Matrix**:

| Capability | effect-ontology | beep-effect | Gap Type | Priority |
|------------|-----------------|-------------|----------|----------|
| CircuitBreaker | ✓ Full | ✗ None | Missing | P1 |
| EntityExtractor | ✓ Full | ✓ Full | None | - |
| EventBridge | ✓ Full | ✗ None | Missing | P2 |

**Gap Types**:
- **None** - Feature parity achieved
- **Partial** - Functionality exists but incomplete
- **Missing** - No equivalent implementation
- **Different** - Different approach, evaluate alignment

**Domain-Specific Gap Considerations**:

When assessing gaps, evaluate each capability through the wealth management lens:

| Capability | Wealth Management Requirement |
|------------|------------------------------|
| Entity Resolution | Must support cross-system identity linking (same person in Salesforce, Schwab, Gmail) |
| Provenance Tracking | Must meet FINRA/SEC audit requirements with complete attribution chains |
| Event Infrastructure | Must support real-time advisor dashboards and compliance logging |
| Workflow Durability | Must handle long-running client onboarding flows (days/weeks) |
| Progress Streaming | Must provide advisor-facing status updates during document processing |
| GraphRAG | Must enable relationship-aware retrieval for AI advisor queries |

**Output**: `GAP_ANALYSIS.md`

### Phase 4: Technology Alignment

**Objective**: Document all Effect ecosystem packages and ensure alignment.

**Package Categories**:

```typescript
// Core Effect
effect                    // Runtime, data types, services
@effect/platform          // Cross-platform I/O
@effect/platform-bun      // Bun runtime
@effect/sql               // Database abstraction
@effect/sql-pg            // PostgreSQL client
@effect/sql-drizzle       // Drizzle ORM integration

// AI/LLM
@effect/ai                // Language model abstraction
@effect/ai-anthropic      // Anthropic provider
@effect/ai-openai         // OpenAI provider

// Durability
@effect/workflow          // Durable workflows
@effect/cluster           // Distributed execution

// Experimental
@effect/experimental      // EventLog, EventJournal

// Observability
@effect/opentelemetry     // Tracing/metrics
```

**Output**: `TECHNOLOGY_ALIGNMENT.md`

### Phase 5: Pattern Documentation

**Objective**: Extract reusable patterns from effect-ontology.

**Pattern Categories**:
1. **Service Definition** - Effect.Service with accessors
2. **Layer Composition** - Dependency ordering, merging
3. **Error Handling** - Tagged errors, recovery strategies
4. **Stream Processing** - Backpressure, cancellation
5. **State Management** - Ref, Deferred, FiberMap
6. **Event Patterns** - PubSub, EventJournal, broadcasting
7. **Testing Patterns** - Layer sharing, mocking
8. **Configuration** - Environment-based config

**Output**: `PATTERN_CATALOG.md`

### Phase 6: Spec Roadmap Generation

**Objective**: Produce actionable spec definitions.

**Deliverables**:
1. `SPEC_ROADMAP.md` - Ordered list of specs with dependencies
2. `SPEC_DEFINITIONS.md` - Detailed scope for each spec
3. `SPEC_GENERATOR_PROMPT.md` - Prompt for agent to create specs

---

## Deliverables

### D1: EFFECT_ONTOLOGY_INVENTORY.md

Complete file-by-file inventory of effect-ontology with:
- File path
- Purpose (1-2 sentences)
- Effect packages imported
- Internal dependencies
- Key exports

### D2: CAPABILITY_CATEGORIES.md

Capabilities grouped by functional area with:
- Category description
- Files in category
- Key services/classes
- Integration points

### D3: GAP_ANALYSIS.md

Comparison matrix with:
- Every capability from effect-ontology
- Equivalent in beep-effect (if exists)
- Gap assessment (None/Partial/Missing/Different)
- Priority (P0-P3)
- Effort estimate (S/M/L/XL)

### D4: TECHNOLOGY_ALIGNMENT.md

Package-by-package comparison with:
- Package name and version
- Usage in effect-ontology
- Current usage in beep-effect
- Required changes

### D5: PATTERN_CATALOG.md

Reusable patterns with:
- Pattern name
- Problem it solves
- Effect-ontology example (file + code reference)
- Applicability to beep-effect

### D6: SPEC_ROADMAP.md

Ordered spec list with:
- Spec name
- Dependencies (other specs)
- Priority
- Estimated phases
- Key deliverables

### D7: SPEC_DEFINITIONS.md

Per-spec detail including:
- Spec name and purpose
- Scope (what's included/excluded)
- Files to create/modify
- Success criteria
- Reference files in effect-ontology

### D8: SPEC_GENERATOR_PROMPT.md

Complete prompt for an agent to create all necessary specs, including:
- Context from this audit
- Spec creation guidelines
- Priority ordering
- Dependency graph

---

## Audit Scope

### effect-ontology Source Directories

```
.repos/effect-ontology/packages/@core-v2/src/
├── Cluster/              # Distributed execution entities
├── Contract/             # RPC and streaming contracts
├── Domain/               # Core domain model
│   ├── Error/            # Typed errors
│   ├── Model/            # Domain entities
│   ├── Rdf/              # RDF constants
│   └── Schema/           # API schemas
├── Prompt/               # LLM prompt construction
├── Runtime/              # Production layer composition
│   └── Persistence/      # PostgreSQL layers
├── Schema/               # Shared schema definitions
├── Service/              # Effect.Service implementations
│   └── LlmControl/       # Token budget, timeouts, rate limiting
├── Telemetry/            # OpenTelemetry integration
├── Utils/                # Common utilities
└── Workflow/             # Durable workflow definitions
```

### beep-effect Knowledge Directories

```
packages/knowledge/
├── domain/src/           # Domain models, errors, value objects
├── tables/src/           # Database schema (Drizzle)
├── server/src/           # Services, extraction, reasoning
│   ├── Ai/               # LLM integration
│   ├── Extraction/       # Extraction pipeline
│   ├── EntityResolution/ # Clustering
│   ├── GraphRag/         # Hybrid retrieval
│   ├── Ontology/         # Ontology parsing
│   ├── Rdf/              # RDF store, SPARQL
│   └── Reasoning/        # Forward-chaining
└── client/src/           # RPC contracts
```

---

## Execution Instructions

### Step 1: Create Inventory

Read every file in `.repos/effect-ontology/packages/@core-v2/src/` and populate inventory:

```bash
# List all TypeScript files
find .repos/effect-ontology/packages/@core-v2/src -name "*.ts" -type f | sort
```

For each file, document:
1. Read file content
2. Extract imports (Effect packages, internal dependencies)
3. Extract exports (services, schemas, functions)
4. Write 1-2 sentence purpose
5. Note any unique patterns

### Step 2: Categorize Capabilities

Group inventory entries by functional area. Create category headers with:
- Description of what the category covers
- Why it matters for knowledge extraction use case
- Integration points with other categories

### Step 3: Perform Gap Analysis

For each capability in inventory:
1. Search beep-effect knowledge slice for equivalent
2. Compare implementations if both exist
3. Assess gap type and priority
4. Note any architectural differences

### Step 4: Document Technology Usage

For each Effect package used in effect-ontology:
1. List modules/functions used
2. Check if beep-effect uses same package
3. Document version alignment
4. Note any missing package installations

### Step 5: Extract Patterns

For each service/infrastructure file:
1. Identify reusable patterns
2. Document pattern with example
3. Note applicability to beep-effect

### Step 6: Generate Spec Roadmap

Based on gaps and priorities:
1. Group related gaps into coherent specs
2. Establish dependency order
3. Estimate effort per spec
4. Create detailed scope definitions

### Step 7: Create Generator Prompt

Synthesize all findings into a comprehensive prompt that:
1. Provides full context from audit
2. Lists specs to create with priorities
3. Includes reference file mappings
4. Specifies success criteria per spec

---

## Success Criteria

### Inventory Completeness
- [ ] Every `.ts` file in effect-ontology cataloged
- [ ] All imports and exports documented
- [ ] All dependencies mapped

### Gap Coverage
- [ ] Every capability assessed
- [ ] No capabilities marked "unknown"
- [ ] All priorities assigned (P0-P3)

### Actionable Output
- [ ] SPEC_ROADMAP contains clear ordering
- [ ] SPEC_DEFINITIONS are detailed enough to start work
- [ ] SPEC_GENERATOR_PROMPT is self-contained

### Quality Gates
- [ ] All deliverables follow markdown formatting
- [ ] Cross-references are valid
- [ ] No placeholder content remaining

---

## Estimated Scope

| Phase | Focus | Effort |
|-------|-------|--------|
| 1 | Source Inventory | L (100+ files) |
| 2 | Capability Categorization | M |
| 3 | Gap Analysis | L (requires reading beep-effect too) |
| 4 | Technology Alignment | S |
| 5 | Pattern Documentation | M |
| 6 | Spec Roadmap Generation | M |

**Total Estimated Effort**: 2-3 days of agent work

---

## Anti-Patterns to Avoid

### DO NOT skip files
Every `.ts` file must be read and documented. The previous comparison missed critical infrastructure because certain directories were not explored.

### DO NOT assume equivalence
Just because a service has the same name doesn't mean it has the same capabilities. Compare actual implementations.

### DO NOT create specs during audit
This spec produces **documentation and a prompt**. Actual spec creation happens in a separate session using the generator prompt.

### DO NOT ignore test files
Test files reveal usage patterns and edge cases. Document `test/` structure alongside `src/`.

---

## Reference Documentation

- **effect-ontology CLAUDE.md**: `.repos/effect-ontology/CLAUDE.md`
- **Previous comparison**: `specs/knowledge-ontology-comparison/`
- **Existing knowledge specs**: `specs/knowledge-*/`
- **Spec guide**: `specs/_guide/README.md`

---

## Timeline

**Duration**: 2-3 days

| Day | Focus |
|-----|-------|
| 1 | Phases 1-2: Inventory and categorization |
| 2 | Phases 3-4: Gap analysis and technology alignment |
| 3 | Phases 5-6: Pattern documentation and roadmap generation |

---

## Post-Audit Workflow

After this spec completes:

1. **Review deliverables** with human for accuracy
2. **Prioritize specs** based on business needs
3. **Run SPEC_GENERATOR_PROMPT** to create individual specs
4. **Execute specs** in dependency order
5. **Validate** each spec against effect-ontology reference

This creates a **systematic path to feature parity** with no capabilities missed.

---

## Templates

Pre-built templates are provided in `templates/` to guide deliverable creation:

| Template | Purpose |
|----------|---------|
| [`EFFECT_ONTOLOGY_INVENTORY.template.md`](templates/EFFECT_ONTOLOGY_INVENTORY.template.md) | File-by-file inventory structure |
| [`CAPABILITY_CATEGORIES.template.md`](templates/CAPABILITY_CATEGORIES.template.md) | Functional category groupings |
| [`GAP_ANALYSIS.template.md`](templates/GAP_ANALYSIS.template.md) | Comparison matrix structure |
| [`TECHNOLOGY_ALIGNMENT.template.md`](templates/TECHNOLOGY_ALIGNMENT.template.md) | Package-by-package comparison |
| [`PATTERN_CATALOG.template.md`](templates/PATTERN_CATALOG.template.md) | Reusable pattern documentation |
| [`SPEC_ROADMAP.template.md`](templates/SPEC_ROADMAP.template.md) | Ordered spec list with dependencies |
| [`SPEC_DEFINITIONS.template.md`](templates/SPEC_DEFINITIONS.template.md) | Detailed per-spec scope |
| [`SPEC_GENERATOR_PROMPT.template.md`](templates/SPEC_GENERATOR_PROMPT.template.md) | Prompt for spec creation agent |

**Usage**: Copy templates to root of spec directory, rename without `.template`, and populate with audit findings.

---

## Related Documentation

- [REFLECTION_LOG.md](REFLECTION_LOG.md) - Session learnings during execution
- [effect-ontology CLAUDE.md](../../.repos/effect-ontology/CLAUDE.md) - Reference repo guidance
- [Spec Guide](../_guide/README.md) - Spec creation standards
- [knowledge-workflow-durability](../knowledge-workflow-durability/README.md) - First spec to implement
