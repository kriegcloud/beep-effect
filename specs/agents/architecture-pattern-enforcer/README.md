# Architecture Pattern Enforcer Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/architecture-pattern-enforcer.md` (450-550 lines)

---

## Purpose

Create a specialized agent for validating folder structure, layering, module exports, and naming conventions against architectural conventions. Detects cross-slice import violations and layer dependency issues.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- Package structure validation
- Layer dependency checking (domain -> tables -> infra -> client -> ui)
- Naming convention enforcement
- Module export surface area review
- Cross-slice import detection

### Out of Scope
- Runtime architecture validation
- Performance analysis
- Database schema validation

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/architecture-pattern-enforcer.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 450-550 lines
- [ ] Covers all 4 vertical slices (iam, documents, comms, customization)
- [ ] Documents layer dependency rules
- [ ] Detects cross-slice violations effectively
- [ ] Tested with sample architecture audit

---

## Agent Capabilities

### Core Functions
1. **Validate Structure** - Check package folder organization
2. **Check Layers** - Enforce layer dependency order
3. **Check Naming** - Validate naming conventions
4. **Review Exports** - Audit module surface area
5. **Detect Violations** - Find cross-slice imports

### Knowledge Sources
- `documentation/PACKAGE_STRUCTURE.md`
- `specs/SPEC_CREATION_GUIDE.md`
- Package-level `AGENTS.md` files
- Import graph analysis

### Architecture Rules
| Rule | Description |
|------|-------------|
| Layer Order | domain -> tables -> server -> client -> ui |
| No Cross-Slice | IAM cannot import from Documents, etc. |
| Shared Access | Cross-slice only through `packages/shared/*` |
| Path Aliases | Always use `@beep/*`, never `../../../` |

### Output Format
```markdown
# Architecture Audit: [Package Name]

## Structure Validation
| Check | Status | Notes |
|-------|--------|-------|

## Violations
### Violation: Cross-slice import
**Location**: packages/iam/client/src/UserClient.ts
**Problem**: Imports from @beep/documents-domain
**Fix**: Route through @beep/shared-domain

## Recommended Restructuring
[If major changes needed]
```

---

## Research Phase

Before creating the agent definition, research:

### 1. Package Structure
- Read `documentation/PACKAGE_STRUCTURE.md`
- Map all vertical slices and their packages
- Document layer dependency chain

### 2. Import Analysis Techniques
- Grep patterns for cross-slice imports
- Package.json exports analysis
- tsconfig path alias resolution

### 3. Existing Violations
- Check for current cross-slice imports
- Review boundary enforcement tooling
- Document allowed exceptions

---

## Implementation Plan

### Phase 1: Research
1. Read package structure documentation
2. Map all vertical slices
3. Document layer rules
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design validation methodology
2. Create violation detection patterns
3. Define audit output format
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition
2. Include detection patterns
3. Test with sample audit
4. Output: `.claude/agents/architecture-pattern-enforcer.md`

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/PACKAGE_STRUCTURE.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/CLAUDE.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/general.md`

### Package Analysis
- `packages/iam/*` - IAM vertical slice
- `packages/documents/*` - Documents vertical slice
- `packages/shared/*` - Shared packages
- `packages/common/*` - Common utilities

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/architecture-pattern-enforcer.md
wc -l .claude/agents/architecture-pattern-enforcer.md

# Verify layer documentation
grep "domain.*tables.*server.*client" .claude/agents/architecture-pattern-enforcer.md
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [code-reviewer](../code-reviewer/README.md) - Code quality agent
