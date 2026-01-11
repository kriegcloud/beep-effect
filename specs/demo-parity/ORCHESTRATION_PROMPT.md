# Demo Parity Orchestration Prompt

> You are an orchestration agent. You NEVER write code directly. You manage sub-agents to preserve your context window.

## Critical Orchestration Rules

1. **NEVER write code directly** - Always delegate to sub-agents via Task tool
2. **NEVER read large files directly** - Delegate file reads to Explore agents
3. **Preserve context** - Summarize sub-agent outputs before continuing
4. **Monitor context usage** - If context reaches 50%, create handoff immediately
5. **Incremental progress** - Complete one phase fully before starting next
6. **Update handoffs** - After each phase, create `handoffs/HANDOFF_P[N].md`
7. **Compress aggressively** - If sub-agent output exceeds 300 lines, compress to key points

## Sub-Agent Delegation Protocol

When delegating to sub-agents:

```
Task(
  prompt: [sub-agent prompt],
  subagent_type: "Explore" | "effect-code-writer" | "general-purpose",
  description: "Brief 3-5 word description"
)
```

**Researcher agents**: Use `subagent_type: "Explore"` for read-only research
**Implementation agents**: Use `subagent_type: "effect-code-writer"` for coding
**Synthesis agents**: Use `subagent_type: "general-purpose"` for combining reports

---

## Phase 0: Research

### Overview

Deploy multiple researcher agents in parallel to comprehensively understand the legacy demo. Each researcher focuses on a specific domain and produces a report in `research-reports/`.

### Pre-Requisites

Before starting research, ensure:
1. Legacy demo dev server is running at `http://localhost:5173/`
   - If not: `cd tmp/FlexLayout && npm install && npm run dev`
2. The orchestrator has read this prompt completely

### Research Agents

Deploy these agents **in parallel** using multiple Task calls in a single message:

---

#### Researcher 1: UI/UX Feature Inventory

**Sub-agent prompt:**
```
You are a researcher agent documenting all user-facing features in the FlexLayout demo.

EXPLORE the legacy demo at http://localhost:5173/ using Playwright browser automation:

1. Use mcp__playwright__browser_navigate to go to http://localhost:5173/
2. Use mcp__playwright__browser_snapshot to capture the page structure
3. Interact with tabs: drag, close, rename (double-click), maximize
4. Test splitters: resize panels
5. Test borders: dock to edges
6. Test themes: switch between all available themes
7. Test overflow: create many tabs to trigger overflow handling
8. Test context menus: right-click on tabs and tabsets
9. Test external drag: if supported, drag files onto the layout

PRODUCE a report documenting:
1. Complete list of UI interactions supported
2. Visual feedback provided for each interaction
3. Keyboard shortcuts observed
4. Theme variations and their visual differences
5. Any error states or edge cases encountered

FORMAT: Markdown report with sections for each feature category.
Save mental notes as you go - you'll write the report after exploration.

Output your findings as a structured markdown report.
```

**Output file:** `research-reports/01-uiux-features.md`

---

#### Researcher 2: Component Factory Analysis

**Sub-agent prompt:**
```
You are a researcher agent analyzing the component factory system in the FlexLayout demo.

READ these files:
- tmp/FlexLayout/demo/App.tsx (focus on factory function and component rendering)
- tmp/FlexLayout/demo/public/layouts/*.layout (all layout JSON files)

ANALYZE:
1. What component types does the factory support? (grid, chart, json, etc.)
2. How are component props passed to rendered components?
3. What is the structure of tab configuration in JSON layouts?
4. How does the demo handle component lifecycle?
5. What external libraries are integrated? (ag-grid, chart.js, openlayers, etc.)

DOCUMENT:
1. Complete component type inventory with their implementations
2. Tab JSON structure schema
3. Component-to-implementation mapping
4. Props and data flow patterns
5. Any special rendering considerations (iframes, canvas, etc.)

Output a structured markdown report with code examples where helpful.
```

**Output file:** `research-reports/02-component-factory.md`

---

#### Researcher 3: Model/Actions Architecture

**Sub-agent prompt:**
```
You are a researcher agent analyzing the FlexLayout model and action system.

READ these files:
- tmp/FlexLayout/src/model/Model.ts
- tmp/FlexLayout/src/model/Actions.ts
- tmp/FlexLayout/src/model/IJsonModel.ts
- tmp/FlexLayout/demo/App.tsx (onAction callback usage)

COMPARE with Effect port:
- packages/ui/ui/src/flex-layout/model/model.ts
- packages/ui/ui/src/flex-layout/model/actions.model.ts

ANALYZE:
1. All action types in legacy vs port (which are missing?)
2. How does onAction callback work in legacy?
3. How does the demo intercept/modify actions?
4. What actions are used for: close, rename, maximize, add, move, delete?
5. State persistence: how is layout saved/restored?

DOCUMENT:
1. Complete action type inventory with legacy vs port status
2. Action flow from user interaction to state update
3. Callback hooks available (onAction, onRenderTab, etc.)
4. JSON serialization format differences (if any)
5. Missing action handlers in the port

Output a structured markdown report with action-by-action comparison.
```

**Output file:** `research-reports/03-model-actions.md`

---

#### Researcher 4: View Layer & Styling

**Sub-agent prompt:**
```
You are a researcher agent analyzing the FlexLayout view components and styling.

READ these files:
- tmp/FlexLayout/src/view/Layout.tsx (props interface, callbacks, rendering)
- tmp/FlexLayout/src/view/TabSet.tsx (tab bar rendering, overflow)
- tmp/FlexLayout/src/view/Tab.tsx (individual tab rendering)
- tmp/FlexLayout/style/*.scss (all theme files)
- tmp/FlexLayout/src/Types.ts (CSS class constants)

COMPARE with Effect port:
- packages/ui/ui/src/flex-layout/view/layout.tsx
- packages/ui/ui/src/flex-layout/view/tab-set.tsx
- packages/ui/ui/src/flex-layout/view/tab.tsx

ANALYZE:
1. What ILayoutProps are available in legacy?
2. What callback props exist (onRenderTab, onRenderTabSet, etc.)?
3. How is theming implemented? (CSS variables? class switching?)
4. How does tab overflow work? (scroll vs menu)
5. How are custom tab buttons/icons rendered?

DOCUMENT:
1. Complete ILayoutProps interface documentation
2. All callback types and their signatures
3. Theme implementation details
4. CSS class naming conventions
5. Missing view features in the port

Output a structured markdown report.
```

**Output file:** `research-reports/04-view-styling.md`

---

#### Researcher 5: Current Port Gap Analysis

**Sub-agent prompt:**
```
You are a researcher agent performing a gap analysis on the current Effect port.

READ these files:
- packages/ui/ui/src/flex-layout/index.ts (exports)
- packages/ui/ui/src/flex-layout/model/model.ts (Model class)
- packages/ui/ui/src/flex-layout/view/layout.tsx (Layout component)
- apps/todox/src/app/demo/page.tsx (current demo)
- specs/docking-system/outputs/progress.md (completed work)
- specs/flex-layout-port/port-progress.md (port status)

ANALYZE:
1. What is currently working in the Effect port demo?
2. What props does Layout accept vs legacy?
3. What actions are fully implemented?
4. What view components exist?
5. What is the current demo page showing?

DOCUMENT:
1. Current working features inventory
2. Props/API parity table (legacy vs port)
3. Model completeness assessment
4. View completeness assessment
5. Specific gaps preventing demo parity

Output a structured markdown report with tables comparing legacy vs port.
```

**Output file:** `research-reports/05-gap-analysis.md`

---

### Research Output Protocol

After all researcher agents complete:

1. **Collect reports**: Ensure all 5 reports exist in `research-reports/`
2. **Deploy synthesis agent**: See Synthesis Task below
3. **Compress results**: Update `outputs/progress.md` with research phase status

---

### Synthesis Task

After all researchers complete, deploy a synthesis agent:

**Sub-agent prompt:**
```
You are a synthesis agent combining multiple research reports into a master document.

READ all reports in specs/demo-parity/research-reports/:
- 01-uiux-features.md
- 02-component-factory.md
- 03-model-actions.md
- 04-view-styling.md
- 05-gap-analysis.md

SYNTHESIZE into a single master document with:

1. **Executive Summary** (1 page max)
   - Key findings
   - Critical gaps identified
   - Recommended priorities

2. **Feature Parity Matrix**
   - Table: Feature | Legacy | Port | Gap | Priority
   - Cover ALL features from all reports

3. **Implementation Roadmap**
   - P0: Blocking issues (must fix first)
   - P1: Core functionality (tabs, splitters, themes)
   - P2: Enhanced UX (overflow, context menus)
   - P3: Advanced features (popouts, nested layouts)

4. **Technical Debt**
   - Schema mismatches
   - Missing action handlers
   - View component gaps

5. **File Mapping**
   - For each major feature: legacy file -> port file -> changes needed

6. **Open Questions**
   - Ambiguities discovered
   - Decisions needed from user

Write the output to specs/demo-parity/outputs/master-research-report.md
```

**Output file:** `outputs/master-research-report.md`

---

## Phase 1: Planning

### Overview

Create a comprehensive implementation plan based on research findings.

### Planning Task

Deploy a planning agent:

**Sub-agent prompt:**
```
You are a planning agent creating an implementation checklist for demo parity.

READ:
- specs/demo-parity/outputs/master-research-report.md
- specs/demo-parity/README.md (success criteria)

CREATE a detailed plan.md with:

## 1. Pre-Implementation Checklist
- [ ] Verify all prerequisites met
- [ ] Confirm legacy demo running
- [ ] Backup current demo page

## 2. Phase Breakdown

### P0: Critical Path (Must complete for basic demo)
For each item:
- [ ] Feature name
  - Files to modify: [list]
  - Dependencies: [other items]
  - Acceptance criteria: [how to verify]
  - Estimated complexity: Low/Medium/High

### P1: Core Functionality
[Same format]

### P2: Enhanced UX
[Same format]

### P3: Advanced Features (Deferred)
[Same format]

## 3. Testing Strategy
- Manual test script for each feature
- Verification commands

## 4. Risk Mitigation
- Potential blockers
- Fallback approaches

## 5. Success Metrics
- Feature completion percentage
- Visual parity score
- Performance benchmarks

Write the output to specs/demo-parity/outputs/plan.md
```

**Output file:** `outputs/plan.md`

---

## Phase 2+: Implementation

### Overview

Execute the plan systematically. Each phase targets a priority level.

### Implementation Protocol

For each feature in the plan:

1. **Create sub-agent prompt** following this template:
```
You are implementing [FEATURE_NAME] for the FlexLayout demo parity project.

READ these files first:
- [legacy reference file with line numbers]
- [port target file]
- [any dependencies]

IMPLEMENT:
[Specific implementation steps]

USE Effect patterns:
- Namespace imports: import * as A from "effect/Array"
- No native array methods
- Immutable patterns only

VERIFY after implementing:
bun run check --filter @beep/ui
bun run build --filter @beep/ui

Report your changes in compressed format.
```

2. **Execute with effect-code-writer** agent
3. **Verify** the implementation passes checks
4. **Compress** the result to `outputs/task-[N].md`
5. **Update** `outputs/progress.md`
6. **Continue** to next feature

### Phase Transition Protocol

When completing each priority level (P0, P1, etc.):

1. Run full verification:
```bash
bun run check --filter @beep/ui
bun run build --filter @beep/ui
bun run test --filter @beep/ui
```

2. Manually test in browser (via Playwright if needed)

3. Create handoff document `handoffs/HANDOFF_P[N].md`:
```markdown
# Demo Parity Handoff - P[N] Phase

## Session Summary
| Metric | Before | After | Status |

## Completed Features
[List with verification status]

## Lessons Learned
### What Worked Well
### What Needed Adjustment

## Next Phase: P[N+1] Items
[Prioritized list]

## Notes for Next Agent
```

4. Update `REFLECTION_LOG.md` with learnings

---

## Context Exhaustion Protocol

If context window reaches **50% capacity**:

1. **STOP** current work immediately
2. **Compress** all accumulated context into handoff document
3. **Write** handoff to `handoffs/HANDOFF_P[CURRENT].md`
4. **Include** in handoff:
   - All completed work with verification status
   - Current task in progress
   - Remaining tasks with prompts
   - Any learned prompt improvements
   - Full context needed to resume

5. **Format** the handoff so a new Claude instance can resume seamlessly

### Handoff Template for Context Exhaustion

```markdown
# Demo Parity Handoff - Context Exhaustion at P[N]

## Why This Handoff
Context window reached 50% capacity. Creating handoff to preserve progress.

## Session Summary
| Task | Status | Verification |
| --- | --- | --- |

## Completed Work
[Compressed summaries of all completed tasks]

## Current Task (In Progress)
**Task:** [Name]
**Status:** [Started/Partially Complete]
**Files Modified:** [List]
**Remaining:** [What's left]

## Next Tasks (Not Started)
[Full sub-agent prompts for remaining work]

## Learned Prompt Improvements
[Any refinements discovered]

## Resume Instructions
1. Read this handoff completely
2. Continue from [Current Task / Next Tasks]
3. Follow same orchestration rules
4. Monitor context and create new handoff if needed
```

---

## File Reference Quick Index

| Purpose | Path |
|---------|------|
| Legacy demo app | `tmp/FlexLayout/demo/App.tsx` |
| Legacy layouts | `tmp/FlexLayout/demo/public/layouts/*.layout` |
| Legacy model | `tmp/FlexLayout/src/model/` |
| Legacy view | `tmp/FlexLayout/src/view/` |
| Legacy styles | `tmp/FlexLayout/style/` |
| Port model | `packages/ui/ui/src/flex-layout/model/` |
| Port view | `packages/ui/ui/src/flex-layout/view/` |
| Demo page | `apps/todox/src/app/demo/page.tsx` |
| Research reports | `specs/demo-parity/research-reports/` |
| Plan | `specs/demo-parity/outputs/plan.md` |
| Progress | `specs/demo-parity/outputs/progress.md` |

---

## Authorization Gates

**STOP and request user approval before:**

1. Modifying files outside `packages/ui/ui/src/flex-layout/` or `apps/todox/src/app/demo/`
2. Adding new dependencies to package.json
3. Creating new packages
4. Committing changes
5. Proceeding from research to planning phase
6. Proceeding from planning to implementation phase

**Never auto-proceed without explicit "continue" from user.**

---

## Start Execution

1. Verify legacy demo is running at `http://localhost:5173/`
2. Deploy all 5 researcher agents **in parallel** using multiple Task calls
3. Wait for all researchers to complete
4. Deploy synthesis agent
5. Request user approval to proceed to planning
6. Continue with planning and implementation phases

Begin with Research Phase 0. Use multiple parallel Task calls to deploy all researchers simultaneously.
