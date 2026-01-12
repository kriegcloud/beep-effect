# UI Coding Agents and Skills: Agent Prompts

> Ready-to-use prompts for orchestrating specialized agents during spec execution.

---

## Discovery Phase Agents

### Codebase UI Pattern Researcher

**Agent**: `codebase-researcher`

```
Research UI implementation patterns in the beep-effect monorepo.

## Analysis Targets

1. **MUI Theme System** (`packages/ui/core/src/theme/`)
   - Extract color palette structure
   - Document typography scale
   - Identify spacing tokens
   - Catalog breakpoint definitions

2. **Component Overrides** (`packages/ui/core/src/theme/core/components/`)
   - Common override patterns
   - sx prop usage conventions
   - Theme token application
   - Responsive styling patterns

3. **Reusable Components** (`packages/ui/ui/src/`)
   - Atom component interfaces
   - Form input patterns
   - Animation components
   - Icon system usage

4. **Domain UI** (`packages/shared/ui/src/`)
   - File management components
   - Dialog patterns
   - List/table patterns

## Deliverables

Output a structured report with:
- Pattern catalog (code examples)
- Constraint list (forbidden patterns)
- Recommended patterns (preferred approaches)
- Integration points (where skills should inject)

Save to: specs/ui-coding-agents-and-skills/outputs/codebase-ui-patterns.md
```

### MCP Capability Researcher

**Agent**: `mcp-researcher`

```
Research MCP server capabilities for UI development tools.

## Servers to Research

1. **MUI MCP** (@anthropic-ai/mui-mcp)
   - Available tools and their signatures
   - Documentation lookup patterns
   - Error handling approaches

2. **shadcn MCP** (shadcn@latest mcp)
   - Registry interaction tools
   - Component installation flow
   - Multi-registry configuration

3. **Playwright MCP** (@playwright/mcp)
   - Testing capability tools
   - Vision capability tools
   - Tracing and debugging tools

## Deliverables

- Tool capability matrix
- Configuration snippets
- Integration code patterns
- Fallback strategies when unavailable

Save to: specs/ui-coding-agents-and-skills/outputs/mcp-capability-matrix.md
```

---

## Implementation Phase Agents

### UI Code Writer Agent Definition

**Agent**: `doc-writer`

```
Create the ui-code-writer agent definition file.

## File Location
.claude/agents/ui-code-writer.md

## Agent Structure

Follow the pattern from .claude/agents/code-observability-writer.md:

1. **YAML Frontmatter**
   - description: UI component generation with MCP documentation lookup
   - tools: Read, Write, Edit, Glob, Grep, plus MCP tools

2. **MCP Server Prerequisites**
   - MUI MCP enablement (mcp__MCP_DOCKER__mcp-add)
   - shadcn MCP enablement
   - Fallback to local sources

3. **Critical Constraints**
   - Effect patterns for React hooks
   - No async/await in Effect code
   - PascalCase Schema constructors
   - Theme token compliance

4. **Component Generation Workflow**
   - Requirement analysis
   - Documentation lookup (MCP)
   - Pattern matching (codebase)
   - Code generation
   - Export integration

5. **Output Templates**
   - Functional component structure
   - Props interface pattern
   - Export pattern

## Reference Files
- .claude/agents/code-observability-writer.md (structure)
- packages/ui/ui/src/atoms/* (component patterns)
- packages/ui/core/src/theme/core/components/* (override patterns)
```

### UI Reviewer Agent Definition

**Agent**: `doc-writer`

```
Create the ui-reviewer agent definition file.

## File Location
.claude/agents/ui-reviewer.md

## Agent Focus

Code review specialized for UI components:

1. **Theme Compliance**
   - Token usage verification
   - Color palette adherence
   - Typography scale usage
   - Spacing consistency

2. **Accessibility Audit**
   - ARIA attributes
   - Keyboard navigation
   - Focus management
   - Screen reader compatibility

3. **Responsive Design**
   - Breakpoint usage
   - Mobile-first patterns
   - Container queries
   - Flexible layouts

4. **Code Quality**
   - Import organization
   - Type completeness
   - Prop validation
   - Memoization opportunities

## Review Checklist Template
Include a markdown checklist agents can populate during review.
```

### Visual QA Agent Definition

**Agent**: `doc-writer`

```
Create the visual-qa agent definition file.

## File Location
.claude/agents/visual-qa.md

## Agent Capabilities

Playwright MCP-powered visual testing:

1. **Test Setup**
   - Dev server coordination
   - Browser mode selection (persistent/isolated)
   - Viewport configuration

2. **Navigation Workflow**
   - Route-based navigation
   - Authentication handling
   - State preparation

3. **Visual Verification**
   - Accessibility snapshot analysis
   - Element visibility assertions
   - Text content verification
   - Screenshot capture

4. **Reporting**
   - Test result formatting
   - Screenshot organization
   - Locator generation for CI

## Playwright Tools Integration
Map each Playwright MCP tool to specific testing scenarios.
```

---

## Skill Creation Prompts

### MUI Component Writer Skill

**Agent**: `doc-writer`

```
Create the MUI component writer skill.

## File Location
.claude/skills/ui/mui-component-writer.md

## Skill Structure

1. **When to Invoke**
   - User requests MUI/Material UI component
   - User modifies existing MUI code
   - User asks about MUI patterns

2. **MCP Prerequisites**
   Enable MUI MCP or provide fallback:
   ```
   mcp__MCP_DOCKER__mcp-find({ query: "mui" })
   mcp__MCP_DOCKER__mcp-add({ name: "mui", activate: true })
   ```

3. **Workflow Steps**
   a. Parse component requirements from user
   b. Query MUI docs via useMuiDocs
   c. Check existing theme (packages/ui/core)
   d. Check existing atoms (packages/ui/ui)
   e. Generate component following patterns
   f. Add to exports if new file

4. **Codebase Constraints**
   Extract from:
   - .claude/rules/effect-patterns.md (for hooks)
   - packages/ui/core patterns (for styling)
   - packages/ui/ui conventions (for structure)

5. **Output Template**
   ```typescript
   import type { SxProps, Theme } from "@mui/material/styles";
   import Box from "@mui/material/Box";
   // ... component implementation
   ```

## Reference
- packages/ui/ui/src/atoms/label/label.tsx (example atom)
- packages/ui/core/src/theme/core/components/button.tsx (override pattern)
```

### shadcn Component Writer Skill

**Agent**: `doc-writer`

```
Create the shadcn/Tailwind component writer skill.

## File Location
.claude/skills/ui/shadcn-component-writer.md

## Skill Structure

1. **When to Invoke**
   - User requests shadcn component
   - User wants Tailwind-styled component
   - User asks about CN/CVA patterns

2. **MCP Prerequisites**
   ```
   mcp__MCP_DOCKER__mcp-add({ name: "shadcn", activate: true })
   ```

3. **Workflow Steps**
   a. Parse component requirements
   b. Search registry for similar components
   c. Install base component if available
   d. Customize with project patterns
   e. Add Tailwind classes following conventions

4. **Tailwind Conventions**
   - Responsive prefixes (sm:, md:, lg:)
   - Dark mode variants (dark:)
   - State variants (hover:, focus:)
   - Custom theme integration

5. **CVA Pattern**
   ```typescript
   import { cva, type VariantProps } from "class-variance-authority";

   const buttonVariants = cva("base-classes", {
     variants: {
       variant: {
         default: "default-classes",
         destructive: "destructive-classes",
       },
       size: {
         sm: "small-classes",
         lg: "large-classes",
       },
     },
     defaultVariants: {
       variant: "default",
       size: "sm",
     },
   });
   ```
```

### Visual Tester Skill

**Agent**: `doc-writer`

```
Create the visual testing skill.

## File Location
.claude/skills/ui/visual-tester.md

## Skill Structure

1. **When to Invoke**
   - User wants to test component visually
   - User needs screenshot comparison
   - User wants accessibility verification

2. **MCP Prerequisites**
   ```
   mcp__MCP_DOCKER__mcp-add({ name: "playwright", activate: true })
   ```

3. **Workflow Steps**
   a. Verify dev server is running
   b. Configure browser mode
   c. Navigate to target route
   d. Capture accessibility snapshot
   e. Run visual assertions
   f. Generate screenshots
   g. Produce test report

4. **Playwright Tools Usage**
   | Step | Tool |
   |------|------|
   | Navigate | browser_navigate |
   | Snapshot | browser_snapshot |
   | Screenshot | browser_take_screenshot |
   | Assert visible | browser_verify_element_visible |
   | Assert text | browser_verify_text_visible |
   | Gen locator | browser_generate_locator |

5. **Report Template**
   ```markdown
   ## Visual Test Report

   **Component**: [name]
   **Route**: [url]
   **Timestamp**: [iso-date]

   ### Accessibility Snapshot
   [snapshot content]

   ### Assertions
   - [x] Element visible: [selector]
   - [x] Text visible: [text]

   ### Screenshots
   [screenshot paths]
   ```
```

---

## Synthesis Phase Prompts

### Reflector Integration Analysis

**Agent**: `reflector`

```
Analyze implementation results for UI coding spec.

## Review Targets

1. **Skill Files**
   - .claude/skills/ui/mui-component-writer.md
   - .claude/skills/ui/shadcn-component-writer.md
   - .claude/skills/ui/visual-tester.md

2. **Agent Files**
   - .claude/agents/ui-code-writer.md
   - .claude/agents/ui-reviewer.md
   - .claude/agents/visual-qa.md

## Analysis Questions

1. Are MCP fallback patterns robust?
2. Do constraints match codebase reality?
3. Are workflows comprehensive?
4. Do output templates follow patterns?

## Deliverables

- Pattern improvement recommendations
- Prompt refinements
- Anti-pattern warnings
- Integration gap analysis

Save to: specs/ui-coding-agents-and-skills/outputs/meta-reflection.md
```

---

## Verification Commands

### Test MCP Availability
```
mcp__MCP_DOCKER__mcp-find({ query: "mui" })
mcp__MCP_DOCKER__mcp-find({ query: "shadcn" })
mcp__MCP_DOCKER__mcp-find({ query: "playwright" })
```

### Validate File Structure
```bash
ls -la .claude/skills/ui/
ls -la .claude/agents/ui-*.md
```

### Test Skill Invocation
```
/mui-component-writer Create a Button with loading state
/shadcn-component-writer Create a Card with header and footer
/ui-visual-tester Test the Button component at /demo/button
```
