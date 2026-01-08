# Apps AGENTS.md Alignment Report

> Audit of AGENTS.md files in `apps/` directory against synthesized best practices.

---

## apps/server/AGENTS.md

### Summary
- **Alignment Score**: 12/16
- **Status**: MINOR improvements available

### Scoring Breakdown
| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Clear sections with headings, well-organized |
| Commands | 2/2 | Commands with clear descriptions in Verifications section |
| Specificity | 2/2 | Highly actionable instructions (e.g., specific Effect patterns, Layer composition) |
| Constraints | 2/2 | Clear DO/DON'T with "critical" emphasis in Guardrails section |
| Architecture | 2/2 | Detailed Surface Map with layer dependencies and patterns |
| Testing | 1/2 | Basic verification commands, no detailed testing workflow |
| Security | 1/2 | Mentions secrets in logs but no dedicated security section |
| Maintainability | 0/2 | Single file, no rules/ modularization |

### Issues Found

1. **file:38-69** - Large embedded code examples
   - **Problem**: Contains two substantial code blocks (entry point + custom route example)
   - **Violation**: Best practices state "DON'T include large code examples (reference docs instead)"
   - **Fix**: Move examples to a referenced documentation file or trim to minimal snippets

2. **file:28** - Inconsistent emphasis keyword usage
   - **Problem**: Uses "(critical)" instead of uppercase emphasis keywords
   - **Violation**: Best practices recommend "IMPORTANT:", "YOU MUST:", "NEVER:" for critical rules
   - **Fix**: Change "## Guardrails (critical)" to "## CRITICAL Guardrails" or add "IMPORTANT:" prefix to each guardrail item

3. **file:77-82** - Checklist items lack explicit MUST/NEVER emphasis
   - **Problem**: Checklist uses soft language ("wraps work", "remains memoizable")
   - **Violation**: Best practices emphasize using clear constraints with "YOU MUST", "NEVER"
   - **Fix**: Prefix critical checklist items with emphasis keywords

### Missing Elements

1. **Security section**: No explicit security guidance beyond "no secrets in logs"
2. **Dev environment setup**: No prerequisites or environment requirements documented
3. **Warnings/Gotchas section**: No explicit warnings about unexpected behaviors
4. **Testing workflow**: Only lists commands, no guidance on what to test or testing patterns
5. **Import references**: Could use `@documentation/` imports for code examples

### Anti-Patterns Detected

- [x] Large embedded code examples (should reference files)
- [ ] Missing constraints/forbidden patterns - Not applicable (has Guardrails)
- [x] No explicit security guidance section

---

## apps/web/AGENTS.md

### Summary
- **Alignment Score**: 11/16
- **Status**: MINOR improvements available

### Scoring Breakdown
| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Clear sections with headings, logical flow |
| Commands | 2/2 | Commands with descriptions in Development Workflow and Verifications |
| Specificity | 2/2 | Highly specific (provider chain order, specific env vars, asset paths) |
| Constraints | 1/2 | Has guardrails but missing explicit DO/DON'T format |
| Architecture | 2/2 | Detailed Surface Map with file paths and provider chain |
| Testing | 1/2 | Basic commands only, no testing patterns |
| Security | 0/2 | No security guidance despite handling auth flows |
| Maintainability | 1/2 | Single file but appropriate length (~67 lines) |

### Issues Found

1. **file:17-42** - Large embedded code examples
   - **Problem**: Two code blocks (server-side fetch + client-side bridge) totaling ~25 lines
   - **Violation**: Best practices state "DON'T include large code examples"
   - **Fix**: Reference documentation files for usage patterns

2. **file:48-54** - Guardrails lack explicit keywords
   - **Problem**: Uses prose format without "NEVER:", "ALWAYS:", "YOU MUST:" emphasis
   - **Violation**: Best practices require emphasis keywords for adherence
   - **Fix**: Restructure as:
     ```markdown
     - **NEVER**: Read `process.env` directly
     - **ALWAYS**: Use `serverEnv`/`clientEnv` from `@beep/shared-env`
     ```

3. **file:12** - Vague route group description
   - **Problem**: "mocks/tests in `apps/web/test`" is ambiguous
   - **Violation**: Best practices emphasize specificity and actionability
   - **Fix**: Clarify what "mocks/tests" means - test utilities, test pages, or test fixtures

4. **file:10** - Provider chain is exhaustive but brittle
   - **Problem**: Full provider chain hardcoded; will become stale if providers change
   - **Violation**: Best practices warn against "Stale/outdated information not reviewed"
   - **Fix**: Reference the actual `GlobalProviders.tsx` file instead of duplicating content

### Missing Elements

1. **Security section**: Handles auth flows (IAM, sessions) but no security guidance
2. **Warnings/Gotchas**: No section for unexpected behaviors (e.g., hydration mismatches, React Compiler quirks)
3. **Error handling patterns**: No guidance on error boundaries or Effect error handling in UI
4. **Dev environment**: No prerequisites (Node version, env setup)

### Anti-Patterns Detected

- [x] Large embedded code examples
- [x] No emphasis keywords for critical rules
- [x] Stale-prone content (provider chain duplication)
- [ ] Missing constraints - Partial (has guardrails but soft language)

---

## apps/marketing/AGENTS.md

### Summary
- **Alignment Score**: 8/16
- **Status**: MODERATE improvements needed

### Scoring Breakdown
| Aspect | Score | Notes |
|--------|-------|-------|
| Structure | 2/2 | Clear sections with headings |
| Commands | 1/2 | Commands present but minimal descriptions |
| Specificity | 1/2 | General guidelines, lacks specific patterns |
| Constraints | 1/2 | Some constraints but no explicit DO/DON'T format |
| Architecture | 1/2 | Basic Surface Map, minimal detail |
| Testing | 0/2 | No testing instructions |
| Security | 0/2 | No security guidance |
| Maintainability | 2/2 | Appropriately sized single file for simple app |

### Issues Found

1. **file:21-26** - Usage Snapshots is not actionable
   - **Problem**: Lists use cases ("Marketing landing pages", "Pricing information") not usage patterns
   - **Violation**: Best practices require actionable, specific instructions
   - **Fix**: Rename to "Content Types" or provide actual code/pattern examples

2. **file:36-38** - Commands lack descriptions
   - **Problem**: Workflow commands have minimal descriptions ("Start development server")
   - **Violation**: Best practices state commands should have clear descriptions
   - **Fix**: Add context like "Start development server with hot reload on localhost:3001"

3. **file:28-34** - Guardrails lack emphasis and specificity
   - **Problem**: Uses soft language ("Keep dependencies minimal", "Optimize for performance")
   - **Violation**: Best practices require "NEVER:", "ALWAYS:", "YOU MUST:" for constraints
   - **Fix**: Restructure with explicit constraints:
     ```markdown
     - **NEVER**: Add backend logic or API routes
     - **NEVER**: Import Effect or complex state management
     - **ALWAYS**: Use Next.js Image for images
     ```

4. **file:40-43** - Verifications incomplete
   - **Problem**: `lint` says "(if configured)" suggesting uncertainty
   - **Violation**: Best practices require specific, accurate commands
   - **Fix**: Verify lint configuration exists and document it accurately

5. **file:9-15** - Surface Map lacks specificity
   - **Problem**: Lists generic files without explaining key files or patterns
   - **Violation**: Best practices recommend detailed architecture notes
   - **Fix**: Add key pages, layout patterns, component locations

### Missing Elements

1. **Testing instructions**: No testing guidance whatsoever
2. **Security section**: No security headers, CSP, or SEO security guidance
3. **Warnings/Gotchas**: No warnings (e.g., build time considerations, image optimization pitfalls)
4. **Code style**: No formatting rules or naming conventions specified
5. **Dev environment**: No prerequisites documented
6. **Specific patterns**: No examples of page structure, metadata patterns, or Tailwind conventions

### Anti-Patterns Detected

- [x] Vague instructions ("Optimize for performance" vs specific rules)
- [x] Missing command descriptions
- [x] No emphasis keywords for critical rules
- [x] Missing testing instructions
- [x] Missing constraints/forbidden patterns (no explicit DON'T list)
- [x] No architecture guidance for content structure

---

## Cross-Cutting Recommendations

### 1. Add Emphasis Keywords Consistently
All three files lack proper emphasis keywords. Adopt this pattern:
```markdown
## CRITICAL Guardrails
- **NEVER**: [forbidden action]
- **ALWAYS**: [required action]
- **YOU MUST**: [non-negotiable requirement]
```

### 2. Remove Large Code Examples
Both `apps/server/AGENTS.md` and `apps/web/AGENTS.md` embed substantial code blocks. These should:
- Reference documentation files: `@documentation/patterns/server-routes.md`
- Or use minimal 3-5 line snippets maximum

### 3. Add Security Sections
None of the files include security guidance:
- **server**: Should document secrets handling, auth middleware, rate limiting
- **web**: Should document CSP headers, auth guard patterns, session security
- **marketing**: Should document security headers, content security

### 4. Standardize Verifications Section
All files should follow this format:
```markdown
## Verifications
| Command | Purpose |
|---------|---------|
| `bun run check --filter @beep/[app]` | Type-check TypeScript |
| `bun run lint --filter @beep/[app]` | Biome formatting and import rules |
| `bun run test --filter @beep/[app]` | Run Vitest test suite |
| `bun run build --filter @beep/[app]` | Production build verification |
```

### 5. Add Testing Workflow Sections
Each app needs explicit testing guidance:
- What to test (components, pages, integrations)
- Testing patterns and utilities available
- How to run focused tests

### 6. Add Warnings/Gotchas Sections
Document project-specific edge cases:
- **server**: Layer composition order, memoization requirements
- **web**: Hydration issues, React Compiler limitations, provider ordering
- **marketing**: Static generation caveats, image optimization limits

### 7. Consider Modularization for Complex Apps
`apps/server` and `apps/web` could benefit from `.claude/rules/` directories:
```
apps/server/.claude/rules/
  layers.md      # Layer composition rules
  routes.md      # Route registration patterns

apps/web/.claude/rules/
  providers.md   # Provider chain rules
  effects.md     # Effect runtime bridge patterns
```

### 8. Remove Stale-Prone Content
The provider chain in `apps/web/AGENTS.md:10` is likely to become stale. Instead:
```markdown
- `apps/web/src/GlobalProviders.tsx` — provider chain (see file for current order)
```

---

## Summary Table

| File | Score | Status | Priority Issues |
|------|-------|--------|-----------------|
| apps/server/AGENTS.md | 12/16 | MINOR | Large code examples, missing security section |
| apps/web/AGENTS.md | 11/16 | MINOR | Large code examples, no emphasis keywords, stale-prone content |
| apps/marketing/AGENTS.md | 8/16 | MODERATE | Missing testing, vague constraints, no emphasis keywords |

**Recommended Priority Order for Remediation:**
1. `apps/marketing/AGENTS.md` - Lowest score, needs most work
2. `apps/web/AGENTS.md` - Handles auth/security, needs security section
3. `apps/server/AGENTS.md` - Highest score, minor refinements only
