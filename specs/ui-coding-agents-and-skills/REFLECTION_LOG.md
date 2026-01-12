# UI Coding Agents and Skills: Reflection Log

## Reflection Protocol

After each phase, record:

1. **What Worked**: Detection methods, agent coordination, findings quality
2. **What Didn't Work**: Failed approaches, time sinks, false positives
3. **Methodology Improvements**: Process changes for next phase
4. **Prompt Refinements**: Improved prompts based on learnings
5. **Codebase-Specific Insights**: beep-effect patterns discovered

---

## Reflection Entries

### 2025-01-11 - Phase 0.1: Initial Research

#### What Worked
- Web research successfully identified 3 key MCP servers (MUI, shadcn, Playwright)
- Playwright MCP has extensive tooling (40+ tools) with accessibility-tree approach
- MUI MCP solves documentation hallucination problem
- shadcn MCP enables natural language component installation

#### Key Findings

**MUI MCP Server**:
- Tools: `useMuiDocs`, `fetchDocs`
- Eliminates 404 errors from fabricated documentation URLs
- Direct source attribution with real quotes

**shadcn MCP Server**:
- Multi-registry support (public, private, third-party)
- Natural language component installation
- Namespace support for private registries (`@internal/component`)

**Playwright MCP Server**:
- 40+ browser automation tools
- Accessibility tree approach (no vision models needed)
- Running modes: persistent, isolated, browser extension
- Opt-in capabilities: vision, testing, pdf, tracing

#### Codebase-Specific Insights
- Existing MUI theme system in `packages/ui/core/src/theme`
- 50+ component override files following consistent pattern
- Atoms/inputs structure in `packages/ui/ui/src`
- Domain-specific UI in `packages/shared/ui/src`

#### Next Steps
- Create skill templates incorporating MCP tool patterns
- Design agent structure with MCP enablement (see `shared/mcp-enablement.md`)
- Map existing theme conventions to skill constraints

---

## Accumulated Improvements

### Skill Design Patterns

**MCP Tool Integration**:
```markdown
## MCP Server Prerequisites

Before using [tool-name], ensure MCP server is available:

1. mcp__MCP_DOCKER__mcp-find({ query: "[server-name]" })
2. mcp__MCP_DOCKER__mcp-add({ name: "[server]", activate: true })

Fallback if unavailable: [alternative approach]
```

**Constraint Inheritance**:
All UI skills must inherit constraints from `.claude/rules/effect-patterns.md` for React components using Effect hooks or data.

---

## Lessons Learned Summary

### Top 3 Most Valuable Discoveries
1. Playwright MCP uses accessibility tree, not screenshots - perfect for LLM-driven testing
2. MUI MCP directly addresses documentation hallucination problem
3. Existing theme system provides rich constraint source for skills

### Potential Challenges Identified
1. MCP server availability varies by session - need robust fallback patterns
2. Multiple UI paradigms (MUI vs shadcn) require clear skill differentiation
3. Playwright testing needs local dev server coordination

---

### 2026-01-11 - Phase 1: Codebase Discovery & MCP Validation

#### What Worked
- Parallel agent deployment for UI patterns + theme analysis was highly efficient
- Explore agents successfully cataloged 47 theme override components
- Form field integration patterns with TanStack Form were clearly documented
- Effect namespace import requirements extracted comprehensively

#### MCP Server Validation Results

**STATUS: All MCP servers NOT AVAILABLE in current session**

| Server | Status | Fallback Strategy |
|--------|--------|-------------------|
| MUI MCP | Not Available | Web search + node_modules type definitions |
| shadcn MCP | Not Available | Manual npx installation |
| Playwright MCP | Not Available | Generate test files for CI execution |
| MCP Docker | Not Available | N/A |

**Available MCP Tools**: Only `mcp__ide__getDiagnostics`

This is a critical finding - all skills MUST be designed with fallback-first approach.

#### Key Pattern Discoveries

**Theme Override Patterns:**
- 47 component override files identified
- `satisfies ComponentVariants` pattern is mandatory
- CSS variable access via `theme.vars.*` is required (not `theme.palette.*`)
- Extended variants: `soft` for buttons, chips, fabs
- Extended colors: `black`, `white` for many components

**Atomic Component Patterns:**
- Directory structure: `component/`, `types.ts`, `classes.ts`, `styles.tsx`, `index.ts`
- `createClasses` utility generates prefixed class names
- `shouldForwardProp` must filter `sx` and custom props
- SlotProps pattern for sub-component customization

**Form Field Patterns:**
- `DefaultOmit<T>` type strips TanStack Form-controlled props
- `useFieldContext<T>()` + `useStore` selector pattern
- Combined submit + inline error display
- HelperText component for consistent error UI

**Effect Integration (CRITICAL):**
- ALL array/string operations MUST use Effect utilities
- Namespace imports required: `import * as A from "effect/Array"`
- PascalCase Schema constructors: `S.Struct`, `S.String`, `S.Array`
- Never use native `.map()`, `.filter()`, `.split()`

#### Codebase-Specific Insights

**Theme Configuration:**
- 6 semantic colors with 6 shades each
- 5 color presets for primary/secondary switching
- Barlow font for h1-h3, Public Sans for body
- 8px spacing base, 8px border radius base
- Custom shadows: z1-z24, card, dialog, dropdown

**Component Coverage:**
- Largest overrides: Data Grid (374 lines), Button (394 lines)
- Form fields: TextField, Checkbox, RadioGroup, DatePicker, Upload
- Atoms: Label, Image, Iconify, SvgColor, FileThumbnail

#### Methodology Improvements

1. **Parallel Agent Deployment**: Running UI patterns and theme analysis concurrently saved significant time
2. **Fallback-First Design**: MCP server unavailability confirms need for robust fallbacks
3. **Comprehensive File Reading**: Agents reading 40+ files each provided complete coverage
4. **Structured Output Templates**: Template-driven outputs ensure consistent documentation

#### Prompt Refinements for P2

**Skill Creation Prompts Should Include:**
```markdown
## Fallback Mode (REQUIRED)

This skill MUST work without MCP servers. Follow these fallback patterns:

### Documentation Lookup
1. Search existing codebase patterns in `packages/ui/core/src/theme/core/components/`
2. Use WebSearch for MUI documentation if needed
3. Read TypeScript definitions from `node_modules/@mui/material/`

### Visual Verification
1. Generate Playwright test files instead of live browser testing
2. Instruct user to run: `bun run test:e2e`
3. Create screenshot comparison baselines
```

**Agent System Prompts Should Emphasize:**
```markdown
## Effect Integration Rules

BEFORE writing any code, ensure:
1. Import Effect modules as namespaces: `import * as A from "effect/Array"`
2. Never use native array methods: `.map()`, `.filter()`, `.reduce()`
3. Route all operations through Effect: `A.map(array, fn)`
4. Use PascalCase Schema constructors: `S.Struct`, not `S.struct`
```

#### Artifacts Created

| File | Purpose | Lines |
|------|---------|-------|
| `outputs/mcp-capability-matrix.md` | MCP server status and fallbacks | ~280 |
| `outputs/codebase-ui-patterns.md` | Complete pattern catalog | ~650 |

#### Next Steps for P2

1. Create skills with fallback-first design
2. Add MCP enhancement sections for when servers become available
3. Include Effect pattern enforcement in all skill constraints
4. Create helper utilities for common fallback patterns

---

### 2026-01-11 - Phase 1 Addendum: Application-Level Patterns

#### What Worked
- Second-pass research on apps/todox uncovered critical application-level patterns
- Dual theme system (MUI + Tailwind) was not visible from packages/ui/* alone

#### Additional Discoveries

**Dual Theme System:**
- MUI theme with `colorSchemeSelector: "class"` for Tailwind compatibility
- next-themes for dark mode toggle
- Both systems coexist without conflict

**Effect-Based Data Fetching:**
- `ManagedRuntime` scoped to module
- SWR integration via `runtime.runPromise(effect)`
- Normalized data shapes (byId/allIds pattern)

**Provider Composition:**
- Multi-layer provider nesting (MiniSidebar → SidePanel → Sidebar → Feature)
- Feature providers with URL-driven state
- `useMemo` for context values

**New Patterns to Enforce:**
- `cn()` utility for Tailwind class merging
- `useBoolean()` hook for toggle state
- `startTransition` for non-urgent route updates
- `O.fromNullable` + `O.match` instead of ternaries

**Component System Split:**
- shadcn/ui for layout/navigation components
- MUI for data-heavy components (DataGrid, TextField)
- Clear separation by use case

#### Artifacts Updated

| File | Change |
|------|--------|
| `outputs/codebase-ui-patterns.md` | Added sections 9-10 (~350 lines) |

#### Impact on P2

Skills should now include:
- Dual theme system awareness
- Effect-based data fetching pattern
- Provider composition best practices
- Application-level constraints (cn, useBoolean, startTransition)

---

### 2026-01-11 - Phase 2: Skill Creation

#### What Worked
- Template-driven skill creation ensured consistency across all 5 skills
- Reference file reading (label, button, TextField) provided concrete patterns
- P1 outputs were comprehensive enough to create skills without additional research
- Fallback-first approach forced clarity on what skills can accomplish without MCP

#### Skills Created

| Skill | Purpose | Location |
|-------|---------|----------|
| `mui-component-override.md` | Generate MUI theme component overrides | `.claude/skills/` |
| `atomic-component.md` | Create atomic UI components | `.claude/skills/` |
| `form-field.md` | Create TanStack Form integrated fields | `.claude/skills/` |
| `visual-testing.md` | Generate Playwright test files | `.claude/skills/` |
| `effect-check.md` | Validate Effect pattern compliance | `.claude/skills/` |

#### Key Design Decisions

**1. Fallback-First Architecture**
- Every skill works without MCP servers
- MCP sections document "enhanced mode" when available
- Fallbacks use: WebSearch, node_modules types, existing codebase patterns

**2. Reference File Strategy**
- Each skill points to canonical reference files
- `label/` for atoms, `button.tsx` for overrides, `TextField.tsx` for fields
- Reduces cognitive load by anchoring to real code

**3. Verification Checklists**
- Each skill ends with explicit checklist
- Covers Effect compliance, export wiring, TypeScript safety
- Serves as quick audit guide

**4. Output Templates**
- Complete, copy-paste ready code templates
- Comments explain structure and requirements
- Reduces generation errors from incomplete understanding

#### Methodology Improvements

**Template Structure Refinements:**
```markdown
## Skill Template (Validated)

1. When to Invoke (trigger conditions)
2. MCP Prerequisites + Fallback Strategy
3. Critical Constraints (numbered list)
4. Workflow (step-by-step)
5. Output Template (full code example)
6. Example Invocations (2+ scenarios)
7. Reference Files (table with locations)
8. Verification Checklist (checkboxes)
```

**Cross-Skill Dependencies:**
- All skills reference `effect-imports.md` skill for import patterns
- Form field skill references atomic component patterns for styled elements
- Visual testing skill coordinates with all component skills for testids

#### Challenges Encountered

**1. Scope Creep Prevention**
- Initial drafts included too much tangential information
- Refined to focus on actionable patterns only
- Removed theoretical discussions

**2. Effect Utility Coverage**
- Native method → Effect utility mappings required comprehensive research
- Created reference table covering 20+ common operations
- Some edge cases (like `A.join` being curried) needed explicit notation

**3. Test File Location Ambiguity**
- Playwright tests could live in multiple places
- Settled on `apps/[app]/tests/e2e/` as primary location
- Documented alternative for component-adjacent tests

#### Artifacts Created

| File | Lines | Purpose |
|------|-------|---------|
| `.claude/skills/mui-component-override.md` | ~250 | MUI theme override generation |
| `.claude/skills/atomic-component.md` | ~280 | Atomic component scaffolding |
| `.claude/skills/form-field.md` | ~320 | TanStack Form field creation |
| `.claude/skills/visual-testing.md` | ~300 | Playwright test generation |
| `.claude/skills/effect-check.md` | ~280 | Effect pattern validation |

#### Recommended Next Steps (P3)

1. **Agent Creation**: Build agents that orchestrate these skills
2. **Skill Testing**: Invoke each skill with real scenarios
3. **Integration Testing**: Verify generated code compiles and runs
4. **Feedback Loop**: Refine skills based on test results

---

## Accumulated Skill Design Patterns

### From P2: Validated Patterns

**Fallback Strategy Block:**
```markdown
## MCP Server Prerequisites

**[Server Name] is NOT available in this session.**

### Fallback Strategy (ACTIVE)

Since [server] cannot be enabled, use these approaches:
1. [Local approach 1]
2. [Local approach 2]
3. [WebSearch for documentation]
```

**Reference File Table:**
```markdown
## Key Reference Files

| File | Pattern | Notes |
|------|---------|-------|
| `path/to/file.tsx` | Pattern name | Brief notes |
```

**Output Template Block:**
```markdown
## Output Template

\`\`\`typescript
// Complete, working code example
// With comments explaining structure
// Ready for copy-paste with customization
\`\`\`
```

**Verification Checklist Block:**
```markdown
## Verification Checklist

- [ ] Specific, actionable item
- [ ] Effect compliance check
- [ ] Export wiring check
- [ ] TypeScript safety check
```
