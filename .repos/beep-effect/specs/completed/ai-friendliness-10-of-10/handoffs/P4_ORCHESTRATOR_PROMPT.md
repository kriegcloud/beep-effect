# P4 Orchestrator Prompt

Copy and paste this prompt to start a new session for Phase 4.

---

## Prompt

You are implementing Phase 4 (Self-Healing Hooks) of the ai-friendliness-10-of-10 spec.

### Context from P3

Phase 3 (Onboarding System) completed successfully:
- 5 onboarding documents created in `.claude/onboarding/`
- 1 onboarding skill created in `.claude/skills/onboarding/`
- All 8 critical blockers from P0 addressed
- Effect primer has working code examples with namespace imports

### Your Mission

Implement conservative self-healing hooks that automatically detect and fix safe errors:

| Deliverable | Location | Purpose |
|-------------|----------|---------|
| Hook infrastructure | `.claude/hooks/self-healing/` | Hook implementations |
| Safe auto-fix hooks | 3-5 hooks | Import sorting, namespace imports, PascalCase |
| Suggest-only hooks | 2-3 hooks | Schema fixes, EntityId reminders |
| Configuration | `.claude/hooks/config.yaml` | Hook settings |
| Documentation | `.claude/hooks/README.md` | Behavior docs |

### Critical Principle

**NEVER auto-fix anything that could change runtime behavior.**

| fix_type | Action | Example |
|----------|--------|---------|
| safe | Auto-fix | `S.struct` → `S.Struct` (same behavior) |
| unsafe | Suggest only | `S.Date` → `S.DateFromString` (different types) |
| conditional | Check context | Import sorting (safe if no side effects) |

### Safe Auto-Fix Patterns (from error-catalog.yaml)

```yaml
# SCH_001: Lowercase schema constructors
pattern: "S.struct|S.array|S.string|S.number"
fix: Replace with PascalCase

# IMP_001: Named imports for Effect modules
pattern: "import { Effect } from"
fix: Replace with namespace import

# IMP_002: Deep relative paths
pattern: "from '\\.\\./\\.\\./\\.\\./"
fix: Suggest @beep/* alias

# BUILD_002: Missing tsconfig reference
pattern: "Cannot find module '@beep/"
fix: Add to tsconfig references
```

### Suggest-Only Patterns

```yaml
# SCH_002: S.Date vs S.DateFromString
pattern: "Type 'Date' is not assignable to type 'string'"
suggestion: "Check data source - use S.DateFromString for API/JSON data"

# EID_001: Plain string for entity ID
pattern: "id: S.String"  # in domain model context
suggestion: "Use branded EntityId from @beep/shared-domain"

# SVC_001: Service not in context
pattern: "is not assignable to parameter of type 'Context.Context<never>'"
suggestion: "Add Layer.provide() for missing service"
```

### Hook Implementation Pattern

```typescript
// .claude/hooks/self-healing/pascalcase-schema.ts
import type { HookConfig, HookResult } from "../types";

export const config: HookConfig = {
  name: "pascalcase-schema",
  description: "Fix lowercase Schema constructors to PascalCase",
  trigger: "pre-commit",
  fix_type: "safe",
  patterns: [
    { match: /S\.struct\(/g, replace: "S.Struct(" },
    { match: /S\.array\(/g, replace: "S.Array(" },
    { match: /S\.string(?!\w)/g, replace: "S.String" },
    { match: /S\.number(?!\w)/g, replace: "S.Number" },
    { match: /S\.boolean(?!\w)/g, replace: "S.Boolean" },
  ],
};

export function run(content: string, filepath: string): HookResult {
  let modified = content;
  let changes: string[] = [];

  for (const { match, replace } of config.patterns) {
    if (match.test(modified)) {
      changes.push(`${match.source} → ${replace}`);
      modified = modified.replace(match, replace);
    }
  }

  return {
    modified: modified !== content,
    content: modified,
    changes,
    fix_type: "safe",
  };
}
```

### Reference Files

- Error patterns: `specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml`
- Existing hooks: `.claude/hooks/`
- Full handoff: `specs/ai-friendliness-10-of-10/handoffs/HANDOFF_P4.md`

### Execution Pattern

**Option A**: 3 parallel agents:

1. **Agent 1**: Safe auto-fix hooks (namespace imports, PascalCase, import sorting)
2. **Agent 2**: Suggest-only hooks + configuration
3. **Agent 3**: Documentation + testing

**Option B**: Single agent for all (hooks are interdependent)

### Hook Configuration Structure

```yaml
# .claude/hooks/config.yaml
version: "1.0"

hooks:
  pascalcase-schema:
    enabled: true
    fix_type: safe
    auto_apply: true

  namespace-imports:
    enabled: true
    fix_type: safe
    auto_apply: true

  entityid-reminder:
    enabled: true
    fix_type: unsafe
    auto_apply: false

settings:
  dry_run: false
  log_all_fixes: true
  require_confirmation_for_unsafe: true
```

### Quality Gates

```bash
# Test hook on sample file
bun run .claude/hooks/self-healing/pascalcase-schema.ts test/sample.ts

# Verify no behavior change
bun run check --filter @beep/affected-package

# Review logged changes
cat .claude/hooks/logs/fixes.log
```

### Success Criteria

- [ ] 3-5 safe auto-fix hooks implemented
- [ ] 2-3 suggest-only hooks implemented
- [ ] Hook configuration file created
- [ ] Documentation explains each hook's behavior
- [ ] All hooks tested on real codebase patterns
- [ ] REFLECTION_LOG.md updated with P4 entry

### After Completion

1. Update `specs/ai-friendliness-10-of-10/REFLECTION_LOG.md` with P4 entry
2. Assess if additional phases needed
3. Create final spec completion summary if done

---

## Agent Delegation Pattern

When spawning hook implementation agents:

```
Task: Implement [Hook Category] self-healing hooks

<contextualization>
Hooks to implement: [list of hooks]
fix_type: [safe|unsafe]

Reference material:
- Read: specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml (pattern definitions)
- Read: .claude/hooks/ (existing infrastructure)

Implementation requirements:
- Safe hooks can auto-apply
- Unsafe hooks must only suggest
- All hooks must log changes
- No runtime behavior changes for auto-fix
</contextualization>

Write to: .claude/hooks/self-healing/[hook-name].ts
```
