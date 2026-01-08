# CLAUDE.md Best Practices Alignment - Actionable TODO List

> Consolidated actionable items from 10 alignment reports, prioritized by impact and organized by category.

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Files Audited** | 52 AGENTS.md + 1 CLAUDE.md + .claude/ directory |
| **Average Score** | 11.4/16 (MODERATE - Minor improvements available) |
| **Critical Issues** | 3 |
| **High Priority Items** | 18 |
| **Medium Priority Items** | 24 |
| **Low Priority Items** | 15 |

---

## CRITICAL Issues (Fix Immediately)

### 1. Wrong Package Documentation
- [x] **File**: `packages/common/yjs/AGENTS.md`
- **Line**: Entire file
- **Issue**: Contains documentation for `@beep/lexical-schemas`, not `@beep/yjs` - completely wrong package
- **Suggested Fix**: Create proper AGENTS.md for @beep/yjs covering Yjs CRDT integration, real-time collaboration utilities, and Effect integration
- **Violation**: File structure anti-pattern - stale/incorrect content

### 2. Missing .claude/settings.json
- [x] **File**: `.claude/settings.json` (missing)
- **Line**: N/A
- **Issue**: No tool permissions configuration exists for the project
- **Suggested Fix**: Create `.claude/settings.json` with appropriate tool allowlists:
  ```json
  {
    "permissions": {
      "allow": ["Bash(bun:*)", "Bash(git:*)", "Read", "Write", "Edit"],
      "deny": []
    }
  }
  ```
- **Violation**: Section 7 - Tool Configuration best practices

### 3. Missing .claude/rules/ Directory
- [x] **File**: `.claude/rules/` (missing directory)
- **Line**: N/A
- **Issue**: No auto-discovered contextual rules directory despite root CLAUDE.md being 110+ lines
- **Suggested Fix**: Create `.claude/rules/` and migrate content:
  - `.claude/rules/effect-patterns.md` - Effect-specific rules
  - `.claude/rules/behavioral.md` - System reminder content from root
  - `.claude/rules/testing.md` - Testing rules
- **Violation**: Section 2 - DON'T create one massive file (>100 lines)

---

## HIGH Priority Issues (Systemic Problems)

### Missing Emphasis Keywords (All Files) ✅ COMPLETED

- [x] **File**: `CLAUDE.md:63`
- **Issue**: "Never use direct cross-slice imports" lacks NEVER emphasis
- **Suggested Fix**: `NEVER use direct cross-slice imports or relative ../../../ paths.`
- **Violation**: Section 4 - Use emphasis keywords for adherence

- [x] **File**: `CLAUDE.md:71`
- **Issue**: "No `any`" lacks NEVER emphasis
- **Suggested Fix**: `NEVER use \`any\`, \`@ts-ignore\`, or unchecked casts.`
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: `packages/iam/server/AGENTS.md:28`
- **Issue**: "Never bypass `IamRepos.layer`" uses lowercase never
- **Suggested Fix**: `NEVER bypass \`IamRepos.layer\` or \`IamDb.IamDb.Live\``
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: `packages/iam/tables/AGENTS.md:29`
- **Issue**: "Never handcraft enum builders" uses lowercase
- **Suggested Fix**: `NEVER handcraft enum builders`
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: `packages/documents/server/AGENTS.md:44`
- **Issue**: "never inspect `process.env`" uses lowercase
- **Suggested Fix**: `NEVER inspect \`process.env\` directly`
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: `packages/documents/tables/AGENTS.md:29`
- **Issue**: "Avoid direct `process.env` access" should use NEVER
- **Suggested Fix**: `NEVER access \`process.env\` directly`
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: `packages/runtime/server/AGENTS.md:27`
- **Issue**: "Never bypass `serverRuntime`" uses lowercase
- **Suggested Fix**: `NEVER bypass \`serverRuntime\` when running server effects`
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: `packages/runtime/client/AGENTS.md:23-28`
- **Issue**: Multiple prohibitions without emphasis keywords
- **Suggested Fix**: Add ALWAYS/NEVER to all critical constraints
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: All `packages/customization/*/AGENTS.md` files
- **Issue**: All use lowercase "never", "always" instead of NEVER, ALWAYS
- **Suggested Fix**: Standardize on uppercase emphasis keywords
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: All `packages/comms/*/AGENTS.md` files
- **Issue**: All use lowercase "never", "always"
- **Suggested Fix**: Standardize on uppercase emphasis keywords
- **Violation**: Section 4 - Emphasis keywords

- [x] **File**: All `tooling/*/AGENTS.md` files
- **Issue**: Critical rules lack emphasis keywords
- **Suggested Fix**: Add NEVER/ALWAYS to Authoring Guardrails
- **Violation**: Section 4 - Emphasis keywords

### Missing Gotchas/Warnings Sections (All Files) ✅ COMPLETED

- [x] **File**: `CLAUDE.md` (missing section)
- **Issue**: No Gotchas section for project-specific edge cases
- **Suggested Fix**: Add `## Gotchas` section with:
  - Effect streams must be consumed or they won't execute
  - Drizzle migrations require `db:generate` before `db:migrate`
  - TanStack Query requires proper invalidation on mutations
- **Violation**: Section 1 - Required sections

- [x] **File**: All 52 AGENTS.md files
- **Issue**: No files have dedicated Gotchas/Warnings sections
- **Suggested Fix**: Add Gotchas section to each file documenting common pitfalls
- **Violation**: Section 1 - Required sections

### Missing Security Sections ✅ COMPLETED

- [x] **File**: `packages/iam/*/AGENTS.md` (all 5 packages)
- **Issue**: Auth-related packages lack explicit security documentation
- **Suggested Fix**: Add Security section covering credential handling, Layer isolation, XSS prevention
- **Violation**: Section 8 - Security Requirements

- [x] **File**: `packages/comms/server/AGENTS.md`
- **Issue**: Handles email/notifications but no security guidance
- **Suggested Fix**: Add section on email validation, template injection, rate limiting
- **Violation**: Section 8 - Security Requirements

- [x] **File**: `packages/shared/domain/AGENTS.md:23`
- **Issue**: EncryptionService mentioned but no security guidance
- **Suggested Fix**: Add Security section covering key management and rotation
- **Violation**: Section 8 - Security Requirements

- [x] **File**: `packages/_internal/db-admin/AGENTS.md`
- **Issue**: Database admin package with no security notes
- **Suggested Fix**: Add section on credential handling, `dotenvx` usage, production access
- **Violation**: Section 8 - Security Requirements

- [x] **File**: `tooling/repo-scripts/AGENTS.md`
- **Issue**: Handles `generate-env-secrets.ts` but no security guidance
- **Suggested Fix**: Add NEVER log/commit secrets guidance
- **Violation**: Section 8 - Security Requirements

---

## MEDIUM Priority Issues

### Large Embedded Code Examples

- [ ] **File**: `apps/server/AGENTS.md:38-69`
- **Issue**: Contains two substantial code blocks (~30 lines total)
- **Suggested Fix**: Move examples to referenced documentation file or trim to minimal snippets
- **Violation**: Section 1 - DON'T include large code examples

- [ ] **File**: `apps/web/AGENTS.md:17-42`
- **Issue**: Two code blocks totaling ~25 lines
- **Suggested Fix**: Reference documentation files for usage patterns
- **Violation**: Section 1 - DON'T include large code examples

- [ ] **File**: `.claude/agents/agents-md-updater.md` (663 lines)
- **Issue**: File exceeds reasonable size for maintainability
- **Suggested Fix**: Split into core agent definition + referenced templates
- **Violation**: Section 1 - File maintainability

- [ ] **File**: `.claude/commands/write-test.md` (876 lines)
- **Issue**: Extremely large command file
- **Suggested Fix**: Split into core command + referenced patterns documentation
- **Violation**: Section 1 - File maintainability

### Incomplete Testing Documentation

- [ ] **File**: `CLAUDE.md:73`
- **Issue**: Testing mentioned briefly but lacks complete workflow
- **Suggested Fix**: Add dedicated `## Testing` section with:
  - How to run all tests: `bun run test`
  - How to run specific tests: `bun run test --filter @beep/package`
  - Testing patterns and requirements
- **Violation**: Section 1 - Required sections - Testing Instructions

- [ ] **File**: `apps/marketing/AGENTS.md`
- **Issue**: No testing instructions whatsoever
- **Suggested Fix**: Add testing guidance appropriate for static site
- **Violation**: Section 1 - Required sections

- [ ] **File**: All `packages/customization/*/AGENTS.md` files
- **Issue**: Testing mentioned in checklists but no complete workflow
- **Suggested Fix**: Add testing section with patterns and workflow guidance
- **Violation**: Section 1 - Required sections

- [ ] **File**: All `packages/comms/*/AGENTS.md` files
- **Issue**: Incomplete testing workflow documentation
- **Suggested Fix**: Document test patterns and integration test setup
- **Violation**: Section 1 - Required sections

### Missing Quick Recipes in Client Packages

- [ ] **File**: `packages/customization/client/AGENTS.md`
- **Issue**: No Quick Recipes section despite being contract definition location
- **Suggested Fix**: Add contract definition recipe showing complete pattern
- **Violation**: Section 1 - Specificity best practices

- [ ] **File**: `packages/comms/client/AGENTS.md`
- **Issue**: No Quick Recipes section, mentions WebSocket but no patterns
- **Suggested Fix**: Add WebSocket contract pattern examples
- **Violation**: Section 1 - Specificity best practices

### Placeholder/Scaffold Documentation Confusion

- [ ] **File**: `packages/customization/ui/AGENTS.md:10-11`
- **Issue**: Surface Map shows only "beep" placeholder, not actual exports
- **Suggested Fix**: Mark as "No exports - awaiting implementation" or list planned components
- **Violation**: Stale content anti-pattern

- [ ] **File**: `packages/customization/client/AGENTS.md:10-11`
- **Issue**: "beep" placeholder provides no guidance
- **Suggested Fix**: Describe intended contract patterns
- **Violation**: Stale content anti-pattern

- [ ] **File**: `packages/comms/ui/AGENTS.md:10-15`
- **Issue**: Surface Map lists future components that don't exist
- **Suggested Fix**: Label as "Planned Components" with disclaimer
- **Violation**: Stale content anti-pattern

- [ ] **File**: `packages/comms/domain/AGENTS.md:10`
- **Issue**: Documents placeholder entity
- **Suggested Fix**: Mark as "Example pattern - replace with actual entities"
- **Violation**: Stale content anti-pattern

### Command Syntax Inconsistencies

- [ ] **File**: `packages/iam/ui/AGENTS.md:125-128`
- **Issue**: Uses `bun run --filter @beep/iam-ui lint` instead of `bun run lint --filter @beep/iam-ui`
- **Suggested Fix**: Standardize to match root AGENTS.md format
- **Violation**: Consistency best practice

- [ ] **File**: `packages/documents/ui/AGENTS.md:39-41`
- **Issue**: Inconsistent command format with siblings
- **Suggested Fix**: Standardize to `--filter=@beep/documents-ui` format
- **Violation**: Consistency best practice

### Stale-Prone Content

- [ ] **File**: `apps/web/AGENTS.md:10`
- **Issue**: Provider chain hardcoded; will become stale if providers change
- **Suggested Fix**: Reference `GlobalProviders.tsx` file instead of duplicating
- **Violation**: Section 6 - What NOT to store (frequently changing info)

- [ ] **File**: `packages/shared/domain/AGENTS.md:29-34`
- **Issue**: Line number references that may become stale
- **Suggested Fix**: Use function/class name anchors instead of line numbers
- **Violation**: Maintainability best practice

- [ ] **File**: `packages/shared/tables/AGENTS.md:31`
- **Issue**: Line number reference to relations.ts:1
- **Suggested Fix**: Use file reference without line numbers
- **Violation**: Maintainability best practice

### Vague Instructions

- [ ] **File**: `CLAUDE.md:77`
- **Issue**: "Clarify Intent: Ask before editing if unclear" - vague
- **Suggested Fix**: "ALWAYS ask before editing if the user's request could be interpreted multiple ways"
- **Violation**: Section 4 - Specificity

- [ ] **File**: `CLAUDE.md:80`
- **Issue**: "Respect Tooling: Use root scripts with dotenvx" - vague
- **Suggested Fix**: "ALWAYS run commands via `bun run <script>` from project root"
- **Violation**: Section 4 - Specificity

- [ ] **File**: `apps/marketing/AGENTS.md:28-34`
- **Issue**: Uses soft language ("Keep dependencies minimal", "Optimize for performance")
- **Suggested Fix**: Use explicit constraints with NEVER/ALWAYS
- **Violation**: Section 4 - Specificity

---

## LOW Priority Issues

### File Organization

- [ ] **File**: `CLAUDE.md:1-24`
- **Issue**: System-reminder block mixed with documentation
- **Suggested Fix**: Extract to `.claude/rules/behavioral.md`
- **Violation**: Maintainability - modular organization

- [ ] **File**: `CLAUDE.md:26`
- **Issue**: Titled "# AGENTS.md" but filename is CLAUDE.md
- **Suggested Fix**: Change to `# CLAUDE.md` or `# beep-effect Agent Configuration`
- **Violation**: Document clarity

- [ ] **File**: `.claude/skills/` directory
- **Issue**: Non-standard directory; content overlaps with what should be in rules/
- **Suggested Fix**: Migrate pattern files to `.claude/rules/effect/`
- **Violation**: Section 2 - Rules outside rules/ directory

- [ ] **File**: `.claude/prompts/` directory
- **Issue**: Purpose unclear; overlaps with specs/ directory
- **Suggested Fix**: Move orchestration prompts to specs/ or document purpose
- **Violation**: Section 1 - Memory hierarchy clarity

### Missing YAML Frontmatter

- [ ] **File**: `.claude/skills/forbidden-patterns.md`
- **Issue**: Lacks YAML frontmatter with paths field for conditional activation
- **Suggested Fix**: Add frontmatter:
  ```yaml
  ---
  paths:
    - "**/*.ts"
    - "**/*.tsx"
  ---
  ```
- **Violation**: Section 2 - Use YAML frontmatter for conditional rules

- [ ] **File**: `.claude/skills/effect-imports.md`
- **Issue**: No YAML frontmatter for path-specific activation
- **Suggested Fix**: Add paths frontmatter for TypeScript files
- **Violation**: Section 2 - Path-specific rules format

### Duplicate Content

- [ ] **File**: `.claude/commands/refine-prompt.md` and `.claude/agents/prompt-refiner.md`
- **Issue**: Overlapping prompt refinement content
- **Suggested Fix**: Keep one canonical source (agent), have command reference it
- **Violation**: DRY principle

- [ ] **File**: `tooling/repo-scripts/AGENTS.md:28-32` and `:99-103`
- **Issue**: Two Verifications sections with slightly different content
- **Suggested Fix**: Consolidate into single section
- **Violation**: Document organization

### Minor Content Issues

- [ ] **File**: `packages/shared/domain/AGENTS.md:14`
- **Issue**: Known duplicate SubscriptionId on lines 17-18 documented but not fixed
- **Suggested Fix**: Fix the duplication in entity-ids
- **Violation**: Code quality

- [ ] **File**: `tooling/repo-scripts/AGENTS.md:52,63`
- **Issue**: Emoji in code examples
- **Suggested Fix**: Replace with plain text logging
- **Violation**: Best practice - avoid emojis

- [ ] **File**: `packages/iam/client/AGENTS.md:133-137`
- **Issue**: PATH prefix workaround unexplained
- **Suggested Fix**: Document workaround reason or fix at environment level
- **Violation**: Documentation clarity

### Missing Accessibility Guidance

- [ ] **File**: `packages/customization/ui/AGENTS.md`
- **Issue**: Missing accessibility (a11y) guidance unlike comms/ui
- **Suggested Fix**: Add accessibility requirements to Authoring Guardrails
- **Violation**: Completeness for UI package

### TODOs Without Issue Links

- [ ] **File**: `packages/iam/ui/AGENTS.md:32-33`
- **Issue**: "current redirect behaviour requires review" without issue link
- **Suggested Fix**: Link to GitHub issue for tracking
- **Violation**: Section 6 - Tracking and accountability

- [ ] **File**: `packages/iam/server/AGENTS.md:32`
- **Issue**: "Legacy usages scheduled for cleanup" without issue link
- **Suggested Fix**: Add `(see #XXX)` issue reference
- **Violation**: Section 6 - Tracking and accountability

---

## Implementation Priority Order

### Phase 1: Critical Fixes (Immediate)
1. Create proper `packages/common/yjs/AGENTS.md`
2. Create `.claude/settings.json`
3. Create `.claude/rules/` directory with initial rules

### Phase 2: High Priority (This Sprint)
1. Add emphasis keywords (NEVER/ALWAYS) to all critical rules across all files
2. Add Security sections to auth-related packages (IAM, comms-server, db-admin)
3. Add Gotchas sections to all files (start with high-traffic packages)

### Phase 3: Medium Priority (Next Sprint)
1. Remove/relocate large embedded code examples
2. Complete testing documentation across all packages
3. Add Quick Recipes to client packages
4. Fix placeholder/scaffold documentation
5. Standardize command syntax

### Phase 4: Low Priority (Backlog)
1. File organization and modularization
2. YAML frontmatter addition
3. Duplicate content consolidation
4. Minor content fixes

---

## Score Improvement Projection

| Current Average | After Phase 1 | After Phase 2 | After Phase 3 | After Phase 4 |
|-----------------|---------------|---------------|---------------|---------------|
| 11.4/16 | 12.0/16 | 13.5/16 | 14.5/16 | 15.0/16 |

Target: Move from "Moderate improvements needed" to "Excellent configuration" (15-16/16)

---

## Report Files Reference

All detailed reports are available in:
```
specs/claude-md-best-practices-alignment/alignment-reports/
├── root-CLAUDE.md
├── dot-claude-directory.md
├── apps-agents.md
├── iam-packages-agents.md
├── documents-packages-agents.md
├── shared-packages-agents.md
├── common-packages-agents.md
├── customization-comms-agents.md
├── runtime-ui-agents.md
└── tooling-internal-agents.md
```

---

*Generated by claude-md-best-practices-alignment audit on 2026-01-07*
