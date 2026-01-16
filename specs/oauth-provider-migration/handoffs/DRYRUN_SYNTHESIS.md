# Dry Run Synthesis Report

> Aggregated findings from Phase 1, 2, and 3 dry runs to improve spec quality.

---

## Execution Summary

| Phase | Status | Key Issue |
|-------|--------|-----------|
| P1 (Entity IDs) | SUCCESS | Missing insertion order guidance |
| P2 (Domain Models) | SUCCESS | Wrong BS helper naming in spec |
| P3 (Tables) | SUCCESS | Cross-phase verification dependency |

---

## Critical Issues to Fix

### 1. BS Helper Naming (HIGH)
**Problem**: Spec uses `BS.toOptionalWithDefault(S.Boolean, false)` but codebase/linter prefers `BS.BoolWithDefault(false)`.

**Fix**: Update P2_ORCHESTRATOR_PROMPT.md to use `BS.BoolWithDefault(false)` for boolean defaults.

### 2. Missing Pre-flight Checks (HIGH)
**Problem**: Each phase assumes prerequisites are complete but provides no verification step.

**Fix**: Add pre-flight check section to each orchestrator prompt:
```bash
# Phase 2 pre-flight
grep -q "OAuthClientId" packages/shared/domain/src/entity-ids/iam/ids.ts || echo "STOP: Phase 1 incomplete"

# Phase 3 pre-flight
bun run check --filter @beep/iam-domain || echo "STOP: Phase 2 errors exist"
```

### 3. Sensitive Field Inconsistency (MEDIUM)
**Problem**: OAuthAccessToken.token is marked sensitive, but OAuthRefreshToken.token is not.

**Fix**: Either mark both as sensitive or add design note explaining why they differ.

### 4. clientId Design Decision Undocumented (MEDIUM)
**Problem**: OAuth tokens use `clientId: S.NonEmptyString` not `IamEntityIds.OAuthClientId`. This is intentional for OAuth spec compliance but not explained.

**Fix**: Add design note to spec explaining OAuth uses string client identifiers for interoperability.

### 5. Cross-Phase Verification Dependencies (MEDIUM)
**Problem**: Phase 3 verification (`bun run check --filter @beep/iam-tables`) fails if Phase 2 has errors, even if tables are correct.

**Fix**: Add note about this dependency and optional isolated verification command.

---

## Minor Improvements

| Issue | Phase | Fix |
|-------|-------|-----|
| No insertion order guidance | P1 | "Append after last existing entry" |
| Missing $IamDomainId import context | P2 | Add import source explanation |
| datetime import not shown everywhere | P3 | Include in all table snippets |
| Description strings vary | P1 | Provide exact strings for all 4 IDs |

---

## Spec Files to Update

1. **P1_ORCHESTRATOR_PROMPT.md**
   - Add pre-flight check section
   - Add insertion order guidance
   - Standardize description strings

2. **P2_ORCHESTRATOR_PROMPT.md**
   - Fix `BS.toOptionalWithDefault` → `BS.BoolWithDefault`
   - Add pre-flight check for Phase 1
   - Add sensitive field for OAuthRefreshToken.token
   - Add design note about clientId being string

3. **P3_ORCHESTRATOR_PROMPT.md**
   - Add pre-flight check for Phase 1 and 2
   - Add datetime import to all snippets
   - Add cross-phase verification note

4. **MASTER_ORCHESTRATION.md**
   - Add "Prerequisites Verification" section
   - Add "Design Decisions" section for FK/clientId pattern

---

## What Worked Well

1. **Pattern references were accurate** - Code snippets matched existing codebase
2. **File paths were correct** - All locations as documented
3. **Critical FK design documented** - clientId FK pattern worked correctly
4. **Table.make pattern** - Well documented and easy to follow
5. **Entity ID builder pattern** - Self-documenting with .tableName accessors

---

## Recommendations

1. **Add pre-flight checks to ALL phases** - Prevent cascading failures
2. **Use canonical helper names** - Avoid linter fixes during execution
3. **Document design decisions inline** - Explain non-obvious patterns
4. **Add isolated verification options** - For debugging specific phases
