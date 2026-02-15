# Phase 5 Orchestrator Prompt: Settings Admin + Review

> Execute Phase 5 of the Taskade UI Reference Capture spec.

## Your Mission

Capture 4 admin settings views (Manage Workspaces, Activate, Workspace Overview, Workspace Members/Apps) and produce a completion summary synthesizing all 17 captured views.

## Read These First

1. `specs/pending/taskade-ui-reference-capture/handoffs/HANDOFF_P5.md` — Phase context, views list, learnings from P4
2. `specs/pending/taskade-ui-reference-capture/agents/PAGE_CAPTURER.md` — Agent prompt template with screenshot pipeline
3. `specs/pending/taskade-ui-reference-capture/templates/capture.template.md` — Output file template

## Workflow

### Step 1: Setup Playwright

```
ToolSearch: "+playwright navigate"
ToolSearch: "+playwright snapshot"
ToolSearch: "+playwright click"
```

Navigate to `https://www.taskade.com/settings/manage`. If redirected to login, authenticate first.

### Step 2: Create Local Directories

```bash
mkdir -p /tmp/taskade-screenshots/{manage-workspaces,activate,workspace-overview,workspace-members-apps}
```

### Step 3: Capture Each View

For each of the 4 views:

1. Navigate to the view URL
2. Wait 3s for content to load
3. Take `browser_snapshot` to get accessibility tree
4. Take full-page screenshot via `browser_run_code`
5. Take component-level screenshots with `clip` parameter
6. Click sub-tabs (if any) and capture each tab state
7. Scroll if content extends below viewport
8. Record all component data from snapshot

**Workspace Overview/Members/Apps Note**: Views 16 and 17 are sub-tabs of the same page (`/settings/manage/Yufy1godJk9Yddwv`). Capture the Overview tab first (default), then click Members tab, then Apps tab. Document tab switching behavior.

### Step 4: Upload to S3

```bash
aws s3 cp /tmp/taskade-screenshots/{view}/ \
  s3://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/ \
  --recursive --content-type image/png --region us-east-1
```

### Step 5: Write Output Files

Delegate to parallel `general-purpose` agents:
- `outputs/CAPTURE_Manage_Workspaces.md`
- `outputs/CAPTURE_Activate.md`
- `outputs/CAPTURE_Workspace_Overview.md`
- `outputs/CAPTURE_Workspace_Members_Apps.md`

### Step 6: Write Completion Summary

After all capture files are written, create `outputs/COMPLETION_SUMMARY.md` with:
- Executive summary of all 17 views captured
- Cross-cutting architectural patterns (3-column layout, sidebar navigation, sub-tab patterns, form patterns, table patterns, empty states)
- Component reuse analysis (which shadcn components appear across multiple views)
- Feature mapping summary by package/slice
- Recommendations for TodoX implementation order

### Step 7: Update Reflection Log

Append Phase 5 entry to `specs/pending/taskade-ui-reference-capture/REFLECTION_LOG.md`.

## Views

| # | View | URL | Expected Content |
|---|------|-----|-----------------|
| 14 | Manage > Workspaces | `/settings/manage` | Workspace list with management actions |
| 15 | Manage > Activate | `/settings/activate` | Activation/onboarding workflow |
| 16 | Workspace Overview | `/settings/manage/Yufy1godJk9Yddwv` | Workspace details, settings |
| 17 | Workspace Members/Apps | Tab switching on #16 | Member list, app configuration |

## Quality Checks

Before finishing, verify:
- [ ] 4 output files in `outputs/`
- [ ] Each file has: Overview, Screenshots table, Layout diagram, Component Inventory, Interactive States, Feature Mapping, Implementation Notes
- [ ] All screenshot references use S3 URLs (not ephemeral IDs)
- [ ] REFLECTION_LOG.md has Phase 5 entry
- [ ] COMPLETION_SUMMARY.md synthesizes all 17 views
- [ ] Total output files in `outputs/` = 14 (3 workspace shell + 4 general + 3 billing + 3 features + 4 admin) or close to it
