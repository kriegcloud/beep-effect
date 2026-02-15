# Handoff: Phase 4 - Settings Features

> Context document for Phase 4 capture of Taskade settings feature pages (Notifications, Integrations, Archives).

## Phase 4 Mission

Capture the 3 settings views that manage workspace features: notification preferences, third-party integrations, and archived content. These views likely feature toggle lists, integration cards, and data tables rather than forms.

## Screenshot Pipeline (Validated P1.5-P3)

### Playwright-Only Workflow

Phase 2 and 3 confirmed Playwright sessions persist across phases. No Chrome dependency needed for screenshots.

| Task | Tool | Why |
|------|------|-----|
| Authenticated navigation | Playwright `browser_navigate` | Session persists across phases |
| Component discovery | Playwright `browser_snapshot` | Full accessibility tree including expandable sections |
| Persistent screenshots | Playwright `browser_run_code` | `page.screenshot({ path, timeout: 30000 })` |
| Element-level screenshots | Playwright `browser_run_code` with `clip` | Precise component captures |
| Expandable sections | Playwright `browser_click` | Click to expand before capturing |

### Playwright Auth Check

At phase start:
1. Navigate to `https://www.taskade.com/settings/notifications`
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
- **Expandable sections**: Click to expand before capturing (accordion pattern seen in P3 Usage view)
- **External link integrations**: Some sub-items under Integrations open external tabs — capture the settings view, not the external page

## Views to Capture

| # | View | URL | Navigation | Key Focus |
|---|------|-----|-----------|---------|
| 11 | Notifications | `https://www.taskade.com/settings/notifications` | Direct URL | Notification preference toggles, channel settings |
| 12 | Integrations | `https://www.taskade.com/settings/integrations/calendar-feed` | Direct URL (first sub-item) | Integration cards, connection status, sub-items |
| 13 | Archives | `https://www.taskade.com/settings/archives` | Direct URL | Archived spaces/members lists, restore actions |

## Phase 3 Context (Episodic)

Phase 3 captured the billing section. Key findings relevant to Phase 4:

- **Settings sidebar is consistent**: Same 3-column layout persists. Integrations is expandable with 6 sub-items; Archives may have sub-tabs (Spaces, Members from pre-spec observation).
- **No sub-tabs on billing pages**: Plans, Usage & Billing, and Credits & Rewards are standalone pages. Phase 4 views may vary — Notifications likely standalone, Integrations has sub-items in sidebar, Archives has sub-tabs.
- **Expandable accordion pattern**: Usage & Billing introduced an expandable "Detailed Usage Breakdown" section. Phase 4 may have similar expandable content.
- **Iframe embed pattern**: Plans used an iframe for pricing cards. Phase 4 views are unlikely to use iframes.
- **Snapshot captures expandable content**: `browser_snapshot` captured expanded accordion content after clicking. Use same approach for any expandable sections in Phase 4.

## Phase 3 Learnings (Apply These)

1. **Navigate directly via URL** — all settings views have unique paths
2. **Use `browser_snapshot` first** for complete component discovery
3. **Click expandable sections** before capturing to document both states
4. **Upload to S3 in parallel** — one `aws s3 cp` per view directory
5. **Delegate output file writing** to parallel sub-agents after gathering all context
6. **For scrollable content**, search for scrollable divs generically: `el.scrollHeight > el.clientHeight && el.clientHeight > 200`
7. **Integrations sub-items** open external tabs (Automation → help article, AI Agents → help article) — only capture the in-app settings views

## Deliverables

1. `outputs/CAPTURE_Notifications.md`
2. `outputs/CAPTURE_Integrations.md`
3. `outputs/CAPTURE_Archives.md`

## Tool Setup

Before starting captures:
1. Load Playwright tools via ToolSearch
2. Navigate to `https://www.taskade.com/settings/notifications`
3. Wait for full page load, verify authenticated state
4. Take `browser_snapshot` to understand page structure
5. Create local directories: `/tmp/taskade-screenshots/{notifications,integrations,archives}/`

## Success Criteria

- [ ] 3 capture files exist in `outputs/`
- [ ] Each has Overview, Layout (with ASCII diagram), Component Inventory, Feature Mapping
- [ ] Notification toggles/preferences documented
- [ ] Integration connection patterns documented (which are in-app vs external)
- [ ] Archive list/restore patterns documented
- [ ] All screenshots uploaded to S3 with persistent URLs
- [ ] REFLECTION_LOG.md updated with Phase 4 learnings
- [ ] Phase 5 handoff created (if more views remain) or spec completion summary

## Context Budget Status

- Working context: ~400 tokens (20% of 2K budget)
- Episodic context: ~250 tokens (Phase 3 learnings)
- Semantic context: ~100 tokens (20% of 500 budget)
- Total: ~750 tokens (19% of 4K budget)

## Known Risks

- Notifications page may be simple (just toggles) or complex (per-channel, per-event granularity)
- Integrations sub-items that open external tabs cannot be captured within the settings layout
- Archives may show empty state if no spaces/members have been archived
- Calendar Feed and Google Calendar integrations may require OAuth connection to show full UI
