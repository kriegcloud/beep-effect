# lexical-editor-qa: Evaluation Rubrics

> Criteria for evaluating QA completion.

---

## Completion Rubric

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Console Cleanliness | 30% | Zero editor-related console errors/warnings on `/` |
| Feature Functionality | 40% | All toolbar features work, all test matrix items pass |
| Stability | 20% | No SSR crashes, no hydration errors, fullscreen stable |
| Documentation | 10% | Bug inventory complete with root causes and fix status |

---

## Quality Checklist

### Console Cleanliness (30%)
- [ ] Zero errors from `apps/todox/src/components/editor/` on page load
- [ ] Zero warnings from Lexical/editor plugins on page load
- [ ] Zero errors during editor interactions (formatting, linking, etc.)
- [ ] Zero errors during fullscreen toggle

### Feature Functionality (40%)
- [ ] Bold, italic, underline, strikethrough all toggle correctly
- [ ] Headings, quotes, lists work from toolbar and markdown shortcuts
- [ ] Link insert/edit/remove works with floating editor
- [ ] Image insert works (at least one method: toolbar, paste, or drag)
- [ ] Emoji picker triggers and inserts
- [ ] Slash command menu triggers and inserts
- [ ] Checklist creates and toggles
- [ ] Undo/Redo works

### Stability (20%)
- [ ] No SSR/hydration errors
- [ ] Fullscreen toggle preserves content
- [ ] Escape exits fullscreen
- [ ] Body scroll locked during fullscreen
- [ ] Editor recovers from rapid formatting

### Documentation (10%)
- [ ] `outputs/bug-inventory.md` has all issues with severity, root cause, fix status
- [ ] Feature test results table is complete
- [ ] REFLECTION_LOG updated with learnings

---

## Exit Criteria

The QA cycle is COMPLETE when:
1. All Critical issues resolved and verified
2. All Warning issues resolved and verified
3. Feature test results table shows all Pass
4. Console is clean on both page load and during interactions

## Grading Scale

| Grade | Score | Description |
|-------|-------|-------------|
| A | 90-100% | All features working, zero console noise, stable |
| B | 80-89% | Core features working, minor console warnings remain |
| C | 70-79% | Most features working, some known issues documented |
| D | 60-69% | Several broken features, console noise present |
| F | <60% | Many broken features, crashes, or SSR issues |
