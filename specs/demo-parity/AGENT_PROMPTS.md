# Demo Parity Agent Prompts

> Specialized prompts for sub-agents in the demo parity orchestration

## Agent Types

| Type | Purpose | Tool Setting |
|------|---------|--------------|
| **Researcher** | Read-only exploration and documentation | `subagent_type: "Explore"` |
| **Playwright** | Browser automation for UI testing | `subagent_type: "general-purpose"` |
| **Synthesizer** | Combine reports into master documents | `subagent_type: "general-purpose"` |
| **Planner** | Create implementation plans | `subagent_type: "general-purpose"` |
| **Implementer** | Write Effect-compliant code | `subagent_type: "effect-code-writer"` |

---

## Research Phase Prompts

### Prompt: UI/UX Feature Researcher (Playwright)

```markdown
You are a researcher agent documenting all user-facing features in the FlexLayout demo.

## Instructions

EXPLORE the legacy demo at http://localhost:5173/ using Playwright browser automation:

### Step 1: Initial Snapshot
1. Navigate to http://localhost:5173/ using browser_navigate
2. Take a snapshot using browser_snapshot to understand the initial layout
3. Document the initial state (number of tabs, panels, borders visible)

### Step 2: Tab Interactions
Test each interaction and document the visual feedback:
- Drag a tab to another tabset (observe drop indicator)
- Drag a tab to edges (observe edge docking feedback)
- Double-click a tab to rename it
- Click the X button to close a tab
- Double-click the tabset header to maximize/restore

### Step 3: Splitter Interactions
- Drag splitters between panels
- Note minimum sizes enforced
- Test nested splitters

### Step 4: Theme Testing
- Find theme selector (usually in toolbar or menu)
- Switch through all available themes
- Document visual differences per theme

### Step 5: Overflow Testing
- Add many tabs to trigger overflow
- Test scroll buttons or overflow menu
- Document how hidden tabs are accessed

### Step 6: Context Menus
- Right-click on tabs
- Right-click on tabsets
- Right-click on borders
- Document all menu options available

### Step 7: External Drag
- Try dragging external content (if supported)
- Document what types of drops are accepted

## Output Format

```markdown
# UI/UX Feature Inventory

## Initial State
- Default layout structure
- Visible components

## Tab Interactions
| Interaction | Trigger | Visual Feedback | Notes |
|-------------|---------|-----------------|-------|

## Splitter Interactions
| Interaction | Behavior | Constraints |

## Themes
| Theme Name | Key Visual Characteristics |

## Overflow Handling
- Trigger condition
- UI mechanism
- Tab access method

## Context Menus
| Target | Menu Options |

## External Drag Support
- Supported types
- Drop behavior

## Edge Cases Discovered
- Any unexpected behaviors
```
```

---

### Prompt: Component Factory Researcher

```markdown
You are a researcher agent analyzing the component factory system in FlexLayout.

## Files to Read

1. `tmp/FlexLayout/demo/App.tsx` (lines 250-400 focus on factory function)
2. `tmp/FlexLayout/demo/public/layouts/default.layout`
3. `tmp/FlexLayout/demo/public/layouts/newfeatures.layout`
4. `tmp/FlexLayout/demo/JsonView.tsx`
5. `tmp/FlexLayout/demo/chart.tsx`

## Analysis Tasks

### Task 1: Factory Function Analysis
- Locate the factory function that renders tab content
- Document all component types it handles
- Note the switch/case or mapping pattern used

### Task 2: Component Type Inventory
For each component type:
```
{
  "type": "grid" | "chart" | "json" | etc,
  "implementation": "inline" | "external module",
  "dependencies": ["list of imports"],
  "props": ["what props are accessed from node"],
  "lifecycle": "notes on mount/unmount behavior"
}
```

### Task 3: Layout JSON Schema
Document the JSON structure for:
- Tab nodes
- TabSet nodes
- Row nodes
- Border nodes
- Global settings

### Task 4: Data Flow
- How does the factory receive data?
- How are component-specific configs passed?
- Any shared state between components?

## Output Format

```markdown
# Component Factory Analysis

## Factory Function Overview
- Location: [file:line]
- Pattern: [switch/map/etc]

## Component Type Inventory

### Type: "grid"
- Implementation: [inline/external]
- Source: [file path]
- Dependencies: [list]
- Tab Props Used: [list]
- Notes: [any special handling]

[Repeat for each type]

## Layout JSON Schema

### TabNode
```json
{
  "type": "tab",
  "id": "string",
  "name": "string",
  "component": "string",
  "config": {}
}
```

### TabSetNode
[schema]

### RowNode
[schema]

## Data Flow Diagram
[Description of how data flows from JSON to rendered component]

## External Library Integrations
| Library | Purpose | Integration Approach |
```
```

---

### Prompt: Model/Actions Researcher

```markdown
You are a researcher agent analyzing the FlexLayout model and action system.

## Files to Read

### Legacy Files
1. `tmp/FlexLayout/src/model/Actions.ts` (complete file)
2. `tmp/FlexLayout/src/model/Model.ts` (lines 1-200, 400-500)
3. `tmp/FlexLayout/src/model/IJsonModel.ts` (interfaces)
4. `tmp/FlexLayout/demo/App.tsx` (onAction callback, lines 100-200)

### Port Files
1. `packages/ui/ui/src/flex-layout/model/actions.model.ts`
2. `packages/ui/ui/src/flex-layout/model/model.ts`

## Analysis Tasks

### Task 1: Action Type Inventory
Create a complete list of all action types:
```
| Action Type | Legacy Status | Port Status | Notes |
```

### Task 2: Action Flow Analysis
For key actions (ADD_NODE, MOVE_NODE, DELETE_TAB, SELECT_TAB, MAXIMIZE_TOGGLE):
- What triggers this action?
- What data is in the action payload?
- What state changes occur?
- What side effects (if any)?

### Task 3: Callback Analysis
Document all Model callbacks:
- onAction
- onRenderTab
- onRenderTabSet
- onModelChange
- etc.

### Task 4: Persistence
- How is layout state serialized?
- How is it restored?
- What's the JSON schema for full model?

### Task 5: Port Comparison
- Which actions are fully ported?
- Which are stubbed?
- Which are missing?

## Output Format

```markdown
# Model/Actions Architecture Analysis

## Action Type Inventory

| Action | Constant | Legacy | Port | Payload Schema |
|--------|----------|--------|------|----------------|
| Add Node | ADD_NODE | Yes | Yes | {toNode, location, json} |
| Move Node | MOVE_NODE | Yes | Yes | {fromNode, toNode, location} |
[etc]

## Action Flow Details

### ADD_NODE
- Trigger: [user action or API call]
- Payload: [schema]
- State Changes: [what changes in model]
- Port Status: [complete/partial/missing]

[Repeat for key actions]

## Callback Hooks

| Callback | Signature | Purpose | Port Status |
|----------|-----------|---------|-------------|

## Persistence

### Serialization (toJson)
- Method: [Model.toJson()]
- Output: [IJsonModel interface]

### Deserialization (fromJson)
- Method: [Model.fromJson(json)]
- Input: [IJsonModel]

## Gap Analysis

### Fully Ported
- [list]

### Partially Ported
- [list with details]

### Missing
- [list]
```
```

---

### Prompt: View Layer Researcher

```markdown
You are a researcher agent analyzing FlexLayout view components and styling.

## Files to Read

### Legacy View Components
1. `tmp/FlexLayout/src/view/Layout.tsx` (lines 1-150 for props, 150-300 for rendering)
2. `tmp/FlexLayout/src/view/TabSet.tsx` (lines 1-100, 200-300)
3. `tmp/FlexLayout/src/view/Tab.tsx`
4. `tmp/FlexLayout/src/view/TabButton.tsx`
5. `tmp/FlexLayout/src/view/Splitter.tsx`
6. `tmp/FlexLayout/src/view/PopupMenu.tsx`

### Legacy Styling
1. `tmp/FlexLayout/style/_base.scss`
2. `tmp/FlexLayout/style/light.css`
3. `tmp/FlexLayout/style/dark.css`
4. `tmp/FlexLayout/src/Types.ts` (CSS class constants)

### Port View Components
1. `packages/ui/ui/src/flex-layout/view/layout.tsx`
2. `packages/ui/ui/src/flex-layout/view/tab-set.tsx`
3. `packages/ui/ui/src/flex-layout/view/tab.tsx`

## Analysis Tasks

### Task 1: ILayoutProps Analysis
Document all props on Layout component:
```typescript
interface ILayoutProps {
  model: Model;                    // Required
  factory: FactoryFn;              // Required
  // ... all optional props
}
```

### Task 2: Callback Props Deep Dive
For each callback prop:
- Signature
- When it's called
- What can be customized
- Example usage from demo

### Task 3: Theme System Analysis
- How are themes switched?
- CSS variable system?
- Class-based switching?
- Theme file structure

### Task 4: Tab Overflow Mechanism
- How is overflow detected?
- What UI is shown (scroll buttons, menu, etc.)?
- How are hidden tabs accessed?

### Task 5: Custom Rendering Analysis
- How do onRenderTab and onRenderTabSet work?
- What's in the render values object?
- Examples of customization

## Output Format

```markdown
# View Layer & Styling Analysis

## ILayoutProps Interface

### Required Props
| Prop | Type | Description |
|------|------|-------------|

### Optional Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|

## Callback Props Detail

### onRenderTab
```typescript
type OnRenderTab = (
  node: TabNode,
  renderValues: ITabRenderValues
) => void;

interface ITabRenderValues {
  leading: ReactNode;
  content: ReactNode;
  // etc
}
```
[Example from demo]

### onRenderTabSet
[Same format]

## Theme System

### Implementation Approach
[CSS variables vs class switching]

### Theme Files
| Theme | File | Key Characteristics |

### Switching Mechanism
[How to switch themes at runtime]

### CSS Class Constants
[Key classes from Types.ts]

## Tab Overflow

### Detection
[How overflow is detected]

### UI Mechanisms
- Scroll buttons: [yes/no]
- Overflow menu: [yes/no]
- Custom: [details]

### Hidden Tab Access
[How users get to hidden tabs]

## Port Comparison

### Props Parity
| Prop | Legacy | Port |

### View Component Parity
| Component | Legacy | Port | Gap |
```
```

---

### Prompt: Gap Analysis Researcher

```markdown
You are a researcher agent performing a comprehensive gap analysis.

## Files to Read

### Port Status Documents
1. `specs/docking-system/outputs/progress.md`
2. `specs/flex-layout-port/port-progress.md`
3. `specs/flex-layout-port/code-quality.md`

### Current Port
1. `packages/ui/ui/src/flex-layout/index.ts`
2. `packages/ui/ui/src/flex-layout/view/layout.tsx` (props interface)
3. `packages/ui/ui/src/flex-layout/model/model.ts` (Model class)

### Current Demo
1. `apps/todox/src/app/demo/page.tsx`

## Analysis Tasks

### Task 1: Export Inventory
List everything exported from the port index.ts vs legacy.

### Task 2: Model Completeness
Compare Model class methods:
| Method | Legacy | Port |

### Task 3: View Component Completeness
Compare view components:
| Component | Legacy | Port | Missing Features |

### Task 4: Props API Completeness
Compare ILayoutProps:
| Prop | Legacy | Port | Notes |

### Task 5: Demo Page Current State
What does the demo page currently show?
What features are working?
What's missing?

### Task 6: Priority Assessment
For each gap, assess:
- Blocking (prevents basic demo)?
- Important (core functionality)?
- Nice-to-have (enhanced UX)?
- Deferred (advanced features)?

## Output Format

```markdown
# Gap Analysis Report

## Executive Summary
- Total features in legacy: [N]
- Features fully ported: [N]
- Features partially ported: [N]
- Features missing: [N]
- Estimated parity: [X%]

## Export Comparison

| Export | Legacy | Port | Status |
|--------|--------|------|--------|

## Model Completeness

### Methods
| Method | Legacy | Port | Gap |

### Properties
| Property | Legacy | Port | Gap |

## View Component Completeness

### Layout
| Feature | Legacy | Port | Gap |

### TabSet
| Feature | Legacy | Port | Gap |

### Tab
| Feature | Legacy | Port | Gap |

## Props API Completeness

| Prop | Legacy | Port | Type Match | Behavior Match |

## Current Demo State

### Working Features
- [list with verification]

### Partially Working
- [list with what's missing]

### Not Working / Missing
- [list]

## Prioritized Gap List

### P0: Blocking
| Gap | Impact | Complexity | Files Affected |

### P1: Core Functionality
| Gap | Impact | Complexity | Files Affected |

### P2: Enhanced UX
| Gap | Impact | Complexity | Files Affected |

### P3: Advanced / Deferred
| Gap | Impact | Complexity | Files Affected |
```
```

---

## Synthesis Phase Prompts

### Prompt: Master Report Synthesizer

```markdown
You are a synthesis agent combining research reports into a master document.

## Input Files

Read ALL reports in specs/demo-parity/research-reports/:
- 01-uiux-features.md
- 02-component-factory.md
- 03-model-actions.md
- 04-view-styling.md
- 05-gap-analysis.md

## Synthesis Tasks

### Task 1: Cross-Reference Findings
- Identify features mentioned in multiple reports
- Resolve any conflicting information
- Note consensus across researchers

### Task 2: Build Complete Feature Matrix
Combine all feature inventories into one comprehensive table.

### Task 3: Create Priority Roadmap
Based on all gap analyses, create unified priority ordering.

### Task 4: Identify Dependencies
Map which features depend on others.

### Task 5: Surface Open Questions
Compile all ambiguities and decisions needed.

## Output Format

Write to specs/demo-parity/outputs/master-research-report.md:

```markdown
# Master Research Report

## Executive Summary
[1 page max covering key findings]

## Feature Parity Matrix
| Category | Feature | Legacy | Port | Gap | Priority | Complexity | Dependencies |

## Implementation Roadmap

### P0: Critical Path
[Features that must work for any demo to function]

### P1: Core Demo Features
[Features needed for feature parity]

### P2: Enhanced UX
[Nice-to-have improvements]

### P3: Advanced/Deferred
[Complex features to tackle later]

## Technical Debt Identified
[From code-quality and architecture analysis]

## File Mapping
| Feature | Legacy File | Port File | Changes Needed |

## Open Questions
[Decisions needed before implementation]

## Risk Assessment
[Potential blockers and mitigation strategies]
```
```

---

## Planning Phase Prompts

### Prompt: Implementation Planner

```markdown
You are a planning agent creating a detailed implementation checklist.

## Input

Read specs/demo-parity/outputs/master-research-report.md completely.

## Planning Tasks

### Task 1: Create Actionable Checklist
Convert each feature gap into a concrete task with:
- Clear title
- Files to modify
- Dependencies (other tasks that must complete first)
- Acceptance criteria (how to verify completion)
- Complexity estimate

### Task 2: Establish Task Order
Order tasks considering:
- Dependencies (must come after prerequisites)
- Risk (tackle risky items early)
- Value (high-value items early)
- Logical grouping (related items together)

### Task 3: Define Test Strategy
For each feature category:
- Manual test steps
- Automated test possibilities
- Visual verification criteria

### Task 4: Plan Verification Points
Identify natural checkpoints where full verification should occur.

## Output Format

Write to specs/demo-parity/outputs/plan.md:

```markdown
# Demo Parity Implementation Plan

## Pre-Implementation Checklist
- [ ] Verify legacy demo runs at http://localhost:5173/
- [ ] Backup current demo page
- [ ] Run baseline verification: bun run check --filter @beep/ui

## P0: Critical Path

### 0.1 [Feature Name]
- **Files**: [list]
- **Dependencies**: None
- **Acceptance**: [how to verify]
- **Complexity**: Low/Medium/High
- **Sub-tasks**:
  - [ ] [specific step]
  - [ ] [specific step]

### 0.2 [Feature Name]
[same format]

## P1: Core Demo Features
[same format for each]

## P2: Enhanced UX
[same format]

## P3: Deferred
[list with rationale for deferral]

## Verification Strategy

### After P0
- [ ] Manual test: [steps]
- [ ] Command: bun run check/build/test

### After P1
[same]

### After P2
[same]

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
```
```

---

## Implementation Phase Prompts

### Prompt Template: Feature Implementation

```markdown
You are implementing [FEATURE_NAME] for the FlexLayout demo parity project.

## Context
- This is part of the P[N] phase
- Dependencies completed: [list]
- Expected outcome: [description]

## Files to Read First
1. [legacy reference with line numbers]
2. [port target file]
3. [related files]

## Implementation Steps

1. [Step 1 with specifics]
2. [Step 2 with specifics]
3. [Step 3 with specifics]

## Effect Patterns Required
- Namespace imports: `import * as A from "effect/Array"`
- No native array methods (.map, .filter, etc.)
- No native string methods
- Immutable patterns only
- Option<T> for nullable values

## Verification
After implementing, run:
```bash
bun run check --filter @beep/ui
bun run build --filter @beep/ui
```

## Output Format
Report your changes as:
```markdown
## [Feature Name] Implementation

**Status:** COMPLETE / PARTIAL / BLOCKED
**Files Modified:**
- [file]: [what changed]

**Changes Made:**
- [bullet points]

**Verification:** PASSED / FAILED
**Notes:** [any issues or learnings]
```
```

---

## Compression Protocol

After any sub-agent completes, compress their output:

### Compression Template

```markdown
## [Task Name] Result

**Agent:** [Researcher/Synthesizer/Implementer]
**Status:** COMPLETE / PARTIAL / BLOCKED
**Key Findings:** [3-5 bullets max]
**Output File:** [path if created]
**Verification:** [command result]
**Next Action:** [what should happen next]
```

Use this format to store results in `outputs/progress.md` before continuing.
