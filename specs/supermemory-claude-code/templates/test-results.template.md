# Test Results: [Command/Feature Name]

> Phase: P[N] | Date: YYYY-MM-DD

---

## Summary

| Metric | Value |
|--------|-------|
| Tests Run | [number] |
| Passed | [number] |
| Failed | [number] |
| Skipped | [number] |
| Duration | [time] |

**Status**: [PASS / FAIL / PARTIAL]

---

## Test Environment

```bash
# Commands used
bun run test --filter=@beep/tooling-supermemory

# Environment
Node: [version]
Bun: [version]
OS: [platform]
```

---

## Test Cases

### [Test Suite 1]

| Test Case | Status | Notes |
|-----------|--------|-------|
| [test name] | PASS | - |
| [test name] | FAIL | [error message] |
| [test name] | SKIP | [reason] |

### [Test Suite 2]

| Test Case | Status | Notes |
|-----------|--------|-------|
| [test name] | PASS | - |

---

## Failures (if any)

### Failure 1: [Test Name]

**Error**:
```
[error output]
```

**Root Cause**: [analysis]

**Fix Applied**: [description or "pending"]

---

## Manual Testing

### Setup Command

```bash
$ bun run beep supermemory setup --help
# Expected: Help text with --oauth, --api-key, --project options
# Actual: [result]
# Status: [PASS/FAIL]

$ bun run beep supermemory setup
# Expected: Interactive setup flow
# Actual: [result]
# Status: [PASS/FAIL]
```

### Status Command

```bash
$ bun run beep supermemory status
# Expected: Configuration status display
# Actual: [result]
# Status: [PASS/FAIL]
```

---

## Coverage Notes

- [x] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] Platform variations tested (macOS/Linux/Windows)

---

## Next Steps

1. [Fix for failure 1]
2. [Additional test coverage needed]
3. [Integration testing with live MCP server]
