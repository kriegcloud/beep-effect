# IAM Packages AGENTS.md Alignment Report

> Audit of `packages/iam/*/AGENTS.md` files against synthesized best practices.

---

## Summary

| Package | Alignment Score | Critical Issues | Recommendations |
|---------|-----------------|-----------------|-----------------|
| `@beep/iam-server` | 12/16 | 2 | 4 |
| `@beep/iam-tables` | 13/16 | 1 | 3 |
| `@beep/iam-domain` | 12/16 | 1 | 4 |
| `@beep/iam-ui` | 12/16 | 2 | 4 |
| `@beep/iam-client` | 13/16 | 1 | 3 |

**Overall Assessment**: The IAM package AGENTS.md files demonstrate strong adherence to best practices with well-structured content, detailed architecture notes, and comprehensive contributor checklists. The primary gaps are around missing explicit warnings/gotchas sections and inconsistent use of emphasis keywords for critical rules.

---

## Per-File Analysis

### 1. `packages/iam/server/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/server/AGENTS.md`

#### Alignment Score: 12/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2 | Clear headings, logical organization |
| Commands | 2 | Commands with descriptions and filter syntax |
| Specificity | 2 | Highly actionable guidance |
| Constraints | 1 | Some constraints but lacks consistent emphasis keywords |
| Architecture | 2 | Detailed surface map with file paths |
| Testing | 2 | Complete verification commands with Docker notes |
| Security | 1 | Mentions `IamConfig` for secrets but no explicit security section |
| Maintainability | 0 | Single file without rules/ decomposition |

#### Issues Found

1. **Line 28-36: Missing emphasis keywords for critical rules**
   - The "Authoring Guardrails" section contains important constraints but doesn't use `NEVER`, `ALWAYS`, `IMPORTANT` keywords consistently.
   - Example: "Never bypass `IamRepos.layer`" should be "NEVER bypass `IamRepos.layer`"

2. **Line 32: Undocumented tech debt reference**
   - References "Legacy usages in `Auth.service.ts` are scheduled for cleanup" without linking to a tracking issue or providing remediation timeline.

3. **Missing: Explicit warnings/gotchas section**
   - No dedicated section for unexpected behaviors or edge cases.

#### Missing Elements

- No explicit `IMPORTANT:` or `NEVER:` emphasis keywords
- No dedicated Warnings/Gotchas section
- No `.claude/rules/` decomposition for complex package
- No security-specific guidance section

#### Anti-Patterns Detected

- [ ] Vague instructions: None detected
- [x] Missing emphasis keywords for critical rules (partial)
- [ ] Missing command descriptions: None detected
- [x] No warnings section about gotchas

#### Recommendations

1. Add emphasis keywords to critical guardrails:
   ```markdown
   - **NEVER** bypass `IamRepos.layer` or `IamDb.IamDb.Live`
   - **ALWAYS** extend `Effect.Service` with `dependencies` defined as Layers
   ```

2. Add a dedicated Warnings/Gotchas section documenting:
   - Common Layer wiring mistakes
   - Better Auth plugin ordering requirements
   - Database transaction boundaries

3. Extract complex patterns to `.claude/rules/iam-server.md` if file continues to grow

4. Link tech debt items to GitHub issues

---

### 2. `packages/iam/tables/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/tables/AGENTS.md`

#### Alignment Score: 13/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2 | Excellent organization with clear sections |
| Commands | 2 | All commands documented with context |
| Specificity | 2 | Very specific guidance with code examples |
| Constraints | 2 | Good use of "Never" in guardrails |
| Architecture | 2 | Detailed surface map with file categories |
| Testing | 1 | Commands present but notes "placeholder" tests |
| Security | 1 | Implicit through schema alignment but no explicit section |
| Maintainability | 1 | Well-organized but could benefit from rules/ split |

#### Issues Found

1. **Line 29: Inconsistent capitalization of constraints**
   - Uses lowercase "Never" instead of uppercase "NEVER" for emphasis:
   ```markdown
   Never handcraft enum builders.
   ```

2. **Line 111: Placeholder test acknowledgment**
   - Explicitly mentions "currently placeholder; expand alongside meaningful table tests" which is honest but indicates coverage gap.

#### Missing Elements

- No explicit security section for database schema security
- Inconsistent emphasis keyword capitalization
- No dedicated gotchas section for Drizzle/PostgreSQL edge cases

#### Anti-Patterns Detected

- [ ] Vague instructions: None detected
- [x] Inconsistent emphasis keywords (partial)
- [ ] Missing command descriptions: None detected
- [ ] Large embedded code examples: Appropriately sized

#### Recommendations

1. Standardize emphasis keywords to uppercase:
   ```markdown
   - **NEVER** handcraft enum builders
   - **ALWAYS** import Effect modules by namespace
   ```

2. Add a Gotchas section for:
   - Drizzle migration ordering
   - Enum value addition limitations in PostgreSQL
   - Cross-package cascade implications

3. Add security note about preventing SQL injection via schema validation

---

### 3. `packages/iam/domain/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/domain/AGENTS.md`

#### Alignment Score: 12/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2 | Well-organized with clear purpose statement |
| Commands | 2 | Verification commands documented |
| Specificity | 2 | Detailed guidance on schema patterns |
| Constraints | 1 | Constraints present but emphasis inconsistent |
| Architecture | 2 | Good surface map with entity inventory |
| Testing | 1 | Commands present but notes "placeholder suite" |
| Security | 1 | Mentions error routing but no explicit security |
| Maintainability | 1 | Single file, reasonably sized |

#### Issues Found

1. **Line 27-33: Guardrails lack strong emphasis keywords**
   - Critical rules about Effect imports and `makeFields` usage don't use `ALWAYS`/`NEVER`:
   ```markdown
   Always import Effect modules with namespaces...
   ```
   Should be:
   ```markdown
   **ALWAYS** import Effect modules with namespaces...
   ```

2. **Line 33: Implicit security guidance**
   - Mentions error routing but doesn't explicitly address schema validation for security.

#### Missing Elements

- No dedicated Warnings/Gotchas section
- Emphasis keywords not consistently capitalized
- No security section for sensitive field handling (tokens, secrets in entities)

#### Anti-Patterns Detected

- [ ] Vague instructions: None detected
- [x] Missing emphasis keywords (partial)
- [ ] Stale information: None detected
- [x] Missing warnings about schema migration gotchas

#### Recommendations

1. Add uppercase emphasis to critical rules in Authoring Guardrails

2. Add a Gotchas section covering:
   - Schema version bumping requirements
   - `Symbol.for` naming stability importance
   - Effect model vs Drizzle model alignment pitfalls

3. Add explicit guidance on handling sensitive fields:
   ```markdown
   ## Security
   - **NEVER** log or expose `Redacted` field values
   - **ALWAYS** use `FieldSensitiveOptionOmittable` for tokens and secrets
   ```

4. Expand test coverage guidance beyond "placeholder suite" acknowledgment

---

### 4. `packages/iam/ui/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/ui/AGENTS.md`

#### Alignment Score: 12/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2 | Clear sections with good organization |
| Commands | 1 | Commands present but formatting varies |
| Specificity | 2 | Highly specific guardrails |
| Constraints | 2 | Good use of bold emphasis for rules |
| Architecture | 2 | Detailed surface map with component inventory |
| Testing | 1 | Commands present but notes "placeholder" |
| Security | 1 | ReCAPTCHA guidance but no broader security |
| Maintainability | 1 | Single file, reasonably sized |

#### Issues Found

1. **Line 125-128: Inconsistent command formatting**
   - Uses `bun run --filter` format inconsistently:
   ```markdown
   - `bun run --filter @beep/iam-ui lint`
   ```
   vs root AGENTS.md pattern:
   ```markdown
   - `bun run lint --filter @beep/iam-ui`
   ```

2. **Line 17: Placeholder test acknowledgment**
   - "placeholder Bun test (signals need for real coverage)" indicates known gap.

3. **Line 32-33: TODO without tracking**
   - "current redirect behaviour requires review" mentioned without issue link.

#### Missing Elements

- No explicit security section for auth UI considerations
- Command format inconsistent with root AGENTS.md
- TODOs referenced without tracking links

#### Anti-Patterns Detected

- [ ] Vague instructions: None detected
- [x] Stale/todo items without tracking: Yes (line 32-33)
- [ ] Missing constraints: None detected
- [x] Inconsistent command syntax

#### Recommendations

1. Standardize command format to match root AGENTS.md:
   ```markdown
   - `bun run lint --filter @beep/iam-ui`
   - `bun run check --filter @beep/iam-ui`
   ```

2. Add GitHub issue links for TODOs:
   ```markdown
   (see Guardrails, tracked in #XXX)
   ```

3. Add Security section covering:
   - XSS prevention in form inputs
   - ReCAPTCHA bypass prevention
   - Session token handling in client state

4. Add Warnings/Gotchas section for:
   - React hydration with auth state
   - Better Auth session timing edge cases

---

### 5. `packages/iam/client/AGENTS.md`

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/client/AGENTS.md`

#### Alignment Score: 13/16

| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2 | Excellent organization with related docs section |
| Commands | 2 | Detailed verification commands |
| Specificity | 2 | Very specific implementation guidance |
| Constraints | 2 | Clear forbidden patterns with explanation |
| Architecture | 2 | Comprehensive surface map |
| Testing | 1 | Commands present but notes placeholder |
| Security | 1 | Mentions `Redacted.value` but no dedicated section |
| Maintainability | 1 | Well-organized single file |

#### Issues Found

1. **Line 133-137: PATH prefix in commands**
   - Unusual PATH modification suggests environment issue:
   ```markdown
   - `PATH="$HOME/.bun/bin:$PATH" bun run --filter @beep/iam-client lint`
   ```
   This should be documented as a workaround or fixed at the environment level.

2. **Line 148: Inline security guidance**
   - Security guidance about `Redacted.value` is buried in contributor checklist rather than a dedicated section.

#### Missing Elements

- No dedicated Warnings/Gotchas section
- Security guidance not in dedicated section
- PATH workaround unexplained

#### Anti-Patterns Detected

- [ ] Vague instructions: None detected
- [x] Missing dedicated security section
- [ ] Missing command descriptions: None detected
- [x] Environment workaround without explanation

#### Recommendations

1. Extract security guidance to dedicated section:
   ```markdown
   ## Security
   - **NEVER** pass raw credential values; use `Redacted.value` extraction
   - **ALWAYS** sanitize callback URLs via `AuthCallback.sanitizePath`
   - Credential fields (email, password, tokens) must flow through Redacted wrappers
   ```

2. Add Gotchas section covering:
   - Session signal timing requirements
   - Contract continuation error handling
   - Better Auth error shape variations

3. Explain or remove PATH workaround in verification commands

4. Add cross-reference to security documentation if available

---

## Cross-Cutting Recommendations

### 1. Standardize Emphasis Keywords

All five files would benefit from consistent use of uppercase emphasis keywords:

```markdown
## Critical Rules
- **NEVER** use native array/string helpers
- **ALWAYS** import Effect modules by namespace
- **IMPORTANT**: Layer dependencies must be explicitly declared
```

**Priority**: HIGH - Improves adherence and scanning

### 2. Add Warnings/Gotchas Sections

None of the files have dedicated warnings sections. Add to each:

```markdown
## Gotchas
- [Package-specific edge cases]
- [Common mistakes and how to avoid them]
- [Timing/ordering dependencies]
```

**Priority**: MEDIUM - Prevents repeated mistakes

### 3. Create Shared Rules File

Consider extracting common IAM rules to `.claude/rules/iam.md`:

```yaml
---
paths:
  - "packages/iam/**/*"
---
# IAM Package Rules

## Effect Import Discipline
ALWAYS use namespace imports for Effect modules.

## Layer Dependencies
NEVER bypass Layer composition; use Layer.provideMerge for additions.
```

**Priority**: LOW - Would reduce duplication across 5 files

### 4. Standardize Command Format

Align all verification commands with root AGENTS.md format:

```markdown
## Verifications
- `bun run check --filter @beep/iam-<package>`
- `bun run lint --filter @beep/iam-<package>`
- `bun run test --filter @beep/iam-<package>`
```

**Priority**: LOW - Consistency improvement

### 5. Link TODOs to Issues

Any TODO or "scheduled for cleanup" references should link to GitHub issues:

```markdown
Legacy usages in `Auth.service.ts` are scheduled for cleanup (see #123).
```

**Priority**: MEDIUM - Improves tracking and accountability

### 6. Add Security Sections

All packages handle auth-related concerns and should have explicit security guidance:

| Package | Security Focus |
|---------|----------------|
| server | Secret handling, Layer isolation |
| tables | Schema validation, injection prevention |
| domain | Sensitive field patterns, error sanitization |
| ui | XSS, ReCAPTCHA, client state |
| client | Credential handling, session tokens |

**Priority**: HIGH - Auth packages require explicit security documentation

---

## Conclusion

The IAM package AGENTS.md files are generally well-structured and provide actionable guidance. The main improvement areas are:

1. **Emphasis consistency** - Upgrade constraint keywords to uppercase for better scanning
2. **Security documentation** - Add dedicated sections given auth-critical nature
3. **Gotchas sections** - Document common pitfalls to prevent repeated issues
4. **Command standardization** - Align with root AGENTS.md format

Overall quality is good (average score 12.4/16), placing these files in the "Minor improvements available" category per the rubric.
