# Playwright E2E Testing — Phase 1 Handoff

> Context preservation document for Phase 1: Foundation implementation.

---

## Session Summary: Phase 0 Completed

| Metric | Status | Notes |
|--------|--------|-------|
| Spec scaffolding | Complete | README, REFLECTION_LOG, QUICK_START |
| Spec review | Complete | 3.5/5 rating, critical gaps addressed |
| Template files | Complete | 3 templates (POM, test, fixture) |
| Turbo integration | Documented | Task definition ready for implementation |
| @beep/testkit relationship | Documented | Clear unit vs e2e boundaries |

---

## What Was Accomplished

### Phase 0: Spec Scaffolding
1. Created spec structure at `specs/playwright-e2e/`
2. Documented current state (Playwright `^1.57.0` already installed)
3. Defined target architecture with monorepo-aware structure
4. Established 4-phase execution plan

### Spec Review Pass
1. Ran spec-reviewer agent - identified 5 critical gaps
2. Fixed all critical gaps:
   - Added Turbo pipeline integration section (BLOCKER)
   - Added @beep/testkit relationship documentation
   - Created 3 template files (POM, test, fixture patterns)
   - Added prompt refinement structure to REFLECTION_LOG
   - Expanded Phase 2 tasks with specific definitions

---

## Remaining Work: Phase 1 Tasks

### Task 1.1: Create Playwright Config
**File**: `playwright.config.ts` (root)

**Requirements**:
- Use config from QUICK_START.md as starting point
- Set `testDir` to `./e2e` for shared utilities
- Set `testMatch` to `**/*.e2e.ts`
- Configure `webServer` to start `@beep/web` dev server
- Set `baseURL` to `http://localhost:3000`

**Sub-agent prompt**:
```
Create playwright.config.ts in the project root following the pattern in specs/playwright-e2e/QUICK_START.md.

Key settings:
- testDir: "./e2e"
- testMatch: "**/*.e2e.ts"
- webServer.command: "bun run dev --filter @beep/web"
- webServer.url: "http://localhost:3000"
- use.baseURL: "http://localhost:3000"
- projects: chromium only for local dev
- reporter: html + list

Reference: specs/playwright-e2e/QUICK_START.md lines 19-50
```

### Task 1.2: Create Directory Structure
**Directories to create**:
```
e2e/
├── fixtures/
├── pages/
└── utils/

apps/web/e2e/
```

### Task 1.3: Create Base Fixture
**File**: `e2e/fixtures/base.fixture.ts`

**Sub-agent prompt**:
```
Create base fixture extending Playwright's test.

Follow pattern in specs/playwright-e2e/templates/fixture.template.md.

Export { test, expect } for use in all e2e tests.
```

### Task 1.4: Create Auth Setup Script
**File**: `e2e/fixtures/auth.setup.ts`

**Requirements**:
- Navigate to `/auth/login`
- Perform login with test credentials
- Save storage state to `e2e/.auth/user.json`
- Add `e2e/.auth/` to `.gitignore`

**Reference**: `specs/playwright-e2e/templates/fixture.template.md` (Auth Fixture Pattern section)

### Task 1.5: Add NPM Scripts
**File**: Root `package.json`

**Scripts to add**:
```json
{
  "e2e": "turbo run test:e2e",
  "e2e:ui": "playwright test --ui",
  "e2e:headed": "playwright test --headed",
  "e2e:debug": "playwright test --debug",
  "e2e:report": "playwright show-report"
}
```

### Task 1.6: Add Turbo Task
**File**: `turbo.json`

**Task to add**:
```json
{
  "test:e2e": {
    "dependsOn": ["^build"],
    "outputs": ["playwright-report/**", "test-results/**"],
    "cache": false
  }
}
```

### Task 1.7: Create Smoke Test
**File**: `e2e/smoke.e2e.ts`

**Purpose**: Verify Playwright setup works before proceeding

**Sub-agent prompt**:
```
Create a minimal smoke test that:
1. Navigates to "/"
2. Verifies page has a title
3. Takes a screenshot on failure

Follow pattern in specs/playwright-e2e/templates/test-file.template.md.
```

---

## Verification Commands

After Phase 1 completion:

```bash
# Verify Playwright config is valid
bunx playwright test --list

# Run smoke test
bun run e2e -- e2e/smoke.e2e.ts

# Verify Turbo task works
turbo run test:e2e --dry-run

# Open Playwright UI
bun run e2e:ui
```

---

## Success Criteria for Phase 1

- [ ] `playwright.config.ts` exists and is valid
- [ ] `e2e/fixtures/base.fixture.ts` created
- [ ] `e2e/fixtures/auth.setup.ts` created
- [ ] `e2e/.auth/` added to `.gitignore`
- [ ] NPM scripts added to root `package.json`
- [ ] `test:e2e` task added to `turbo.json`
- [ ] Smoke test passes: `bun run e2e -- e2e/smoke.e2e.ts`
- [ ] `bun run e2e:ui` opens Playwright UI

---

## Dependencies to Verify

Before starting Phase 1:

```bash
# Verify Playwright is installed
grep "playwright" package.json

# Verify @beep/web can start
bun run dev --filter @beep/web
# (Ctrl+C after it starts)

# Verify no conflicting e2e config
ls playwright.config.* 2>/dev/null || echo "No existing config (good)"
```

---

## Notes for Next Agent

1. **Start with Task 1.1** - The config is the foundation
2. **Test incrementally** - Run `bunx playwright test --list` after creating config
3. **Auth fixture depends on better-auth** - Check `packages/iam/` for session cookie structure
4. **webServer timeout** - Next.js 16 with Turbopack may need 120s+ to start
5. **Use test-writer agent** - For creating test files following Effect patterns

---

## Related Files

| File | Purpose |
|------|---------|
| `specs/playwright-e2e/README.md` | Full spec with architecture |
| `specs/playwright-e2e/QUICK_START.md` | Config templates |
| `specs/playwright-e2e/templates/*.md` | Pattern templates |
| `packages/iam/server/` | better-auth implementation |
| `apps/web/` | Primary test target |

---

## P1 Orchestrator Prompt

See `handoffs/P1_ORCHESTRATOR_PROMPT.md` for the ready-to-use execution prompt.
