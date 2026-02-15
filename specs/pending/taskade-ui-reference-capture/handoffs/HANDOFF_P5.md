# Handoff: Phase 5 - Settings Admin + Review

> Context document for Phase 5 capture of Taskade admin settings pages (Manage Workspaces, Activate, Workspace Overview, Workspace Members/Apps) and cross-cutting synthesis.

## Phase 5 Mission

Capture the 4 admin settings views that manage workspace administration: workspace list management, activation workflow, workspace-level overview, and member/app management. Then produce a cross-cutting synthesis document summarizing all 17 captured views.

## Screenshot Pipeline (Validated P1.5-P4)

### Playwright-Only Workflow

Phases 2-4 confirmed Playwright sessions persist across phases with zero re-login.

| Task | Tool | Why |
|------|------|-----|
| Authenticated navigation | Playwright `browser_navigate` | Session persists across phases |
| Component discovery | Playwright `browser_snapshot` | Full accessibility tree including sub-tabs |
| Persistent screenshots | Playwright `browser_run_code` | `page.screenshot({ path, timeout: 30000 })` |
| Element-level screenshots | Playwright `browser_run_code` with `clip` | Precise component captures |
| Sub-tab interaction | Playwright `browser_click` | Click tabs to capture different states |

### Playwright Auth Check

At phase start:
1. Navigate to `https://www.taskade.com/settings/manage`
2. Verify page loads with H1 visible (not redirected to login)
3. If auth expired, re-login via `browser_fill_form` + `browser_click`

### S3 Upload Pattern

```bash
/tmp/taskade-screenshots/{view-name-kebab}/

aws s3 cp /tmp/taskade-screenshots/{view}/ \
  s3://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/ \
  --recursive --content-type image/png --region us-east-1

# Public URL format
https://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/{filename}.png
```

### Screenshot Capture Pattern

```javascript
await page.waitForTimeout(2000);
await page.screenshot({
  path: '/tmp/taskade-screenshots/{view}/{filename}.png',
  timeout: 30000
});
```

### Key Warnings

- **Do NOT use `browser_take_screenshot`** — 5s default timeout too short
- **Use `page.waitForTimeout(ms)`** not `setTimeout` in Playwright run_code
- **Snapshot refs** (e.g., `e34`) are stable within a page load
- **Empty states**: Some views may show empty states if no data exists (seen in Archives Phase 4). Document empty state pattern rather than trying to mock populated data.
- **Manual clip coordinates**: When DOM content has minimal height (empty states), use manual clip coordinates rather than auto-detecting from DOM bounding boxes.

## Views to Capture

| # | View | URL | Navigation | Key Focus |
|---|------|-----|-----------|---------|
| 14 | Manage > Workspaces | `https://www.taskade.com/settings/manage` | Direct URL | Workspace list, management actions |
| 15 | Manage > Activate | `https://www.taskade.com/settings/activate` | Direct URL | Activation workflow, onboarding |
| 16 | Workspace Overview | `https://www.taskade.com/settings/manage/Yufy1godJk9Yddwv` | Direct URL (workspace ID) | Overview tab with workspace details |
| 17 | Workspace Members/Apps | Tab switching on view 16 | Click Members/Apps tabs | Team management, app configuration |

## Phase 4 Context (Episodic)

Phase 4 captured Settings Features. Key findings relevant to Phase 5:

- **Settings sidebar Manage group**: Expandable with 2 sub-items: Workspaces (`/settings/manage`) and Activate (`/settings/activate`).
- **Workspace Settings section**: Below the main settings categories, shows individual workspace entries linking to `/settings/manage/{workspaceId}`.
- **Current workspace ID**: `Yufy1godJk9Yddwv` (from sidebar link observed in all Phase 4 snapshots).
- **Sub-tab pattern confirmed**: Archives has Spaces/Members tabs sharing same URL. Workspace Overview likely has Overview/Members/Apps tabs per the pre-spec observation.
- **Empty state risk**: If workspace has minimal configuration, some sections may show empty states.

## Phase 4 Learnings (Apply These)

1. **Navigate directly via URL** — admin views have direct paths
2. **Use `browser_snapshot` first** for complete component discovery
3. **Document empty states** when encountered rather than skipping
4. **Use manual clip coordinates** when DOM content has minimal height
5. **Delegate output file writing** to parallel sub-agents after gathering all context
6. **Integration sub-items showed 3 patterns** — expect similar diversity in admin views (list management, activation flows, member tables)

## Deliverables

1. `outputs/CAPTURE_Manage_Workspaces.md`
2. `outputs/CAPTURE_Activate.md`
3. `outputs/CAPTURE_Workspace_Overview.md`
4. `outputs/CAPTURE_Workspace_Members_Apps.md`
5. `outputs/COMPLETION_SUMMARY.md` — Cross-cutting synthesis of all 17 views

## Tool Setup

Before starting captures:
1. Load Playwright tools via ToolSearch
2. Navigate to `https://www.taskade.com/settings/manage`
3. Wait for full page load, verify authenticated state
4. Take `browser_snapshot` to understand page structure
5. Create local directories: `/tmp/taskade-screenshots/{manage-workspaces,activate,workspace-overview,workspace-members-apps}/`

## Success Criteria

- [ ] 4 capture files exist in `outputs/`
- [ ] Each has Overview, Layout (with ASCII diagram), Component Inventory, Feature Mapping
- [ ] Workspace list management documented (rename, delete, transfer actions)
- [ ] Activation workflow documented (onboarding, setup steps)
- [ ] Workspace-level member/app management documented
- [ ] All screenshots uploaded to S3 with persistent URLs
- [ ] REFLECTION_LOG.md updated with Phase 5 learnings
- [ ] COMPLETION_SUMMARY.md written with cross-cutting synthesis of all 17 views

## Context Budget Status

- Working context: ~400 tokens (20% of 2K budget)
- Episodic context: ~250 tokens (Phase 4 learnings)
- Semantic context: ~100 tokens (20% of 500 budget)
- Total: ~750 tokens (19% of 4K budget)

## Known Risks

- Workspace Overview may have sub-tabs (Overview, Members, Apps) sharing the same base URL — may need tab-click navigation
- Activate page purpose is unclear — could be a simple toggle or a multi-step onboarding flow
- Member management may require admin permissions that the test account has
- This is the final phase — COMPLETION_SUMMARY.md must synthesize patterns across all 17 views
