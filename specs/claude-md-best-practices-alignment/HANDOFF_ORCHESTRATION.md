# Pattern Remediation Orchestration Handoff

> **Session Type**: Multi-agent orchestration for executing TODO.md remediation items
> **Created**: 2026-01-07
> **Status**: Ready for execution

---

## Mission Statement

You are the **orchestrator** for remediating CLAUDE.md and AGENTS.md files across the `beep-effect` monorepo. Your mission is to systematically execute the items in `specs/claude-md-best-practices-alignment/TODO.md`, deploying parallel sub-agents where appropriate and tracking progress meticulously.

---

## Context Summary

### What Was Done (Previous Session)

1. **Phase 1**: Fetched best practices from 4 Anthropic documentation URLs
2. **Phase 2**: Discovered 52 AGENTS.md files + 1 root CLAUDE.md + extensive .claude/ directory
3. **Phase 3**: Deployed 10 parallel sub-agents to audit all configurations against best practices
4. **Phase 4**: Synthesized 10 detailed reports into a prioritized TODO.md with 57 actionable items

### Key Artifacts

| File | Purpose |
|------|---------|
| `specs/claude-md-best-practices-alignment/TODO.md` | **PRIMARY** - Actionable checkbox items to execute |
| `specs/claude-md-best-practices-alignment/SYNTHESIZED_BEST_PRACTICES.md` | Reference for best practices patterns |
| `specs/claude-md-best-practices-alignment/alignment-reports/*.md` | Detailed per-package audit reports |
| `specs/claude-md-best-practices-alignment/claude-md-best-practices-alignment.original.md` | Original user request |

### Current State

- **Overall Score**: 11.4/16 (Moderate - Minor improvements available)
- **Target Score**: 15.0/16 (Excellent configuration)
- **Critical Issues**: 3
- **High Priority Items**: 18
- **Medium Priority Items**: 24
- **Low Priority Items**: 15

---

## Orchestration Strategy

### Execution Phases

Execute in order. Each phase should be completed before moving to the next.

#### Phase 1: Critical Fixes (3 items)

**Execute sequentially** - these are foundational and other fixes depend on them.

1. **Create `packages/common/yjs/AGENTS.md`**
   - Read existing yjs package structure: `packages/common/yjs/src/`
   - Create proper AGENTS.md following template from sibling packages
   - Remove/replace the incorrect lexical-schemas content

2. **Create `.claude/settings.json`**
   - Create with standard permissions structure
   - Reference: TODO.md Critical Issue #2

3. **Create `.claude/rules/` directory structure**
   - Create directory: `.claude/rules/`
   - Create `.claude/rules/effect-patterns.md` - extract from skills/
   - Create `.claude/rules/behavioral.md` - extract system-reminder from root CLAUDE.md
   - Create `.claude/rules/general.md` - universal project rules

**Checkpoint**: After Phase 1, update TODO.md marking Critical items as complete.

#### Phase 2: High Priority - Emphasis Keywords (Parallel Batch)

**Deploy 5-6 parallel agents** - each handles a package group.

| Agent | Packages | Files to Update |
|-------|----------|-----------------|
| Agent 1 | Root + Apps | CLAUDE.md, apps/*/AGENTS.md |
| Agent 2 | IAM slice | packages/iam/*/AGENTS.md (5 files) |
| Agent 3 | Documents slice | packages/documents/*/AGENTS.md (5 files) |
| Agent 4 | Shared packages | packages/shared/*/AGENTS.md (6 files) |
| Agent 5 | Common packages | packages/common/*/AGENTS.md (11 files) |
| Agent 6 | Customization + Comms | packages/customization/*/AGENTS.md + packages/comms/*/AGENTS.md (10 files) |

**Task for each agent**:
```
Review the AGENTS.md files in [package group] and add emphasis keywords:
- Change "never" to "NEVER" for prohibitions
- Change "always" to "ALWAYS" for requirements
- Add "IMPORTANT:" prefix to critical rules
- Reference: specs/claude-md-best-practices-alignment/SYNTHESIZED_BEST_PRACTICES.md Section 4

Files to update: [list files]

Report which files were modified and what changes were made.
```

**Checkpoint**: After all agents complete, verify changes with `git diff` and update TODO.md.

#### Phase 3: High Priority - Security Sections (Parallel Batch)

**Deploy 4 parallel agents** - each handles security-sensitive packages.

| Agent | Focus | Files |
|-------|-------|-------|
| Agent 1 | IAM Security | packages/iam/*/AGENTS.md - credential handling, Layer isolation, XSS |
| Agent 2 | Comms Security | packages/comms/server/AGENTS.md - email validation, rate limiting |
| Agent 3 | Data Security | packages/shared/domain/AGENTS.md, packages/_internal/db-admin/AGENTS.md |
| Agent 4 | Tooling Security | tooling/repo-scripts/AGENTS.md - secret generation |

**Task for each agent**:
```
Add a dedicated ## Security section to [files] covering:
- Credential/secret handling patterns
- Data sanitization requirements
- Access control considerations
- Specific security concerns for this package type

Use NEVER/ALWAYS emphasis for security rules.
Reference: specs/claude-md-best-practices-alignment/SYNTHESIZED_BEST_PRACTICES.md Section 8
```

**Checkpoint**: Update TODO.md marking Security items complete.

#### Phase 4: High Priority - Gotchas Sections (Parallel Batch)

**Deploy 4 parallel agents** - grouped by domain knowledge.

| Agent | Domain | Files |
|-------|--------|-------|
| Agent 1 | Effect/Runtime | runtime/*, shared/server, shared/domain |
| Agent 2 | Database/Tables | */tables/*, db-admin |
| Agent 3 | UI/React | */ui/*, ui-core |
| Agent 4 | Client/Contracts | */client/* |

**Task for each agent**:
```
Add a ## Gotchas section to each file documenting:
- Common pitfalls specific to this package
- Edge cases that cause confusion
- Timing/ordering dependencies
- Integration gotchas with sibling packages

Draw from alignment reports: specs/claude-md-best-practices-alignment/alignment-reports/
```

**Checkpoint**: Update TODO.md marking Gotchas items complete.

#### Phase 5: Medium Priority (Sequential or Small Parallel Batches)

Execute remaining Medium priority items:
- Remove large embedded code examples
- Complete testing documentation
- Add Quick Recipes to client packages
- Fix placeholder documentation
- Standardize command syntax

#### Phase 6: Low Priority (As Time Permits)

Execute Low priority items:
- File organization improvements
- YAML frontmatter additions
- Duplicate content consolidation
- Minor content fixes

---

## Sub-Agent Deployment Template

When deploying sub-agents, use this template:

```
You are remediating AGENTS.md files in the beep-effect monorepo.

## Context
- Reference best practices: specs/claude-md-best-practices-alignment/SYNTHESIZED_BEST_PRACTICES.md
- Detailed report for your packages: specs/claude-md-best-practices-alignment/alignment-reports/[relevant-report].md

## Your Task
[Specific task description]

## Files to Modify
[List of exact file paths]

## Output Requirements
1. Make the specified changes using Edit tool
2. Report what was changed in each file
3. Note any issues or blockers encountered

## Constraints
- Do NOT modify code files, only AGENTS.md/CLAUDE.md files
- Preserve existing content structure where possible
- Use consistent formatting with sibling packages
- Follow Effect namespace import conventions in any code examples
```

---

## Progress Tracking

### Checkpoint Protocol

After each phase:

1. **Run git status** to see all modified files
2. **Update TODO.md** - mark completed items with `[x]`
3. **Log progress** in this file under "Execution Log" section
4. **Verify changes** don't break existing functionality

### Execution Log

Record progress here as phases complete:

```
## Execution Log

### Phase 1: Critical Fixes
- [x] Started: 2026-01-07 19:44 UTC
- [x] yjs AGENTS.md created: 2026-01-07 19:44 UTC
- [x] settings.json created: 2026-01-07 19:45 UTC
- [x] rules/ directory created: 2026-01-07 19:45 UTC (effect-patterns.md, behavioral.md, general.md)
- [x] Completed: 2026-01-07 19:46 UTC

### Phase 2: Emphasis Keywords
- [x] Started: 2026-01-07 20:00 UTC
- [x] Agent 1 (Root + Apps): ✅ Completed - CLAUDE.md + 3 apps AGENTS.md updated
- [x] Agent 2 (IAM): ✅ Completed - 5 packages updated
- [x] Agent 3 (Documents): ✅ Completed - 5 packages updated
- [x] Agent 4 (Shared): ✅ Completed - 6 packages updated
- [x] Agent 5 (Common): ✅ Completed - 11 packages updated
- [x] Agent 6 (Customization + Comms): ✅ Completed - 10 packages updated
- [x] Completed: 2026-01-07 20:15 UTC
- **Total**: ~42 AGENTS.md files updated with NEVER/ALWAYS/MUST emphasis keywords

### Phase 3: Security Sections
- [x] Started: 2026-01-07 20:20 UTC
- [x] Agent 1 (IAM Security): ✅ Completed - 5 IAM packages (server, tables, domain, ui, client)
- [x] Agent 2 (Comms Security): ✅ Completed - 5 comms packages (server, domain, client, tables, ui)
- [x] Agent 3 (Data Security): ✅ Completed - 2 packages (shared/domain, db-admin)
- [x] Agent 4 (Tooling Security): ✅ Completed - 1 package (repo-scripts)
- [x] Completed: 2026-01-07 20:30 UTC
- **Total**: 13 AGENTS.md files updated with Security sections covering credentials, rate limiting, encryption, SQL injection prevention

### Phase 4: Gotchas Sections
- [x] Started: 2026-01-07 20:35 UTC
- [x] Agent 1 (Effect/Runtime): ✅ Completed - 4 files (runtime/server, runtime/client, shared/server, shared/domain)
- [x] Agent 2 (Database/Tables): ✅ Completed - 6 files (iam/tables, documents/tables, shared/tables, comms/tables, customization/tables, db-admin)
- [x] Agent 3 (UI/React): ✅ Completed - 7 files (iam/ui, documents/ui, shared/ui, comms/ui, customization/ui, ui/ui, ui/core)
- [x] Agent 4 (Client/Contracts): ✅ Completed - 5 files (iam/client, documents/client, shared/client, comms/client, customization/client)
- [x] Completed: 2026-01-07 20:55 UTC
- **Total**: 22 AGENTS.md files updated with Gotchas sections covering Effect, database, React, and contract pitfalls

### Phase 5: Medium Priority
- [ ] Started: [timestamp]
- [ ] Completed: [timestamp]

### Phase 6: Low Priority
- [ ] Started: [timestamp]
- [ ] Completed: [timestamp]
```

---

## File Inventory

### Files to Create

| Path | Template/Reference |
|------|-------------------|
| `packages/common/yjs/AGENTS.md` | Use `packages/common/utils/AGENTS.md` as template |
| `.claude/settings.json` | See TODO.md Critical Issue #2 |
| `.claude/rules/effect-patterns.md` | Extract from `.claude/skills/effect-imports.md` |
| `.claude/rules/behavioral.md` | Extract from `CLAUDE.md:1-24` |
| `.claude/rules/general.md` | Create with universal rules |

### Files to Modify (52 total)

**Root**:
- `CLAUDE.md`

**Apps (3)**:
- `apps/server/AGENTS.md`
- `apps/web/AGENTS.md`
- `apps/marketing/AGENTS.md`

**IAM Slice (5)**:
- `packages/iam/server/AGENTS.md`
- `packages/iam/tables/AGENTS.md`
- `packages/iam/domain/AGENTS.md`
- `packages/iam/ui/AGENTS.md`
- `packages/iam/client/AGENTS.md`

**Documents Slice (5)**:
- `packages/documents/server/AGENTS.md`
- `packages/documents/tables/AGENTS.md`
- `packages/documents/domain/AGENTS.md`
- `packages/documents/ui/AGENTS.md`
- `packages/documents/client/AGENTS.md`

**Shared Packages (6)**:
- `packages/shared/server/AGENTS.md`
- `packages/shared/env/AGENTS.md`
- `packages/shared/tables/AGENTS.md`
- `packages/shared/ui/AGENTS.md`
- `packages/shared/client/AGENTS.md`
- `packages/shared/domain/AGENTS.md`

**Common Packages (11)**:
- `packages/common/mock/AGENTS.md`
- `packages/common/contract/AGENTS.md`
- `packages/common/identity/AGENTS.md`
- `packages/common/errors/AGENTS.md`
- `packages/common/utils/AGENTS.md`
- `packages/common/yjs/AGENTS.md` (to be recreated)
- `packages/common/lexical-schemas/AGENTS.md`
- `packages/common/constants/AGENTS.md`
- `packages/common/schema/AGENTS.md`
- `packages/common/types/AGENTS.md`
- `packages/common/invariant/AGENTS.md`

**Customization Slice (5)**:
- `packages/customization/server/AGENTS.md`
- `packages/customization/tables/AGENTS.md`
- `packages/customization/domain/AGENTS.md`
- `packages/customization/ui/AGENTS.md`
- `packages/customization/client/AGENTS.md`

**Comms Slice (5)**:
- `packages/comms/server/AGENTS.md`
- `packages/comms/tables/AGENTS.md`
- `packages/comms/domain/AGENTS.md`
- `packages/comms/ui/AGENTS.md`
- `packages/comms/client/AGENTS.md`

**Runtime Packages (2)**:
- `packages/runtime/server/AGENTS.md`
- `packages/runtime/client/AGENTS.md`

**UI Packages (2)**:
- `packages/ui/ui/AGENTS.md`
- `packages/ui/core/AGENTS.md`

**Tooling (6)**:
- `tooling/scraper/AGENTS.md`
- `tooling/testkit/AGENTS.md`
- `tooling/utils/AGENTS.md`
- `tooling/cli/AGENTS.md`
- `tooling/repo-scripts/AGENTS.md`
- `tooling/build-utils/AGENTS.md`

**Internal (1)**:
- `packages/_internal/db-admin/AGENTS.md`

---

## Verification Commands

After completing remediation, run these to verify:

```bash
# Check for any remaining lowercase "never" in critical contexts
grep -r "never " packages/*/AGENTS.md apps/*/AGENTS.md | grep -v "NEVER"

# Check all files have been modified
git status

# Verify no syntax errors in markdown
bun run lint

# Check for common anti-patterns
grep -r "process\.env" packages/*/AGENTS.md | grep -v "NEVER"
```

---

## Rollback Strategy

If issues are encountered:

1. **Single file rollback**: `git checkout -- path/to/file`
2. **Phase rollback**: `git stash` before each phase, `git stash pop` to restore
3. **Full rollback**: `git checkout -- .` (discards all uncommitted changes)

---

## Success Criteria

Remediation is complete when:

1. [ ] All Critical items in TODO.md are marked `[x]`
2. [ ] All High Priority items in TODO.md are marked `[x]`
3. [ ] At least 80% of Medium Priority items are marked `[x]`
4. [ ] `grep -r "never " packages/*/AGENTS.md` returns only NEVER (uppercase)
5. [ ] All security-sensitive packages have `## Security` sections
6. [ ] All packages have `## Gotchas` sections
7. [ ] Score projection: 14.5+/16 average

---

## Quick Start

Begin orchestration with:

1. Read this handoff document completely
2. Read `specs/claude-md-best-practices-alignment/TODO.md` for full item list
3. Read `specs/claude-md-best-practices-alignment/SYNTHESIZED_BEST_PRACTICES.md` for patterns
4. Start Phase 1 Critical Fixes (sequential execution)
5. Use TodoWrite tool to track progress
6. Update Execution Log after each phase

**First command to run**:
```
Read specs/claude-md-best-practices-alignment/TODO.md
```

---

*Handoff prepared by previous session on 2026-01-07*
