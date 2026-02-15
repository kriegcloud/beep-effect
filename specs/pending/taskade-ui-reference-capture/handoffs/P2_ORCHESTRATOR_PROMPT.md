# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 of the Taskade UI Reference Capture.

---

## Prompt

You are implementing Phase 2 (Settings General) of the `taskade-ui-reference-capture` spec.

### Context

We are building a comprehensive UI reference library of the Taskade application (`https://www.taskade.com`) to guide the architectural buildout of TodoX (`apps/todox/`). Phase 1 successfully captured the workspace shell (sidebar, navbar, content area) and produced an architecture synthesis.

Phase 2 focuses on the **Settings > General** section, which has 4 sub-tabs: Account, Password, Connected Accounts, and Sessions. The settings page adds a secondary sidebar (~250px) to the persistent app shell (icon sidebar 56px + navbar 48px).

This spec uses **Claude-in-Chrome only** for browser automation. Outputs are **structured markdown files** in `specs/pending/taskade-ui-reference-capture/outputs/`.

### Your Mission

Capture 4 settings views that compose the General settings section, documenting the sub-tab navigation pattern.

**Views to capture:**

1. **Account** — Navigate to `https://www.taskade.com/settings`. Capture the profile form: avatar upload, name/email fields, language/timezone dropdowns, any save/cancel buttons. Document the two-column form layout.

2. **Password** — Click the "Password" sub-tab (or navigate to `/settings/password`). Capture the password change form, MFA configuration section, and any access token management.

3. **Connected Accounts** — Click the "Connected Accounts" sub-tab (or navigate to `/settings/sso`). Capture SSO provider toggles (Google, GitHub, etc.), connect/disconnect buttons, and the list layout.

4. **Sessions** — Click the "Sessions" sub-tab (or navigate to `/settings/sessions`). Capture the sessions data table: columns, row structure, device info, IP addresses, revoke buttons.

**Important**: Also document the settings sidebar and sub-tab navigation pattern in detail across all captures:
- Settings sidebar items (left side, ~250px)
- Sub-tab horizontal navigation (top of content area)
- How active states are indicated (sidebar + sub-tabs)
- URL routing pattern (`/settings`, `/settings/password`, `/settings/sso`, `/settings/sessions`)

### Workflow Per View

For each view:

1. Navigate to the view (URL or click sub-tab)
2. Take a full-page screenshot
3. Measure layout with JavaScript (`getBoundingClientRect` on settings sidebar, sub-tab bar, form content)
4. Use `read_page` with `filter: "interactive"` to discover components
5. Use `find` to locate specific component types (inputs, dropdowns, toggles, buttons, tables)
6. Capture interactive states (dropdown open, toggle on/off, hover states)
7. Record at least 1 GIF for a key interaction (sub-tab switching recommended)
8. Write the output file following the template

### Critical Patterns

- **Load tools first**: Use `ToolSearch` to load Claude-in-Chrome tools before any browser calls
- **Fresh tab**: Create a new tab with `tabs_create_mcp`, don't reuse existing
- **Don't modify data**: Hover and click to reveal states, but don't submit forms or change settings
- **Screenshot IDs**: Reference actual `ss_*` IDs from your session in the output files
- **ASCII diagrams**: Every capture needs an ASCII layout diagram showing the 3-column settings layout
- **Feature mapping**: Map Taskade components to TodoX packages (`@beep/iam-client`, `@beep/iam-ui`, `@beep/customization-client`, etc.)
- **Ref-based interaction**: Use `find` to get element refs, then interact by ref — more reliable than coordinates
- **Zoom carefully**: Keep zoom regions under ~500px in each dimension to avoid coordinate scaling issues

### Phase 1 Learnings (Apply These)

1. Use ref-based hover/click instead of coordinate-based for reliable interactions
2. zoom tool has coordinate scaling issues — use small regions
3. JavaScript DOM inspection reveals hidden structure (use for settings sidebar items)
4. Delegate output file writing to parallel sub-agents after gathering all context
5. Activity panel opens as right-side overlay, not dropdown — watch for this pattern in settings

### Reference Files

- Spec README: `specs/pending/taskade-ui-reference-capture/README.md`
- Output template: `specs/pending/taskade-ui-reference-capture/templates/capture.template.md`
- Agent prompt: `specs/pending/taskade-ui-reference-capture/agents/PAGE_CAPTURER.md`
- Full workflow: `specs/pending/taskade-ui-reference-capture/MASTER_ORCHESTRATION.md`
- Handoff context: `specs/pending/taskade-ui-reference-capture/handoffs/HANDOFF_P2.md`
- Phase 1 outputs (for shell context): `specs/pending/taskade-ui-reference-capture/outputs/ARCHITECTURE_APP_SHELL.md`

### Verification

After completing all captures:
1. Verify each output file exists in `outputs/`
2. Verify each has all required sections (Overview, Layout, Component Inventory, Feature Mapping)
3. Verify settings sidebar structure is documented consistently across captures
4. Verify sub-tab navigation pattern is documented

### Success Criteria

- [ ] `outputs/CAPTURE_Account.md` — complete with form fields and layout documented
- [ ] `outputs/CAPTURE_Password.md` — complete with password/MFA/token sections
- [ ] `outputs/CAPTURE_Connected_Accounts.md` — complete with SSO provider list
- [ ] `outputs/CAPTURE_Sessions.md` — complete with data table columns and actions
- [ ] Settings sidebar structure documented in at least one capture
- [ ] Sub-tab navigation pattern documented (active indicator, URL routing)
- [ ] At least 1 GIF recorded (sub-tab switching recommended)
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created for next phase
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created for next phase

### Handoff

Read full context in: `specs/pending/taskade-ui-reference-capture/handoffs/HANDOFF_P2.md`
