# Bootstrapped Slice Specs Pattern

> Guide for specs that extend existing package slices rather than creating new ones.

**When to use**: Your spec targets `packages/[SLICE_NAME]/*` and packages already exist.

---

## Quick Check

```bash
ls packages/[SLICE_NAME]/
# If packages exist → bootstrapped (use this guide)
# If empty/missing → greenfield (standard workflow)
```

---

## Bootstrapped vs Greenfield

| State | Definition | Language |
|-------|------------|----------|
| **Greenfield** | Packages don't exist | "Create the slice" |
| **Bootstrapped** | Packages exist with starter files | "Extend the slice" |

---

## Required Adjustments

### 1. Inventory Existing Implementation

```bash
find packages/[SLICE_NAME]/domain/src/entities -name "*.ts" 2>/dev/null
find packages/[SLICE_NAME]/tables/src/tables -name "*.table.ts" 2>/dev/null
```

### 2. Add "Current State" Section

Add to README.md, MASTER_ORCHESTRATION.md, handoff files:

```markdown
### Current State (Bootstrapped)

**Already Exists:**
- [x] Package scaffolding (package.json, tsconfig.json)
- [x] Starter entity: `{Name}` model (use as pattern reference)
- [x] Starter table: `{name}.table.ts`

**Phase 0 Extends With:**
- [ ] Additional domain models
- [ ] Additional tables
```

### 3. Use "Extend" Language

```markdown
# WRONG
Create the `packages/knowledge/*` vertical slice...

# RIGHT
Extend the existing `packages/knowledge/*` slice...
```

### 4. Split Success Criteria

```markdown
### Success Criteria

**Already Complete (Bootstrapped):**
- [x] Package structure exists

**Phase 0 Deliverables:**
- [ ] New domain models
- [ ] New table schemas
```

---

## Verification

- [ ] All docs use "Extend" (not "Create") language
- [ ] "Current State" section in all spec docs
- [ ] Success criteria split appropriately
- [ ] Starter patterns documented as references
