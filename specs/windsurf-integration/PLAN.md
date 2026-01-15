# Windsurf Integration Implementation Plan

> Detailed checklist for orchestrating the Windsurf configuration integration.

---

## Overview

**Goal**: Enable the beep-effect monorepo to work with both Claude Code and Windsurf IDE using shared configuration where possible.

**Approach**: Phased implementation starting with symlink validation, then AGENTS.md creation, and optional transformation pipeline.

**Estimated Total Effort**: 4-6 hours (updated from 3-4 hours after Phase 3 correction)

---

## ⚠️ Critical Issues Fixed (2026-01-14 Review)

This plan was reviewed and **9 critical issues** were identified and corrected:

| Issue | Severity | Status |
|-------|----------|--------|
| 1. Transformation script used Node.js fs (violates Effect patterns) | HIGH | **FIXED** - Rewrote using Effect FileSystem |
| 2. Missing Windsurf installation verification | MEDIUM | **FIXED** - Added prerequisite check |
| 3. Symlink path potentially incorrect if not in project root | MEDIUM | **FIXED** - Added cd command |
| 4. Dangerous rollback plan (`git checkout .`) | HIGH | **FIXED** - Explicit file removal |
| 5. No frontmatter verification (assumption vs reality) | MEDIUM | **FIXED** - Added check step |
| 6. Character vs byte count confusion | LOW | **FIXED** - Use wc -m |
| 7. Broken git commit syntax (multi-line string) | MEDIUM | **FIXED** - Use heredoc |
| 8. Inconsistent file size metrics | LOW | **FIXED** - Clarified measurement |
| 9. Unrealistic Phase 3 time estimate | LOW | **FIXED** - Updated to 2-3 hours |

**Review Date**: 2026-01-14
**Reviewer**: Claude Code spec review agent

---

## Phase 1: Symlink Validation (1 hour)

### Prerequisites
- [ ] Windsurf IDE installed and accessible (⚠️ Not installed on this system)
- [ ] Project opened in both Claude Code and Windsurf for testing
- [ ] Verify Windsurf installation:
  ```bash
  which windsurf || echo "⚠️  BLOCKER: Windsurf not installed"
  ```

### Tasks

#### 1.1 Create Windsurf Directory Structure
- [ ] Create `.windsurf/` directory at project root
- [ ] Verify directory is empty and ready for configuration

```bash
mkdir -p .windsurf/rules
```

#### 1.2 Create Symlink
- [ ] Create symlink from `.windsurf/rules` to `.claude/rules`
- [ ] Verify symlink created successfully
- [ ] Verify symlink target is accessible

```bash
# Ensure we're in project root
cd /home/elpresidank/YeeBois/projects/beep-effect

# Remove the empty rules directory
rmdir .windsurf/rules

# Create symlink (using relative path from .windsurf/)
ln -s ../.claude/rules .windsurf/rules

# Verify symlink creation
ls -la .windsurf/
# Expected: rules -> ../.claude/rules

# Verify symlink target is accessible
ls -la .windsurf/rules/
# Expected: behavioral.md, general.md, effect-patterns.md
```

**⚠️ RISK**: Symlink assumes current directory is project root. If executed from wrong directory, symlink will break.

#### 1.3 Test Symlink in Windsurf
- [ ] Open project in Windsurf IDE
- [ ] Navigate to Cascade → Customizations → Rules
- [ ] Verify all 3 rule files appear:
  - [ ] behavioral.md
  - [ ] general.md
  - [ ] effect-patterns.md
- [ ] Verify rule content is readable (not symlink path)

#### 1.4 Validate Rule Application
- [ ] Start a new Cascade session
- [ ] Ask Windsurf to write TypeScript code
- [ ] Verify Effect patterns are enforced (namespace imports, etc.)
- [ ] Verify behavioral rules apply (no reflexive agreement)

#### 1.5 Verify Character Limits
- [ ] Verify character counts (Windsurf uses chars, not bytes):
  ```bash
  wc -m .claude/rules/*.md
  # Windsurf limits: 6,000 chars/file, 12,000 total
  ```
- [ ] **Expected**: All files under 6,000 chars (currently ~7,977 total)

#### 1.6 Verify Frontmatter Status
- [ ] Check if current rules have YAML frontmatter:
  ```bash
  head -n 5 .claude/rules/*.md | grep -E "^---$"
  ```
- [ ] **Expected**: No frontmatter exists (files are plain Markdown)
- [ ] Document if Windsurf requires frontmatter to be added

#### 1.7 Document Symlink Results
- [ ] Record whether symlink worked (yes/no)
- [ ] If failed, document error message
- [ ] Update REFLECTION_LOG.md with findings

### Phase 1 Exit Criteria
- [ ] Symlink behavior confirmed (works or fallback needed)
- [ ] If working: proceed to Phase 2
- [ ] If failed: implement copy fallback before Phase 2

### Fallback: Copy Script (if symlink fails)
```bash
# Create sync script
cat > scripts/sync-windsurf.sh << 'EOF'
#!/bin/bash
cp -r .claude/rules/* .windsurf/rules/
echo "Synced .claude/rules → .windsurf/rules"
EOF
chmod +x scripts/sync-windsurf.sh
```

---

## Phase 2: AGENTS.md Creation (30 minutes)

### Tasks

#### 2.1 Create Root AGENTS.md
- [ ] Create `AGENTS.md` at project root
- [ ] Include core behavioral guidelines from CLAUDE.md
- [ ] Keep under 6,000 characters for Windsurf compatibility

**Content Template**:
```markdown
# AI Agent Guidelines - beep-effect

## Critical Thinking Requirements

NEVER use phrases like "you are right" or reflexive agreement.
ALWAYS provide substantive technical analysis.

## Effect Patterns

- Use namespace imports: `import * as Effect from "effect/Effect"`
- Use single-letter aliases: `import * as S from "effect/Schema"`
- NEVER use native array/string methods
- NEVER use `any` or `@ts-ignore`

## Architecture

- Use `@beep/*` path aliases
- Follow slice structure: domain → tables → infra → client → ui
- No direct cross-slice imports

## Commands

- `bun run check` - Type check
- `bun run lint:fix` - Format code
- `bun run test` - Run tests
```

#### 2.2 Verify AGENTS.md Discovery
- [ ] Open project in Windsurf
- [ ] Verify AGENTS.md appears in Cascade context
- [ ] Start new session and verify guidelines apply

#### 2.3 Test CLAUDE.md Coexistence
- [ ] Verify Claude Code still reads CLAUDE.md
- [ ] Verify no conflicts between AGENTS.md and CLAUDE.md
- [ ] Confirm both IDEs get appropriate guidance

---

## Phase 3: Frontmatter Compatibility (2-3 hours)

**⚠️ TIME ESTIMATE UPDATED**: Original estimate (1 hour) was unrealistic. Transformation script requires Effect patterns compliance, not vanilla Node.js fs.

### Tasks

#### 3.1 Test Frontmatter Without Transformation
- [ ] Check if Windsurf accepts Claude Code frontmatter format
- [ ] Test each rule file individually
- [ ] Document any warnings or errors

#### 3.2 Assess Transformation Need
- [ ] If Windsurf requires `trigger:` field, determine approach:
  - Option A: Add Windsurf frontmatter (modifies source)
  - Option B: Create transformation script (maintains source)
  - Option C: Duplicate files with different frontmatter

#### 3.3 Implement Transformation (if needed)
- [ ] Create `scripts/transform-rules.ts` if Option B chosen
- [ ] **CRITICAL**: Use Effect FileSystem service (NOT Node.js fs)
- [ ] Test transformed output
- [ ] Integrate with sync workflow

**⚠️ CRITICAL ISSUE**: The original template violated project Effect patterns. Corrected version below.

**Transformation Script Template** (if needed):
```typescript
import * as Effect from "effect/Effect"
import * as A from "effect/Array"
import * as Str from "effect/String"
import { FileSystem } from "@effect/platform"

const RULES_DIR = '.claude/rules'
const OUTPUT_DIR = '.windsurf/rules'

const transformRules = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  // Read directory
  const files = yield* fs.readDirectory(RULES_DIR)
  const mdFiles = A.filter(files, file => Str.endsWith(file, '.md'))

  // Transform each file
  yield* Effect.forEach(mdFiles, (file) => Effect.gen(function* () {
    const sourcePath = `${RULES_DIR}/${file}`
    const targetPath = `${OUTPUT_DIR}/${file}`

    let content = yield* fs.readFileString(sourcePath)

    // Add trigger field if missing frontmatter
    if (!Str.includes(content, 'trigger:')) {
      // Add frontmatter if missing entirely
      if (!Str.startsWith(content, '---')) {
        content = `---\ntrigger: always_on\n---\n\n${content}`
      } else {
        content = Str.replace(content, /^---\n/, '---\ntrigger: always_on\n')
      }
    }

    // Transform paths to globs (if present)
    content = Str.replace(content, /^paths:\s*$/m, 'globs:')

    yield* fs.writeFileString(targetPath, content)
  }), { concurrency: 'unbounded' })
})

// Run with Bun runtime
import { BunFileSystem, BunRuntime } from "@effect/platform-bun"

const program = transformRules.pipe(
  Effect.provide(BunFileSystem.layer)
)

BunRuntime.runMain(program)
```

**Note**: This script follows project patterns:
- Uses Effect FileSystem service (not Node.js fs)
- Uses Effect Array/String utilities (not native methods)
- Properly handles errors through Effect runtime

#### 3.4 Validate Transformed Rules
- [ ] Verify transformed rules load in Windsurf
- [ ] Verify original rules still work in Claude Code
- [ ] Run both IDEs side-by-side to confirm

---

## Phase 4: Documentation and Finalization (30 minutes)

### Tasks

#### 4.1 Update Project Documentation
- [ ] Add Windsurf section to CLAUDE.md
- [ ] Document `.windsurf/` directory purpose
- [ ] Add setup instructions for new developers

#### 4.2 Version Control
- [ ] Add `.windsurf/` to git (or add to .gitignore if generated)
- [ ] If using symlinks, verify symlink is tracked correctly
- [ ] Commit with clear message

```bash
git add .windsurf/ AGENTS.md

# Use heredoc for multi-line commit message
git commit -m "$(cat <<'EOF'
Add Windsurf IDE configuration

- Symlink .windsurf/rules to .claude/rules
- Create AGENTS.md for Windsurf directory-scoped guidance
- Enables dual-IDE workflow with shared rules

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**⚠️ SYNTAX FIX**: Original command had broken multi-line string syntax. Corrected to use heredoc.

#### 4.3 Update README (Optional)
- [ ] Add IDE compatibility section
- [ ] Document supported editors (Claude Code, Windsurf)
- [ ] Include quick setup steps

#### 4.4 Final Verification
- [ ] Open fresh Claude Code session, verify working
- [ ] Open fresh Windsurf session, verify working
- [ ] Test one code generation task in each

---

## Success Checklist

### Minimum Viable Integration
- [ ] `.windsurf/rules` exists and contains rule files
- [ ] Rules load in Windsurf Cascade customizations
- [ ] Effect patterns enforced in Windsurf sessions
- [ ] Claude Code continues working unchanged

### Full Integration
- [ ] AGENTS.md provides Windsurf-specific guidance
- [ ] Frontmatter compatibility resolved
- [ ] Documentation updated
- [ ] Version controlled

---

## Rollback Plan

**⚠️ CRITICAL FIX**: Original rollback was dangerous and incomplete.

If integration causes issues:

```bash
# Step 1: Remove newly created files
rm -rf .windsurf/
rm -f AGENTS.md
rm -f scripts/sync-windsurf.sh  # If fallback script was created
rm -f scripts/transform-rules.ts  # If transformation was implemented

# Step 2: Check if integration was committed
git log --oneline -1 --grep="Windsurf"

# Step 3a: If committed, revert the commit
# git revert HEAD

# Step 3b: If not committed but files were modified
# git restore <modified-files>

# Verify clean state
git status
```

**Important Notes**:
- **DO NOT** use `git checkout .` - it only restores tracked files and could lose other uncommitted work
- Remove files explicitly with `rm` commands
- Only revert commits if they were actually created
- Symlinks can be removed with `rm` (won't delete target files)

---

## Future Enhancements (Out of Scope)

These are identified but deferred:

1. **Skill Migration**: Transform compatible skills for Windsurf
2. **Agent Condensation**: Create rule summaries of agent behaviors
3. **Build Pipeline**: Full templating system for multi-IDE support
4. **Workflow Creation**: Port Claude Code commands to Windsurf workflows
5. **Cross-IDE Settings**: Unified permissions/ignore configuration

---

## Notes for Orchestrator

1. **Test frequently**: Verify after each major step
2. **Document issues**: Update REFLECTION_LOG.md with problems
3. **Be conservative**: If uncertain, choose simpler approach
4. **Preserve Claude Code**: Never break existing functionality
5. **Commit incrementally**: Small, focused commits

---

*Plan created: 2026-01-14*
