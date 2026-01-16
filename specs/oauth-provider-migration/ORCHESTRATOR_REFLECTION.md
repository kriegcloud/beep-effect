# Orchestrator Reflection: OAuth Provider Migration Spec

> Meta-analysis of friction points encountered during spec creation and dry run orchestration.
> Purpose: Improve repository-level documentation and agent configuration for future spec work.

---

## Executive Summary

During the creation and dry-run validation of the OAuth Provider migration spec, several friction points emerged that could be addressed through improved repository documentation and Claude configuration. This reflection captures those learnings for systematic improvement.

---

## Friction Points Encountered

### 1. BS Helper Discovery (HIGH IMPACT)

**Problem**: The `@beep/schema` package has multiple helpers for optional/default fields, but the correct modern patterns aren't documented.

**Specific Issue**: Used `BS.toOptionalWithDefault(S.Boolean, false)` which triggered linter errors. The correct pattern is `BS.BoolWithDefault(false)`.

**Where Documentation Was Missing**:
- `.claude/rules/effect-patterns.md` mentions `S.optional` and `S.optionalWith` but not BS-specific helpers
- No comprehensive BS helper reference exists

**Recommended Fix**: Add BS helper reference to `effect-patterns.md` or create dedicated `@beep/schema` documentation.

```typescript
// BS Helper Quick Reference (MISSING from docs)
BS.BoolWithDefault(false)              // Boolean with default
BS.FieldOptionOmittable(schema)        // Optional field, omitted when undefined
BS.FieldSensitiveOptionOmittable(schema) // Sensitive + optional (suppresses logging)
BS.DateTimeUtcFromAllAcceptable        // DateTime that accepts multiple input formats
BS.EmailBase                           // Validated email schema
BS.NonEmptyString                      // Non-empty string validation
```

---

### 2. Sensitive Field Guidelines (HIGH IMPACT)

**Problem**: No clear guidance on when to mark fields as sensitive vs. regular.

**Specific Issue**: Initially marked `OAuthAccessToken.token` as sensitive but not `OAuthRefreshToken.token`, despite both being credentials.

**Where Documentation Was Missing**:
- `effect-patterns.md` doesn't mention sensitive field handling
- No security-focused schema documentation exists

**Recommended Fix**: Add sensitive field guidelines to rules or security documentation.

```markdown
## Sensitive Field Guidelines

ALWAYS use `BS.FieldSensitiveOptionOmittable` for:
- User credentials (passwords, API keys, secrets)
- OAuth tokens (access tokens, refresh tokens, ID tokens)
- Session tokens and CSRF tokens
- Any value that could enable impersonation if logged

NEVER mark these as sensitive (overhead without benefit):
- Server-generated UUIDs/IDs
- Timestamps
- Public identifiers (email, username)
```

---

### 3. Foreign Key Design Patterns (MEDIUM IMPACT)

**Problem**: The pattern of referencing public identifiers vs. internal primary keys for FKs wasn't documented.

**Specific Issue**: OAuth tables should reference `oauthClient.clientId` (public OAuth identifier) not `oauthClient.id` (internal UUID). This is a design decision based on OAuth RFC 6749 but wasn't captured anywhere.

**Where Documentation Was Missing**:
- No FK design pattern documentation
- Table creation patterns don't address this decision

**Recommended Fix**: Add FK design guidance to `documentation/patterns/` or create database patterns doc.

```markdown
## Foreign Key Target Selection

When creating FKs, consider:

1. **Internal References** (same bounded context):
   - Reference the internal `id` column (UUID primary key)
   - Example: `userId → user.id`

2. **External/Interop References** (cross-system or standards-based):
   - Reference the public identifier column
   - Example: OAuth tokens reference `clientId` (string) not `id` (UUID)
   - Rationale: OAuth RFC 6749 defines client_id as the interop identifier

3. **Decision Criteria**:
   - Will external systems need to use this reference? → Public identifier
   - Is this purely internal? → Internal UUID
```

---

### 4. Pre-flight Verification Patterns (MEDIUM IMPACT)

**Problem**: No standardized pattern for verifying prerequisites before starting a phase.

**Specific Issue**: Had to invent ad-hoc verification patterns (`grep -q`, `bun run check`) for each phase.

**Where Documentation Was Missing**:
- Spec template doesn't include pre-flight check section
- No standard verification patterns documented

**Recommended Fix**: Add pre-flight check patterns to spec template.

```markdown
## Pre-flight Check Template

Before starting any phase, verify:

1. **Existence Check** (file/symbol exists):
   ```bash
   grep -q "SymbolName" path/to/file.ts && echo "✓ Ready" || echo "✗ STOP"
   ```

2. **Type Check** (upstream compiles):
   ```bash
   bun run check --filter @beep/upstream-package 2>&1 | tail -5
   ```

3. **Syntax Check** (isolated file check):
   ```bash
   bun tsc --noEmit path/to/file.ts 2>&1 | head -20
   ```
```

---

### 5. Cross-Package Verification Cascading (MEDIUM IMPACT)

**Problem**: Turborepo's `--filter` cascades through all dependencies, causing confusing failures.

**Specific Issue**: `bun run check --filter @beep/iam-tables` fails if `@beep/iam-domain` has errors, even if tables are correct.

**Where Documentation Was Missing**:
- Turborepo behavior not documented in CLAUDE.md
- No guidance on isolated vs. cascading verification

**Recommended Fix**: Document Turborepo verification behavior.

```markdown
## Turborepo Verification Behavior

`bun run check --filter @beep/package` cascades through ALL dependencies:
- If `@beep/iam-tables` depends on `@beep/iam-domain`, domain errors will fail tables check
- Use isolated syntax check for debugging: `bun tsc --noEmit path/to/file.ts`

**Implication for Specs**: When verification fails, check if error is in current phase's files or upstream dependencies.
```

---

### 6. Entity ID Creation Pattern Completeness (LOW IMPACT)

**Problem**: Entity ID pattern documented but namespace declaration wasn't shown completely.

**Specific Issue**: The `declare namespace` with `Type`, `Encoded`, and `RowId` sub-namespaces wasn't fully documented.

**Where Documentation Was Missing**:
- Pattern shown partially in examples but not explained
- No explanation of why `RowId` namespace exists

**Recommended Fix**: Complete the Entity ID pattern documentation.

```typescript
// Complete Entity ID Pattern
export const MyEntityId = make("table_name", { brand: "MyEntityId" })
  .annotations($I.annotations("MyEntityId", { description: "..." }));

export declare namespace MyEntityId {
  export type Type = S.Schema.Type<typeof MyEntityId>;      // Branded runtime type
  export type Encoded = S.Schema.Encoded<typeof MyEntityId>; // Wire format (string)

  namespace RowId {
    export type Type = typeof MyEntityId.privateSchema.Type;    // Database row ID
    export type Encoded = typeof MyEntityId.privateSchema.Encoded;
  }
}
```

---

### 7. Spec Template for Multi-Phase Work (LOW IMPACT)

**Problem**: No template specifically for multi-phase specs with agent handoffs.

**Specific Issue**: Had to create REFLECTION_LOG.md, HANDOFF_P[N].md, and orchestrator prompts from scratch.

**Where Documentation Was Missing**:
- `SPEC_CREATION_GUIDE.md` exists but doesn't cover multi-phase orchestration
- No handoff document template

**Recommended Fix**: Extend spec template with multi-phase patterns.

```markdown
## Multi-Phase Spec Structure

specs/[name]/
├── README.md                    # Overview, phases, success criteria
├── REFLECTION_LOG.md            # Cumulative learnings (append-only)
├── handoffs/
│   ├── P1_ORCHESTRATOR_PROMPT.md  # Phase 1 execution instructions
│   ├── HANDOFF_P1.md              # Phase 1 completion report
│   ├── P2_ORCHESTRATOR_PROMPT.md  # Phase 2 execution instructions
│   └── ...
└── outputs/                     # Generated artifacts (if any)
```

---

## Recommended Repository Updates

### Priority 1: Effect Patterns Enhancement

Update `.claude/rules/effect-patterns.md`:
- Add BS helper reference table
- Add sensitive field guidelines
- Add Factory encoding behavior note (already present, verify complete)

### Priority 2: Database Patterns Documentation

Create `documentation/patterns/database-patterns.md`:
- FK design guidance (internal vs. public identifiers)
- Table.make vs OrgTable.make selection criteria
- Index naming conventions
- Cross-package verification cascading note

### Priority 3: Spec Template Enhancement

Update `specs/SPEC_CREATION_GUIDE.md`:
- Add multi-phase spec structure
- Add pre-flight check patterns
- Add handoff document template
- Add reflection log template

### Priority 4: Package-Level CLAUDE.md Enhancement

Update `packages/common/schema/CLAUDE.md` (if exists) or create:
- Complete BS helper reference
- Sensitive field decision tree
- Optional field pattern selection guide

---

## Agent Configuration Gaps

### Missing Agent Type: Schema Expert

**Gap**: No specialized agent for Effect Schema questions.

**Recommendation**: Consider adding `effect-schema-expert` agent that:
- Knows all BS helpers and their use cases
- Can recommend correct optionality patterns
- Understands sensitive field requirements

### Missing Agent Type: Database Pattern Enforcer

**Gap**: `architecture-pattern-enforcer` exists but doesn't cover database patterns.

**Recommendation**: Extend or create agent that:
- Validates FK design decisions
- Checks table naming conventions
- Verifies index naming patterns

---

## Summary of Recommended Changes

| File | Change | Priority |
|------|--------|----------|
| `.claude/rules/effect-patterns.md` | Add BS helper reference, sensitive field guidelines | P1 |
| `documentation/patterns/database-patterns.md` | Create FK design, Table.make guidance | P2 |
| `specs/SPEC_CREATION_GUIDE.md` | Add multi-phase patterns, pre-flight checks | P3 |
| `packages/common/schema/CLAUDE.md` | BS helper reference (if package has CLAUDE.md) | P4 |
| `.claude/rules/general.md` | Add Turborepo cascading verification note | P3 |

---

## Conclusion

The primary friction points were:
1. **Undocumented BS helpers** - Most impactful, caused spec errors
2. **Missing sensitive field guidance** - Security-relevant omission
3. **FK design patterns undocumented** - Design decision not captured
4. **Pre-flight check patterns missing** - Caused phase dependency confusion

Addressing these gaps will significantly improve spec creation velocity and reduce dry-run iterations needed to validate specs.
