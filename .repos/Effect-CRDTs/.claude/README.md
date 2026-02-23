# Claude Code Configuration

This repository **IS** the `.claude` configuration directory for Effect TypeScript projects following functional programming principles.

## 🚀 Usage

Clone this repository directly as the `.claude` directory in your Effect TypeScript projects:

```bash
# Clone directly into your project as .claude
cd /path/to/your/project
git clone <repo-url> .claude

# Or use as a git submodule
git submodule add <repo-url> .claude

# Or copy if you prefer not to use git
cp -r /path/to/claude-setup /path/to/your/project/.claude
```

**After cloning**, your project structure will be:
```
your-project/
├── .claude/           # This repository
│   ├── agents/
│   ├── hooks/
│   ├── skills/
│   └── settings.json
├── src/               # Your code
└── package.json
```

## 📁 Repository Structure

This repository contains:

```
claude-setup/              (clones into your-project/.claude/)
├── agents/               # Specialized subagents
│   ├── domain-modeler.md       # ADT domain modeling with MCP
│   ├── effect-expert.md        # Services & layers with MCP
│   ├── spec-writer.md          # Spec-driven development
│   ├── react-expert.md         # Compositional React patterns
│   └── test-writer.md          # Effect testing patterns
├── skills/               # Reusable capabilities
│   ├── typeclass-design/       # Typeclass implementation patterns
│   ├── domain-predicates/      # Predicate and Order generation
│   ├── service-implementation/ # Service design patterns
│   ├── layer-design/           # Layer composition patterns
│   ├── context-witness/        # Witness vs Capability patterns
│   └── atom-state/             # Effect Atom patterns
├── commands/             # Custom slash commands
│   ├── mailboxes.md            # Agent mailbox management
│   ├── request.md              # Inter-agent messaging
│   ├── await-mailbox.md        # Message waiting
│   └── parallelize.md          # Parallel agent execution
├── coordination/         # Multi-agent coordination
│   └── mailboxes/              # Agent communication
├── hooks/                # Hook implementations
│   ├── agent-init.sh/ts        # Session startup context injection
│   ├── skill-suggester.sh/ts   # Dynamic skill suggestions
│   └── stop-await-mailbox.sh/ts # Mailbox coordination
├── scripts/              # Utility scripts
│   ├── request.sh              # Send inter-agent messages
│   ├── await-mailbox.sh        # Wait for messages
│   ├── mailboxes.sh            # List all mailboxes
│   └── close-mailbox.sh        # Close mailboxes
├── docs/                 # Reference documentation
│   ├── project-guide.md        # Project instructions
│   └── clean-code-guide.md     # Complete patterns guide
└── settings.json         # Claude Code configuration
```

## 🎯 Specialized Agents

Claude automatically invokes the appropriate agent based on your task:

### domain-modeler
Creates type-safe domain models with:
- ADT unions for valid states
- Branded/nominal types
- Comprehensive predicates
- Order instances for sorting
- Typeclass integration
- **Effect Docs**: View the git subtree in `.context/effect/` for best practices

### effect-expert
Implements Effect infrastructure:
- Fine-grained service capabilities
- Layer composition
- Dependency injection
- Error handling
- **Effect Docs**: View the git subtree in `.context/effect/` for patterns

### spec-writer
Manages spec-driven workflow:
- Instructions → Requirements → Design → Plan
- Requires approval at each phase
- Prevents premature implementation

### react-expert
Compositional React patterns:
- Component composition over configuration
- No boolean props
- Effect Atom integration
- State lifting patterns

### test-writer
Testing strategies:
- @effect/vitest for Effect code
- Regular vitest for pure functions
- Service testing with layers

## 🔧 Skills

Skills extend agents with focused capabilities:

- **typeclass-design**: Curried signatures, dual APIs
- **domain-predicates**: Complete predicate/order sets
- **service-implementation**: Capability-based services
- **layer-design**: Layer composition patterns
- **context-witness**: Witness vs Capability decisions
- **atom-state**: Effect Atom reactive state

## 🎨 Effect Documentation

Both `domain-modeler` and `effect-expert` agents have access to the Effect documentation via the git subtree in `.context/effect/`.

This ensures implementations follow official Effect best practices.

## 📚 Reference Documentation

Full guides available in `docs/`:
- `docs/project-guide.md` - Original project instructions
- `docs/clean-code-guide.md` - Complete patterns and best practices

Agents access these automatically when needed.

## 🔄 Hooks

Automatic quality checks configured in `settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | { read file_path; if echo \"$file_path\" | grep -qE '\\.(ts|tsx)$'; then bun run format && bun run lint && bun run typecheck; fi; }",
            "description": "Format, lint, and typecheck TypeScript files immediately after editing"
          }
        ]
      }
    ]
  }
}
```

**How it works:**
- **PostToolUse** event: Triggers immediately after Edit/Write operations
- **File path extraction**: Uses `jq` to get the modified file path from tool input
- **TypeScript filter**: Only runs on `.ts` and `.tsx` files
- **Quality checks**: Runs format → lint → typecheck in sequence
- Provides immediate feedback on code quality issues

## 🎯 Development Workflow

1. **Ask Claude** to perform a task
2. **Claude automatically**:
   - Selects appropriate agent
   - Loads relevant skills
   - Accesses MCP docs if needed
   - Uses minimal context (2-10KB vs 104KB)
3. **Complete task** efficiently with focused expertise

## 🚦 Quality Standards

After every file change:
```bash
bun run format
bun run typecheck
```

This is enforced in agent workflows.

## 📖 Examples

### Creating a Domain Model

"Create an Appointment domain model with status, meeting type, date, and duration"

→ Invokes `domain-modeler` agent (6-8KB context)
→ Uses `domain-predicates` skill
→ References Effect docs in `.context/effect/`
→ Generates complete module with predicates and orders

### Implementing a Service

"Implement a PaymentGateway service with handoff capability"

→ Invokes `effect-expert` agent (7-9KB context)
→ Uses `service-implementation` and `layer-design` skills
→ References Effect docs in `.context/effect/`
→ Creates focused capability with proper layer

### Building React Component

"Create a message composer component"

→ Invokes `react-expert` agent (7-9KB context)
→ Uses `atom-state` skill
→ Generates compositional structure with Effect Atom integration

## 🔮 Benefits

- **Specialized expertise** per domain
- **Effect documentation access** via git subtree in `.context/effect/` for accuracy
- **Consistent patterns** across projects
- **Reusable configuration** for all projects
- **Automatic agent selection** based on task

## 📄 License

This configuration is designed for personal/team use. Adapt as needed for your projects.

## 🤝 Contributing

To improve this configuration:
1. Test patterns in real projects
2. Update agents/skills based on learnings
3. Keep documentation in sync with code

---

**Context pollution solved. Specialized agents ready. Effect best practices enforced.** 🎉
