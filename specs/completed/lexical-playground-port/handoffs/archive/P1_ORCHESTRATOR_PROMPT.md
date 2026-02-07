# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `lexical-playground-port` spec: **Fix Lint/Build/Check Errors**.

### Context

The Lexical Playground has been copied to `apps/todox/src/app/lexical/` with 143 TS/TSX files. Initial analysis found:
- 106 lint errors (many auto-fixable)
- 1 corrupted file blocking type checks

### Your Mission

Make `@beep/todox` pass all quality commands with zero errors.

### Implementation Steps

1. **Fix corrupted file FIRST**:
   - File: `apps/todox/src/app/lexical/plugins/LayoutPlugin/InsertLayoutDialog.tsx`
   - Problem: Malformed license header (lines split incorrectly)
   - Action: Restore proper `/** ... */` license block format

2. **Run auto-fix**:
   ```bash
   bun run lint:fix --filter=@beep/todox
   ```

3. **Fix button types** (most common manual fix):
   - Search for `<button` without `type=` attribute
   - Add `type="button"` to prevent form submission behavior

4. **Fix remaining lint errors**:
   - `Number.isNaN()` instead of `isNaN()`
   - Add `title` to iframes
   - Add accessible content to anchor tags
   - Remove remaining unused imports

5. **Verify**:
   ```bash
   bun run lint --filter=@beep/todox
   bun run check --filter=@beep/todox
   bun run build --filter=@beep/todox
   ```

### Critical Patterns

**Button Type Fix**:
```tsx
// Before
<button onClick={handleClick}>

// After
<button type="button" onClick={handleClick}>
```

**isNaN Fix**:
```typescript
// Before
if (isNaN(parsedDate)) {

// After
if (Number.isNaN(parsedDate)) {
```

**Unused Import Fix**:
```typescript
// Before
import * as React from "react";
import { useState } from "react";

// After (remove the namespace import)
import { useState } from "react";
```

### Reference Files

- Handoff details: `specs/lexical-playground-port/handoffs/HANDOFF_P1.md`
- Effect patterns: `.claude/rules/effect-patterns.md`

### Success Criteria

- [ ] `bun run lint --filter=@beep/todox` passes (zero errors)
- [ ] `bun run check --filter=@beep/todox` passes (zero errors)
- [ ] `bun run build --filter=@beep/todox` passes

### After Completion

1. Update `specs/lexical-playground-port/REFLECTION_LOG.md` with Phase 1 learnings
2. Create `handoffs/HANDOFF_P2.md` with context for CSS/shadcn conversion
3. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md` for next phase
