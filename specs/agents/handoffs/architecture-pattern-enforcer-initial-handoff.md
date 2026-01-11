# Architecture Pattern Enforcer Agent — Initial Handoff

> **Priority**: Tier 3 (Quality)
> **Spec Location**: `specs/agents/architecture-pattern-enforcer/README.md`
> **Target Output**: `.claude/agents/architecture-pattern-enforcer.md` (450-550 lines)

---

## Mission

Create the **architecture-pattern-enforcer** agent — a structural validation specialist that audits folder structure, layer dependencies, module exports, and naming conventions. Detects cross-slice violations and layer boundary issues.

---

## Critical Constraints

1. **NEVER use `async/await`** — All examples must use `Effect.gen`
2. **NEVER use native array/string methods** — Use `A.map`, `Str.split`, etc.
3. **Agent definition must be 450-550 lines**
4. **Must cover all 4 vertical slices**: iam, documents, comms, customization
5. **Must document complete layer dependency chain**

---

## Phase 1: Research (Read-Only)

### Task 1.1: Map Complete Package Structure

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/PACKAGE_STRUCTURE.md`

**Create visual map**:
```
packages/
├── iam/
│   ├── domain/    # Layer 1: entities, value objects
│   ├── tables/    # Layer 2: database schemas
│   ├── server/    # Layer 3: API handlers
│   ├── client/    # Layer 4: RPC clients
│   └── ui/        # Layer 5: React components
├── documents/
│   ├── domain/
│   ├── tables/
│   ├── server/
│   ├── client/
│   └── ui/
├── comms/
│   └── [same structure]
├── customization/
│   └── [same structure]
├── shared/
│   ├── domain/    # Cross-slice domain types
│   ├── server/    # Cross-slice server utils
│   ├── client/    # Cross-slice client utils
│   └── ...
└── common/
    └── ...        # Pure utilities, no slice affiliation
```

### Task 1.2: Document Layer Dependency Rules

**Layer Order (dependencies can only flow DOWN)**:
```
domain (1) ← tables (2) ← server (3) ← client (4) ← ui (5)
```

**Allowed imports**:
- `domain` → nothing from same slice
- `tables` → `domain` only
- `server` → `domain`, `tables`
- `client` → `domain` only (not tables/server)
- `ui` → `domain`, `client`

**Cross-slice rules**:
- NEVER import directly between slices
- Route through `packages/shared/*` or `packages/common/*`

### Task 1.3: Analyze Import Patterns

**Run detection patterns**:

```bash
# Find all internal imports
grep -r "from \"@beep/" packages/

# Detect cross-slice violations
# IAM importing from documents
grep -r "@beep/documents" packages/iam/

# Documents importing from IAM
grep -r "@beep/iam" packages/documents/

# Layer violations (e.g., domain importing from server)
grep -r "@beep/iam-server" packages/iam/domain/
```

### Task 1.4: Study tsconfig Path Aliases

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/tsconfig.base.jsonc`

**Extract**:
- All `@beep/*` path mappings
- Package naming conventions

### Task 1.5: Sample Package.json Exports

**Glob**:
```
packages/**/package.json
```

**Check for**:
- Export surface area
- Entry point patterns
- Dependencies declared correctly

### Output: `specs/agents/architecture-pattern-enforcer/outputs/research-findings.md`

```markdown
# Architecture Pattern Enforcer Research Findings

## Package Structure Map
[Visual tree of all packages]

## Layer Dependency Matrix
| Layer | Can Import |
|-------|------------|
| domain | shared-domain, common/* |
| tables | domain, shared-domain, common/* |
| server | domain, tables, shared-server, common/* |
| client | domain, shared-client, common/* |
| ui | domain, client, shared-ui, common/* |

## Cross-Slice Rules
[What is/isn't allowed]

## Current Violations Found
[Any existing violations in codebase]

## Path Alias Reference
[All @beep/* mappings]
```

---

## Phase 2: Design

### Task 2.1: Design Validation Methodology

1. **Structure Validation**
   - Check folder organization
   - Verify required files exist (package.json, tsconfig.json, etc.)
   - Check naming conventions

2. **Layer Validation**
   - Parse imports from each file
   - Check against layer dependency rules
   - Flag violations

3. **Cross-Slice Validation**
   - Detect direct slice-to-slice imports
   - Verify shared package usage
   - Check for violations

4. **Export Validation**
   - Check package.json exports
   - Verify index.ts barrel exports
   - Flag over/under-exposed APIs

### Task 2.2: Define Output Format

```markdown
# Architecture Audit: [Package/Slice Name]

## Structure Validation
| Check | Status | Notes |
|-------|--------|-------|
| Folder organization | ✅/❌ | |
| Required files | ✅/❌ | |
| Naming conventions | ✅/❌ | |

## Layer Validation
| File | Layer | Invalid Imports |
|------|-------|-----------------|

## Cross-Slice Violations
### Violation 1
**File**: packages/iam/server/src/AuthHandler.ts
**Import**: `from "@beep/documents-domain"`
**Problem**: Direct cross-slice import
**Fix**:
```typescript
// Move shared types to @beep/shared-domain
import { SharedType } from "@beep/shared-domain"
```

## Export Surface Analysis
| Package | Public Exports | Recommended |
|---------|---------------|-------------|

## Recommended Restructuring
[If major changes needed]

## Summary
- **Structure**: PASS/FAIL
- **Layers**: PASS/FAIL (N violations)
- **Cross-Slice**: PASS/FAIL (N violations)
- **Exports**: PASS/FAIL
```

### Task 2.3: Create Detection Pattern Library

```markdown
## Detection Patterns

### Layer Violations
| Source Layer | Forbidden Import | Pattern |
|--------------|-----------------|---------|
| domain | tables, server, client, ui | `@beep/*-(tables\|server\|client\|ui)` |
| tables | server, client, ui | `@beep/*-(server\|client\|ui)` |
| client | tables, server | `@beep/*-(tables\|server)` |

### Cross-Slice Detection
| Slice | Pattern to Find Violations |
|-------|---------------------------|
| iam | `from "@beep/(documents\|comms\|customization)` in packages/iam/ |
| documents | `from "@beep/(iam\|comms\|customization)` in packages/documents/ |

### Path Alias Violations
| Pattern | Problem |
|---------|---------|
| `from "\.\./\.\./"` | Relative path instead of @beep/* |
| `from "\.\./packages/"` | Direct package path |
```

### Output: `specs/agents/architecture-pattern-enforcer/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/architecture-pattern-enforcer.md`:

```markdown
---
description: Architecture validation agent for enforcing layer dependencies and cross-slice boundaries
tools: [Glob, Grep, Read]
---

# Architecture Pattern Enforcer Agent

[Purpose statement]

## Architecture Rules Reference

### Vertical Slices
[iam, documents, comms, customization]

### Layer Order
[domain → tables → server → client → ui]

### Cross-Slice Access
[Only through shared/common]

## Methodology

### Step 1: Scope the Audit
[Package vs slice vs monorepo]

### Step 2: Structure Validation
[Folder checks, required files]

### Step 3: Layer Validation
[Import analysis per layer]

### Step 4: Cross-Slice Validation
[Slice boundary checks]

### Step 5: Export Validation
[Surface area review]

## Detection Pattern Library
[Grep patterns for violations]

## Output Format
[Structure with examples]

## Examples
[Sample audit and output]
```

### Task 3.2: Include Complete Reference Tables

```markdown
## Layer Dependency Matrix

| Source | Can Import From |
|--------|-----------------|
| domain | shared-domain, common/* |
| tables | domain, shared-domain, shared-tables, common/* |
| server | domain, tables, shared-domain, shared-server, common/* |
| client | domain, shared-domain, shared-client, common/* |
| ui | domain, client, shared-domain, shared-client, shared-ui, common/* |

## Slice Isolation Rules

| From Slice | Cannot Import |
|------------|---------------|
| iam | @beep/documents-*, @beep/comms-*, @beep/customization-* |
| documents | @beep/iam-*, @beep/comms-*, @beep/customization-* |
| comms | @beep/iam-*, @beep/documents-*, @beep/customization-* |
| customization | @beep/iam-*, @beep/documents-*, @beep/comms-* |
```

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/architecture-pattern-enforcer.md
wc -l .claude/agents/architecture-pattern-enforcer.md

# Verify layer documentation
grep -E "domain.*tables.*server" .claude/agents/architecture-pattern-enforcer.md

# Verify all slices mentioned
grep -E "iam|documents|comms|customization" .claude/agents/architecture-pattern-enforcer.md

# Verify detection patterns included
grep -c "grep\|Grep" .claude/agents/architecture-pattern-enforcer.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/architecture-pattern-enforcer.md`
- [ ] Length is 450-550 lines
- [ ] Covers all 4 vertical slices
- [ ] Documents complete layer dependency chain
- [ ] Includes detection pattern library
- [ ] Includes reference tables
- [ ] Tested with sample architecture audit

---

## Ready-to-Use Orchestrator Prompt

```
You are executing the architecture-pattern-enforcer agent creation spec.

Your goal: Create `.claude/agents/architecture-pattern-enforcer.md` (450-550 lines) — an architecture validation agent.

CRITICAL RULES:
1. Must cover all 4 vertical slices (iam, documents, comms, customization)
2. Must document complete layer dependency chain
3. All examples MUST use Effect patterns

PHASE 1 - Research:
1. Read documentation/PACKAGE_STRUCTURE.md — map complete structure
2. Document layer dependency rules
3. Run grep patterns to find current violations
4. Read tsconfig.base.jsonc for path aliases
5. Output to specs/agents/architecture-pattern-enforcer/outputs/research-findings.md

PHASE 2 - Design:
1. Create layer dependency matrix
2. Create slice isolation rules
3. Design detection pattern library
4. Define output format
5. Output to specs/agents/architecture-pattern-enforcer/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/architecture-pattern-enforcer.md
2. Include all reference tables
3. Include detection patterns
4. Test with sample audit (e.g., audit packages/iam/)

PHASE 4 - Validate:
1. Run verification commands
2. Update REFLECTION_LOG.md

Begin with Phase 1.
```
