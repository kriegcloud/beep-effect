# Delegation Rules for Orchestrators

## Purpose

This document defines explicit rules for when orchestrators MUST delegate to specialized sub-agents to prevent context exhaustion and ensure efficient task execution. These rules emerged from analyzing context consumption patterns and identifying delegation anti-patterns in orchestrator sessions.

## Mandatory Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | `codebase-researcher` | Sequential Glob/Read operations |
| Effect documentation lookup | `mcp-researcher` | Manual documentation searching |
| Source code implementation | `effect-code-writer` | Writing .ts files directly |
| Test implementation | `test-writer` | Writing .test.ts files directly |
| Architecture validation | `architecture-pattern-enforcer` | Manual layer boundary checks |
| README/AGENTS.md creation | `doc-writer` | Writing documentation files directly |
| Build/lint error fixing | `package-error-fixer` | Manual error resolution |
| Schema patterns | `effect-schema-expert` | Schema design decisions |
| Code review | `code-reviewer` | Manual code guideline checks |
| Predicate/type guard design | `effect-predicate-master` | Custom predicate implementation |

## Delegation Trigger Rules

An orchestrator MUST delegate when ANY of these conditions are met:

1. **File Count Threshold**: Task requires reading more than 3 files
2. **Tool Call Threshold**: Task requires more than 5 sequential tool calls
3. **Code Generation**: Task involves generating ANY source code (.ts files)
4. **Test Generation**: Task involves generating ANY test code (.test.ts files)
5. **Broad Search**: Task requires searching across multiple packages or directories
6. **Documentation Creation**: Task involves creating or updating .md files (except handoffs)
7. **Context Depth**: Task requires understanding >2 layers of dependencies
8. **Pattern Matching**: Task requires finding examples across the codebase
9. **Specialized Knowledge**: Task requires domain expertise (Effect patterns, schemas, predicates)

## Explicit "NEVER Do Directly" List

Orchestrators MUST NEVER:

### 1. Research Anti-Patterns

- Execute sequences of Glob → Read → Grep for research
- Iterate through files to build understanding
- Search Effect documentation manually
- Build dependency graphs through sequential file reading
- Explore multiple packages to find patterns
- Read test files to understand testing patterns

### 2. Implementation Anti-Patterns

- Write source code inline in the conversation
- Fix type/lint errors by directly editing files
- Create documentation files directly (README.md, AGENTS.md)
- Write test files directly
- Implement schemas without consulting schema expert
- Create predicates without consulting predicate expert
- Design service layers without architecture validation

### 3. Validation Anti-Patterns

- Check architecture boundaries manually
- Review code against guidelines manually
- Verify Effect pattern compliance by reading .claude/rules/
- Validate test patterns by comparing to examples
- Check naming conventions manually

### 4. Context-Consuming Anti-Patterns

- Read files "just to understand context"
- Explore related files "to get the full picture"
- Read entire files when only specific sections are needed
- Check multiple files to find an example
- Iterate through test files to understand patterns

## Orchestrator Allowed Actions

Orchestrators MAY directly:

### 1. Minimal Context Gathering

- Read 1-3 small files (< 100 lines each) for quick reference
- Single Glob to understand structure
- Check file existence with targeted Glob patterns
- Read specific files mentioned in handoffs
- Quick grep for specific identifiers (< 3 patterns)

### 2. Coordination Actions

- Delegate tasks to sub-agents (Task tool)
- Synthesize sub-agent outputs
- Make decisions based on agent results
- Resolve conflicts between agent recommendations
- Determine next phase based on results

### 3. Handoff Management

- Create handoff documents (HANDOFF_*.md)
- Update REFLECTION_LOG.md
- Track context budget
- Summarize phase completion
- Document decisions and rationale

### 4. Quick Verifications

- Check if files exist before delegating
- Verify package names with targeted Glob
- Quick syntax checks (single file, no dependencies)
- Confirm agent outputs match expectations

## Examples

### Good Delegation Example 1: Research

**Task**: Understand service patterns in the IAM domain

**WRONG (orchestrator doing directly)**:
```
[Glob: packages/iam/**/*.ts]
Found 47 files. Let me examine the service implementations...
[Read: packages/iam/server/src/services/AuthService.ts]
I see it uses Effect.Service. Let me check other services...
[Read: packages/iam/server/src/services/SessionService.ts]
[Read: packages/iam/server/src/services/UserService.ts]
Now let me look at the Layer composition...
[Grep: "Layer.effect" in packages/iam/]
[Read: packages/iam/server/src/layers/Auth.layer.ts]
[Read: packages/iam/server/src/layers/Session.layer.ts]
... (15+ tool calls, 40% context consumed before any real work)
```

**RIGHT (proper delegation)**:
```
[Task: codebase-researcher]
"Analyze Effect.Service patterns in packages/iam/server/src/services/.
Document:
1. Service definition patterns (Effect.Service vs Context.Tag)
2. Layer composition patterns (Layer.effect vs Layer.succeed)
3. Dependency injection patterns
4. Error handling approaches
5. Common utilities used

Provide concrete examples for each pattern found."

(Agent returns comprehensive 800-word summary in ~2k tokens,
orchestrator has full picture at 1% context cost)
```

### Good Delegation Example 2: Implementation

**Task**: Create a new repository implementation for Entity

**WRONG (orchestrator doing directly)**:
```
Let me look at existing repositories for patterns...
[Glob: packages/*/server/src/db/repos/*.ts]
Found 12 repos. Let me check a few...
[Read: packages/knowledge/server/src/db/repos/Embedding.repo.ts]
Good pattern. Now let me check the domain entity...
[Read: packages/knowledge/domain/src/entities/Entity/Entity.model.ts]
And the table schema...
[Read: packages/knowledge/tables/src/tables/entity.table.ts]
Now I'll write the repository...
[Write: packages/knowledge/server/src/db/repos/Entity.repo.ts]
Let me verify it compiles...
[Read: verification output]
Type error on line 42. Let me fix...
[Edit: fix type error]
Another error. Let me check...
[Read: dependencies]
... (20+ tool calls, implementation incomplete, patterns inconsistent)
```

**RIGHT (proper delegation)**:
```
First, I need to understand the repository patterns:

[Task: codebase-researcher]
"Analyze repository patterns in packages/knowledge/server/src/db/repos/.
Focus on: CRUD method signatures, error handling, Effect.Service usage,
Layer construction. Provide 1-2 canonical examples."

Based on patterns, delegate implementation:

[Task: effect-code-writer]
"Create Entity.repo.ts in packages/knowledge/server/src/db/repos/ following
the pattern from Embedding.repo.ts.

Requirements:
- Implement CRUD operations: findById, findAll, create, update, delete
- Use Effect.Service pattern with Layer.effect
- Handle NotFound errors with tagged errors from @beep/shared/domain/errors
- Use SqlClient from @effect/sql
- Follow entity-id patterns from @beep/shared/domain/entity-ids

Reference files:
- Domain: packages/knowledge/domain/src/entities/Entity/Entity.model.ts
- Table: packages/knowledge/tables/src/tables/entity.table.ts
- Pattern: packages/knowledge/server/src/db/repos/Embedding.repo.ts"

(Agent produces complete, verified, pattern-consistent implementation)
```

### Good Delegation Example 3: Documentation

**Task**: Create README.md for new package @beep/knowledge/tables

**WRONG (orchestrator doing directly)**:
```
Let me understand what this package does...
[Read: packages/knowledge/tables/package.json]
[Glob: packages/knowledge/tables/src/**/*.ts]
Found 8 files. Let me check the exports...
[Read: packages/knowledge/tables/src/index.ts]
[Read: packages/knowledge/tables/src/schema.ts]
Now let me look at related packages for context...
[Read: packages/knowledge/domain/README.md]
[Read: packages/shared/tables/README.md]
I'll write the README...
[Write: packages/knowledge/tables/README.md]
... (12+ tool calls, inconsistent with doc-writer standards)
```

**RIGHT (proper delegation)**:
```
[Task: doc-writer]
"Create README.md for @beep/knowledge/tables following project standards.

Package purpose: Drizzle table schemas for knowledge graph entities
Key exports: entity.table.ts, relation.table.ts, embedding.table.ts, schema.ts
Layer position: Tables layer (domain → tables → server)
Dependencies: @beep/shared/tables, @effect/sql/Pg

Include: Purpose, Key Exports table, Usage example with imports,
Dependencies table, Development commands."

(Agent produces standards-compliant README matching project style)
```

### Anti-Pattern: Sequential File Reading

**WRONG**:
```
Let me explore the knowledge package structure...
[Glob: packages/knowledge/**/*.ts]
Found 200 files across 5 sub-packages. Let me understand the architecture...
[Read: packages/knowledge/domain/src/index.ts]
I see entities exported. Let me check what entities exist...
[Glob: packages/knowledge/domain/src/entities/**/*.ts]
Found Entity, Embedding, Extraction, Mention, Ontology...
Let me understand the Entity implementation...
[Read: packages/knowledge/domain/src/entities/Entity/Entity.model.ts]
It uses schemas. Let me check the schemas...
[Read: packages/knowledge/domain/src/entities/Entity/Entity.schema.ts]
Now the errors...
[Read: packages/knowledge/domain/src/errors/entity.errors.ts]
Let me see how this connects to tables...
[Read: packages/knowledge/tables/src/tables/entity.table.ts]
And the repository layer...
[Read: packages/knowledge/server/src/db/repos/index.ts]
... (25+ tool calls, 60% context consumed, still incomplete picture)
```

**RIGHT**:
```
I need a comprehensive understanding of the knowledge package architecture.

[Task: codebase-researcher]
"Map the knowledge graph vertical slice architecture in packages/knowledge/.

Provide:
1. Package dependency graph (domain → tables → server → client → ui)
2. Key entities and their responsibilities
3. Data flow: Domain schemas → Table schemas → Repository → Services
4. Integration points with shared packages
5. Notable patterns or deviations from standard slice structure

Focus on architectural overview, not implementation details."

(Agent returns structured analysis with clear architecture map,
orchestrator proceeds with 95% context remaining)
```

### Good Delegation Example 4: Schema Design

**Task**: Design schema for new Entity with complex validation

**WRONG (orchestrator doing directly)**:
```
Let me check existing schemas for patterns...
[Read: packages/knowledge/domain/src/entities/Embedding/Embedding.schema.ts]
[Read: packages/shared/domain/src/schemas/base.schema.ts]
I'll create the schema...
[Write: Entity.schema.ts with custom validators]
... (inconsistent with Effect Schema best practices)
```

**RIGHT (proper delegation)**:
```
[Task: effect-schema-expert]
"Design schema for Entity in packages/knowledge/domain/src/entities/Entity/.

Entity has:
- id: EntityId (branded UUID)
- name: non-empty string
- attributes: Record<string, unknown> (flexible JSON)
- createdAt/updatedAt: DateTime
- Optional: description, metadata

Requirements:
- Use BS helpers where applicable (NonEmptyString, DateTimeUtcFromAllAcceptable)
- Brand the ID type
- Validate attributes structure
- Follow patterns from Embedding.schema.ts

Provide: Schema definition + encode/decode utilities + branded types."

(Agent produces Effect-idiomatic schema with proper branding and validation)
```

## Decision Flowchart

When encountering a task, follow this decision process:

```
START
  ↓
1. Does task require reading >3 files?
   YES → Delegate to codebase-researcher
   NO ↓

2. Does task require Effect documentation?
   YES → Delegate to mcp-researcher
   NO ↓

3. Does task involve writing .ts files?
   YES → Delegate to effect-code-writer or test-writer
   NO ↓

4. Does task involve writing .md files (not handoffs)?
   YES → Delegate to doc-writer
   NO ↓

5. Does task involve fixing errors?
   YES → Delegate to package-error-fixer
   NO ↓

6. Does task involve architecture validation?
   YES → Delegate to architecture-pattern-enforcer
   NO ↓

7. Does task involve schema design/validation?
   YES → Delegate to effect-schema-expert
   NO ↓

8. Does task involve predicate/type guard design?
   YES → Delegate to effect-predicate-master
   NO ↓

9. Does task require >5 tool calls?
   YES → Delegate to appropriate specialist
   NO ↓

10. Is task simple coordination or synthesis?
    YES → Orchestrator may proceed directly
    NO → Re-evaluate task decomposition
```

## Context Budget Tracking

Orchestrators should track estimated context consumption:

### Tool Call Cost Estimates

| Action | Estimated Cost | Notes |
|--------|---------------|-------|
| Read small file (<100 lines) | ~1k tokens | Acceptable for quick reference |
| Read medium file (100-500 lines) | ~3k tokens | Use sparingly |
| Read large file (>500 lines) | ~8k+ tokens | Avoid unless critical |
| Glob results | ~500 tokens | Per 50 results |
| Grep results (content mode) | ~2k tokens | Per 20 matches |
| Task delegation | ~500 tokens | Request only |
| Task result | ~2k-5k tokens | Specialist summary |

### Budget Allocation Guidelines

For a 200k token budget:

- **Phase Planning**: 5% (10k tokens)
  - Read handoffs, understand requirements, plan delegation

- **Delegation & Coordination**: 25% (50k tokens)
  - Task requests to specialists
  - Agent result synthesis
  - Decision making

- **Handoff Creation**: 15% (30k tokens)
  - HANDOFF document creation
  - REFLECTION_LOG updates
  - Context summarization

- **Reserve Buffer**: 55% (110k tokens)
  - Unexpected iterations
  - Error recovery
  - Additional research needs

**Warning Signs of Budget Overrun:**
- More than 10 direct file reads in a session
- More than 20 total tool calls before first delegation
- More than 5 Grep operations
- Reading the same file multiple times
- Exploring "just to understand context"

## Rationale

These rules exist because:

### 1. Context is Finite

Each orchestrator session has ~200k tokens of context. Sequential research patterns can consume 50%+ of this budget before productive work begins.

**Example Cost Breakdown (Anti-Pattern)**:
```
Sequential research approach:
- 15 file reads (avg 3k each): 45k tokens (22.5%)
- 8 Grep operations (avg 2k each): 16k tokens (8%)
- 5 Glob operations (avg 500 each): 2.5k tokens (1.25%)
Total: 63.5k tokens (31.75%) spent on research alone

Remaining for productive work: 136.5k tokens
- But now need to hold all research in context
- Synthesis becomes harder with fragmented knowledge
- Handoff creation compressed due to budget pressure
```

**Delegation Approach**:
```
Single codebase-researcher delegation:
- Task request: 500 tokens
- Agent summary: 3k tokens
Total: 3.5k tokens (1.75%)

Remaining for productive work: 196.5k tokens (98.25%)
- Clear, structured understanding
- No fragmented context to track
- Ample space for handoff quality
```

### 2. Specialists are Efficient

Sub-agents are optimized for their tasks with domain-specific knowledge and efficient patterns.

**Efficiency Comparison**:

| Task | Orchestrator Direct | Specialist Delegation | Efficiency Gain |
|------|--------------------|-----------------------|-----------------|
| Find all Effect.Service patterns | 15 files × 3k = 45k tokens | 3.5k tokens | 12.8x |
| Implement repository | 20+ tool calls, 50k+ tokens | 5k tokens | 10x |
| Create README | 12 file reads, 36k tokens | 3k tokens | 12x |
| Fix type errors | Trial-and-error, 30k+ tokens | 8k tokens (with verification) | 3.75x |

### 3. Handoffs Require Headroom

Quality handoffs need context space for:
- Synthesizing multi-agent results
- Documenting decisions and rationale
- Providing clear next steps
- Capturing learnings for reflection

A context-exhausted orchestrator produces:
- Rushed handoffs with missing context
- Incomplete decision documentation
- Skipped reflection updates
- Lost knowledge between phases

### 4. Quality and Consistency Improve

Specialists follow codebase patterns consistently because:

- They have targeted rules in their prompts
- They reference canonical examples
- They validate against project standards
- They don't context-switch between concerns

Direct orchestrator code often shows:
- Inconsistent naming conventions
- Mixed patterns from different examples
- Missing error handling
- Incomplete JSDoc
- Non-idiomatic Effect usage

### 5. Error Recovery is Cheaper

When specialists make mistakes:
- Error is scoped to their domain
- Re-delegation is targeted
- Context cost is bounded

When orchestrators make mistakes:
- Error compounds with research cost
- Fix requires re-reading context
- Context budget spirals downward

## Measuring Delegation Effectiveness

Track these metrics to validate delegation patterns:

### Session Health Metrics

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Direct file reads | <5 | 5-10 | >10 |
| Tool calls before first delegation | <8 | 8-15 | >15 |
| Context consumed at phase midpoint | <30% | 30-50% | >50% |
| Specialist delegations per phase | 3-6 | 1-2 or >8 | 0 |
| Handoff document quality | Complete | Rushed | Minimal |

### Quality Indicators

**Good delegation patterns produce:**
- Handoffs with clear next steps
- Updated reflection logs
- Consistent code/doc quality
- Preserved context budget
- Reusable specialist outputs

**Poor delegation patterns produce:**
- Vague handoffs
- Skipped reflections
- Inconsistent patterns
- Context exhaustion
- Repeated research in next phase

## Exceptions

These rules may be relaxed ONLY when:

1. **Emergency Hotfix**: Critical production issue requires immediate fix
   - Still delegate for verification after fix

2. **Specialist Unavailable**: Required specialist agent doesn't exist
   - Document need for new specialist in reflection

3. **Trivial Task**: Task genuinely requires <3 tool calls
   - Be honest about "trivial" assessment

4. **Handoff Final Review**: Quick verification of delegated output
   - Reading specialist output doesn't count against limits

## Evolution

These rules should be updated when:

- New specialist agents are created
- Context budget changes
- Tool capabilities change
- Anti-patterns are discovered
- Efficiency metrics improve delegation strategies

**Update Process**:
1. Document observed anti-pattern in REFLECTION_LOG
2. Propose rule addition/modification
3. Test in pilot phase
4. Update this document with learnings
5. Propagate to orchestrator prompts

---

## Summary

**Golden Rule**: If you're reading more than 3 files or making more than 5 tool calls to understand something, you should be delegating to a specialist.

**Context is Precious**: Every token spent on research is a token not available for synthesis, decision-making, and handoff quality. Delegate early, delegate often, preserve context for coordination.

**Specialists Exist for a Reason**: Use them. They're optimized for efficiency and consistency. Your role as orchestrator is to coordinate their outputs, not replicate their work.
