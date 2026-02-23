# Test Fixtures

This directory contains sample agent files for testing format adapters.

## Structure

```
fixtures/
├── claude/
│   ├── simple-agent.md
│   ├── full-agent.md
│   └── edge-cases/
├── copilot/
│   ├── simple-agent.agent.md
│   ├── full-agent.agent.md
│   └── edge-cases/
├── cursor/
│   └── modes.json
├── windsurf/
│   └── memories/
└── continue/
    └── config.yaml
```

## Adding Test Fixtures

When adding a new test case:
1. Create sample files in the appropriate format directory
2. Document any special characteristics (edge cases, missing fields, etc.)
3. Add corresponding test in test_adapters.py

## Sample Files To Create

### Claude
- **simple-agent.md**: Minimal required fields only
- **full-agent.md**: All fields including optional ones
- **official-pr-reviewer.md**: Expected output from converting the official Copilot example
- **official-code-reviewer.md**: Based on official Anthropic agent examples
- **edge-cases/**: Unusual but valid configurations

### Copilot
- **simple-agent.agent.md**: Basic agent
- **full-agent.agent.md**: With handoffs, argument-hint, mcp-servers
- **official-pr-reviewer.agent.md**: Based on official GitHub Copilot agent examples
- **official-code-reviewer.agent.md**: Expected output from converting the official Claude example

### Others
- To be added when implementing those adapters
