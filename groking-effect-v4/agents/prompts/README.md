# Example Agent Prompt Pack

This folder contains reusable prompt templates for sub-agents that implement examples in generated export files.

## Composition Model

Each deployment prompt is built from four parts:

1. `shared/base-system.md`
2. `kinds/<kind>.md`
3. optional `shared/dry-run-overlay.md`
4. task payload (target file + constraints)

## Kind Mapping

- `const`, `let`, `var`, `enum`, `namespace`, `reexport` -> `kinds/value-like.md`
- `function` -> `kinds/function-like.md`
- `class` -> `kinds/class-like.md`
- `type`, `interface` -> `kinds/type-like.md`

## Dry-Run Output Requirement

In dry-run mode, agents must create a markdown report containing:

- what worked
- what did not
- what should change in docs, prompt, and agent config

Use `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/templates/agent-feedback-report.md` as the report structure.
