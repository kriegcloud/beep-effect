# Migration Checklist: [Module Name]

> Template for tracking migration progress in a module.

---

## Summary

| Metric | Count |
|--------|-------|
| Files to migrate | [count] |
| Total violations | [count] |
| Completed | 0 |
| Remaining | [count] |

---

## Files

### [relative/path/to/file.ts]

| Line | Native Pattern | Effect Replacement | Status |
|------|---------------|-------------------|--------|
| 42 | `.map()` | `A.map()` | [ ] |
| 55 | `.filter()` | `A.filter()` | [ ] |

---

## Verification

```bash
bun run build
bun run check
bun run lint
```

---

## Notes

[Add any file-specific notes or edge cases here]
