# Phase 2 Handoff: Skill Creation

> Previous Phase: P1 Discovery | Next Phase: P3 Agent Creation
> Generated: 2026-01-11

---

## P1 Completion Summary

### Deliverables Created

| File | Purpose | Status |
|------|---------|--------|
| `outputs/codebase-ui-patterns.md` | Complete UI pattern catalog | Complete |
| `outputs/mcp-capability-matrix.md` | MCP server status and fallbacks | Complete |
| `REFLECTION_LOG.md` | P1 learnings documented | Updated |

### Critical Findings

1. **MCP Servers NOT Available**: All three MCP servers (MUI, shadcn, Playwright) are not accessible in the current session. Skills MUST be designed with fallback-first approach.

2. **Pattern Catalog Complete**: 47 theme override components documented with comprehensive patterns for:
   - Theme overrides (variant structure, CSS variable access)
   - Atomic components (directory structure, props interface)
   - Form fields (TanStack Form integration)

3. **Effect Integration Critical**: All UI code must use Effect namespace imports and never use native array/string methods.

4. **Application-Level Patterns** (from apps/todox research):
   - **Dual Theme System**: MUI + Tailwind/next-themes coexistence
   - **Effect Data Fetching**: SWR + ManagedRuntime pattern
   - **Provider Composition**: Multi-layer nesting with URL state
   - **Component Split**: shadcn for layout, MUI for data components
   - **Utilities**: `cn()`, `useBoolean()`, `startTransition`

---

## P2 Task List

### Task 1: Create MUI Component Override Skill

**Location**: `.claude/skills/mui-component-override.md`

**Purpose**: Generate MUI theme component overrides following codebase patterns.

**Key Constraints from P1**:
- File structure: imports → Effect imports → internal imports → types → variants → component → export
- CSS variable access: `theme.vars.palette.*` (never `theme.palette.*`)
- Variant typing: `satisfies ComponentVariants`
- Extended variants: `soft` for buttons, chips, fabs
- Extended colors: `black`, `white` for interactive components

**Fallback Strategy**:
- Search `packages/ui/core/src/theme/core/components/` for existing patterns
- Use WebSearch for MUI documentation
- Read TypeScript definitions from `node_modules/@mui/material/`

---

### Task 2: Create Atomic Component Skill

**Location**: `.claude/skills/atomic-component.md`

**Purpose**: Create new atomic UI components following project conventions.

**Key Constraints from P1**:
- Directory structure: `component.tsx`, `types.ts`, `classes.ts`, `styles.tsx`, `index.ts`
- Props interface: `readonly`, `| undefined` for optionals
- Classes: Use `createClasses` utility
- Styles: `shouldForwardProp` must filter `sx` and custom props
- SlotProps pattern for sub-component customization

**Fallback Strategy**:
- Reference `packages/ui/ui/src/atoms/label/` as canonical example
- Copy directory structure from existing atoms

---

### Task 3: Create Form Field Skill

**Location**: `.claude/skills/form-field.md`

**Purpose**: Create TanStack Form integrated input fields.

**Key Constraints from P1**:
- Use `DefaultOmit<T>` for props (strips controlled props)
- Use `useFieldContext<T>()` hook
- Subscribe to form store with selector pattern
- Combine submit + inline validation errors
- Include `HelperText` component

**Fallback Strategy**:
- Reference `packages/ui/ui/src/inputs/TextField.tsx` as base
- Copy error handling pattern from existing fields

---

### Task 4: Create Visual Testing Skill

**Location**: `.claude/skills/visual-testing.md`

**Purpose**: Generate Playwright test files for UI component verification.

**Key Constraints from P1**:
- Playwright MCP not available - generate test files instead
- Use accessibility tree approach (not screenshots)
- Target selectors: `[data-testid="..."]`
- Output to `apps/web/tests/e2e/` or appropriate location

**Fallback Strategy**:
- Generate `.spec.ts` files for Playwright
- Include instructions for user to run tests
- Create screenshot baselines for comparison

---

### Task 5: Create Effect Integration Checker Skill

**Location**: `.claude/skills/effect-check.md`

**Purpose**: Validate Effect pattern compliance in UI code.

**Key Constraints from P1**:
- Namespace imports: `import * as A from "effect/Array"`
- No native methods: `.map()`, `.filter()`, `.split()` forbidden
- PascalCase Schema: `S.Struct`, `S.String`, `S.Array`
- Import aliases: A (Array), O (Option), F (Function), etc.

**Fallback Strategy**:
- Pure validation - no MCP required
- Grep for violations, suggest fixes

---

## P2 Execution Protocol

### Step 1: Read Templates

```bash
Read specs/ui-coding-agents-and-skills/templates/skill.template.md
```

### Step 2: Create Skills Sequentially

For each skill:
1. Copy template structure
2. Fill in constraints from P1 findings
3. Add fallback patterns from MCP capability matrix
4. Include Effect integration rules
5. Add usage examples

### Step 3: Wire Skills into Claude Config

Skills should be registered in `.claude/skills/` and optionally listed in a manifest.

### Step 4: Test Each Skill

Invoke each skill with test scenarios:
- `/mui-component-override` - Create a new Tooltip override
- `/atomic-component` - Create a new Badge atom
- `/form-field` - Create a new SwitchField
- `/visual-testing` - Generate tests for Button component
- `/effect-check` - Validate a sample file

---

## Skill Template Structure

Based on P1 discoveries, skills should follow this structure:

```markdown
# [Skill Name]

## When to Use
[Trigger conditions]

## Input Requirements
[Required context, files, or parameters]

## Constraints

### Codebase Patterns
[From codebase-ui-patterns.md]

### Effect Integration
[From effect-patterns.md rules]

### Fallback Mode
[From mcp-capability-matrix.md]

## Workflow

### Step 1: [Research]
[How to gather context]

### Step 2: [Generate]
[Code generation with constraints]

### Step 3: [Validate]
[Verification steps]

### Step 4: [Wire Up]
[Integration into codebase]

## Examples

### Basic Usage
[Simple example]

### Advanced Usage
[Complex example with edge cases]

## Common Mistakes
[Anti-patterns to avoid]
```

---

## Improved Prompts for P2

### MUI Override Skill Prompt

```markdown
You are creating a MUI theme component override for the beep-effect monorepo.

## Critical Rules

1. **Theme Access**: ALWAYS use `theme.vars.palette.*` (never `theme.palette.*`)
2. **Variants**: Use `satisfies ComponentVariants` for type safety
3. **Effect Imports**:
   ```typescript
   import * as A from "effect/Array";
   import * as Str from "effect/String";
   ```
4. **File Structure**:
   - External imports
   - Effect imports
   - Internal imports
   - Type extensions
   - Variant definitions
   - Component definition
   - Barrel export

## Reference Files

Before generating, read:
- `packages/ui/core/src/theme/core/components/button.tsx` (complex variants)
- `packages/ui/core/src/theme/core/components/chip.tsx` (sizes + variants)

## Output Location

`packages/ui/core/src/theme/core/components/[component].tsx`

Then wire into `components/index.ts`:
```typescript
import { newComponent } from "./new-component";
export const components = { ...existing, ...newComponent };
```
```

### Atomic Component Skill Prompt

```markdown
You are creating an atomic UI component for the beep-effect monorepo.

## Directory Structure

Create these files in `packages/ui/ui/src/atoms/[component]/`:

1. `[component].tsx` - Main component with `"use client"` if using hooks
2. `types.ts` - Props interface with `readonly` and `| undefined`
3. `classes.ts` - CSS classes using `createClasses`
4. `styles.tsx` - Styled components with `shouldForwardProp`
5. `index.ts` - Barrel export

## Props Interface Pattern

```typescript
export interface ComponentProps extends React.ComponentProps<"div"> {
  readonly variant?: "filled" | "outlined" | "soft" | undefined;
  readonly color?: ComponentColor | undefined;
  readonly sx?: SxProps<Theme> | undefined;
}
```

## Classes Pattern

```typescript
import { createClasses } from "@beep/ui-core/theme/create-classes";

export const componentClasses = {
  root: createClasses("component__root"),
  icon: createClasses("component__icon"),
  state: { active: "--active" },
};
```

## Reference

Copy structure from `packages/ui/ui/src/atoms/label/`
```

---

## Success Criteria for P2

- [ ] `mui-component-override.md` skill created
- [ ] `atomic-component.md` skill created
- [ ] `form-field.md` skill created
- [ ] `visual-testing.md` skill created
- [ ] `effect-check.md` skill created
- [ ] All skills include fallback patterns
- [ ] All skills include Effect integration rules
- [ ] Skills tested with sample invocations
- [ ] `REFLECTION_LOG.md` updated with P2 learnings

---

## Verification Commands

```bash
# Check skills exist
ls -la .claude/skills/

# Verify skill content
wc -l .claude/skills/*.md

# Test skill invocation (user runs)
# /mui-component-override Tooltip
# /atomic-component StatusBadge
```

---

## Notes for Next Session

1. **Fallback-First**: Every skill must work without MCP servers
2. **Effect Enforcement**: Include Effect pattern checks in every generation
3. **Reference Files**: Always read existing implementations before generating
4. **Barrel Exports**: Always wire new components into index files
5. **Type Safety**: Use `satisfies` and strict prop types throughout
