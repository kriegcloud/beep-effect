# Visual Comparison Agent

## Status: COMPLETE ✅

**Final Score: 5/5**
**Iterations: 3**
**Date: 2025-01-27**

## Purpose

Compare the ported Lexical editor at `http://localhost:3000/lexical` with the official playground at `https://playground.lexical.dev/` and score similarity on a 1-5 scale.

## Scoring Rubric

| Score | Description |
|-------|-------------|
| 1 | Major differences - Missing core functionality or completely different appearance |
| 2 | Significant differences - Multiple visual/functional issues visible |
| 3 | Moderate differences - Some noticeable styling or behavior differences |
| 4 | Minor differences - Small cosmetic or edge-case functional differences |
| 5 | Identical - Visually and functionally indistinguishable |

## Comparison Checklist

### Visual Elements (Style)

- [ ] Header/logo placement and styling
- [ ] Toolbar appearance (icons, spacing, colors)
- [ ] Editor area background and borders
- [ ] Font family, size, and colors
- [ ] Button/dropdown styling
- [ ] Settings panel appearance
- [ ] TreeView/debug panel styling
- [ ] Overall color scheme matching

### Functional Elements (Behavior)

- [ ] Text input and cursor behavior
- [ ] Bold formatting (Ctrl+B)
- [ ] Italic formatting (Ctrl+I)
- [ ] Underline formatting (Ctrl+U)
- [ ] Heading selection dropdown
- [ ] Font size controls
- [ ] Text alignment controls
- [ ] Link insertion
- [ ] Undo/Redo
- [ ] Code block insertion
- [ ] Quote block insertion
- [ ] List creation (bullet/numbered)
- [ ] Table insertion
- [ ] Image insertion
- [ ] Toolbar dropdown menus
- [ ] Settings toggle functionality
- [ ] Dark mode toggle (if present)

## Agent Instructions

1. **Screenshot Both Versions**
   - Take full-page screenshot of official playground
   - Take full-page screenshot of ported version
   - Save to `output/iteration-<N>/screenshots/`

2. **Visual Comparison**
   - Compare header/toolbar layout
   - Compare editor area styling
   - Compare settings/debug panels
   - Document color, spacing, font differences

3. **Functional Testing**
   - Test each toolbar function on both
   - Note any behavioral differences
   - Test keyboard shortcuts

4. **Generate Report**
   - List all differences found
   - Categorize by severity (critical/major/minor)
   - Provide specific CSS/code fix suggestions
   - Calculate similarity score

5. **Output Structure**
   ```
   output/iteration-<N>/
   ├── screenshots/
   │   ├── official-playground.png
   │   └── ported-version.png
   ├── DIFFERENCES.md
   └── SCORE.md
   ```

## Iteration Process

After each comparison:
1. Sub-agents fix identified issues
2. Re-run comparison
3. Repeat until score reaches 5/5

## Commands

```bash
# Ensure dev server is running
bun run dev --filter=@beep/todox

# Access ported version
http://localhost:3000/lexical

# Official playground
https://playground.lexical.dev/
```
