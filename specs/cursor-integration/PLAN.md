# Cursor Integration Implementation Plan

> Detailed checklist for orchestrating the Cursor configuration integration.

---

## Overview

**Goal**: Enable the beep-effect monorepo to work with both Claude Code and Cursor IDE using shared configuration where possible.

**Approach**: Phased implementation starting with proof of concept, then transformation script, then full integration.

**Estimated Total Effort**: 4-6 hours

---

## Phase 1: Proof of Concept (1-2 hours)

### Prerequisites
- [ ] Cursor IDE installed and accessible
- [ ] Project opened in both Claude Code and Cursor for testing
- [ ] Verify Cursor installation:
  ```bash
  which cursor || echo "⚠️  BLOCKER: Cursor not installed"
  ```

### Tasks

#### 1.1 Create Cursor Directory Structure
- [ ] Create `.cursor/rules/` directory at project root
- [ ] Verify directory is empty and ready for configuration

```bash
mkdir -p .cursor/rules
```

#### 1.2 Manual Transformation Test
- [ ] Manually transform `behavioral.md` → `behavioral.mdc`:
  - Add frontmatter with `description:` and `alwaysApply: true`
  - Rename file extension to `.mdc`
- [ ] Verify file format is correct

**Template for behavioral.mdc:**
```yaml
---
description: Behavioral rules for critical thinking and workflow standards
alwaysApply: true
---

# Behavioral Rules
[... existing content from behavioral.md ...]
```

#### 1.3 Test in Cursor
- [ ] Open project in Cursor IDE
- [ ] Navigate to Rules settings (if available in UI)
- [ ] Verify `behavioral.mdc` appears in rules list
- [ ] Start a new chat session
- [ ] Test that behavioral rules are applied (e.g., ask for code review and verify critical thinking patterns)

#### 1.4 Verify Frontmatter Format
- [ ] Check Cursor documentation for exact frontmatter requirements
- [ ] Verify `description:` field is recognized
- [ ] Verify `alwaysApply: true` works as expected
- [ ] Document any issues or adjustments needed

#### 1.5 Document Findings
- [ ] Record whether transformation worked (yes/no)
- [ ] Document any frontmatter adjustments needed
- [ ] Update REFLECTION_LOG.md with findings

### Phase 1 Exit Criteria
- [ ] At least one rule file successfully transformed and tested
- [ ] Frontmatter format confirmed
- [ ] Cursor recognizes and applies the rule
- [ ] Proceed to Phase 2 if successful, or adjust approach if issues found

---

## Phase 2: Transformation Script (2-3 hours)

### Tasks

#### 2.1 Create Effect FileSystem Script
- [ ] Create `scripts/sync-cursor-rules.ts`
- [ ] **CRITICAL**: Use Effect FileSystem service (NOT Node.js fs)
- [ ] Implement file reading from `.claude/rules/`
- [ ] Implement frontmatter parsing and transformation
- [ ] Implement file writing to `.cursor/rules/`

**Script Template** (using Effect patterns):
```typescript
import * as Effect from "effect/Effect"
import * as A from "effect/Array"
import * as Str from "effect/String"
import { FileSystem } from "@effect/platform"
import { BunFileSystem, BunRuntime } from "@effect/platform-bun"

const RULES_DIR = '.claude/rules'
const OUTPUT_DIR = '.cursor/rules'

const transformRules = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  // Read directory
  const files = yield* fs.readDirectory(RULES_DIR)
  const mdFiles = A.filter(files, file => Str.endsWith(file, '.md'))

  // Transform each file
  yield* Effect.forEach(mdFiles, (file) => Effect.gen(function* () {
    const sourcePath = `${RULES_DIR}/${file}`
    const targetPath = `${OUTPUT_DIR}/${Str.replace(file, '.md', '.mdc')}`

    let content = yield* fs.readFileString(sourcePath)

    // Parse existing frontmatter if present
    const hasFrontmatter = Str.startsWith(content, '---')
    
    if (hasFrontmatter) {
      // Extract and transform frontmatter
      // Transform paths: to globs:
      content = Str.replace(content, /^paths:\s*$/m, 'globs:')
      // Add description if missing
      if (!Str.includes(content, 'description:')) {
        // Extract from filename or generate
        const description = generateDescription(file)
        content = Str.replace(content, /^---\n/, `---\ndescription: ${description}\n`)
      }
      // Add alwaysApply if missing
      if (!Str.includes(content, 'alwaysApply:')) {
        const hasGlobs = Str.includes(content, 'globs:')
        const alwaysApply = !hasGlobs
        content = Str.replace(content, /^---\n/, `---\nalwaysApply: ${alwaysApply}\n`)
      }
    } else {
      // Add frontmatter for files without it
      const description = generateDescription(file)
      const alwaysApply = true // Default for files without scoping
      content = `---\ndescription: ${description}\nalwaysApply: ${alwaysApply}\n---\n\n${content}`
    }

    yield* fs.writeFileString(targetPath, content)
  }), { concurrency: 'unbounded' })
})

// Helper to generate description from filename
const generateDescription = (filename: string): string => {
  const name = Str.replace(filename, '.md', '')
  return `${name.charAt(0).toUpperCase() + name.slice(1)} rules`
}

// Run with Bun runtime
const program = transformRules.pipe(
  Effect.provide(BunFileSystem.layer)
)

BunRuntime.runMain(program)
```

**Note**: This script follows project patterns:
- Uses Effect FileSystem service (not Node.js fs)
- Uses Effect Array/String utilities (not native methods)
- Properly handles errors through Effect runtime

#### 2.2 Test Script
- [ ] Run script on all 3 rule files
- [ ] Verify output files are created in `.cursor/rules/`
- [ ] Verify frontmatter format matches expected structure
- [ ] Verify content is preserved correctly
- [ ] Test with files that have frontmatter (`effect-patterns.md`)
- [ ] Test with files without frontmatter (`behavioral.md`, `general.md`)

#### 2.3 Validate Transformed Rules
- [ ] Open Cursor IDE
- [ ] Verify all 3 rule files appear in rules list
- [ ] Verify frontmatter is correctly parsed
- [ ] Test rule application in Cursor sessions

#### 2.4 Error Handling
- [ ] Add error handling for missing files
- [ ] Add error handling for invalid frontmatter
- [ ] Add logging for transformation steps
- [ ] Test error cases

### Phase 2 Exit Criteria
- [ ] Transformation script successfully converts all 3 rule files
- [ ] All transformed rules load correctly in Cursor
- [ ] Error handling is robust
- [ ] Script follows Effect patterns

---

## Phase 3: Integration (1 hour)

### Tasks

#### 3.1 Run Full Transformation
- [ ] Execute transformation script
- [ ] Verify all 3 rule files are created in `.cursor/rules/`
- [ ] Verify file sizes and content match expectations

#### 3.2 Test Rule Application
- [ ] Open Cursor IDE
- [ ] Start new chat session
- [ ] Test behavioral rules (critical thinking patterns)
- [ ] Test general rules (code quality standards)
- [ ] Test effect-patterns rules (TypeScript file patterns)
- [ ] Verify rules are applied correctly

#### 3.3 Verify Claude Code Still Works
- [ ] Open Claude Code
- [ ] Verify `.claude/rules/` still works unchanged
- [ ] Test that rules are still applied in Claude Code
- [ ] Confirm no regression

#### 3.4 Cross-Platform Testing (if applicable)
- [ ] Test on Linux (current system)
- [ ] Document Windows-specific considerations (if needed)
- [ ] Document macOS-specific considerations (if needed)

### Phase 3 Exit Criteria
- [ ] All rules successfully transformed and loaded
- [ ] Rules apply correctly in Cursor
- [ ] Claude Code continues working
- [ ] No regressions detected

---

## Phase 4: Documentation and Finalization (30 minutes)

### Tasks

#### 4.1 Update Project Documentation
- [ ] Add Cursor section to CLAUDE.md or README.md
- [ ] Document `.cursor/rules/` directory purpose
- [ ] Add setup instructions for new developers
- [ ] Document transformation process

#### 4.2 Version Control
- [ ] Add `.cursor/rules/` to git
- [ ] Verify transformed files are tracked
- [ ] Commit with clear message

```bash
git add .cursor/rules/ scripts/sync-cursor-rules.ts

# Use heredoc for multi-line commit message
git commit -m "$(cat <<'EOF'
Add Cursor IDE configuration

- Transform .claude/rules/*.md to .cursor/rules/*.mdc
- Add transformation script using Effect FileSystem
- Enables dual-IDE workflow with shared rules

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### 4.3 Update README (Optional)
- [ ] Add IDE compatibility section
- [ ] Document supported editors (Claude Code, Cursor)
- [ ] Include quick setup steps

#### 4.4 Final Verification
- [ ] Open fresh Claude Code session, verify working
- [ ] Open fresh Cursor session, verify working
- [ ] Test one code generation task in each
- [ ] Verify both IDEs get appropriate guidance

### Phase 4 Exit Criteria
- [ ] Documentation updated
- [ ] Changes version controlled
- [ ] Both IDEs verified working
- [ ] Team can follow setup instructions

---

## Success Checklist

### Minimum Viable Integration
- [ ] `.cursor/rules/` exists and contains `.mdc` files
- [ ] Rules load in Cursor IDE
- [ ] Effect patterns enforced in Cursor sessions
- [ ] Claude Code continues working unchanged

### Full Integration
- [ ] Transformation script functional
- [ ] All rules successfully migrated
- [ ] Frontmatter compatibility verified
- [ ] Documentation complete
- [ ] Version controlled

---

## Rollback Plan

If integration causes issues:

```bash
# Step 1: Remove newly created files
rm -rf .cursor/
rm -f scripts/sync-cursor-rules.ts

# Step 2: Check if integration was committed
git log --oneline -1 --grep="Cursor"

# Step 3a: If committed, revert the commit
# git revert HEAD

# Step 3b: If not committed but files were modified
# git restore <modified-files>

# Verify clean state
git status
```

**Important Notes**:
- **DO NOT** use `git checkout .` - it only restores tracked files
- Remove files explicitly with `rm` commands
- Only revert commits if they were actually created
- `.claude/rules/` remains untouched (source of truth)

---

## Future Enhancements (Out of Scope)

These are identified but deferred:

1. **Automated Sync**: Set up CI/CD to auto-sync on `.claude/rules/` changes
2. **Validation**: Add linting for `.mdc` frontmatter format
3. **Testing**: Automated tests for transformation script
4. **Skills Migration**: Research if Skills concepts can be partially migrated
5. **Cross-IDE Settings**: Unified permissions/ignore configuration

---

## Notes for Orchestrator

1. **Test frequently**: Verify after each major step
2. **Document issues**: Update REFLECTION_LOG.md with problems
3. **Be conservative**: If uncertain, choose simpler approach
4. **Preserve Claude Code**: Never break existing functionality
5. **Commit incrementally**: Small, focused commits
6. **Use Effect patterns**: All file operations must use Effect FileSystem

---

*Plan created: 2026-01-14*
