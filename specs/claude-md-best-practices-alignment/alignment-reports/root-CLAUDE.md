# Root CLAUDE.md Alignment Report

## Summary
- **File**: CLAUDE.md
- **Alignment Score**: 10/16
- **Status**: MODERATE

The root CLAUDE.md file demonstrates solid structure and covers essential areas, but has notable gaps in organization strategy, testing depth, and use of emphasis keywords for critical rules. The file is at the 110-line threshold where modularization should be considered.

---

## Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Clear sections with markdown headings, well-organized tables |
| **Commands** | 2/2 | Complete command reference with categories and descriptions |
| **Specificity** | 1/2 | Some rules are specific ("No `any`"), others vague ("Respect Tooling") |
| **Constraints** | 1/2 | Some constraints stated, but missing emphasis keywords for critical rules |
| **Architecture** | 2/2 | Good overview with patterns and boundary documentation references |
| **Testing** | 1/2 | Mentions `@beep/testkit` but lacks complete testing workflow |
| **Security** | 1/2 | No explicit security notes, though no secrets present |
| **Maintainability** | 0/2 | 110 lines in single file, no `.claude/rules/` despite having `.claude/` infrastructure |

**Total: 10/16**

---

## Strengths

1. **Well-Structured Command Reference**: The Quick Reference table provides clear, categorized commands with descriptions. This follows best practices exactly.

2. **Technology Stack Documentation**: Comprehensive table of technologies organized by category makes onboarding clear.

3. **Architecture Boundaries Defined**: Clear statement of slice patterns and import restrictions ("Cross-slice imports only through `packages/shared/*` or `packages/common/*`").

4. **External Documentation References**: Good use of links to detailed docs (EFFECT_PATTERNS.md, PACKAGE_STRUCTURE.md) rather than embedding large content.

5. **AI Agent Workflow Section**: Provides specific behavioral guidelines for AI collaborators.

6. **Key References Table**: Helps navigation of documentation structure.

---

## Issues Found

### Issue 1: Misleading Title "AGENTS.md"
- **Location**: CLAUDE.md:L26
- **Problem**: The file is titled "# AGENTS.md" but the actual filename is CLAUDE.md. This creates confusion about file identity.
- **Violates**: Best practice - "Keep content concise and human-readable" and general document clarity
- **Suggested Fix**: Change `# AGENTS.md` to `# CLAUDE.md` or `# beep-effect Agent Configuration`

### Issue 2: System-Reminder Block Exposed in Root File
- **Location**: CLAUDE.md:L1-24
- **Problem**: The `<system-reminder>` block with behavioral instructions is included directly in the CLAUDE.md file. While technically valid, this pattern mixes prompt engineering with documentation and may be better suited for a `.claude/rules/` file.
- **Violates**: Maintainability best practice - modular organization
- **Suggested Fix**: Extract to `.claude/rules/behavioral.md` or keep minimal version in root file

### Issue 3: Missing Emphasis Keywords on Critical Rules
- **Location**: CLAUDE.md:L63, L71
- **Problem**: Critical constraints like "Never use direct cross-slice imports" and "No `any`" lack emphasis keywords (NEVER, IMPORTANT, etc.) that improve adherence.
- **Violates**: Prompt Engineering best practice - "Use emphasis keywords for adherence"
- **Suggested Fix**:
  ```markdown
  NEVER use direct cross-slice imports or relative `../../../` paths.
  NEVER use `any`, `@ts-ignore`, or unchecked casts.
  ```

### Issue 4: Vague Workflow Instructions
- **Location**: CLAUDE.md:L77-82
- **Problem**: Some workflow items are vague rather than actionable:
  - "Clarify Intent: Ask before editing if unclear" - What constitutes "unclear"?
  - "Respect Tooling: Use root scripts with `dotenvx`" - What does "respect" mean specifically?
- **Violates**: Specificity best practice - "Be specific and actionable"
- **Suggested Fix**: Rewrite with concrete triggers and actions:
  ```markdown
  1. **Clarify Intent**: ALWAYS ask before editing if the user's request could be interpreted multiple ways
  2. **Use Root Scripts**: ALWAYS run commands via `bun run <script>` from project root, never package directories
  ```

### Issue 5: Incomplete Testing Instructions
- **Location**: CLAUDE.md:L73
- **Problem**: Testing is mentioned briefly ("Effect testing utilities in `@beep/testkit`") but lacks a complete workflow: when to write tests, how to run specific tests, test patterns, etc.
- **Violates**: Required sections - "Testing Instructions: How to run tests, what to test"
- **Suggested Fix**: Add a dedicated "## Testing" section with:
  - How to run all tests: `bun run test`
  - How to run specific tests: `bun run test path/to/file.test.ts`
  - What to test (unit, integration patterns)
  - Testing requirements before committing

### Issue 6: No Warnings/Gotchas Section
- **Location**: N/A (missing)
- **Problem**: No documentation of unexpected behaviors, edge cases, or common mistakes specific to this codebase.
- **Violates**: Required sections - "Warnings/Gotchas: Unexpected behaviors, project-specific edge cases"
- **Suggested Fix**: Add section like:
  ```markdown
  ## Gotchas
  - Effect streams must be consumed or they won't execute
  - Drizzle migrations require `db:generate` before `db:migrate`
  - TanStack Query requires proper invalidation on mutations
  ```

### Issue 7: File At Modularization Threshold
- **Location**: Entire file (110 lines)
- **Problem**: The file is at the 100-line threshold where the best practices recommend using `.claude/rules/` for modular organization. The `.claude/` directory exists with skills, agents, and commands, but no `rules/` directory.
- **Violates**: Maintainability best practice - "DON'T create one massive file for large projects (use `.claude/rules/` instead)"
- **Suggested Fix**: Create `.claude/rules/` directory and extract:
  - `.claude/rules/behavioral.md` - The system-reminder content
  - `.claude/rules/effect-patterns.md` - Effect-specific rules (or import existing doc)
  - `.claude/rules/workflow.md` - AI agent workflow guidelines

---

## Missing Elements

- [ ] **Security guidance section** - No explicit security notes about handling secrets, environment variables, or safe patterns
- [ ] **Dev environment setup** - No mention of required local setup (PostgreSQL, Redis, etc.) beyond `bun run services:up`
- [ ] **Warnings/Gotchas section** - No documentation of common pitfalls
- [ ] **`.claude/rules/` directory** - Existing `.claude/` structure lacks rules folder despite file size
- [ ] **Path-specific rules** - No YAML frontmatter rules for different file patterns (e.g., `packages/**/*.ts`)
- [ ] **Error recovery patterns** - No guidance on what to do when commands fail
- [ ] **Commit/PR workflow** - No guidance on commit message format or PR requirements

---

## Anti-Patterns Detected

### File Structure Anti-Patterns
- [ ] One massive CLAUDE.md (>100 lines) instead of using `.claude/rules/`
  - **Status**: BORDERLINE - At 110 lines, approaching the anti-pattern threshold
- [x] Secrets or credentials in memory files - Not detected
- [x] Imports inside code blocks - Not detected (no code blocks with imports)
- [x] Circular symlinks - Not detected
- [x] Deep import chains (>5 hops) - Not detected
- [ ] Rules files outside `.claude/rules/`
  - **Status**: N/A - No `.claude/rules/` exists, behavioral rules are in root file

### Content Anti-Patterns
- [ ] Vague instructions ("format properly" vs specific rules)
  - **Detected**: CLAUDE.md:L77,80 - "Clarify Intent", "Respect Tooling" are vague
- [x] Missing command descriptions - Not detected, commands are well-described
- [ ] No emphasis keywords for critical rules
  - **Detected**: CLAUDE.md:L63,71 - Critical "never" rules lack NEVER/IMPORTANT emphasis
- [ ] Stale/outdated information not reviewed
  - **Unknown**: Cannot determine without version history analysis
- [x] Large embedded code examples - Not detected
- [ ] Missing constraints/forbidden patterns
  - **Partial**: Some constraints stated (no `any`), but no comprehensive forbidden patterns list

### Workflow Anti-Patterns
- [x] No exploration/planning phase documented - Specifications section covers this
- [ ] Missing testing instructions
  - **Detected**: Testing is mentioned but incomplete
- [ ] No clear success criteria
  - **Detected**: No explicit "when is a task complete" guidance
- [ ] Missing warnings about gotchas
  - **Detected**: No Gotchas section
- [x] No architecture guidance for complex tasks - Architecture section exists with references

---

## Recommendations Summary

### High Priority
1. Add emphasis keywords (NEVER, ALWAYS, IMPORTANT) to critical rules
2. Create `.claude/rules/` directory and extract modular content
3. Add complete testing workflow section
4. Add Gotchas/Warnings section

### Medium Priority
5. Fix the misleading "AGENTS.md" title
6. Make workflow instructions more specific and actionable
7. Add security guidance section
8. Add dev environment setup requirements

### Low Priority
9. Consider path-specific rules for different package types
10. Document error recovery patterns
11. Add commit message/PR guidelines
