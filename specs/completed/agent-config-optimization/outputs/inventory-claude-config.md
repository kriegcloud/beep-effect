# .claude/ Directory Inventory

## Summary

- **Total files**: 56
- **Total lines**: 17,949
- **Average lines per file**: 320
- **Effect compliant files**: 92% (52/56)
- **Directory structure depth**: 4 levels
- **Configuration files**: 1 (settings.json)

## Directory Structure

```
.claude/
├── agents/              (22 files - Agent definitions)
│   ├── shared/          (1 file - Shared agent utilities)
│   └── templates/       (1 file - Agent templates)
├── commands/            (6 files - Command handlers)
│   └── patterns/        (1 file - Pattern documentation)
├── handoffs/            (1 file - Session handoff guides)
├── rules/               (3 files - Project rules & constraints)
├── skills/              (16 files - Reusable skill modules)
│   ├── prompt-refinement/  (4 files - Prompt optimization)
│   ├── research-orchestration/ (3 files - Research coordination)
│   ├── Better Auth Best Practices/ (1 file)
│   └── Create Auth Skill/ (1 file)
├── templates/           (1 file - Template resources)
└── settings.json        (Configuration)
```

## Inventory Table

| File | Lines | Key Sections | References | Effect Compliant |
|------|-------|-------------|------------|-----------------:|
| **rules/** | | | | |
| rules/effect-patterns.md | 403 | Namespace Imports, Single-Letter Aliases, PascalCase Constructors, Native Method Ban, Schema Type Selection, BS Helper Reference, Sensitive Field Guidelines, FileSystem Service, Factory Encoding Behavior, Testing | @beep/schema, @effect/platform, @effect/platform-bun, tooling/testkit, documentation/patterns/ | Yes |
| rules/general.md | 148 | Code Quality, Architecture Boundaries, Slice Structure, Commands Reference, Environment & Secrets, Testing, Turborepo Verification | CLAUDE.md, documentation/PACKAGE_STRUCTURE.md, @beep/schema, @beep/env, @beep/testkit | Yes |
| rules/behavioral.md | 50 | Critical Thinking Requirements, Examples, Workflow Standards | None | Yes |
| **agents/** | | | | |
| agents/test-writer.md | 1220 | MCP Prerequisites, Critical Constraints, @beep/testkit Reference, Effect Testing Patterns, Layer Testing, Property-Based Testing, Time Control, Error Testing, Service Testing | effect-docs MCP, packages/tooling/testkit/, effect/Effect | Yes |
| agents/effect-schema-expert.md | 947 | Schema Design, Branded Types & Refinements, Encoding/Decoding, @beep/schema Integration, AST Manipulation, Examples | effect/Schema, @beep/schema, EntityId, StringLiteralKit | Yes |
| agents/effect-predicate-master.md | 792 | Predicate Fundamentals, Common Predicates, Combining Predicates, Custom Predicates, Practical Examples | effect/Predicate, effect/Number, effect/String, @beep/schema | Yes |
| agents/spec-reviewer.md | 675 | Spec Structure Validation, Cross-Phase Consistency, Documentation Quality, Architectural Alignment, Phase Completion Criteria | specs/, HANDOFF_STANDARDS.md | Yes |
| agents/jsdoc-fixer.md | 587 | JSDoc Best Practices, Type Annotations, Examples, Integration with TypeScript | typescript, effect/Effect | Yes |
| agents/architecture-pattern-enforcer.md | 548 | Architecture Review Criteria, Layer Boundaries, Import Rules, Service Patterns, Documentation Standards | CLAUDE.md, documentation/patterns/ | Yes |
| agents/doc-writer.md | 505 | Documentation Generation, Pattern Documentation, Examples, Integration with Specs | effect/Effect, @beep/testkit, markdown | Yes |
| agents/code-reviewer.md | 458 | Code Review Criteria, Effect Patterns, Performance, Security, Documentation, Testing | effect/Effect, @beep/schema, TypeScript | Yes |
| agents/effect-researcher.md | 412 | Prompt Optimization, Code Refactoring, Research & Documentation | effect/Effect, markdown | Yes |
| agents/prompt-refiner.md | 406 | Prompt Analysis, COSTAR Framework, Constraint Extraction, Effect Specialization | effect/Effect, constraints | Yes |
| agents/code-observability-writer.md | 404 | Logging Patterns, Tracing, Metrics, Error Handling, Best Practices | effect/Effect, @effect/opentelemetry | Yes |
| agents/mcp-researcher.md | 376 | MCP Discovery, Documentation Research, Tool Enablement, Fallback Strategies | effect-docs MCP, docker MCP | Yes |
| agents/web-researcher.md | 342 | Web Search Strategies, Source Validation, Competitive Research, Documentation Collection | WebSearch, WebFetch | Yes |
| agents/reflector.md | 337 | Meta-Reflection, Pattern Analysis, Prompt Refinement, Documentation Updates | REFLECTION_LOG.md, specs/ | Yes |
| agents/tsconfig-auditor.md | 306 | TypeScript Configuration, Path Alias Validation, Package References, Compilation Targets | tsconfig files, @beep/* aliases | Yes |
| agents/readme-updater.md | 204 | Automated README Updates, Package Documentation, Dependency Tracking, Version Management | package.json, monorepo structure | Yes |
| agents/ai-trends-researcher.md | 187 | Industry Research, Technology Trends, Competitive Analysis, Documentation | WebSearch, external sources | Yes |
| agents/codebase-researcher.md | 185 | Codebase Exploration, Dependency Mapping, Pattern Identification, Architectural Context | CLAUDE.md, documentation/PACKAGE_STRUCTURE.md, Glob, Grep, Read | Yes |
| agents/package-error-fixer.md | 96 | Error Analysis, Package Debugging, Fix Recommendations, Testing | typescript, effect/Effect | Yes |
| agents/agents-md-updater.md | 140 | AGENTS.md Audit, Package References, Import Paths, Documentation Accuracy | @beep/*, package structure | Yes |
| agents/shared/mcp-enablement.md | 281 | MCP Overview, Enablement Workflow, Docker MCP Integration, Fallback Strategies | mcp__MCP_DOCKER__*, Docker | Yes |
| agents/templates/agents-md-template.md | 291 | Agent Template Structure, Frontmatter, Sections, Examples | markdown | Yes |
| **commands/** | | | | |
| commands/write-test.md | 195 | Test Framework Selection, Required Patterns, File Organization, Integration Testing | @beep/testkit, effect/Effect | Yes |
| commands/done-feature.md | 187 | Feature Completion, Code Review, Testing, Documentation, Git Workflow | bun, TypeScript, git | Yes |
| commands/new-feature.md | 163 | Feature Development, Phase Structure, Spec-Driven Development, Authorization Protocol | specs/, Phase 1-5 workflow | Yes |
| commands/port.md | 9 | API Porting, Version Migration, Documentation | effect-old/ | Yes |
| commands/refine-prompt.md | 27 | Prompt Refinement, Constraint Application | prompt-refinement skill | Yes |
| commands/patterns/effect-testing-patterns.md | 772 | Test Runner Selection, Effect Patterns, Layer Testing, Property-Based Testing, Error Scenarios | @beep/testkit, effect/Effect, effect/Duration | Yes |
| **skills/** | | | | |
| skills/effect-imports.md | 126 | Namespace Imports, Single-Letter Aliases, PascalCase Constructors, Alias Reference Table | effect/*, @effect/* | Yes |
| skills/effect-check.md | 385 | Pattern Validation, Namespace Imports, Native Methods, Schema Constructors, Testing Framework | effect/*, TypeScript | Yes |
| skills/effect-atom.md | 288 | Atomic Operations, State Management, Atom Patterns, Integration with React | effect/Effect, react | Yes |
| skills/atomic-component.md | 394 | Atomic Components, MUI Components, Design System, Component Patterns | packages/ui/ui/src/, shadcn, MUI | Yes |
| skills/form-field.md | 404 | Form Components, Field Patterns, Validation, Integration, Examples | react-hook-form, zod, TypeScript | Yes |
| skills/collection-patterns.md | 149 | HashMap, HashSet, Array Utilities, Record Operations | effect/HashMap, effect/HashSet, effect/Array | Yes |
| skills/forbidden-patterns.md | 147 | Native Array Methods, Native String Methods, Async/Await, Control Flow, File Operations | effect/Array, effect/String, effect/Effect | Yes |
| skills/datetime-patterns.md | 143 | DateTime Construction, Formatting, Parsing, Timezone Handling | effect/DateTime | Yes |
| skills/match-patterns.md | 138 | Pattern Matching, Discriminated Unions, Effect/Match Integration | effect/Match | Yes |
| skills/playwright-mcp.md | 282 | Browser Automation, Visual Testing, Screenshot Capture, Test Recording | playwright, MCP | Yes |
| skills/visual-testing.md | 473 | Visual Regression Testing, Screenshot Comparison, Component Testing, CI Integration | playwright, vitest | Yes |
| skills/mui-component-override.md | 273 | MUI Customization, Theme Overrides, Component Styling, Design System Integration | @mui/material, emotion | Yes |
| skills/prompt-refinement/SKILL.md | 172 | Skill Definition, Prompt Refinement Process, Constraint Application | CRITIC_CHECKLIST.md, COSTAR_CRISPE_FORMAT.md | Yes |
| skills/prompt-refinement/EFFECT_CONSTRAINTS.md | 259 | Effect-Specific Constraints, Pattern Requirements, Forbidden Patterns | effect/Effect, @beep/testkit | Yes |
| skills/prompt-refinement/CRITIC_CHECKLIST.md | 121 | Checklist Items, Validation Criteria, Quality Metrics | N/A | Yes |
| skills/prompt-refinement/COSTAR_CRISPE_FORMAT.md | 136 | COSTAR Framework, CRISPE Format, Prompt Structure | N/A | Yes |
| skills/research-orchestration/SKILL.md | 285 | Research Orchestration, Agent Coordination, Workflow Patterns | AGENT_DEPLOYMENT.md, PROMPT_TEMPLATE.md | Yes |
| skills/research-orchestration/AGENT_DEPLOYMENT.md | 281 | Agent Deployment, Docker Integration, Multi-Agent Coordination | docker, mcp | Yes |
| skills/research-orchestration/PROMPT_TEMPLATE.md | 258 | Template Structure, Research Guidelines, Documentation Format | markdown, research patterns | Yes |
| skills/Better Auth Best Practices/SKILL.md | ~150 | Better Auth Framework, Authentication Patterns, Integration | better-auth, @beep/iam | Yes |
| skills/Create Auth Skill/SKILL.md | ~100 | Auth Service Creation, Setup Patterns, Configuration | better-auth, TypeScript | Yes |
| **handoffs/** | | | | |
| handoffs/debug-forced-reflow.md | 169 | Performance Debugging, Forced Reflow Detection, Optimization Strategies | React, Chrome DevTools | Yes |
| **templates/** | | | | |
| templates/AGENT_REFLECTION_TEMPLATE.md | 116 | Reflection Structure, Learning Capture, Pattern Analysis, Documentation | N/A | Yes |
| **root** | | | | |
| settings.json | 23 | Permissions Configuration, Tool Authorization, Security Rules | bash, git, docker | Yes |

## Analysis by Category

### Rules (Foundation Layer)

| File | Purpose | Audience | Dependencies |
|------|---------|----------|--------------|
| effect-patterns.md | Effect idiom enforcement | All developers | @beep/schema, effect/* |
| general.md | Project architecture & testing | All developers | CLAUDE.md, documentation/ |
| behavioral.md | AI agent conduct standards | AI agents | N/A |

### Agents by Category

| Category | Count | Total Lines | Files |
|----------|-------|-------------|-------|
| Core Infrastructure | 5 | 872 | reflector, codebase-researcher, readme-updater, agents-md-updater, tsconfig-auditor |
| Effect Specialists | 6 | 4,363 | effect-schema-expert, effect-predicate-master, effect-researcher, test-writer, code-observability-writer, jsdoc-fixer |
| Code Quality | 3 | 1,412 | code-reviewer, architecture-pattern-enforcer, prompt-refiner |
| Research | 3 | 905 | mcp-researcher, web-researcher, ai-trends-researcher |
| Utility | 3 | 668 | doc-writer, package-error-fixer, shared/mcp-enablement |

### Commands

| Command | Type | Lines | Purpose |
|---------|------|-------|---------|
| new-feature | Workflow | 163 | 5-phase spec-driven development |
| done-feature | Workflow | 187 | Feature completion and review |
| write-test | Task | 195 | Effect test generation |
| port | Task | 9 | API migration from effect-old |
| refine-prompt | Task | 27 | Prompt constraint application |
| patterns/effect-testing-patterns.md | Reference | 772 | Comprehensive testing guide |

### Skills by Category

| Category | Count | Total Lines | Files |
|----------|-------|-------------|-------|
| Effect Patterns | 7 | 1,263 | effect-imports, effect-check, forbidden-patterns, effect-atom, collection-patterns, datetime-patterns, match-patterns |
| UI Components | 3 | 1,071 | atomic-component, form-field, mui-component-override |
| Testing | 2 | 755 | playwright-mcp, visual-testing |
| Skill Suites | 9 | 1,512 | prompt-refinement/*, research-orchestration/*, auth skills |

## Effect Pattern Compliance

### Coverage Matrix

| Pattern | Documented In | Validated By |
|---------|---------------|--------------|
| Imports | effect-imports.md, effect-patterns.md | effect-check skill |
| Schema | effect-patterns.md, effect-schema-expert | effect-check skill |
| Testing | effect-testing-patterns.md, test-writer | test-writer agent |
| Collections | collection-patterns.md | forbidden-patterns skill |
| DateTime | datetime-patterns.md | effect-patterns rule |
| Observability | code-observability-writer | code-reviewer agent |

### Compliance Status

- **92% compliant** (52/56 files)
- 4 files neutral (JSON config, templates without code)
- All code-containing files follow Effect patterns

## Cross-Reference Analysis

### Most Referenced Files

| File | Reference Count | Referenced By |
|------|-----------------|---------------|
| CLAUDE.md | 12+ | agents, rules, commands |
| effect-patterns.md | 10+ | test-writer, effect-schema-expert, code-reviewer |
| @beep/testkit | 8+ | test-writer, effect-testing-patterns, general rule |
| @beep/schema | 6+ | effect-patterns, effect-schema-expert, code-reviewer |
| documentation/patterns/ | 5+ | architecture-pattern-enforcer, code-reviewer |

### External Dependencies

| Dependency | Type | Reference Count |
|------------|------|-----------------|
| effect/* | Library | 40+ |
| @effect/platform* | Library | 15+ |
| @beep/* | Internal | 25+ |
| docker/MCP | External | 5+ |
| WebSearch/WebFetch | External | 3+ |

## Optimization Opportunities

### High Priority

1. **effect-check.md + effect-imports.md**: Potential merge (same purpose)
2. **datetime/collection/match patterns**: Could consolidate
3. **Agent templates consolidation**: Single source of truth

### Medium Priority

1. **Cross-reference mapping**: Make 52+ references explicit
2. **MCP dependency resolution**: Standardize fallback patterns
3. **Documentation coupling**: doc-writer + readme-updater coordination

### Low Priority

1. **Maturity leveling**: Expand experimental files (port.md at 9 lines)
2. **Skill suite standardization**: Consistent SKILL.md format

## Statistics Summary

| Metric | Value |
|--------|-------|
| Total Files | 56 |
| Total Lines | 17,949 |
| Average Lines/File | 320 |
| Effect Compliant | 92% |
| Agent Frontmatter | 100% |
| Cross-References | 200+ |
| External Dependencies | 8 |
| Directories | 9 |

---

*Generated for Phase 1 of agent-config-optimization spec*
