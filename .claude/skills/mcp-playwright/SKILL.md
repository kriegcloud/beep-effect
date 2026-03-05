# MCP Playwright

Use this skill for browser automation through Playwright MCP in headless mode.

## Use When
- You need to navigate pages, inspect DOM state, or capture screenshots.
- You need to verify Playwright MCP startup and available tools.

## Quick Smoke
1. Confirm tools list includes browser actions.
2. Run one lightweight read flow (`browser_navigate` + `browser_snapshot`).

## Common Failures
- Missing `-y` causes install prompt and startup hang.
- First-run browser dependencies not available.
- Page load delays causing timeout.

## Fix Patterns
- Use args: `-y @playwright/mcp@latest --headless`.
- Keep smoke calls short and deterministic.
- Add wait steps before snapshot/interaction on dynamic pages.
