# Doc Writer Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/doc-writer.md` (400-500 lines)

---

## Purpose

Create a specialized agent for writing JSDoc comments and markdown documentation following repository standards. Ensures docgen compliance and maintains consistent documentation quality.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- JSDoc generation with `@example`, `@category`, `@since`
- README.md creation/updates
- AGENTS.md file creation
- docgen compliance validation

### Out of Scope
- API reference generation (handled by docgen tool)
- Documentation hosting/deployment
- Changelog generation

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/doc-writer.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 400-500 lines
- [ ] JSDoc examples use Effect patterns
- [ ] Covers all required tags (@example, @category, @since)
- [ ] README template aligned with existing packages
- [ ] Tested with sample documentation task

---

## Agent Capabilities

### Core Functions
1. **Generate JSDoc** - Create documentation with required tags
2. **Create README** - Write package README.md files
3. **Create AGENTS.md** - Write AI agent guidance files
4. **Validate Compliance** - Check against docgen standards

### Knowledge Sources
- `documentation/cli/docgen/DOCGEN_AGENTS.md`
- Package `docgen.json` configs
- `.claude/agents/templates/agents-md-template.md`
- Existing documentation examples

### Required JSDoc Tags
```typescript
/**
 * Retrieves user by ID.
 *
 * @category Queries
 * @since 1.0.0
 * @example
 * import * as Effect from "effect/Effect"
 * import { UserRepo } from "@beep/iam-domain"
 *
 * const program = Effect.gen(function* () {
 *   const repo = yield* UserRepo
 *   return yield* repo.findById("user-123")
 * })
 */
```

### Output Locations
- JSDoc: Modified source files
- README.md: Package root
- AGENTS.md: Package root

---

## Research Phase

Before creating the agent definition, research:

### 1. Docgen Standards
- Read `documentation/cli/docgen/DOCGEN_AGENTS.md`
- Review `docgen.json` configuration format
- Understand token tracking and cost estimation

### 2. Existing Documentation Patterns
- Sample well-documented packages
- Review existing README.md files
- Check AGENTS.md coverage

### 3. JSDoc Best Practices
- Required vs optional tags
- Example code formatting
- Category organization

---

## Implementation Plan

### Phase 1: Research
1. Read docgen documentation
2. Sample existing documentation
3. Document JSDoc patterns
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design documentation methodology
2. Create JSDoc templates
3. Create README/AGENTS.md templates
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition
2. Include template examples
3. Test with sample task
4. Output: `.claude/agents/doc-writer.md`

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/cli/docgen/DOCGEN_AGENTS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/jsdoc-fixer.md`

### Existing Agents for Reference
- `.claude/agents/jsdoc-fixer.md` - JSDoc enforcement patterns
- `.claude/agents/readme-updater.md` - README patterns

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/doc-writer.md
wc -l .claude/agents/doc-writer.md

# Verify JSDoc tag examples
grep "@category\|@since\|@example" .claude/agents/doc-writer.md
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [code-reviewer](../code-reviewer/README.md) - Code quality agent
