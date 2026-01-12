# Supermemory Claude Code: Orchestration Prompt

> Entry point for executing the Supermemory tooling spec.

---

## Orchestration Rules

1. **Use AGENT_PROMPTS.md** for detailed implementation guidance
2. **PRESERVE context window** - Summarize results in `outputs/`
3. **FOLLOW CLI patterns** - Match existing `tooling/cli/` structure
4. **USE Effect patterns** - Namespace imports, @effect/cli conventions
5. **Use templates/** - Output artifacts should follow template formats

---

## Available Agents

Reference `.claude/agents-manifest.yaml` for full list. For this spec:

| Task Type | Agent | Capability |
|-----------|-------|------------|
| Code exploration | `codebase-researcher` | read-only |
| Structure validation | `architecture-pattern-enforcer` | write-reports |
| Documentation | `doc-writer` | write-files |
| CLI implementation | Direct (no agent) | - |

**Note**: There is no `effect-code-writer` agent. CLI command implementation is done directly or via `doc-writer` for scaffolding.

---

## Pre-flight Checks

```bash
# Check tooling structure
ls tooling/

# Check existing CLI commands
ls tooling/cli/src/commands/

# Verify CLI entry point
grep -A5 "withSubcommands" tooling/cli/src/index.ts | head -10

# Check if Claude config exists
ls ~/.config/claude/ 2>/dev/null || \
ls ~/Library/Application\ Support/Claude/ 2>/dev/null || \
echo "Claude config location unknown"
```

---

## Phase Context

**Current Phase**: P0 (Package Setup)

### P0 Task List

| # | Task | Method | Status |
|---|------|--------|--------|
| 1 | Create package structure | Direct | Pending |
| 2 | Implement setup command | Direct | Pending |
| 3 | Implement status command | Direct | Pending |
| 4 | Register in main CLI | Direct | Pending |
| 5 | Test setup flow | Manual | Pending |

---

## Task 1: Create Package Structure

**Method**: Direct execution

**Commands**:
```bash
mkdir -p tooling/supermemory/{src/commands,src/config,test}
```

**Files**: See AGENT_PROMPTS.md P0.1 for file contents.

**Success Criteria**:
- [ ] Directory structure created
- [ ] package.json valid JSON
- [ ] tsconfig.json extends base correctly
- [ ] src/index.ts exports supermemoryCommand

---

## Task 2: Implement Setup Command

**Method**: Direct implementation (use AGENT_PROMPTS.md P0.2 for guidance)

**Target**: `tooling/supermemory/src/commands/setup.ts`

**Requirements**:
1. @effect/cli Command pattern
2. Platform detection (macOS, Linux, Windows)
3. Options: `--oauth`, `--api-key`, `--project`
4. Config merge logic
5. Error handling with tagged errors

**Reference**: `tooling/cli/src/commands/sync.ts` for FileSystem patterns

**Success Criteria**:
- [ ] Command compiles without TypeScript errors
- [ ] Options have descriptions
- [ ] Detects config on current platform
- [ ] Handles missing config gracefully
- [ ] Merges without clobbering existing servers

---

## Task 3: Implement Status Command

**Method**: Direct implementation (use AGENT_PROMPTS.md P0.3 for guidance)

**Target**: `tooling/supermemory/src/commands/status.ts`

**Requirements**:
1. Read Claude config
2. Check for supermemory entry
3. Display formatted status

**Success Criteria**:
- [ ] Command compiles without errors
- [ ] Shows config path
- [ ] Shows supermemory status (configured/not configured)
- [ ] Shows project scope if configured

---

## Task 4: Register in Main CLI

**Method**: Direct edit

**Files to modify**:
1. `tooling/cli/src/index.ts` - Add import and subcommand
2. `tooling/cli/package.json` - Add dependency

**Success Criteria**:
- [ ] Import added correctly
- [ ] Subcommand registered
- [ ] Dependency added to package.json
- [ ] `bun install` succeeds

---

## Task 5: Test Setup Flow

**Method**: Manual verification

**Commands**:
```bash
# Install dependencies
bun install

# Verify types
bun run check --filter=@beep/tooling-supermemory

# Check command registered
bun run beep supermemory --help

# Run setup
bun run beep supermemory setup

# Check status
bun run beep supermemory status
```

**Success Criteria**:
- [ ] No TypeScript errors
- [ ] Help text displays correctly
- [ ] Setup modifies Claude config
- [ ] Status reads config correctly

---

## P0 Completion Checklist

- [ ] Package structure created
- [ ] `bun install` succeeds
- [ ] `bun run check` passes
- [ ] `bun run beep supermemory --help` works
- [ ] `setup` command functional
- [ ] `status` command functional
- [ ] Claude config updated

---

## After P0 Completion

1. **Update REFLECTION_LOG.md** using `templates/phase-reflection-entry.template.md`
2. **Test memory tools** in Claude Code session
3. **Generate HANDOFF_P1.md** for seed command phase
4. **Run spec-reviewer** to validate improvements

---

## Phase 1 Preview

Phase 1 implements:
- `seed` command for bootstrapping memories
- Memory content from `CONTEXT.md` seeds section
- Validation that memories are stored

See `AGENT_PROMPTS.md` P1.1 for seed command prompt.
