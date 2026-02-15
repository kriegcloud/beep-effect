# Phase 4 Orchestrator Prompt: Settings Features

> Execute Phase 4 of the Taskade UI Reference Capture spec.

## Your Mission

Capture 3 settings views related to notifications, integrations, and archives from Taskade. Produce structured markdown output files with persistent S3-hosted screenshots.

## Read These First

1. `specs/pending/taskade-ui-reference-capture/handoffs/HANDOFF_P4.md` — Phase context, views list, learnings from P3
2. `specs/pending/taskade-ui-reference-capture/agents/PAGE_CAPTURER.md` — Agent prompt template with screenshot pipeline
3. `specs/pending/taskade-ui-reference-capture/templates/capture.template.md` — Output file template

## Workflow

### Step 1: Setup Playwright

```
ToolSearch: "+playwright navigate"
ToolSearch: "+playwright snapshot"
ToolSearch: "+playwright click"
```

Navigate to `https://www.taskade.com/settings/notifications`. If redirected to login, authenticate first.

### Step 2: Create Local Directories

```bash
mkdir -p /tmp/taskade-screenshots/{notifications,integrations,archives}
```

### Step 3: Capture Each View

For each of the 3 views:

1. Navigate to the view URL
2. Wait 3s for content to load
3. Take `browser_snapshot` to get accessibility tree
4. Take full-page screenshot via `browser_run_code`
5. Take component-level screenshots with `clip` parameter
6. Click expandable sections (if any) and capture expanded state
7. Scroll if content extends below viewport
8. Record all component data from snapshot

**Integrations Note**: Integrations has 6 sub-items in the sidebar (Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All). Capture the first in-app sub-item (Calendar Feed at `/settings/integrations/calendar-feed`) as the representative view. Note which sub-items open external tabs vs render inline.

### Step 4: Upload to S3

```bash
aws s3 cp /tmp/taskade-screenshots/{view}/ \
  s3://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/ \
  --recursive --content-type image/png --region us-east-1
```

### Step 5: Write Output Files

Delegate to parallel `general-purpose` agents:
- `outputs/CAPTURE_Notifications.md`
- `outputs/CAPTURE_Integrations.md`
- `outputs/CAPTURE_Archives.md`

### Step 6: Update Reflection Log

Append Phase 4 entry to `specs/pending/taskade-ui-reference-capture/REFLECTION_LOG.md`.

### Step 7: Create Phase 5 Handoff (or Completion Summary)

If more views remain (Manage > Workspaces, Manage > Activate, Workspace Settings), create `handoffs/HANDOFF_P5.md` and `handoffs/P5_ORCHESTRATOR_PROMPT.md`.

If all views are captured, write a completion summary in `outputs/COMPLETION_SUMMARY.md`.

## Views

| # | View | URL | Expected Content |
|---|------|-----|-----------------|
| 11 | Notifications | `/settings/notifications` | Toggle lists for notification channels/events |
| 12 | Integrations | `/settings/integrations/calendar-feed` | Integration connection cards, calendar feed setup |
| 13 | Archives | `/settings/archives` | Archived spaces/members list, restore actions |

## Quality Checks

Before finishing, verify:
- [ ] 3 output files in `outputs/`
- [ ] Each file has: Overview, Screenshots table, Layout diagram, Component Inventory, Interactive States, Feature Mapping, Implementation Notes
- [ ] All screenshot references use S3 URLs (not ephemeral IDs)
- [ ] REFLECTION_LOG.md has Phase 4 entry
- [ ] Phase 5 handoff exists (or completion summary)
