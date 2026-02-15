# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 of the Taskade UI Reference Capture.

---

## Prompt

You are implementing Phase 1 (Pilot - Workspace Shell) of the `taskade-ui-reference-capture` spec.

### Context

We are building a comprehensive UI reference library of the Taskade application (`https://www.taskade.com`) to guide the architectural buildout of TodoX (`apps/todox/`). The TodoX app's root layout will be aligned to match Taskade's frontend architecture. A throwaway POC at `apps/todox/src/app/app-layout/` already captures core CSS styles and animations.

This spec uses **Claude-in-Chrome only** for browser automation. Outputs are **structured markdown files** in `specs/pending/taskade-ui-reference-capture/outputs/`.

### Your Mission

Capture 3 views that compose the Taskade workspace shell, then synthesize an architectural overview.

**Views to capture:**

1. **Workspace Home** — Navigate to `https://www.taskade.com/spaces/Yufy1godJk9Yddwv`. Capture the full page: project grid, AI prompt area, integration icons, category tabs.

2. **Sidebar Navigation** — On the same page, systematically hover over each icon in the left sidebar to reveal tooltips and capture what each icon does. Document the full icon list from top to bottom.

3. **Workspace Header** — Capture the top navigation bar: logo/hamburger, workspace name dropdown, "Add people" button, menu dots, notification bell, user avatar. Try clicking the workspace name to see if there's a workspace switcher dropdown.

**After all 3 captures**, write `outputs/ARCHITECTURE_APP_SHELL.md` synthesizing how sidebar + navbar + content compose as the persistent app shell.

### Workflow Per View

For each view, spawn a `general-purpose` sub-agent (or do it yourself for this pilot):

1. Navigate to the view (URL or interaction)
2. Take a full-page screenshot
3. Measure layout with JavaScript (`getBoundingClientRect` on sidebar, main content, header)
4. Use `read_page` with `filter: "interactive"` to discover components
5. Use `find` to locate specific component types (buttons, inputs, dropdowns, tabs)
6. Capture interactive states (hover tooltips, open dropdowns, tab switches)
7. Record at least 1 GIF for a key interaction
8. Write the output file following the template

### Critical Patterns

- **Load tools first**: Use `ToolSearch` to load Claude-in-Chrome tools before any browser calls
- **Fresh tab**: Create a new tab with `tabs_create_mcp`, don't reuse existing
- **Don't modify data**: Hover and click to reveal states, but don't submit forms or change settings
- **Screenshot IDs**: Reference actual `ss_*` IDs from your session in the output files
- **ASCII diagrams**: Every capture needs an ASCII layout diagram showing the view's structure
- **Feature mapping**: Map Taskade components to TodoX packages (`@beep/iam-client`, `@beep/ui`, etc.)

### Reference Files

- Spec README: `specs/pending/taskade-ui-reference-capture/README.md`
- Output template: `specs/pending/taskade-ui-reference-capture/templates/capture.template.md`
- Agent prompt: `specs/pending/taskade-ui-reference-capture/agents/PAGE_CAPTURER.md`
- Full workflow: `specs/pending/taskade-ui-reference-capture/MASTER_ORCHESTRATION.md`
- Handoff context: `specs/pending/taskade-ui-reference-capture/handoffs/HANDOFF_P1.md`

### Verification

After completing all captures:
1. Verify each output file exists in `outputs/`
2. Verify each has all required sections (Overview, Layout, Component Inventory, Feature Mapping)
3. Verify `ARCHITECTURE_APP_SHELL.md` exists and documents the shell composition

### Success Criteria

- [ ] `outputs/CAPTURE_Workspace_Home.md` — complete with 10+ components inventoried
- [ ] `outputs/CAPTURE_Sidebar_Navigation.md` — complete with all sidebar icons documented
- [ ] `outputs/CAPTURE_Workspace_Header.md` — complete with navbar components documented
- [ ] `outputs/ARCHITECTURE_APP_SHELL.md` — synthesis document
- [ ] At least 1 GIF recorded
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created for next phase
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created for next phase

### Handoff

Read full context in: `specs/pending/taskade-ui-reference-capture/handoffs/HANDOFF_P1.md`
