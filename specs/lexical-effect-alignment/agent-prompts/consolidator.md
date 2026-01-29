# Checklist Consolidator Agent

## Your Mission

Merge all discovery documents for Phase [N] into a single master checklist.

## Input Documents

Read all files matching: `specs/lexical-effect-alignment/outputs/P[N]-discovery-*.md`

## Output Document

Create: `specs/lexical-effect-alignment/outputs/P[N]-MASTER_CHECKLIST.md`

## Output Format

```markdown
# P[N] [Category] Master Checklist

## Summary
- Total violations: [sum from all discovery docs]
- Unique files: [deduplicated count]
- Discovery batches merged: [count]

## Statistics

| Violation Type | Count |
|----------------|-------|
| [type1] | [count] |
| [type2] | [count] |
| ... | ... |

## Files by Violation Count

| File | Violations |
|------|------------|
| [file with most violations] | [count] |
| [next file] | [count] |
| ... | ... |

## Master Checklist

### [relative/path/to/file.ts] ([N] violations)

- [ ] `full/path/to/file.ts:LINE` - `violation` - `replacement`
- [ ] `full/path/to/file.ts:LINE` - `violation` - `replacement`

### [another/file.tsx] ([N] violations)

- [ ] `full/path/to/another/file.tsx:LINE` - `violation` - `replacement`

[Continue for all files, sorted by violation count descending]
```

## Consolidation Rules

1. **DEDUPLICATE** - Same file:line should only appear once
2. **SORT BY IMPACT** - Files with most violations first
3. **GROUP BY FILE** - All violations for a file together
4. **PRESERVE DETAILS** - Keep exact line numbers and replacements
5. **COUNT ACCURATELY** - Totals must match sum of individual items

## Quality Checks

Before finalizing:
- [ ] Total violations = sum of all checklist items
- [ ] No duplicate entries (same file:line)
- [ ] All entries have line numbers
- [ ] All entries have replacement functions specified
- [ ] Files are sorted by violation count (descending)

## Batch Count Calculation

For the orchestrator's use, include:

```markdown
## Execution Planning

- Total unique files: [count]
- Files per batch: 5
- Total batches needed: [ceil(unique_files / 5)]

### Batch Assignments

| Batch | Files |
|-------|-------|
| 1 | file1.ts, file2.ts, file3.ts, file4.ts, file5.ts |
| 2 | file6.ts, file7.ts, file8.ts, file9.ts, file10.ts |
| ... | ... |
```

This allows the orchestrator to deploy code-writer agents without reading the checklist in detail.
