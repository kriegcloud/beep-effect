# Batch Report: [BATCH_NAME]

> Generated: [DATE]
> Files in batch: [COUNT]

---

## Batch Summary

| Metric | Value |
|--------|-------|
| Files processed | X / Y |
| Issues fixed | Z |
| Build status | Pass / Fail |
| Time elapsed | ~Xm |

---

## Files Processed

| File | Status | Issues Fixed | Agent | Notes |
|------|--------|--------------|-------|-------|
| [FILE_1] | completed | 5 | effect-schema-expert | |
| [FILE_2] | completed | 3 | effect-predicate-master | |
| [FILE_3] | blocked | 0 | — | [Reason] |

---

## Issues by Type

| Pattern Type | Count Fixed | Remaining |
|--------------|-------------|-----------|
| Native array methods | X | Y |
| Type assertions | X | Y |
| Unchecked access | X | Y |
| any types | X | Y |
| toJson validation | X | Y |

---

## Agent Usage

| Agent | Files | Issues | Success Rate |
|-------|-------|--------|--------------|
| effect-schema-expert | X | Y | Z% |
| effect-predicate-master | X | Y | Z% |
| effect-researcher | X | Y | Z% |

---

## Learnings

### What Worked
- [Learning 1]
- [Learning 2]

### What Didn't Work
- [Issue] → [Adjustment]

### Prompt Improvements
- [Prompt change made]

---

## Blocked Items

| File | Blocker | Resolution Needed |
|------|---------|-------------------|
| [FILE] | [Description] | [What's needed] |

---

## Next Batch Preparation

### Recommended Files
1. [FILE] — [Reason for priority]
2. [FILE] — [Reason for priority]

### Carryover Issues
- [Issue from this batch to address]

---

## Verification Log

```
[TIMESTAMP] bun run check
[OUTPUT]

[TIMESTAMP] bun run build
[OUTPUT]
```
