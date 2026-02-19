# Handoff: Debug "Forced Reflow" Performance Warning

## Objective

Identify and resolve the source of this browser warning:
```
[Violation] Forced reflow while executing JavaScript took 81ms
```

## Context

- **App**: `apps/todox` (Next.js 16 App Router)
- **Dev Server**: `http://localhost:3000` (use `http://host.docker.internal:3000` from Playwright MCP)
- **Issue**: 81ms forced reflow occurring during page load, likely on auth pages

## Available MCP Tools

### Next.js DevTools MCP

First, discover the server:
```typescript
mcp__next-devtools__nextjs_index({})
```

Then call tools on port 3000:
```typescript
// Get runtime errors
mcp__next-devtools__nextjs_call({ port: 3000, toolName: "get_errors" })

// Get page metadata
mcp__next-devtools__nextjs_call({ port: 3000, toolName: "get_page_metadata" })

// Get logs path
mcp__next-devtools__nextjs_call({ port: 3000, toolName: "get_logs" })
```

### Playwright MCP Browser Tools

**CRITICAL**: Use `host.docker.internal` instead of `localhost`:
```typescript
// Navigate to page
mcp__MCP_DOCKER__browser_navigate({ url: "http://host.docker.internal:3000" })

// Get page structure (accessibility tree)
mcp__MCP_DOCKER__browser_snapshot({})

// Get console messages (errors, warnings, logs)
mcp__MCP_DOCKER__browser_console_messages({})
mcp__MCP_DOCKER__browser_console_messages({ onlyErrors: true })

// Check network requests
mcp__MCP_DOCKER__browser_network_requests({})

// Execute JavaScript to measure performance
mcp__MCP_DOCKER__browser_evaluate({
  function: "() => { return performance.getEntriesByType('measure'); }"
})

// Run Playwright code for profiling
mcp__MCP_DOCKER__browser_run_code({
  code: `
    // Add performance observer
    const entries = [];
    const observer = new PerformanceObserver((list) => {
      entries.push(...list.getEntries());
    });
    observer.observe({ entryTypes: ['longtask', 'layout-shift'] });

    // Wait and collect
    await page.waitForTimeout(3000);
    return entries;
  `
})
```

## Investigation Strategy

### Phase 1: Identify the Page/Route

1. Navigate to `http://host.docker.internal:3000`
2. Check which page triggers the warning (likely `/auth/sign-in` or `/auth/sign-up`)
3. Get console messages to see if there are related errors

### Phase 2: Profile Layout Operations

Use Playwright to inject performance measurement:

```typescript
mcp__MCP_DOCKER__browser_evaluate({
  function: `() => {
    // Wrap getBoundingClientRect to track calls
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const calls = [];
    Element.prototype.getBoundingClientRect = function() {
      const stack = new Error().stack;
      calls.push({ element: this.tagName, id: this.id, class: this.className, stack });
      return originalGetBoundingClientRect.call(this);
    };
    window.__layoutCalls = calls;
    return 'Tracking enabled';
  }`
})

// Then after page interactions:
mcp__MCP_DOCKER__browser_evaluate({
  function: "() => window.__layoutCalls"
})
```

### Phase 3: Identify Specific Components

Based on prior analysis, likely culprits are:

1. **`packages/ui/ui/src/hooks/use-client-rect.ts`**
   - Uses `useLayoutEffect` with `getBoundingClientRect`
   - Called on mount, could trigger reflow

2. **`packages/ui/ui/src/flexlayout-react/`**
   - 18+ files with `getBoundingClientRect`
   - Heavy layout calculations

3. **`packages/ui/ui/src/providers/break-points.provider.tsx`**
   - Multiple `useMediaQuery` hooks
   - Could trigger layout during hydration

4. **`apps/todox/src/components/ui/waveform.tsx`**
   - Many `getBoundingClientRect` calls
   - Check if loaded on auth pages

5. **MUI Theme/Emotion**
   - CSS-in-JS calculations during SSR hydration

### Phase 4: Test Fixes

Once identified, common fixes:

1. **Defer measurements to `useEffect` instead of `useLayoutEffect`**
2. **Use `requestAnimationFrame` for batching**
3. **Add CSS `contain: layout` to heavy components**
4. **Lazy load components that do heavy measurement**

## Files to Examine

```
packages/ui/ui/src/hooks/use-client-rect.ts
packages/ui/ui/src/providers/break-points.provider.tsx
packages/ui/ui/src/flexlayout-react/view/Layout.tsx
apps/todox/src/global-providers.tsx
apps/todox/src/app/layout.tsx
apps/todox/src/app/auth/sign-in/page.tsx
packages/iam/ui/src/_common/recaptcha-v3-atom.tsx
```

## Expected Outcome

1. Identify the exact component/hook causing the 81ms reflow
2. Implement a fix (defer measurement, batch reads, or lazy load)
3. Verify the warning is resolved using Playwright console check

## Notes

- The "Forced reflow" warning appears in Chrome DevTools Performance tab, NOT in regular console
- It's triggered when JS reads layout properties (offsetHeight, getBoundingClientRect, etc.) after DOM changes
- 81ms is significant - normal reflows are <10ms
- The issue may only appear on initial page load (hydration mismatch scenario)

## Reference

See `.claude/skills/playwright-mcp.md` for detailed Playwright MCP usage patterns.
