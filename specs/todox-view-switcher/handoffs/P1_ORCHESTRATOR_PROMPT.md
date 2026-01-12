# Todox View Switcher - P1 Orchestrator Prompt

> Copy this prompt to begin Phase 1 implementation.

---

## Prompt

```
I'm implementing the Todox view switcher feature. Please help me complete Phase 1 as documented in specs/todox-view-switcher/handoffs/HANDOFF_P1.md.

The goal is to connect the ToggleGroup in apps/todox/src/app/page.tsx to conditionally render different views based on user selection.

Current state:
- ToggleGroup exists with viewMode state (string[])
- Only MailContent renders regardless of selection
- Duplicate "calendar" toggle item exists

Phase 1 tasks:
1. Remove duplicate calendar entry (lines 170-173)
2. Define ViewMode union type
3. Refactor from multi-select to single-select
4. Update onChange handler
5. Add type="single" to ToggleGroup
6. Add conditional rendering for views
7. Create PlaceholderView component
8. Add necessary imports

Please implement these changes following the exact specifications in HANDOFF_P1.md. After changes, run `bun run check` to verify no type errors.
```

---

## Expected Outcome

After Phase 1:
- Clicking toggle buttons changes the displayed view
- Email view renders the existing MailContent
- Other views show a placeholder with "Coming soon"
- No TypeScript errors
- Single-select behavior (one active view at a time)
