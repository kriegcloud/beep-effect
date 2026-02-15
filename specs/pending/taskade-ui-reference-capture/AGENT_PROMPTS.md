# Agent Prompts: Taskade UI Reference Capture

> Index of specialized sub-agent prompts for the single-agent capture workflow.

## Agent Pipeline

```
Orchestrator → Page Capturer → outputs/CAPTURE_{VIEW_NAME}.md
```

Unlike the open-ontology spec (3-agent pipeline), this spec uses a single agent type because:
- Only Claude-in-Chrome is needed (no Playwright + Notion coordination)
- Output is markdown files (no database writes)
- Scouting and capturing are done in a single pass

## Agent Prompt Files

| Agent | Prompt File | Tools | Input | Output |
|-------|-------------|-------|-------|--------|
| **Page Capturer** | [`agents/PAGE_CAPTURER.md`](agents/PAGE_CAPTURER.md) | Claude-in-Chrome | VIEW_NAME, VIEW_URL, NAV_INSTRUCTIONS | `outputs/CAPTURE_{VIEW_NAME}.md` |

## Input Contract

The orchestrator provides these parameters to each Page Capturer invocation:

```
VIEW_NAME:          Human-readable name, e.g., "Account Settings"
VIEW_URL:           Direct URL if available, e.g., "https://www.taskade.com/settings"
NAV_INSTRUCTIONS:   Step-by-step navigation if URL alone isn't sufficient
TAB_ID:             Active Chrome tab ID (from tabs_context_mcp)
TEMPLATE_PATH:      "specs/pending/taskade-ui-reference-capture/templates/capture.template.md"
OUTPUT_PATH:        "specs/pending/taskade-ui-reference-capture/outputs/CAPTURE_{VIEW_NAME}.md"
```

## Output Contract

Each Page Capturer produces a markdown file following `templates/capture.template.md` with:
- **Overview**: 1-3 sentence purpose description
- **Layout**: Measurements, ASCII diagram, structural description
- **Component Inventory**: Table of all interactive/visible components
- **Interactive States**: Documented state transitions with screenshot IDs
- **GIF Recordings**: Key interactions recorded (best-effort)
- **Feature Mapping**: Each component mapped to a TodoX package/slice
- **Implementation Notes**: Suggested shadcn components, Phosphor icons, API surface

## Orchestrator Responsibilities

The orchestrator (NOT the Page Capturer agent) handles:
1. Tool loading — ensure Claude-in-Chrome tools are loaded before spawning agents
2. Tab management — create/reuse tabs, provide tab IDs
3. Authentication state — verify Taskade session is active
4. Output verification — check capture files exist and are complete
5. Synthesis documents — produce ARCHITECTURE_*.md files from individual captures
6. Reflection logging — update REFLECTION_LOG.md after each phase
7. Handoff creation — produce HANDOFF and ORCHESTRATOR_PROMPT for next phase
