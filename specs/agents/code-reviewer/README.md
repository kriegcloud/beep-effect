# Code Reviewer Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/code-reviewer.md` (400-500 lines)

---

## Purpose

Create a specialized agent for reviewing code against repository guidelines, Effect patterns, and architectural constraints. Generates actionable review reports with specific fix suggestions.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- Effect pattern compliance checking
- Architecture boundary validation
- Anti-pattern identification
- Specific fix suggestions with before/after examples

### Out of Scope
- Automated code fixes (agent suggests, user applies)
- Style-only reviews (handled by Biome)
- Test coverage analysis (see test-writer)

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/code-reviewer.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 400-500 lines
- [ ] Covers all Effect pattern rules from CLAUDE.md
- [ ] Includes architecture boundary checks
- [ ] Provides file:line references for issues
- [ ] Tested with sample code review

---

## Agent Capabilities

### Core Functions
1. **Check Effect Patterns** - Validate namespace imports, forbidden patterns
2. **Validate Architecture** - Check cross-slice imports, layer boundaries
3. **Identify Anti-Patterns** - Find async/await, native methods, any types
4. **Generate Fixes** - Provide specific code changes

### Knowledge Sources
- `CLAUDE.md` - Repository rules
- `documentation/EFFECT_PATTERNS.md` - Effect constraints
- Package-level `AGENTS.md` files
- `.claude/rules/*.md` - Behavioral and pattern rules

### Review Categories
| Category | Weight | Examples |
|----------|--------|----------|
| Effect Patterns | HIGH | Namespace imports, no async/await |
| Architecture | HIGH | No cross-slice imports, layer order |
| Types | MEDIUM | No `any`, no `@ts-ignore` |
| Documentation | LOW | JSDoc on public exports |

### Output Format
```markdown
# Code Review: [File/Package Name]

## Compliance Summary
| Category | Status | Issues |
|----------|--------|--------|

## Issues Found
### Issue: [Title]
**Severity**: HIGH/MEDIUM/LOW
**Location**: file.ts:123
**Problem**: [Description]
**Fix**: [Specific code change]

## Recommendations
[Overall suggestions for improvement]
```

---

## Research Phase

Before creating the agent definition, research:

### 1. Repository Rules
- Read `CLAUDE.md` for all rules
- Read `.claude/rules/*.md` for pattern rules
- Document forbidden patterns list

### 2. Effect Pattern Constraints
- Namespace import requirements
- Forbidden native methods
- Required Effect alternatives

### 3. Architecture Boundaries
- Vertical slice structure
- Layer dependency rules
- Cross-slice import restrictions

---

## Implementation Plan

### Phase 1: Research
1. Compile complete rules list from CLAUDE.md
2. Document Effect pattern constraints
3. Map architecture boundaries
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design review methodology
2. Define severity levels
3. Create issue template
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition
2. Include all rule references
3. Test with sample review
4. Output: `.claude/agents/code-reviewer.md`

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/CLAUDE.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/general.md`

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/code-reviewer.md
wc -l .claude/agents/code-reviewer.md

# Verify references to key files
grep "CLAUDE.md\|EFFECT_PATTERNS\|rules/" .claude/agents/code-reviewer.md
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [architecture-pattern-enforcer](../architecture-pattern-enforcer/README.md) - Structure validation
