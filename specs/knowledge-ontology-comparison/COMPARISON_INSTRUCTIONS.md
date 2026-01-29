# Comparison Instructions

> Detailed methodology for comparing effect-ontology with the knowledge slice.

---

## Overview

This document provides step-by-step instructions for conducting a comprehensive comparison between the reference implementation (`tmp/effect-ontology`) and the current knowledge slice (`packages/knowledge/*`).

---

## Phase 1: Capability Inventory (effect-ontology)

### 1.1 Service Catalog

For each directory in `tmp/effect-ontology/packages/@core-v2/src/Service/`:

1. **List all services/modules**
   - File name
   - Service name (Context.Tag identifier)
   - Type: Service | Repository | Adapter | Utility

2. **Document public APIs**
   - Method signatures
   - Input/output types
   - Effect error channel types
   - Effect dependency channel (requirements)

3. **Note Effect patterns used**
   - Layer composition pattern
   - Error handling pattern (TaggedError variants)
   - Resource management (acquireRelease, Scope)
   - Concurrency patterns (Fiber, Semaphore, Queue)

4. **Capture key dependencies**
   - Internal service dependencies
   - External package dependencies
   - Configuration requirements

### 1.2 Focus Areas

Prioritize analysis of these directories:

| Directory | Priority | Reason |
|-----------|----------|--------|
| `Service/` | Critical | Core business logic |
| `Domain/Model/` | Critical | Data structures |
| `Workflow/` | High | Batch processing patterns |
| `Repository/` | High | Data access patterns |
| `Sparql/` | Medium | Query capabilities |
| `Reasoner/` | Medium | Inference engine |
| `Shacl/` | Medium | Validation |

### 1.3 Output Format

Create a structured catalog:

```markdown
## Service: [ServiceName]

**File**: `Service/[FileName].ts`
**Tag**: `[ContextTagName]`
**Type**: Service | Repository | Adapter

### API

| Method | Signature | Description |
|--------|-----------|-------------|
| methodName | `(param: Type) => Effect<Return, Error, Deps>` | What it does |

### Dependencies

- Internal: ServiceA, ServiceB
- External: @effect/ai, n3

### Effect Patterns

- [ ] Layer composition
- [ ] TaggedError
- [ ] Resource management
- [ ] Streaming (Stream/Sink)
```

---

## Phase 2: Knowledge Slice Audit

### 2.1 Package Inventory

For each package in `packages/knowledge/*/`:

1. **Document current state**
   - Package name
   - Status: Complete | Partial | Placeholder | Missing
   - File count and structure

2. **List implemented services/models**
   - Map to corresponding effect-ontology capability
   - Note implementation approach differences

3. **Identify integration points**
   - Dependencies on other @beep packages
   - External dependencies
   - RPC contracts (client package)

### 2.2 Package-by-Package Analysis

#### @beep/knowledge-domain
- Entity models (Entity, Relation, Mention, Ontology)
- Schema definitions
- Error types
- Algebra/monoids

#### @beep/knowledge-tables
- Table definitions
- Foreign key relationships
- pgvector configuration
- RLS policies

#### @beep/knowledge-server
- Extraction pipeline services
- EntityResolution service
- GraphRAG service
- Ontology parsing service
- AI integration (custom vs @effect/ai)

#### @beep/knowledge-client
- RPC contract definitions
- Client-side handlers
- (Note: likely placeholder)

#### @beep/knowledge-ui
- React components
- Visualization
- (Note: likely placeholder)

### 2.3 Output Format

Create a structured audit:

```markdown
## Package: @beep/knowledge-[name]

**Status**: Complete | Partial | Placeholder
**Files**: X files, Y lines

### Implemented

| Component | Corresponding effect-ontology | Notes |
|-----------|------------------------------|-------|
| EntityExtractor | EntityExtractionService | Different AI abstraction |

### Missing

| Capability | effect-ontology Source | Priority |
|------------|------------------------|----------|
| SPARQL queries | Service/Sparql.ts | P1 |

### Differences

| Aspect | effect-ontology | knowledge-slice | Assessment |
|--------|----------------|-----------------|------------|
| LLM integration | @effect/ai | Custom AiService | Refactor needed |
```

---

## Phase 3: Gap Analysis

### 3.1 Comparison Matrix

Create a comprehensive matrix with these columns:

| Column | Description | Values |
|--------|-------------|--------|
| Capability | Feature/service name | Free text |
| effect-ontology | File/service reference | Path |
| knowledge-slice | File/service reference or "Missing" | Path or "Missing" |
| Gap Type | Classification | Missing, Partial, Different, Equivalent |
| Priority | Business importance | P0, P1, P2, P3 |
| Complexity | Implementation effort | S, M, L, XL |
| Dependencies | What must come first | List of capabilities |
| Notes | Additional context | Free text |

### 3.2 Gap Type Definitions

| Type | Definition | Action |
|------|------------|--------|
| **Missing** | Capability does not exist in knowledge slice | Implement from scratch |
| **Partial** | Some functionality present, incomplete | Complete implementation |
| **Different** | Alternative approach taken | Evaluate trade-offs |
| **Equivalent** | Same capability, possibly different API | No action needed |

### 3.3 Priority Definitions

| Priority | Definition | Examples |
|----------|------------|----------|
| **P0** | Critical for core functionality | Entity extraction, basic queries |
| **P1** | Important for production use | SPARQL, SHACL validation |
| **P2** | Nice to have, improves UX | Advanced visualization, reasoning traces |
| **P3** | Future consideration | Distributed execution, external KB linking |

### 3.4 Complexity Definitions

| Complexity | Effort | Characteristics |
|------------|--------|-----------------|
| **S** | 1-2 days | Single service, clear pattern, no new deps |
| **M** | 3-5 days | Multiple services, some research needed |
| **L** | 1-2 weeks | New subsystem, significant research |
| **XL** | 2+ weeks | Major architectural change, new patterns |

---

## Phase 4: Roadmap Creation

### 4.1 Phase Grouping

Group gaps into implementation phases:

#### Phase A: Foundation (Prerequisites)
- Infrastructure needed for other phases
- Core service abstractions
- Database schema changes

#### Phase B: Core Capabilities (Must-Have)
- Essential for minimum viable product
- Blocking other high-value features
- User-facing functionality

#### Phase C: Advanced Features (Production-Ready)
- Performance optimization
- Advanced queries and reasoning
- Full integration

#### Phase D: Optimization (Scale/Performance)
- Distributed execution
- Caching strategies
- Monitoring and observability

### 4.2 Dependency Ordering

For each gap, identify:
1. **Hard dependencies**: Must be complete before starting
2. **Soft dependencies**: Helpful but not blocking
3. **Parallel tracks**: Can be developed independently

### 4.3 Estimation Guidelines

For each gap, estimate:

| Aspect | Estimate |
|--------|----------|
| Development effort | S/M/L/XL (days/weeks) |
| Testing effort | Percentage of dev effort |
| Documentation effort | Percentage of dev effort |
| Risk factors | What could go wrong |
| Unknowns | What needs more research |

### 4.4 Output Format

```markdown
## Phase [A/B/C/D]: [Phase Name]

**Estimated Duration**: X weeks
**Dependencies**: Phase [X] complete

### Work Items

| Item | Priority | Complexity | Dependencies | Estimate |
|------|----------|------------|--------------|----------|
| Implement SPARQL | P1 | L | Schema changes | 2 weeks |

### Risks

- Risk 1: Description
- Risk 2: Description

### Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
```

---

## Verification Checklist

Before considering the comparison complete:

- [ ] All 60+ services in effect-ontology cataloged
- [ ] All packages in knowledge slice audited
- [ ] Every capability has a gap classification
- [ ] Every gap has priority AND complexity
- [ ] Dependencies mapped for all L/XL items
- [ ] Roadmap phases are logically ordered
- [ ] No circular dependencies in roadmap
- [ ] Estimates are realistic (validated against similar work)
- [ ] Risk factors identified for high-complexity items
- [ ] Success criteria defined for each phase

---

## Tools and Techniques

### Recommended Approach

1. **Use Glob** to list all files in a directory
2. **Use Grep** to find patterns (e.g., `Context.Tag`, `Layer.effect`)
3. **Use Read** for detailed file analysis
4. **Use LSP** for type definitions and references

### Useful Grep Patterns

```bash
# Find all Context.Tag definitions
grep -r "Context\.Tag" tmp/effect-ontology/packages/@core-v2/src/

# Find all Layer definitions
grep -r "Layer\.(effect|succeed)" packages/knowledge/

# Find all TaggedError definitions
grep -r "TaggedError" packages/knowledge/
```

### File Organization

When cataloging, use this hierarchy:
1. Package level (e.g., @beep/knowledge-server)
2. Directory level (e.g., Extraction/)
3. File level (e.g., EntityExtractor.ts)
4. Service level (e.g., EntityExtractor service)
5. Method level (e.g., extract method)

---

## Common Pitfalls

### Avoid These Mistakes

1. **Surface-level comparison**: Look at implementation, not just file names
2. **Missing private utilities**: Some capabilities are in internal helpers
3. **Ignoring test patterns**: Test files reveal expected behavior
4. **Overlooking configuration**: Config services define capabilities
5. **Skipping error handling**: Error types reveal edge cases

### Quality Checks

1. **Cross-reference**: If a service is missing, check if it's in a different location
2. **Version alignment**: effect-ontology may use newer Effect patterns
3. **Domain fit**: Some effect-ontology features may not apply to wealth management
4. **Existing solutions**: Check if @beep/shared-* already provides capability
