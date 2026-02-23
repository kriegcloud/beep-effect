---
name: full-agent
description: Agent with all optional fields
tools:
  - read
  - grep
  - glob
  - edit
model: Claude Sonnet 4
target: vscode
argument-hint: Use this agent for complex tasks
handoffs:
  - label: Continue
    agent: next-agent
    prompt: Continue with next step
    send: false
mcp-servers:
  - name: example-server
    url: http://localhost:3000
---
Full agent instructions with all Copilot features.

This agent demonstrates all available Copilot-specific fields for comprehensive testing.
