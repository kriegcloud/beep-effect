# Synthesized Best Practices Reference

> Compressed reference document for comparing CLAUDE.md files and .claude configurations against official best practices from Anthropic documentation.

---

## 1. CLAUDE.md File Structure

### Required Sections
| Section | Purpose | Priority |
|---------|---------|----------|
| **Commands** | Document build, test, lint, dev commands with descriptions | HIGH |
| **Code Style** | Naming conventions, formatting rules, patterns to follow | HIGH |
| **Architecture Notes** | Core files, patterns, boundaries | MEDIUM |
| **Testing Instructions** | How to run tests, what to test | MEDIUM |
| **Warnings/Gotchas** | Unexpected behaviors, project-specific edge cases | MEDIUM |
| **Dev Environment** | Setup requirements, tooling | LOW |

### Structure Best Practices
- **DO**: Use bullet points and markdown headings for organization
- **DO**: Keep content concise and human-readable
- **DO**: Be specific and actionable ("Use 2-space indentation" not "Format code properly")
- **DO**: Group related content under descriptive headings
- **DO**: Use emphasis keywords ("IMPORTANT", "YOU MUST", "NEVER") for critical rules
- **DON'T**: Create one massive file for large projects (use `.claude/rules/` instead)
- **DON'T**: Store secrets or credentials
- **DON'T**: Include large code examples (reference docs instead)

### Memory Hierarchy (Priority Order)
1. Enterprise Policy (`/etc/claude-code/CLAUDE.md`)
2. Project Memory (`./CLAUDE.md` or `./.claude/CLAUDE.md`)
3. Project Rules (`./.claude/rules/*.md`)
4. User Memory (`~/.claude/CLAUDE.md`)
5. Project Local (`./CLAUDE.local.md`)

---

## 2. .claude/rules/ Directory

### Organization Patterns
```
.claude/rules/
├── frontend/
│   ├── react.md
│   └── styles.md
├── backend/
│   ├── api.md
│   └── database.md
└── general.md
```

### Rules File Best Practices
- **DO**: Use descriptive filenames indicating content
- **DO**: Keep each file focused on one topic
- **DO**: Use YAML frontmatter with `paths` field for conditional rules
- **DO**: Support glob patterns (`**/*.ts`, `src/**/*`)
- **DON'T**: Place rules outside `.claude/rules/` (not auto-discovered)
- **DON'T**: Use conditional paths for rules that apply everywhere
- **DON'T**: Create overly complex import chains (max 5 hops)

### Path-Specific Rules Format
```yaml
---
paths:
  - "**/*.ts"
  - "src/**/*.tsx"
---
# TypeScript-specific rules here
```

---

## 3. Import System (`@path/to/import`)

### Supported Patterns
| Pattern | Description |
|---------|-------------|
| `@docs/architecture.md` | Relative to project |
| `@~/.claude/my-rules.md` | User home directory |
| `@../shared/rules.md` | Relative paths |

### Import Best Practices
- **DO**: Use imports for shared documentation
- **DO**: Use imports for architecture guides
- **DON'T**: Import paths inside code spans/blocks (ignored in backticks)
- **DON'T**: Import frequently changing content
- **DON'T**: Create circular symlinks
- **DON'T**: Create deep recursive imports (max 5 hops)

---

## 4. Prompt Engineering in CLAUDE.md

### Instruction Quality Checklist
| Aspect | Good | Bad |
|--------|------|-----|
| **Specificity** | "Use 2-space indentation, PascalCase for components" | "Format code properly" |
| **Actionability** | "Run `bun run test` before committing" | "Make sure tests pass" |
| **Constraints** | "NEVER use `any` type, always use Effect for async" | "Try to use good types" |
| **Commands** | "`npm run build` - Compiles TypeScript and bundles" | "build command exists" |

### Emphasis Keywords for Adherence
| Keyword | Use When |
|---------|----------|
| `IMPORTANT:` | Critical rules that affect correctness |
| `YOU MUST:` | Non-negotiable requirements |
| `NEVER:` | Absolute prohibitions |
| `ALWAYS:` | Mandatory practices |
| `PREFER:` | Soft recommendations |
| `AVOID:` | Discouraged patterns |

---

## 5. Multi-Agent / Sub-Agent Patterns

### Agent Orchestration Best Practices
- **DO**: Give each subagent specific objectives and defined output formats
- **DO**: Provide guidance on tools and sources to use
- **DO**: Set clear task boundaries
- **DO**: Scale effort appropriately (1 agent for simple, 10+ for complex)
- **DON'T**: Give vague instructions like "research topic X"
- **DON'T**: Expect agents to judge effort levels themselves

### Communication Patterns
- **DO**: Have subagents condense insights before reporting
- **DO**: Use artifact systems with lightweight references
- **DO**: Store essential information in external memory before proceeding
- **DON'T**: Route all subagent outputs through lead agent (token overhead)
- **DON'T**: Let memory grow unbounded

### Error Handling
- **DO**: Build resume mechanisms for stateful error recovery
- **DO**: Implement graceful degradation when tools fail
- **DO**: Combine AI adaptability with deterministic safeguards
- **DO**: Use full tracing for debugging

---

## 6. Memory & Context Management

### What TO Store
| Category | Examples |
|----------|----------|
| Patterns | Architectural patterns, coding idioms |
| Conventions | Naming conventions, import patterns |
| Commands | Build, test, lint with descriptions |
| Constraints | Forbidden patterns, required patterns |
| Warnings | Gotchas, unexpected behaviors |

### What NOT to Store
| Category | Why |
|----------|-----|
| Secrets/credentials | Security risk |
| Raw conversation history | Use patterns instead |
| Large code examples | Reference docs instead |
| Frequently changing info | Will become stale |
| PII | Security and privacy |

### Memory Organization Template
```markdown
# Pattern Name

## Symptom
- Description of problem indicators

## Root Cause
- Why this pattern causes issues

## Solution
- Recommended fix with code example

## Red Flags
- Indicators to watch for
```

---

## 7. Tool Configuration

### Permissions Best Practices
- **DO**: Use `/permissions` to customize tool allowlists
- **DO**: Install necessary CLIs (e.g., `gh` for GitHub)
- **DO**: Use `.claude/settings.json` for project-level permissions
- **DO**: Use `~/.claude.json` for user-level permissions
- **DON'T**: Bypass permission checks without safeguards
- **DON'T**: Use `--dangerously-skip-permissions` outside containers

### MCP Configuration
- **DO**: Store in `.mcp.json` (git-tracked)
- **DO**: Use `--mcp-debug` to identify issues
- **DON'T**: Mix project and personal MCP configs without reason

---

## 8. Security Requirements

### Critical Security Practices
| Area | Requirement |
|------|-------------|
| Path Traversal | Validate all paths, prevent `../../../` attacks |
| Memory Poisoning | Sanitize content before storing (prompt injection risk) |
| Isolation | Per-project/per-user memory isolation |
| Secrets | NEVER store in memory files |
| Production | Use safeguards, no auto-accept without review |

---

## 9. Anti-Pattern Checklist

### File Structure Anti-Patterns
- [ ] One massive CLAUDE.md (>100 lines) instead of using `.claude/rules/`
- [ ] Secrets or credentials in memory files
- [ ] Imports inside code blocks (ineffective)
- [ ] Circular symlinks
- [ ] Deep import chains (>5 hops)
- [ ] Rules files outside `.claude/rules/`

### Content Anti-Patterns
- [ ] Vague instructions ("format properly" vs specific rules)
- [ ] Missing command descriptions
- [ ] No emphasis keywords for critical rules
- [ ] Stale/outdated information not reviewed
- [ ] Large embedded code examples (should reference files)
- [ ] Missing constraints/forbidden patterns

### Workflow Anti-Patterns
- [ ] No exploration/planning phase documented
- [ ] Missing testing instructions
- [ ] No clear success criteria
- [ ] Missing warnings about gotchas
- [ ] No architecture guidance for complex tasks

---

## 10. Evaluation Rubric

When evaluating a CLAUDE.md or .claude configuration, score each aspect:

| Aspect | Score 0 | Score 1 | Score 2 |
|--------|---------|---------|---------|
| **Structure** | Unorganized/missing | Some structure | Clear sections with headings |
| **Commands** | None | Commands without descriptions | Commands with clear descriptions |
| **Specificity** | Vague | Somewhat specific | Highly actionable |
| **Constraints** | None stated | Some constraints | Clear DO/DON'T with emphasis |
| **Architecture** | None | Basic overview | Detailed with patterns |
| **Testing** | None | Basic instructions | Complete workflow |
| **Security** | Contains secrets | No security notes | Clear security guidance |
| **Maintainability** | One huge file | Some organization | Modular with rules/ |

**Total Score Interpretation:**
- 0-6: Critical improvements needed
- 7-10: Moderate improvements needed
- 11-14: Minor improvements available
- 15-16: Excellent configuration

---

## Quick Reference: Must-Have Elements

### Minimum Viable CLAUDE.md
```markdown
# Project Name

## Commands
- `<build-cmd>` - Description
- `<test-cmd>` - Description
- `<lint-cmd>` - Description

## Code Style
- [Specific formatting rules]
- [Naming conventions]

## IMPORTANT
- [Critical rules with emphasis]
- [Forbidden patterns]

## Architecture
- [Brief overview or @import reference]
```

### Ideal .claude/ Structure
```
.claude/
├── settings.json     # Tool permissions
├── rules/
│   ├── general.md    # Universal rules
│   ├── testing.md    # Test patterns
│   └── [domain]/     # Domain-specific rules
├── commands/         # Custom slash commands
└── agents/           # Agent definitions
```
