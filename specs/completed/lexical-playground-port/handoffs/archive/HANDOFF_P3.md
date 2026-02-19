# Phase 3 Handoff: Next.js Page + API Routes

> Full context for implementing Phase 3 of the Lexical Playground Port.

---

## Context Budget Verification

| Memory Type | Content | Est. Tokens | Budget | Status |
|-------------|---------|-------------|--------|--------|
| Working | P3 tasks, API route patterns | ~1,000 | ≤2,000 | OK |
| Episodic | Phase 2 summary, key learnings | ~500 | ≤1,000 | OK |
| Semantic | File paths, auth patterns | ~300 | ≤500 | OK |
| **Total** | | **~1,800** | **≤4,000** | **OK** |

---

## Phase 2 Summary

Phase 2 completed successfully. Tailwind + shadcn conversion achieved all targets:

- **CSS files**: 32 → 5 (target: ≤5) ✅
- **UI components wrapped with shadcn**: Modal, Button, DropDown, Switch
- **Deleted unused**: Select.tsx, joinClasses utility
- **Quality checks**: All passing (lint, check, build)

Key conversion strategy:
- React components → Tailwind inline classes with `cn()` utility
- Imperative DOM nodes → Consolidated into PlaygroundEditorTheme.css
- Complex CSS (CommentPlugin) → Kept as-is (400+ lines)

---

## Phase 3 Objective

Create accessible Next.js page at `/lexical` and migrate server validation code to Next.js API routes.

**Success Criteria**:
- `/lexical` route returns 200 status when authenticated
- `/api/lexical/validate` endpoint responds to POST requests
- `/api/lexical/set-state` endpoint responds to POST requests

---

## Current Page Structure

The Lexical editor is currently rendered at `apps/todox/src/app/lexical/` but:
- No dedicated `page.tsx` exists
- Editor is imported as component from `index.tsx`
- Server validation runs as standalone HTTP server (port 1235)

### Existing Entry Point

**File**: `apps/todox/src/app/lexical/index.tsx`

This exports the main editor component but is NOT a Next.js page.

---

## Server Code Analysis

**File**: `apps/todox/src/app/lexical/server/validation.ts`

Current implementation creates standalone HTTP server:

```typescript
// Creates server on port 1235
// Two endpoints:
// - POST /validate-json (validates editor state JSON)
// - POST /set-state (sets and validates editor state)
```

### Migration Path

| Current | Next.js |
|---------|---------|
| `POST /validate-json` | `POST /api/lexical/validate` |
| `POST /set-state` | `POST /api/lexical/set-state` |

---

## Implementation Tasks

### Task 1: Create Page Route

**Create**: `apps/todox/src/app/lexical/page.tsx`

```typescript
// Metadata
export const metadata = {
  title: "Lexical Editor | Beep",
  description: "Rich text editor powered by Lexical",
};

// Page component
export default function LexicalPage() {
  return <LexicalEditor />;
}
```

**Considerations**:
- Authentication required (user must be logged in)
- Use existing `LexicalEditor` component from `index.tsx`
- May need client directive (`"use client"`) if using hooks

### Task 2: Create API Route - Validate

**Create**: `apps/todox/src/app/api/lexical/validate/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate editor state JSON
  // Return validation result
}
```

### Task 3: Create API Route - Set State

**Create**: `apps/todox/src/app/api/lexical/set-state/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Set and validate editor state
  // Return result
}
```

### Task 4: Update Client Code

Find and update any client code that calls the validation server:

```bash
grep -r "1235\|validate-json\|set-state" apps/todox/src/app/lexical/
```

Update URLs from `http://localhost:1235/...` to `/api/lexical/...`.

### Task 5: Handle Authentication

The `/lexical` page requires authentication. Options:
1. Use existing middleware in `apps/todox/src/middleware.ts`
2. Add route to protected routes list
3. Check session in page component

---

## Authentication Context

### Test Credentials
- Email: `beep@hole.com`
- Password: `F55kb3iy!`

### Login Route
- `/auth/sign-in`

### Existing Auth Pattern

Check `apps/todox/src/middleware.ts` for existing protected route patterns.

---

## File Locations Reference

| Purpose | Path |
|---------|------|
| Lexical editor root | `apps/todox/src/app/lexical/` |
| Main editor component | `apps/todox/src/app/lexical/index.tsx` |
| Server validation | `apps/todox/src/app/lexical/server/validation.ts` |
| API routes location | `apps/todox/src/app/api/` |
| Middleware | `apps/todox/src/middleware.ts` |
| Auth components | `apps/todox/src/app/auth/` |

---

## Effect Patterns for API Routes

Use Effect-based handlers following repository patterns:

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// Define request/response schemas
const ValidateRequest = S.Struct({
  editorState: S.Unknown,
});

const ValidateResponse = S.Struct({
  valid: S.Boolean,
  errors: S.optional(S.Array(S.String)),
});

// Effect-based handler
const validateHandler = Effect.gen(function* () {
  // ... implementation
});
```

Reference: `.claude/rules/effect-patterns.md`

---

## Verification Commands

```bash
# After creating page
curl -I http://localhost:3000/lexical
# Should redirect to login if not authenticated

# After creating API routes
curl -X POST http://localhost:3000/api/lexical/validate \
  -H "Content-Type: application/json" \
  -d '{"editorState": {...}}'

# Full quality check
bun run lint --filter=@beep/todox
bun run check --filter=@beep/todox
bun run build --filter=@beep/todox
```

---

## Known Gotchas

1. **Server validation uses headless Lexical**: The validation code creates a headless editor instance. This should work in API routes but may need adjustment for server-side execution.

2. **Client vs Server components**: The Lexical editor uses many React hooks (`useState`, `useEffect`). The page component will need `"use client"` directive.

3. **API route body parsing**: Next.js App Router uses `request.json()` for parsing JSON bodies, not `request.body`.

4. **Environment variables**: Check if validation server uses any env vars that need to be available in API routes.

5. **CORS**: If the editor calls validation from client-side, CORS headers may be needed on API routes.

---

## Success Criteria Checklist

- [ ] `/lexical` page renders editor (when authenticated)
- [ ] `/lexical` redirects to login (when unauthenticated)
- [ ] `POST /api/lexical/validate` returns valid JSON response
- [ ] `POST /api/lexical/set-state` returns valid JSON response
- [ ] All quality commands pass
- [ ] No console errors on page load

---

## Next Phase Preview

After P3 completes, P4 will:
- Fix runtime errors (console.error entries)
- Verify all plugins render without exceptions
- Test core editor functionality (text input, formatting)
- Use browser DevTools and potentially Playwright for testing
