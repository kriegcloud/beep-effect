# Spec Bootstrapper Quick Start

> 5-minute guide to using the spec bootstrapper.

---

## Option 1: CLI Command

```bash
# Create a new spec with default structure
bun run beep bootstrap-spec --name my-feature --description "Feature description"

# Preview without creating files
bun run beep bootstrap-spec --name my-feature --description "Feature description" --dry-run
```

### CLI Options

| Flag | Short | Required | Description |
|------|-------|----------|-------------|
| `--name` | `-n` | Yes | Spec name in kebab-case |
| `--description` | `-d` | Yes | Brief description of the spec |
| `--dry-run` | | No | Preview without creating files |
| `--complexity` | `-c` | No | `simple`, `medium`, or `complex` |

---

## Option 2: Claude Skill

Use the `/new-spec` skill for guided spec creation:

```
/new-spec my-feature
```

The skill will:
1. Ask clarifying questions about scope
2. Determine appropriate complexity level
3. Create folder structure
4. Generate README.md with context
5. Suggest next steps

---

## What Gets Created

### Simple Spec
```
specs/my-feature/
├── README.md
└── REFLECTION_LOG.md
```

### Medium Spec
```
specs/my-feature/
├── README.md
├── REFLECTION_LOG.md
├── QUICK_START.md
└── outputs/
```

### Complex Spec
```
specs/my-feature/
├── README.md
├── QUICK_START.md
├── MASTER_ORCHESTRATION.md
├── AGENT_PROMPTS.md
├── RUBRICS.md
├── REFLECTION_LOG.md
├── templates/
├── outputs/
└── handoffs/
```

---

## Next Steps After Creation

1. **Edit README.md** - Add specific success criteria
2. **Run Discovery** - Use codebase-researcher agent
3. **Document Findings** - Write to `outputs/`
4. **Plan Execution** - Create handoff documents

---

## Verification

Check that your new spec:
- [ ] README.md exists and has clear purpose
- [ ] REFLECTION_LOG.md exists
- [ ] Follows META_SPEC_TEMPLATE structure
- [ ] Is listed in `specs/README.md` (auto-added)
