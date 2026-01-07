# Specifications

Self-improving specification workflow for complex, multi-phase tasks.

## Structure

Each specification follows the [META_SPEC_TEMPLATE](ai-friendliness-audit/META_SPEC_TEMPLATE.md):

```
specs/[SPEC_NAME]/
├── README.md                    # Entry point (100-150 lines)
├── REFLECTION_LOG.md            # Cumulative learnings (required)
├── QUICK_START.md               # 5-min getting started (optional)
├── MASTER_ORCHESTRATION.md      # Full workflow (for complex specs)
├── AGENT_PROMPTS.md             # Specialized prompts (for complex specs)
├── RUBRICS.md                   # Evaluation criteria (if applicable)
├── templates/                   # Output templates (if applicable)
├── outputs/                     # Generated artifacts
└── HANDOFF_P[N].md              # Iterative execution handoffs
```

## Compliance Requirements

Every spec folder MUST have:
- **README.md** - Entry point with purpose and scope
- **REFLECTION_LOG.md** - Accumulated learnings (even if empty)

## Current Specs

| Spec | Description | Status |
|------|-------------|--------|
| [ai-friendliness-audit](ai-friendliness-audit/) | AI collaboration audit methodology | Active |

## Creating a New Spec

1. Create directory: `mkdir specs/[name]`
2. Add required files: `README.md`, `REFLECTION_LOG.md`
3. Follow [META_SPEC_TEMPLATE](ai-friendliness-audit/META_SPEC_TEMPLATE.md) for structure

## Standardization

Run the [SPEC_STANDARDIZATION_PROMPT](SPEC_STANDARDIZATION_PROMPT.md) to audit and standardize specs.

## Skills vs Specs

- **Skills** (`.claude/skills/`): Single-session tasks
- **Specs** (`specs/`): Multi-session orchestration with handoffs
