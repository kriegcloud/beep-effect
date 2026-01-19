# Specifications

> Agent-assisted, self-improving specification workflow for complex, multi-phase tasks.

---

## Quick Start

1. **New spec?** Follow the [SPEC_CREATION_GUIDE](SPEC_CREATION_GUIDE.md)
2. **Need an agent?** See [Specialized Agents](agents/README.md)
3. **Pattern reference?** Read [META_SPEC_TEMPLATE](ai-friendliness-audit/META_SPEC_TEMPLATE.md)

---

## Agent-Assisted Workflow

Specs leverage 9 specialized agents for research, validation, documentation, and continuous improvement:

| Phase          | Agents                                                    | Purpose                             |
|----------------|-----------------------------------------------------------|-------------------------------------|
| **Discovery**  | `codebase-researcher`, `mcp-researcher`, `web-researcher` | Gather context                      |
| **Evaluation** | `code-reviewer`, `architecture-pattern-enforcer`          | Validate quality                    |
| **Synthesis**  | `reflector`, `doc-writer`                                 | Generate artifacts, improve prompts |
| **Iteration**  | `test-writer`, `code-observability-writer`, `reflector`   | Execute, test, observe              |

See [SPEC_CREATION_GUIDE](SPEC_CREATION_GUIDE.md) for detailed phase instructions.

---

## Specialized Agents

| Agent                                                                  | Purpose                                | Tier   |
|------------------------------------------------------------------------|----------------------------------------|--------|
| [reflector](agents/reflector/)                                         | Meta-reflection and prompt improvement | Tier 1 |
| [codebase-researcher](agents/codebase-researcher/)                     | Systematic code exploration            | Tier 1 |
| [mcp-researcher](agents/mcp-researcher/)                               | Effect documentation research          | Tier 2 |
| [web-researcher](agents/web-researcher/)                               | Web-based research synthesis           | Tier 2 |
| [code-reviewer](agents/code-reviewer/)                                 | Repository guideline enforcement       | Tier 3 |
| [architecture-pattern-enforcer](agents/architecture-pattern-enforcer/) | Structure and layering validation      | Tier 3 |
| [code-observability-writer](agents/code-observability-writer/)         | Logging, tracing, metrics              | Tier 4 |
| [doc-writer](agents/doc-writer/)                                       | JSDoc and markdown documentation       | Tier 4 |
| [test-writer](agents/test-writer/)                                     | Effect-first test creation             | Tier 4 |

Ready-to-use prompts: [Agent Handoffs](agents/handoffs/)

---

## Structure

Every spec follows [META_SPEC_TEMPLATE](ai-friendliness-audit/META_SPEC_TEMPLATE.md):

```
specs/[SPEC_NAME]/
├── README.md                    # Entry point (required)
├── REFLECTION_LOG.md            # Cumulative learnings (required)
├── QUICK_START.md               # 5-min getting started (optional)
├── MASTER_ORCHESTRATION.md      # Full workflow (complex specs)
├── AGENT_PROMPTS.md             # Sub-agent prompts (complex specs)
├── RUBRICS.md                   # Evaluation criteria (if applicable)
├── templates/                   # Output templates
├── outputs/                     # Generated artifacts
└── handoffs/                    # Iteration documents
```

---

## Current Specs

| Spec                                                    | Description                                                              | Status   |
|---------------------------------------------------------|--------------------------------------------------------------------------|----------|
| [agents](agents/)                                       | Specialized agent specifications                                         | Active   |
| [ai-docs-review](ai-docs-review/)                       | AI documentation accuracy and integrity review                           | P0 Ready |
| [full-iam-client](full-iam-client/)                     | Better Auth client Effect wrappers (multi-session, password, 2FA, org)   | Complete |
| [iam-client-methods-final](iam-client-methods-final/)   | Remaining Better Auth client methods (sign-in variants, admin, API keys) | P0 Ready |
| [knowledge-graph-integration](knowledge-graph-integration/) | Knowledge graph extraction pipeline for documents                      | Active   |
| [legacy-spec-alignment](legacy-spec-alignment/)           | Retrofit specs to canonical patterns (phase sizing, handoffs)           | P0 Ready |
| [orchestrator-context-optimization](orchestrator-context-optimization/) | Spec orchestration delegation rules and context budget protocol | Complete |
| [rls-implementation](rls-implementation/)                 | Row-level security implementation for multi-tenant data access          | Active   |
| [ai-friendliness-audit](ai-friendliness-audit/)         | AI collaboration audit methodology                                       | Active   |
| [demo-parity](demo-parity/)                             | FlexLayout demo feature parity                                           | P0 Ready |
| [docking-system](docking-system/)                       | FlexLayout drag-drop docking                                             | Complete |
| [flex-layout-port](flex-layout-port/)                   | FlexLayout Effect Schema port                                            | Active   |
| [flexlayout-schemas](flexlayout-schemas/)               | FlexLayout model class schema migration                                  | P0 Ready |
| [flexlayout-type-safety](flexlayout-type-safety/)       | Type safety improvements                                                 | Active   |
| [new-specialized-agents](new-specialized-agents/)       | Agent creation initiative                                                | Complete |
| [node-composition-refactor](node-composition-refactor/) | Node hierarchy refactor                                                  | Complete |
| [playwright-e2e](playwright-e2e/)                       | Playwright end-to-end testing infrastructure                             | P0 Ready |
| [spec-bootstrapper](spec-bootstrapper/)                 | CLI command for spec scaffolding                                         | Complete |
| [structure-standardization](structure-standardization/) | Codebase structure standards                                             | Active   |
| [todox-auth-integration](todox-auth-integration/)       | Better-auth integration for apps/todox                                   | P1 Ready |
| [todox-view-switcher](todox-view-switcher/)             | View switcher component for apps/todox                                   | Active   |

---

## Creating a New Spec

### CLI Command (Recommended)

```bash
# Medium complexity (default) - most common
bun run beep bootstrap-spec -n my-feature -d "Feature description"

# Simple - quick fixes, single session
bun run beep bootstrap-spec -n quick-fix -d "Bug fix" -c simple

# Complex - major initiatives with orchestration
bun run beep bootstrap-spec -n major-refactor -d "API redesign" -c complex

# Preview without creating files
bun run beep bootstrap-spec -n my-feature -d "Description" --dry-run
```

### Manual Version

```bash
mkdir -p specs/[name]/{templates,outputs,handoffs}
touch specs/[name]/{README,REFLECTION_LOG}.md
```

Then use agents:
1. `doc-writer` to generate README.md content
2. `architecture-pattern-enforcer` to validate structure

### Full Version

See [SPEC_CREATION_GUIDE](SPEC_CREATION_GUIDE.md) for complete agent-assisted workflow.

---

## Compliance Requirements

Every spec MUST have:

| File                | Purpose                            | Validation                      |
|---------------------|------------------------------------|---------------------------------|
| `README.md`         | Entry point with purpose and scope | `architecture-pattern-enforcer` |
| `REFLECTION_LOG.md` | Accumulated learnings              | Required even if empty          |

Complex specs SHOULD also have:
- `MASTER_ORCHESTRATION.md` - Full workflow
- `handoffs/HANDOFF_P[N].md` - Multi-session context preservation (full context document)
- `handoffs/P[N]_ORCHESTRATOR_PROMPT.md` - Copy-paste ready prompts to start each phase

**Critical**: Multi-session specs require BOTH handoff files at the end of each phase:
- `HANDOFF_P[N+1].md` provides complete context and verification details
- `P[N+1]_ORCHESTRATOR_PROMPT.md` provides a copy-paste ready prompt to launch the next phase

See [HANDOFF_STANDARDS.md](HANDOFF_STANDARDS.md) for requirements.

---

## Skills vs Specs

| Aspect     | Skills (`.claude/skills/`) | Specs (`specs/`)    |
|------------|----------------------------|---------------------|
| Duration   | Single session             | Multi-session       |
| Handoffs   | Not needed                 | HANDOFF_P[N].md     |
| Reflection | Minimal                    | REFLECTION_LOG.md   |
| Agents     | Optional                   | Integrated workflow |

**Rule of thumb**: If it spans sessions or needs learning capture, use a spec.

---

## Key Documents

| Document                                                          | Purpose                      |
|-------------------------------------------------------------------|------------------------------|
| [SPEC_CREATION_GUIDE](SPEC_CREATION_GUIDE.md)                     | Agent-assisted spec workflow |
| [META_SPEC_TEMPLATE](ai-friendliness-audit/META_SPEC_TEMPLATE.md) | Core pattern reference       |
| [Agent Specifications](agents/README.md)                          | All 9 specialized agents     |
| [Agent Handoffs](agents/handoffs/)                                | Ready-to-use agent prompts   |
