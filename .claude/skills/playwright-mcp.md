---
paths:
  - "apps/**/*"
  - "packages/ui/**/*"
---

# Playwright MCP Browser Debugging Skill

Use the Playwright MCP tools to debug and interact with the running Next.js application in a browser.

## When to Invoke

Invoke this skill when:
- Debugging runtime errors in the browser
- Investigating UI rendering issues
- Checking console messages and errors
- Taking screenshots for visual debugging
- Interacting with the running application
- Testing user flows interactively

## Critical: Docker Network Access

The Playwright browser runs in a Docker container. To access the local dev server:

```
WRONG:  http://localhost:3000
RIGHT:  http://host.docker.internal:3000
```

Always use `host.docker.internal` instead of `localhost` when navigating to the dev server.

---

## Available MCP Tools

### Navigation & Page State

| Tool | Purpose |
|------|---------|
| `mcp__MCP_DOCKER__browser_navigate` | Navigate to a URL |
| `mcp__MCP_DOCKER__browser_navigate_back` | Go back to previous page |
| `mcp__MCP_DOCKER__browser_snapshot` | Get accessibility tree (preferred over screenshot) |
| `mcp__MCP_DOCKER__browser_take_screenshot` | Capture visual screenshot |
| `mcp__MCP_DOCKER__browser_close` | Close the browser page |

### Console & Network

| Tool | Purpose |
|------|---------|
| `mcp__MCP_DOCKER__browser_console_messages` | Get all console messages (logs, errors, warnings) |
| `mcp__MCP_DOCKER__browser_network_requests` | List all network requests since page load |

### Interaction

| Tool | Purpose |
|------|---------|
| `mcp__MCP_DOCKER__browser_click` | Click on an element |
| `mcp__MCP_DOCKER__browser_type` | Type text into an input |
| `mcp__MCP_DOCKER__browser_hover` | Hover over an element |
| `mcp__MCP_DOCKER__browser_fill_form` | Fill multiple form fields at once |
| `mcp__MCP_DOCKER__browser_select_option` | Select dropdown option |
| `mcp__MCP_DOCKER__browser_press_key` | Press keyboard key |
| `mcp__MCP_DOCKER__browser_drag` | Drag and drop between elements |
| `mcp__MCP_DOCKER__browser_file_upload` | Upload files |

### Utilities

| Tool | Purpose |
|------|---------|
| `mcp__MCP_DOCKER__browser_wait_for` | Wait for text or time |
| `mcp__MCP_DOCKER__browser_handle_dialog` | Accept/dismiss dialogs |
| `mcp__MCP_DOCKER__browser_tabs` | Manage browser tabs |
| `mcp__MCP_DOCKER__browser_resize` | Resize browser window |
| `mcp__MCP_DOCKER__browser_evaluate` | Execute JavaScript on page |
| `mcp__MCP_DOCKER__browser_run_code` | Run Playwright code snippet |

---

## Common Workflows

### 1. Debug Console Errors

```typescript
// Step 1: Navigate to the page
mcp__MCP_DOCKER__browser_navigate({ url: "http://host.docker.internal:3000" })

// Step 2: Get console messages
mcp__MCP_DOCKER__browser_console_messages({})

// Step 3: Filter for errors only
mcp__MCP_DOCKER__browser_console_messages({ onlyErrors: true })
```

### 2. Inspect Page Structure

```typescript
// Get accessibility tree (better than screenshot for understanding structure)
mcp__MCP_DOCKER__browser_snapshot({})

// The snapshot returns a YAML-like structure with refs you can use for clicking
```

### 3. Interact with Elements

```typescript
// Click using the ref from snapshot
mcp__MCP_DOCKER__browser_click({
  element: "Submit button",
  ref: "e42"  // From snapshot output
})

// Type into input
mcp__MCP_DOCKER__browser_type({
  element: "Email input",
  ref: "e15",
  text: "test@example.com"
})
```

### 4. Fill Forms

```typescript
mcp__MCP_DOCKER__browser_fill_form({
  fields: [
    { name: "Email", type: "textbox", ref: "e15", value: "test@example.com" },
    { name: "Password", type: "textbox", ref: "e18", value: "password123" },
    { name: "Remember me", type: "checkbox", ref: "e21", value: "true" }
  ]
})
```

### 5. Take Screenshots

```typescript
// Full page screenshot
mcp__MCP_DOCKER__browser_take_screenshot({ fullPage: true })

// Element screenshot
mcp__MCP_DOCKER__browser_take_screenshot({
  element: "Sign in form",
  ref: "e10"
})
```

### 6. Check Network Requests

```typescript
// See all network requests (useful for API debugging)
mcp__MCP_DOCKER__browser_network_requests({})
```

### 7. Execute Custom JavaScript

```typescript
// Run JavaScript on the page
mcp__MCP_DOCKER__browser_evaluate({
  function: "() => { return document.title; }"
})

// Run Playwright code directly
mcp__MCP_DOCKER__browser_run_code({
  code: "await page.getByRole('button', { name: 'Submit' }).click();"
})
```

---

## Understanding Snapshot Output

The `browser_snapshot` returns an accessibility tree in YAML format:

```yaml
- generic [ref=e1]:
  - banner [ref=e3]:
    - link "Home" [ref=e5]:
      - /url: /
  - main [ref=e10]:
    - heading "Sign In" [ref=e12] [level=1]
    - textbox "Email" [ref=e15]
    - textbox "Password" [ref=e18]
    - button "Submit" [ref=e21]
```

**Key elements:**
- `[ref=eXX]` - Reference ID for interacting with element
- `[level=X]` - Heading level
- `/url: X` - Link destination
- `[cursor=pointer]` - Clickable element

Use the `ref` value when calling interaction tools like `browser_click`.

---

## Debugging Tips

### For "Forced Reflow" Warnings
1. Navigate to the page
2. Check console for timing warnings
3. The warning itself won't appear in console - it's a DevTools performance metric
4. Use `browser_evaluate` to profile specific operations

### For Layout Issues
1. Use `browser_snapshot` to see the accessibility tree
2. Take screenshots at different viewport sizes using `browser_resize`
3. Check for hidden elements or z-index issues

### For Authentication Issues
1. Check `browser_console_messages` for auth errors
2. Use `browser_network_requests` to see failed API calls
3. Look for CORS or cookie issues in error messages

---

## Example: Full Debug Session

```typescript
// 1. Navigate to the app
await mcp__MCP_DOCKER__browser_navigate({
  url: "http://host.docker.internal:3000"
});

// 2. Get page structure
await mcp__MCP_DOCKER__browser_snapshot({});

// 3. Check for errors
await mcp__MCP_DOCKER__browser_console_messages({ onlyErrors: true });

// 4. Check network failures
await mcp__MCP_DOCKER__browser_network_requests({});

// 5. Take screenshot for reference
await mcp__MCP_DOCKER__browser_take_screenshot({ fullPage: true });

// 6. Interact with form
await mcp__MCP_DOCKER__browser_fill_form({
  fields: [
    { name: "Email", type: "textbox", ref: "e15", value: "test@example.com" }
  ]
});

// 7. Click submit and wait
await mcp__MCP_DOCKER__browser_click({ element: "Submit", ref: "e21" });
await mcp__MCP_DOCKER__browser_wait_for({ time: 2 });

// 8. Check result
await mcp__MCP_DOCKER__browser_snapshot({});
```

---

## Troubleshooting

### Connection Refused
```
Error: net::ERR_CONNECTION_REFUSED at http://localhost:3000
```
**Solution:** Use `http://host.docker.internal:3000` instead of `localhost`

### Element Not Found
```
Error: Element with ref "eXX" not found
```
**Solution:** Re-run `browser_snapshot` to get fresh refs - they change on re-render

### Timeout Errors
**Solution:** Use `browser_wait_for` with appropriate time/text conditions

### Browser Not Installed
```
Error: Browser not installed
```
**Solution:** Run `mcp__MCP_DOCKER__browser_install({})`

---

## Related Skills

| Skill | Relationship |
|-------|--------------|
| `visual-testing.md` | For generating persistent test files |
| `atomic-component.md` | Components should have `data-testid` for reliable selection |

