# UI Coding Agents & Skills P1 Orchestrator

## Critical Orchestration Rules

1. **NEVER write skill/agent files yet** — P1 is discovery only
2. **PRESERVE context window** — Use subagents for research
3. **DOCUMENT everything** — All findings go to `outputs/`
4. **VALIDATE MCP servers** — Check availability before assuming tools work

---

## Context from P0 Completion

| Deliverable | Location | Status |
|-------------|----------|--------|
| Spec README | `specs/ui-coding-agents-and-skills/README.md` | Complete |
| Master workflow | `MASTER_ORCHESTRATION.md` | Complete |
| Agent prompts | `AGENT_PROMPTS.md` | Complete |
| Templates | `templates/` | Complete |

### MCP Servers Identified

| Server | Tools | Status |
|--------|-------|--------|
| MUI MCP | `useMuiDocs`, `fetchDocs` | To validate |
| shadcn MCP | registry tools | To validate |
| Playwright MCP | 40+ browser tools | To validate |

---

## P1 Tasks to Execute

### Task 1: MCP Server Validation (Parallel)

Execute these in parallel:

```
mcp__MCP_DOCKER__mcp-find({ query: "mui" })
mcp__MCP_DOCKER__mcp-find({ query: "shadcn" })
mcp__MCP_DOCKER__mcp-find({ query: "playwright" })
```

Document results:
- Available: Record catalog entry
- Not found: Document fallback strategy

### Task 2: Codebase UI Pattern Research (Parallel)

**Launch Task tool with codebase-researcher or Explore agent**:

```
Research UI implementation patterns in beep-effect monorepo.

Focus areas:
1. packages/ui/core/src/theme/core/components/*.tsx
   - Extract override patterns
   - Document sx prop conventions
   - Identify theme token usage

2. packages/ui/ui/src/atoms/
   - Catalog component interfaces
   - Document prop patterns
   - Identify export conventions

3. packages/ui/ui/src/inputs/
   - Form input patterns
   - Validation integration
   - State management patterns

Deliverable: Structured pattern catalog for skill constraints
```

### Task 3: Theme System Analysis (Parallel)

**Launch Task tool with Explore agent (very thorough)**:

```
Analyze MUI theme configuration in packages/ui/core/src/theme/:

Extract:
1. Color palette structure (primary, secondary, error, etc.)
2. Typography scale (h1-h6, body, caption, etc.)
3. Spacing scale (values in pixels/rem)
4. Breakpoint definitions
5. Component default props
6. Custom theme extensions

Deliverable: Theme constraint document for skill integration
```

### Task 4: Compile Findings

After all parallel tasks complete:

1. Create `outputs/codebase-ui-patterns.md`
2. Create `outputs/mcp-capability-matrix.md`
3. Update `REFLECTION_LOG.md` with P1 learnings

---

## Execution Protocol

### Step 1: Parallel Research Launch

Launch all research tasks simultaneously:
- MCP validation (direct tool calls)
- Codebase researcher (Task tool)
- Theme analysis (Task tool, Explore agent)

### Step 2: Collect Results

Wait for all agents to complete. Use `TaskOutput` for background agents.

### Step 3: Synthesize Findings

Combine all research into structured outputs:

**`outputs/codebase-ui-patterns.md`**:
```markdown
# Codebase UI Patterns

## Component Override Patterns
[From Task 2]

## Atom Interface Patterns
[From Task 2]

## Theme Integration
[From Task 3]
```

**`outputs/mcp-capability-matrix.md`**:
```markdown
# MCP Server Capability Matrix

## MUI MCP
[From Task 1 + template]

## shadcn MCP
[From Task 1 + template]

## Playwright MCP
[From Task 1 + template]
```

### Step 4: Update Reflection Log

Add P1 entry to `REFLECTION_LOG.md`:
- What patterns were discovered
- MCP server availability status
- Gaps or concerns identified
- Recommendations for P2

### Step 5: Generate P2 Handoff

Create `handoffs/HANDOFF_P2.md` with:
- P1 completion summary
- P2 task list (skill creation)
- Improved prompts based on P1 learnings

---

## Success Criteria

- [ ] MCP server availability documented
- [ ] `outputs/codebase-ui-patterns.md` created
- [ ] `outputs/mcp-capability-matrix.md` created
- [ ] Theme constraints extracted and documented
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P2.md` created

---

## Verification Commands

### Check output files exist
```bash
ls -la specs/ui-coding-agents-and-skills/outputs/
```

### Validate patterns file has content
```bash
wc -l specs/ui-coding-agents-and-skills/outputs/codebase-ui-patterns.md
```

### Verify MCP matrix
```bash
wc -l specs/ui-coding-agents-and-skills/outputs/mcp-capability-matrix.md
```
