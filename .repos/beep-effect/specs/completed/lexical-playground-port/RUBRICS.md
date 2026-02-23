# Evaluation Rubrics

> Scoring criteria for Lexical Playground Port specification quality gates.

---

## Overview

Total possible points: **100**

| Category | Max Points | Weight |
|----------|------------|--------|
| Code Quality | 30 | 30% |
| Type Safety | 25 | 25% |
| Effect Patterns | 25 | 25% |
| Integration | 20 | 20% |

**Grade Thresholds**:
| Score | Grade | Status |
|-------|-------|--------|
| 90-100 | A | Production-ready |
| 80-89 | B | Minor fixes needed |
| 70-79 | C | Significant work remaining |
| <70 | D | Phase incomplete |

---

## Category 1: Code Quality (30 points)

### 1.1 Lint Compliance (10 points)

| Score | Criteria |
|-------|----------|
| 10 | Zero lint errors on `bun run lint --filter=@beep/todox` |
| 7-9 | 1-5 lint errors remaining |
| 4-6 | 6-20 lint errors remaining |
| 1-3 | 21-50 lint errors remaining |
| 0 | 50+ lint errors remaining |

**Verification**:
```bash
bun run lint --filter=@beep/todox 2>&1 | grep -c "error"
```

### 1.2 Build Success (10 points)

| Score | Criteria |
|-------|----------|
| 10 | `bun run build --filter=@beep/todox` completes successfully |
| 5 | Build completes with warnings only |
| 0 | Build fails |

**Verification**:
```bash
bun run build --filter=@beep/todox && echo "PASS" || echo "FAIL"
```

### 1.3 Type Check (10 points)

| Score | Criteria |
|-------|----------|
| 10 | Zero type errors on `bun run check --filter=@beep/todox` |
| 7-9 | 1-5 type errors remaining |
| 4-6 | 6-20 type errors remaining |
| 1-3 | 21-50 type errors remaining |
| 0 | 50+ type errors or corrupted files |

**Verification**:
```bash
bun run check --filter=@beep/todox 2>&1 | grep -c "error TS"
```

---

## Category 2: Type Safety (25 points)

### 2.1 No `any` Types (10 points)

| Score | Criteria |
|-------|----------|
| 10 | Zero `any` types in lexical directory |
| 7-9 | 1-3 `any` types remaining |
| 4-6 | 4-10 `any` types remaining |
| 1-3 | 11-20 `any` types remaining |
| 0 | 20+ `any` types remaining |

**Verification**:
```bash
grep -r ": any" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | wc -l
```

### 2.2 No Type Assertions (8 points)

| Score | Criteria |
|-------|----------|
| 8 | Zero `as Type` assertions (excluding imports) |
| 6-7 | 1-5 assertions remaining |
| 3-5 | 6-15 assertions remaining |
| 1-2 | 16-30 assertions remaining |
| 0 | 30+ assertions remaining |

**Verification**:
```bash
grep -r " as " apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | grep -v "import" | wc -l
```

### 2.3 No Non-Null Assertions (7 points)

| Score | Criteria |
|-------|----------|
| 7 | Zero `!` non-null assertions |
| 5-6 | 1-5 assertions remaining |
| 3-4 | 6-15 assertions remaining |
| 1-2 | 16-30 assertions remaining |
| 0 | 30+ assertions remaining |

**Verification**:
```bash
grep -rE "\w+!" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | grep -v "!=" | grep -v "!//" | wc -l
```

---

## Category 3: Effect Patterns (25 points)

### 3.1 Array Utility Usage (8 points)

| Score | Criteria |
|-------|----------|
| 8 | All array operations use `A.*` utilities |
| 6-7 | 90%+ use Effect utilities |
| 4-5 | 70-89% use Effect utilities |
| 2-3 | 50-69% use Effect utilities |
| 0-1 | <50% use Effect utilities |

**Verification**:
```bash
# Native methods (should be 0)
grep -rE "\.(map|filter|reduce|find|some|every)\(" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | wc -l

# Effect methods (should be >0)
grep -r "A\.(map|filter|reduce|find)" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | wc -l
```

### 3.2 String Utility Usage (5 points)

| Score | Criteria |
|-------|----------|
| 5 | All string operations use `Str.*` utilities |
| 4 | 90%+ use Effect utilities |
| 2-3 | 70-89% use Effect utilities |
| 1 | 50-69% use Effect utilities |
| 0 | <50% use Effect utilities |

**Verification**:
```bash
# Native methods (should be 0)
grep -rE "\.(split|toLowerCase|toUpperCase|trim)\(" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | wc -l
```

### 3.3 No JSON.parse (5 points)

| Score | Criteria |
|-------|----------|
| 5 | Zero `JSON.parse` calls |
| 3-4 | 1-3 calls remaining |
| 1-2 | 4-10 calls remaining |
| 0 | 10+ calls remaining |

**Verification**:
```bash
grep -r "JSON.parse" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | wc -l
```

### 3.4 No try/catch (4 points)

| Score | Criteria |
|-------|----------|
| 4 | Zero `try {` blocks |
| 3 | 1-3 blocks remaining |
| 1-2 | 4-10 blocks remaining |
| 0 | 10+ blocks remaining |

**Verification**:
```bash
grep -r "try {" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | wc -l
```

### 3.5 No Raw Promises (3 points)

| Score | Criteria |
|-------|----------|
| 3 | Zero `new Promise` or `async/await` in new code |
| 2 | 1-5 occurrences |
| 1 | 6-15 occurrences |
| 0 | 15+ occurrences |

**Verification**:
```bash
grep -r "new Promise\|async function\|async (" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" | wc -l
```

---

## Category 4: Integration (20 points)

### 4.1 Page Accessibility (5 points)

| Score | Criteria |
|-------|----------|
| 5 | `/lexical` route returns 200 when authenticated |
| 3-4 | Page loads with warnings |
| 1-2 | Page loads with errors |
| 0 | Page does not load |

**Verification**:
1. Start dev server: `bun run dev --filter=@beep/todox`
2. Login at `/auth/sign-in`
3. Navigate to `/lexical`
4. Check status code in Network tab

### 4.2 API Routes (5 points)

| Score | Criteria |
|-------|----------|
| 5 | Both `/api/lexical/validate` and `/api/lexical/set-state` work |
| 3-4 | One route works |
| 1-2 | Routes exist but return errors |
| 0 | Routes missing |

**Verification**:
```bash
curl -X POST http://localhost:3000/api/lexical/validate \
  -H "Content-Type: application/json" \
  -d '{"editorState": "{}"}' \
  -w "\n%{http_code}"
```

### 4.3 Console Errors (5 points)

| Score | Criteria |
|-------|----------|
| 5 | Zero `console.error` entries on page load |
| 3-4 | 1-3 errors |
| 1-2 | 4-10 errors |
| 0 | 10+ errors |

**Verification**:
1. Open DevTools Console
2. Clear console
3. Navigate to `/lexical`
4. Count red error entries

### 4.4 CSS/Tailwind Migration (5 points)

| Score | Criteria |
|-------|----------|
| 5 | ≤5 CSS files remaining (themes only) |
| 4 | 6-10 CSS files |
| 2-3 | 11-20 CSS files |
| 1 | 21-30 CSS files |
| 0 | 30+ CSS files (no progress) |

**Verification**:
```bash
find apps/todox/src/app/lexical/ -name "*.css" | wc -l
```

---

## Phase-Specific Minimum Scores

Each phase must achieve minimum scores before proceeding:

| Phase | Min Score | Required Categories |
|-------|-----------|---------------------|
| P1 | 30/30 | Code Quality only |
| P2 | 35/55 | Code Quality + Integration (CSS) |
| P3 | 45/55 | Code Quality + Integration |
| P4 | 50/55 | Code Quality + Integration |
| P5 | 70/100 | All categories |
| P6 | 90/100 | All categories (production-ready) |

---

## Scoring Template

Use this template to score each phase completion:

```markdown
## Phase [N] Score Report

**Date**: YYYY-MM-DD
**Scorer**: [Agent/Human]

### Code Quality (30 points)
- Lint Compliance: _/10
- Build Success: _/10
- Type Check: _/10
**Subtotal**: _/30

### Type Safety (25 points)
- No any types: _/10
- No type assertions: _/8
- No non-null assertions: _/7
**Subtotal**: _/25

### Effect Patterns (25 points)
- Array utilities: _/8
- String utilities: _/5
- No JSON.parse: _/5
- No try/catch: _/4
- No raw Promises: _/3
**Subtotal**: _/25

### Integration (20 points)
- Page accessibility: _/5
- API routes: _/5
- Console errors: _/5
- CSS migration: _/5
**Subtotal**: _/20

### Total: _/100

**Grade**: [A/B/C/D]
**Status**: [Production-ready/Minor fixes/Significant work/Incomplete]
```

---

## Automated Scoring Script

Run this script to calculate current score:

```bash
#!/bin/bash
echo "=== Lexical Port Scoring ==="

# Code Quality
lint_errors=$(bun run lint --filter=@beep/todox 2>&1 | grep -c "error" || echo "0")
echo "Lint errors: $lint_errors"

# Type Safety
any_types=$(grep -r ": any" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
type_assertions=$(grep -r " as " apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import" | wc -l)
non_null=$(grep -rE "\w+!" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "!=" | wc -l)
echo "any types: $any_types"
echo "Type assertions: $type_assertions"
echo "Non-null assertions: $non_null"

# Effect Patterns
native_array=$(grep -rE "\.(map|filter|reduce)\(" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
json_parse=$(grep -r "JSON.parse" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
try_catch=$(grep -r "try {" apps/todox/src/app/lexical/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "Native array methods: $native_array"
echo "JSON.parse calls: $json_parse"
echo "try/catch blocks: $try_catch"

# Integration
css_files=$(find apps/todox/src/app/lexical/ -name "*.css" 2>/dev/null | wc -l)
echo "CSS files remaining: $css_files"

echo "=== End Scoring ==="
```
