# Agent Prompts: Todox Design

> Ready-to-use prompts for specialized agents in Todox implementation.

---

## Phase 0 Agents

### codebase-researcher: FlexLayout Analysis

```
Analyze the FlexLayout implementation in the Todox application.

Research questions:
1. How is FlexLayout used in apps/todox/src/app/demo/_lib/App.tsx?
2. What tab types and components are rendered?
3. How is layout state managed and persisted?
4. What integration points exist with the theme system?

Also examine:
- apps/todox/src/app/page.tsx (current root structure)
- packages/ui/ui/src/flexlayout-react/ (wrapper implementation)

Output a report with:
- Current FlexLayout usage patterns
- Component factory requirements
- State management approach
- Recommendations for WorkSpace integration
```

### architecture-pattern-enforcer: Multi-Tenant Schema Validation

```
Validate the proposed multi-tenant schema design for Todox.

Check against:
1. Layer dependency rules (domain -> tables -> server -> client -> ui)
2. Cross-slice import restrictions
3. RLS policy completeness
4. org_id presence on all tenant-scoped tables

Input: outputs/schema-design.md

Output: outputs/architecture-review.md with:
- Violations found
- Remediation recommendations
- Compliance score
```

---

## Phase 1 Agents

### test-writer: WorkSpace Domain Tests

```
Create Effect-first tests for the WorkSpace domain.

Target package: packages/workspaces/domain/

Test coverage:
1. WorkSpace schema validation (valid and invalid cases)
2. Document block structure validation
3. Hierarchical nesting constraints
4. Entity ID generation patterns

Use @beep/testkit patterns:
- Effect.gen for test bodies
- Arbitrary for property-based tests
- Layer composition for dependencies

Output: packages/workspaces/domain/src/__tests__/
```

### codebase-researcher: Existing Document Patterns

```
Research existing document/block patterns in the codebase.

Search for:
1. Notion-like block structures
2. TipTap editor integration (apps/todox/src/features/editor/)
3. Content serialization patterns
4. Collaborative editing patterns (Liveblocks config)

Output: Key patterns to reuse for WorkSpace documents
```

---

## Phase 3 Agents

### web-researcher: Gmail API Integration

```
Research Gmail API integration patterns for Effect applications.

Topics:
1. Gmail API OAuth 2.0 flow with offline access
2. Watch/push notifications for real-time sync
3. Batch operations for initial sync
4. Rate limiting and quota management
5. Token refresh best practices

Focus on:
- TypeScript integration patterns
- Error handling approaches
- Security considerations

Output: Integration approach recommendation
```

---

## Phase 4 Agents

### mcp-researcher: @effect/ai Patterns

```
Research @effect/ai and McpServer patterns.

Search for:
1. @effect/ai service definitions
2. McpServer tool registration
3. Schema integration for tool parameters
4. Agent execution patterns with Effect.gen

Also research:
- How to integrate with existing Effect services
- Error handling in MCP tool handlers
- Streaming responses from agents

Output: Recommended patterns for Todox agent framework
```

### codebase-researcher: Existing AI Integration

```
Analyze existing AI integration in Todox.

Files to examine:
1. apps/todox/src/components/ai-chat/ (AI chat panel)
2. apps/todox/src/config.ts (model configuration)
3. Any @ai-sdk usage patterns

Output:
- Current AI integration approach
- Migration path to @effect/ai
- Component reuse opportunities
```

---

## Cross-Phase Agents

### reflector: Phase Synthesis

```
Analyze REFLECTION_LOG.md and synthesize learnings.

Input: Current REFLECTION_LOG.md entries

Output:
1. Pattern extraction (reusable approaches)
2. Anti-pattern warnings (what to avoid)
3. Prompt improvements for next phase
4. Documentation updates needed

Apply improvements to:
- MASTER_ORCHESTRATION.md (if workflows need refinement)
- AGENT_PROMPTS.md (this file, if prompts need improvement)
- README.md (if scope changed)
```

### doc-writer: Package Documentation

```
Create documentation for new packages.

For each new package (workspaces/*, agents/*, integrations/*):

1. Create AGENTS.md with:
   - Package architecture overview
   - Key abstractions and their purposes
   - Common modification patterns
   - Gotchas and edge cases

2. Create README.md with:
   - Package purpose
   - Installation (if applicable)
   - Usage examples with Effect patterns
   - API reference

Follow existing patterns from:
- packages/iam/client/AGENTS.md
- packages/iam/client/README.md
```

### spec-reviewer: Quality Assessment

```
Review the todox-design spec for quality and completeness.

Check:
1. README.md follows META_SPEC_TEMPLATE structure
2. REFLECTION_LOG.md exists and has entries
3. MASTER_ORCHESTRATION.md has all phases defined
4. Handoff documents follow HANDOFF_STANDARDS.md
5. All code examples use Effect patterns
6. Success criteria are measurable

Output: outputs/spec-review.md with:
- Compliance score
- Issues found
- Recommended fixes
```

---

## Usage Notes

### Launching Agents

Use the Task tool with appropriate subagent_type:

```
Task tool:
  subagent_type: "codebase-researcher"
  prompt: [paste prompt from above]
```

### Agent Output Handling

- **read-only agents** (codebase-researcher, mcp-researcher): Inform orchestrator
- **write-reports agents** (reflector, spec-reviewer): Check outputs/ directory
- **write-files agents** (test-writer, doc-writer): Verify files created

### Parallel Execution

Independent research tasks can run in parallel:

```
Parallel-safe combinations:
- codebase-researcher + web-researcher
- test-writer + doc-writer (different packages)

Sequential requirements:
- architecture-pattern-enforcer AFTER schema design
- reflector AFTER phase completion
```
