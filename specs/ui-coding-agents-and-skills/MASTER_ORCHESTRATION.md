# UI Coding Agents and Skills: Master Orchestration

> Complete workflow for creating UI-focused skills and agents with MCP server integration.

---

## Critical Orchestration Rules

1. **NEVER skip MCP validation** — Always verify server availability before depending on tools
2. **PRESERVE existing theme patterns** — Skills must respect `packages/ui/core` conventions
3. **AGENT-PHASE alignment** — Use read-only agents for research, write-capable for implementation
4. **PROGRESSIVE skill creation** — MUI skill first (primary library), then shadcn, then testing

---

## Phase 0: Scaffolding

### 0.1 Create Skill Directory Structure

```bash
mkdir -p .claude/skills/ui
touch .claude/skills/ui/{mui-component-writer,shadcn-component-writer,visual-tester}.md
```

### 0.2 Create Agent Files

```bash
touch .claude/agents/{ui-code-writer,ui-reviewer,visual-qa}.md
```

### 0.3 Validate Structure

Launch `architecture-pattern-enforcer` to verify:
- Skill files exist in correct location
- Agent files follow `.claude/agents/*.md` pattern
- No conflicts with existing skills

---

## Phase 1: Discovery

### 1.1 Codebase UI Pattern Research

**Agent**: `codebase-researcher` (read-only)

**Prompt**:
```
Research UI patterns in beep-effect monorepo:

1. Analyze packages/ui/core/src/theme/core/components/*.tsx
   - Extract common patterns for MUI component overrides
   - Identify sx prop usage patterns
   - Document color token usage

2. Analyze packages/ui/ui/src/
   - Catalog existing atoms and their interfaces
   - Document form input patterns
   - Identify reusable component patterns

3. Analyze packages/shared/ui/src/
   - Document domain-specific UI patterns
   - Identify file-related component conventions

Output: specs/ui-coding-agents-and-skills/outputs/codebase-ui-patterns.md
```

### 1.2 Theme System Analysis

**Agent**: `Explore` (thorough)

**Prompt**:
```
Explore the MUI theme configuration in beep-effect:

Focus areas:
- packages/ui/core/src/theme/core/ - Base theme setup
- packages/ui/core/src/theme/with-settings/ - Settings integration
- Color palette structure and tokens
- Typography scale definitions
- Spacing conventions
- Breakpoint definitions

Deliverable: Summary of theme constraints for skill integration
```

### 1.3 MCP Server Capability Verification

**Agent**: `mcp-researcher` (read-only)

**Research**:
1. Verify MUI MCP tools (`useMuiDocs`, `fetchDocs`)
2. Verify shadcn MCP capabilities (list, search, install)
3. Verify Playwright MCP testing tools

**Output**: Capability matrix for skill design

---

## Phase 2: MCP Integration Design

### 2.1 MUI MCP Integration

**Tools Available**:
| Tool | Usage Pattern |
|------|---------------|
| `useMuiDocs` | Primary documentation lookup |
| `fetchDocs` | Follow-up URL fetching |

**Skill Integration Pattern**:
```typescript
// In skill prompt:
// 1. User describes component need
// 2. Skill invokes useMuiDocs for relevant components
// 3. Skill generates code following documentation
// 4. Skill validates against theme constraints
```

### 2.2 shadcn MCP Integration

**Capabilities**:
- Component discovery across registries
- Natural language search
- Direct installation to project

**Registry Configuration** (components.json):
```json
{
  "registries": {
    "shadcn": "https://ui.shadcn.com/registry",
    "@beep": "https://internal.registry.example.com"
  }
}
```

### 2.3 Playwright MCP Integration

**Recommended Capabilities**:
```bash
npx @playwright/mcp@latest --caps=vision,testing
```

**Key Tools for Visual Testing**:
| Tool | Purpose |
|------|---------|
| `browser_navigate` | Load component page |
| `browser_snapshot` | Capture accessibility tree |
| `browser_take_screenshot` | Visual capture |
| `browser_verify_element_visible` | Assert visibility |
| `browser_verify_text_visible` | Assert text content |
| `browser_generate_locator` | Generate test locators |

---

## Phase 3: Skill Design

### 3.1 MUI Component Writer Skill

**File**: `.claude/skills/ui/mui-component-writer.md`

**Structure**:
```markdown
# MUI Component Writer Skill

## When to Invoke
- User requests MUI component creation
- User asks about Material UI patterns
- User needs to modify existing MUI components

## MCP Prerequisites
[MUI MCP enablement steps]

## Workflow
1. Parse component requirements
2. Query useMuiDocs for relevant APIs
3. Check existing theme in packages/ui/core
4. Generate component following patterns
5. Validate against codebase conventions

## Constraints
- Use sx prop, not styled()
- Import from @mui/material (not @material-ui/core)
- Follow existing atom patterns from packages/ui/ui
- Respect theme tokens (no hardcoded colors)
- PascalCase component names

## Output Format
[Component file structure]
```

### 3.2 shadcn Component Writer Skill

**File**: `.claude/skills/ui/shadcn-component-writer.md`

**Key Differentiators**:
- Tailwind CSS styling (not sx prop)
- Component installation via MCP
- CN utility for class merging
- Variant patterns with CVA

### 3.3 Visual Tester Skill

**File**: `.claude/skills/ui/visual-tester.md`

**Workflow**:
1. Start dev server (if not running)
2. Navigate to component route
3. Capture accessibility snapshot
4. Verify expected elements
5. Generate screenshot for comparison
6. Produce test report

---

## Phase 4: Agent Design

### 4.1 UI Code Writer Agent

**File**: `.claude/agents/ui-code-writer.md`

**Tools**:
```yaml
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - mcp__mui__useMuiDocs      # MUI documentation
  - mcp__mui__fetchDocs       # Follow-up docs
  - mcp__shadcn__*            # shadcn tools
```

**Methodology**:
1. Determine UI library (MUI vs shadcn)
2. Query relevant MCP documentation
3. Check existing patterns in codebase
4. Generate component with full typing
5. Add to appropriate exports

### 4.2 UI Reviewer Agent

**File**: `.claude/agents/ui-reviewer.md`

**Focus Areas**:
- Theme token compliance
- Accessibility attributes
- Responsive design patterns
- Import organization
- Component composition

### 4.3 Visual QA Agent

**File**: `.claude/agents/visual-qa.md`

**Tools**:
```yaml
tools:
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_snapshot
  - mcp__playwright__browser_take_screenshot
  - mcp__playwright__browser_verify_element_visible
  - mcp__playwright__browser_verify_text_visible
  - mcp__playwright__browser_generate_locator
```

---

## Phase 5: Implementation

### 5.1 Create MUI Component Writer Skill

**Task**: Write `.claude/skills/ui/mui-component-writer.md`

**Requirements**:
1. MCP enablement section with fallback
2. Codebase pattern constraints
3. Step-by-step generation workflow
4. Example invocations
5. Output templates

### 5.2 Create shadcn Component Writer Skill

**Task**: Write `.claude/skills/ui/shadcn-component-writer.md`

**Differentiators from MUI skill**:
- Tailwind class patterns
- Registry-based component addition
- CVA variant system
- CN utility usage

### 5.3 Create Visual Tester Skill

**Task**: Write `.claude/skills/ui/visual-tester.md`

**Playwright Integration**:
- Server startup coordination
- Route navigation patterns
- Snapshot interpretation
- Screenshot management

### 5.4 Create UI Agents

**Tasks**:
1. `ui-code-writer.md` - Unified generation
2. `ui-reviewer.md` - Code review focus
3. `visual-qa.md` - Testing automation

---

## Verification Checklist

### Skill Files
- [ ] `.claude/skills/ui/mui-component-writer.md` created
- [ ] `.claude/skills/ui/shadcn-component-writer.md` created
- [ ] `.claude/skills/ui/visual-tester.md` created

### Agent Files
- [ ] `.claude/agents/ui-code-writer.md` created
- [ ] `.claude/agents/ui-reviewer.md` created
- [ ] `.claude/agents/visual-qa.md` created

### Integration
- [ ] MCP servers documented with enablement steps
- [ ] Fallback patterns for unavailable servers
- [ ] Theme constraints extracted and integrated
- [ ] Skills registered in settings.json (if required)

### Testing
- [ ] MUI skill generates valid component
- [ ] shadcn skill installs component successfully
- [ ] Visual tester captures snapshots

---

## Execution Commands

### MCP Server Verification
```
mcp__MCP_DOCKER__mcp-find({ query: "mui" })
mcp__MCP_DOCKER__mcp-find({ query: "shadcn" })
mcp__MCP_DOCKER__mcp-find({ query: "playwright" })
```

### Build Validation
```bash
bun run check
bun run lint
```

### Local Testing
```bash
bun run dev  # Start dev server for Playwright testing
```
