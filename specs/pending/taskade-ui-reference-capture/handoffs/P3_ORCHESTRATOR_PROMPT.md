# Phase 3 Orchestrator Prompt: Settings Billing

> Execute Phase 3 of the Taskade UI Reference Capture spec.

## Your Mission

Capture 3 settings views related to billing, plans, and credits from Taskade. Produce structured markdown output files with persistent S3-hosted screenshots.

## Read These First

1. `specs/pending/taskade-ui-reference-capture/handoffs/HANDOFF_P3.md` — Phase context, views list, learnings from P2
2. `specs/pending/taskade-ui-reference-capture/agents/PAGE_CAPTURER.md` — Agent prompt template with screenshot pipeline
3. `specs/pending/taskade-ui-reference-capture/templates/capture.template.md` — Output file template

## Workflow

### Step 1: Setup Playwright

```
ToolSearch: "+playwright navigate"
ToolSearch: "+playwright snapshot"
ToolSearch: "+playwright click hover"
```

Navigate to `https://www.taskade.com/settings/plans`. If redirected to login, authenticate first.

### Step 2: Create Local Directories

```bash
mkdir -p /tmp/taskade-screenshots/{plans,usage-billing,credits-rewards}
```

### Step 3: Capture Each View

For each of the 3 views:

1. Navigate to the view URL
2. Wait 3s for content to load
3. Take `browser_snapshot` to get accessibility tree
4. Take full-page screenshot via `browser_run_code`
5. Take component-level screenshots with `clip` parameter
6. Scroll if content extends below viewport
7. Record all component data from snapshot

### Step 4: Upload to S3

```bash
aws s3 cp /tmp/taskade-screenshots/{view}/ \
  s3://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/ \
  --recursive --content-type image/png --region us-east-1
```

### Step 5: Write Output Files

Delegate to parallel `general-purpose` agents:
- `outputs/CAPTURE_Plans.md`
- `outputs/CAPTURE_Usage_Billing.md`
- `outputs/CAPTURE_Credits_Rewards.md`

### Step 6: Update Reflection Log

Append Phase 3 entry to `specs/pending/taskade-ui-reference-capture/REFLECTION_LOG.md`.

### Step 7: Create Phase 4 Handoff

Create `handoffs/HANDOFF_P4.md` and `handoffs/P4_ORCHESTRATOR_PROMPT.md` for Phase 4 (Settings Features: Notifications, Integrations, Archives).

## Views

| # | View | URL | Expected Content |
|---|------|-----|-----------------|
| 8 | Plans | `/settings/plans` | Pricing tier cards, plan comparison, upgrade buttons |
| 9 | Usage & Billing | `/settings/usage` | Usage meters, billing details, invoices |
| 10 | Credits & Rewards | `/settings/credits` | Credit balance, referral system, reward actions |

## Quality Checks

Before finishing, verify:
- [ ] 3 output files in `outputs/`
- [ ] Each file has: Overview, Screenshots table, Layout diagram, Component Inventory, Interactive States, Feature Mapping, Implementation Notes
- [ ] All screenshot references use S3 URLs (not ephemeral IDs)
- [ ] REFLECTION_LOG.md has Phase 3 entry
- [ ] HANDOFF_P4.md exists
