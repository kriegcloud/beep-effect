---
name: mcp-playwright
description: "Use for Playwright MCP browser automation checks, page interactions, and startup diagnostics in headless mode."
---

# MCP Playwright

## Use When
- You need browser automation via MCP tools.
- You need to verify Playwright MCP startup and tool availability.

## Quick Smoke
1. Verify startup and tools via inspector:
   `npx -y @modelcontextprotocol/inspector --cli --transport stdio --method tools/list -- npx -y @playwright/mcp@latest --headless`
2. Confirm browser tools exist (`browser_navigate`, `browser_snapshot`).

## Representative Calls
- Navigation: `browser_navigate`, `browser_navigate_back`.
- Read state: `browser_snapshot`, `browser_console_messages`.
- Interaction: `browser_click`, `browser_fill_form`, `browser_wait_for`.

## Common Failures
- Missing `-y` causes install prompt/hang.
- Browser install/runtime issues on first launch.
- Timeouts from long pages or blocked network.

## Fix Patterns
- Use args: `-y @playwright/mcp@latest --headless`.
- Keep first smoke lightweight and read-only.
- Add explicit waits before snapshotting dynamic pages.
