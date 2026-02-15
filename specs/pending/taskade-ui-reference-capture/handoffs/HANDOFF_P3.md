# Handoff: Phase 3 - Settings Billing

> Context document for Phase 3 capture of the Taskade billing/plan settings section.

## Phase 3 Mission

Capture the 3 views under Settings that relate to billing, plans, and credits. These views likely feature card-based layouts, pricing tiers, usage meters, and reward/credit systems.

## Screenshot Pipeline (Validated in P1.5, Used Successfully in P2)

### Dual-Browser Workflow

| Task | Tool | Why |
|------|------|-----|
| Authenticated navigation | Chrome (Claude-in-Chrome) | Has persistent session cookies |
| GIF recording | Chrome `computer` tool | Only Chrome supports GIF capture |
| Visual inspection | Chrome `computer screenshot` | Quick checks during capture |
| Persistent screenshots | Playwright `browser_run_code` | Saves to disk, survives session end |
| Element-level screenshots | Playwright `browser_run_code` with `clip` | Precise component captures |

### Playwright Auth Requirement

Playwright runs a **separate browser** without Chrome's auth cookies. At the start of this phase:

1. Load Playwright tools via `ToolSearch` (query: `+playwright navigate`)
2. Navigate Playwright to `https://www.taskade.com/settings/plans`
3. If redirected to landing/login page, manually log in using `browser_fill_form` + `browser_click`
4. Verify authenticated state (confirm settings page loads with sidebar visible)
5. Then proceed with captures

### S3 Upload Pattern

```bash
# Local temp directory
/tmp/taskade-screenshots/{view-name-kebab}/

# Upload command
aws s3 cp /tmp/taskade-screenshots/{view}/ \
  s3://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/ \
  --recursive --content-type image/png --region us-east-1

# Public URL format
https://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/{filename}.png
```

### Screenshot Capture Pattern

Use `browser_run_code` (NOT `browser_take_screenshot` which times out):

```javascript
await page.waitForTimeout(2000);
await page.screenshot({
  path: '/tmp/taskade-screenshots/{view}/{filename}.png',
  timeout: 30000
});
```

### Key Warnings

- **Do NOT use `browser_take_screenshot`** — 5s default timeout is too short
- **Use `page.waitForTimeout(ms)`** not `setTimeout` in Playwright run_code
- **html2canvas does not work** — React apps render blank content
- **Snapshot refs** (e.g., `e34`) from `browser_snapshot` are usable with `browser_click`/`browser_hover`

## Views to Capture

| # | View | URL | Navigation | Key Focus |
|---|------|-----|-----------|-----------|
| 8 | Plans | `https://www.taskade.com/settings/plans` | Direct URL | Pricing tier cards, current plan indicator, upgrade/downgrade buttons |
| 9 | Usage & Billing | `https://www.taskade.com/settings/usage` | Direct URL | Usage meters, billing info, invoice history |
| 10 | Credits & Rewards | `https://www.taskade.com/settings/credits` | Direct URL | Credit balance, referral system, reward actions |

## Phase 2 Context (Episodic)

Phase 2 successfully captured the General settings section. Key findings relevant to Phase 3:

- **Settings layout is consistent**: 3-column layout (Icon sidebar 56px | Settings sidebar ~165px | Main content) persists across all settings pages.
- **Settings sidebar structure**: General (active in P2), Plans, Usage & Billing, Credits & Rewards, Integrations (expandable), Notifications, Archives, Manage (expandable), WORKSPACE SETTINGS section.
- **Direct URL navigation works**: All settings views have unique URLs — navigate directly rather than clicking through the sidebar.
- **Sub-tab pattern**: General had 4 sub-tabs. Plans/Usage/Credits may not have sub-tabs — they're top-level sidebar items.
- **Form patterns**: P2 documented two-column forms, single-column forms, card rows, and data tables. P3 likely adds pricing cards and usage meters.
- **Snapshot-first discovery**: `browser_snapshot` provides complete accessibility tree for component inventory. Use this before screenshots.

## Phase 2 Learnings (Apply These)

1. **Navigate directly via URL** — sub-views all have unique paths under `/settings/`
2. **Use `browser_snapshot` first** for complete component discovery before taking screenshots
3. **Use `clip` parameter** for component-level screenshots to isolate sections
4. **Upload to S3 in parallel** — one `aws s3 cp` per view directory
5. **Delegate output file writing** to parallel sub-agents after gathering all context
6. **For scrollable content**, search for scrollable divs generically: `el.scrollHeight > el.clientHeight && el.clientHeight > 200`

## Deliverables

1. `outputs/CAPTURE_Plans.md`
2. `outputs/CAPTURE_Usage_Billing.md`
3. `outputs/CAPTURE_Credits_Rewards.md`

## Tool Setup

Before starting captures:
1. Load Playwright tools via ToolSearch
2. Navigate to `https://www.taskade.com/settings/plans`
3. Wait for full page load, verify you see the Plans page
4. Take `browser_snapshot` to understand page structure before screenshots
5. Create local directories: `/tmp/taskade-screenshots/{plans,usage-billing,credits-rewards}/`

## Success Criteria

- [ ] 3 capture files exist in `outputs/`
- [ ] Each has Overview, Layout (with ASCII diagram), Component Inventory, Feature Mapping
- [ ] Pricing card layout documented (if Plans has tier cards)
- [ ] Usage meters/charts documented (if Usage has visual indicators)
- [ ] All screenshots uploaded to S3 with persistent URLs
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` and `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

## Context Budget Status

- Working context: ~400 tokens (20% of 2K budget)
- Episodic context: ~250 tokens (Phase 2 learnings)
- Semantic context: ~100 tokens (20% of 500 budget)
- Total: ~750 tokens (19% of 4K budget)

## Known Risks

- Plans page may show paid plan options — free account may have limited view
- Usage & Billing may require active subscription to show meaningful data
- Credits & Rewards may have referral links that shouldn't be captured/shared
- Pricing cards may have complex hover states or feature comparison tables
