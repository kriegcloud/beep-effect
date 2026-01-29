# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 (Verification).

---

## Prompt

You are orchestrating Phase 5 (Verification) of the storybook-implementation spec.

### Your Role

**YOU ARE A VERIFIER, NOT A FIXER.**

You ONLY:
- Run verification commands
- Check manual criteria
- Score against RUBRICS.md
- Document results
- Recommend fixes (but don't implement)

### Context from P4

**Status**: Implementation complete with dev server working, build failing.

**Key Files Created**:
- `tooling/storybook/` - Storybook workspace (7 foundation files)
- `packages/ui/ui/src/components/*.stories.tsx` - 14 component stories
- `packages/ui/ui/src/components/__tests__/*.stories.tsx` - 4 theme verification stories
- `packages/ui/editor/STORYBOOK_PENDING.md` - Blocker documentation

**Known Issues**:
- Build fails due to monorepo resolution (dev works)
- CSS import order warnings (non-blocking)

### Critical Verification (MUST PASS)

**Theme Attribute Check**:
1. Start: `cd tooling/storybook && bun run dev`
2. Open: http://localhost:6006
3. Open DevTools → Elements → `<html>` element
4. Click theme toggle in Storybook toolbar
5. **PASS**: `data-color-scheme="light"` or `"dark"` attribute changes
6. **FAIL**: `class="dark"` appears OR no attribute change

### Verification Checklist

**Configuration Quality** (20 points):
- [ ] `package.json` has correct Storybook 8.6+ dependencies
- [ ] `main.ts` uses `@storybook/react-vite` framework
- [ ] `preview.tsx` imports globals.css
- [ ] Theme decorators in correct order

**Story Coverage** (25 points):
- [ ] ≥8 component stories exist
- [ ] Stories use CSF 3.0 format
- [ ] `tags: ["autodocs"]` present
- [ ] Stories render without console errors

**Theme Integration** (20 points):
- [ ] `withThemeByDataAttribute` used (NOT `withThemeByClassName`)
- [ ] `attributeName: "data-color-scheme"` configured
- [ ] Theme toggle changes both MUI and Tailwind styles
- [ ] No style conflicts between themes

**Documentation** (15 points):
- [ ] AGENTS.md exists in `tooling/storybook/`
- [ ] P4c blocker documented
- [ ] REFLECTION_LOG.md updated for P4

**Accessibility** (10 points):
- [ ] `@storybook/addon-a11y` configured
- [ ] No critical a11y violations in priority stories

**Performance** (10 points):
- [ ] Dev server starts in <30 seconds
- [ ] Stories load without timeout

### Commands to Run

```bash
# 1. Verify theme decorator constraint
grep -n "withThemeByDataAttribute" tooling/storybook/.storybook/decorators/ThemeDecorator.tsx
grep -n "data-color-scheme" tooling/storybook/.storybook/decorators/ThemeDecorator.tsx
grep -c "withThemeByClassName" tooling/storybook/.storybook/decorators/ThemeDecorator.tsx || echo "PASS"

# 2. Count stories
find packages/ui/ui/src -name "*.stories.tsx" | wc -l

# 3. Verify configuration files exist
ls -la tooling/storybook/package.json tooling/storybook/.storybook/main.ts tooling/storybook/.storybook/preview.tsx

# 4. Start dev server (manual verification)
cd tooling/storybook && bun run dev

# 5. Attempt build (expected to fail)
cd tooling/storybook && bun run build
```

### RUBRICS.md Scoring

After verification, calculate score using `specs/storybook-implementation/RUBRICS.md`.

**Minimum passing score**: 75 points

### Output Requirements

Create verification report:
- `specs/storybook-implementation/outputs/verification-report.md`

Include:
- All checklist results
- Score breakdown by category
- Screenshots/evidence of theme toggle (if possible)
- Recommendations for Phase 6 (if needed)

### Success Criteria

- [ ] Theme verification passes (data-color-scheme attribute changes)
- [ ] ≥8 stories render correctly
- [ ] RUBRICS.md score ≥75 points
- [ ] Verification report created
- [ ] Known issues documented
