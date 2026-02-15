# Handoff: Phase 2 - Settings General

> Context document for Phase 2 capture of the Taskade General settings section.

## Phase 2 Mission

Capture the 4 views under Settings > General and document the sub-tab navigation pattern that recurs across settings pages. Build on the app shell architecture documented in Phase 1.

## Screenshot Pipeline (New in P1.5)

Phase 1.5 validated a persistent screenshot pipeline. All screenshots in Phase 2 and beyond MUST use this pipeline instead of relying on ephemeral Chrome `ss_*` IDs.

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
2. Navigate Playwright to `https://www.taskade.com/login`
3. Log in manually using `browser_fill_form` + `browser_click`
4. Verify authenticated state (navigate to `/settings` and confirm it loads)
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
  path: '/tmp/taskade-screenshots/account/full-page.png',
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
| 4 | Account | `https://www.taskade.com/settings` | Direct URL | Profile form, two-column layout, avatar upload, dropdowns |
| 5 | Password | `https://www.taskade.com/settings/password` | Click "Password" sub-tab | Password form, MFA config, access tokens |
| 6 | Connected Accounts | `https://www.taskade.com/settings/sso` | Click "Connected Accounts" sub-tab | SSO provider toggles, connect/disconnect buttons |
| 7 | Sessions | `https://www.taskade.com/settings/sessions` | Click "Sessions" sub-tab | Data table with device info, revoke buttons |

## Phase 1 Context (Episodic)

Phase 1 successfully captured the workspace shell. Key findings relevant to Phase 2:

- **App shell persists**: The icon sidebar (56px) and navbar (48px) remain visible on settings pages. Settings adds a secondary sidebar (~250px) to the left of the main content area.
- **Settings sidebar structure**: From pre-exploration, the settings sidebar contains: General, Plans, Usage & Billing, Credits & Rewards, Integrations (expandable), Notifications, Archives, Manage (expandable), WORKSPACE SETTINGS section.
- **Sub-tab pattern**: General has 4 sub-tabs (Account, Password, Connected Accounts, Sessions). These appear as horizontal tabs at the top of the main content area within settings.
- **Navigation**: Settings is accessed via the cog icon at the bottom of the icon sidebar, which routes to `/settings`.
- **Layout**: Settings pages use a 3-column layout: Icon sidebar (56px) | Settings sidebar (~250px) | Main content (fills remaining).

## Phase 1 Learnings (Apply These)

1. **Use ref-based hover/click** over coordinate-based for interactive elements
2. **zoom tool has coordinate scaling** — use regions no larger than ~500px per dimension
3. **JavaScript DOM inspection** reveals structure not visible in screenshots
4. **Delegate output file writing** to parallel sub-agents after gathering all context

## Deliverables

1. `outputs/CAPTURE_Account.md`
2. `outputs/CAPTURE_Password.md`
3. `outputs/CAPTURE_Connected_Accounts.md`
4. `outputs/CAPTURE_Sessions.md`

## Tool Setup

Before starting captures:
1. Load Claude-in-Chrome tools via ToolSearch
2. Get tab context with `tabs_context_mcp`
3. Create a new tab (don't reuse existing)
4. Navigate to `https://www.taskade.com/settings`
5. Wait for full page load, verify you see the Account settings page
6. Note the settings sidebar items and sub-tab layout before starting captures

## Success Criteria

- [ ] 4 capture files exist in `outputs/`
- [ ] Each has Overview, Layout (with ASCII diagram), Component Inventory, Feature Mapping
- [ ] Sub-tab navigation pattern documented (how tabs work, active indicator, URL changes)
- [ ] Settings sidebar structure documented (items, expandable sections, active indicators)
- [ ] At least 1 GIF captured (tab switching or form interaction)
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` and `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

## Context Budget Status

- Working context: ~350 tokens (18% of 2K budget)
- Episodic context: ~200 tokens (Phase 1 learnings)
- Semantic context: ~100 tokens (20% of 500 budget)
- Total: ~650 tokens (16% of 4K budget)

## Known Risks

- Settings may require active Taskade session — if session expired, re-login needed
- Some settings forms may have required fields that prevent navigation if dirty
- MFA/password forms may have restricted interaction patterns
- Connected Accounts page may show different SSO providers depending on account type
