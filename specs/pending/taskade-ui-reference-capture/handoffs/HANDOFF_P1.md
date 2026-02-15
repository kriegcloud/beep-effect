# Handoff: Phase 1 - Workspace Shell Pilot

> Context document for Phase 1 pilot capture of the Taskade workspace shell.

## Phase 1 Mission

Capture the 3 workspace shell views and validate the single-agent capture workflow end-to-end. Produce both per-view captures AND an architectural synthesis of the app shell.

## Views to Capture

| # | View | URL | Navigation | Key Focus |
|---|------|-----|-----------|-----------|
| 1 | Workspace Home | `https://www.taskade.com/spaces/Yufy1godJk9Yddwv` | Direct URL | Project grid, AI prompt, integration icons |
| 2 | Sidebar Navigation | Same URL | Hover/click icon sidebar items | Icon list, tooltips, active states, routing targets |
| 3 | Workspace Header | Same URL | Interact with top bar elements | Logo, workspace name, breadcrumb, user menu, notification bell |

## Pre-Exploration Context

From the initial manual exploration, the workspace home has:
- **Left icon sidebar** (~56px): Icons for Search, History, People, Workspace (active/green), plus bottom icons for Documents, Calendar, Favorites, Search, something, something, Help, Settings (cog)
- **Main content**: "Imagine It. Run It." heading, AI prompt input, category tabs (Tools, Productivity, Dashboards, Automation, Surveys, AI), integration icons row, Workspace Apps / Community Apps tabs, project cards grid
- **Top bar**: Taskade logo (hamburger), "Workspace" with dropdown, "Add people" button, dots menu, notification bell, user avatar
- **Visual effects**: Green-tinted orb glow in center, warm gradient (orange/peach) in bottom-left of sidebar area

## Deliverables

1. `outputs/CAPTURE_Workspace_Home.md`
2. `outputs/CAPTURE_Sidebar_Navigation.md`
3. `outputs/CAPTURE_Workspace_Header.md`
4. `outputs/ARCHITECTURE_APP_SHELL.md` — synthesis of how the shell composes

## Tool Setup

Before starting captures:
1. Load Claude-in-Chrome tools via ToolSearch
2. Get tab context with `tabs_context_mcp`
3. Create a new tab (don't reuse existing)
4. Navigate to the workspace URL
5. Wait for full page load, verify you see the workspace

## Success Criteria

- [ ] 3 capture files exist in `outputs/`
- [ ] Each has Overview, Layout (with ASCII diagram), Component Inventory, Feature Mapping
- [ ] `ARCHITECTURE_APP_SHELL.md` documents the persistent shell (sidebar + navbar + content area)
- [ ] At least 1 GIF captured (sidebar interaction or workspace switching)
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` and `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

## Context Budget Status

- Working context: ~220 tokens (11% of 2K budget)
- Episodic context: N/A (first phase)
- Semantic context: ~50 tokens (10% of 500 budget)
- Total: ~270 tokens (7% of 4K budget)

## Known Risks

- The workspace requires active Taskade session — if session expired, re-login needed
- Icon sidebar tooltips may only appear on hover (need hover interaction to capture labels)
- Workspace switcher dropdown may require specific click target
