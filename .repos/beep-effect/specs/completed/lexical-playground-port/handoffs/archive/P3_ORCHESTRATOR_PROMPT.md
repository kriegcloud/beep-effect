# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the `lexical-playground-port` spec: **Next.js Page + API Routes**.

### Context

Phases 1-2 are complete:
- All quality commands pass (lint, check, build)
- CSS files reduced from 32 to 5
- UI components wrapped with shadcn equivalents
- Editor component ready at `apps/todox/src/app/lexical/index.tsx`

### Your Mission

Create a Next.js page at `/lexical` and migrate server validation code to Next.js API routes.

### Implementation Steps

1. **Create the Page Route**:
   ```bash
   # Location
   apps/todox/src/app/lexical/page.tsx
   ```

   Create a page that:
   - Has proper metadata (title, description)
   - Renders the Lexical editor from `index.tsx`
   - Uses `"use client"` directive (editor uses hooks)
   - Is protected by authentication

2. **Analyze Existing Server Code**:
   ```bash
   # Read the validation server
   cat apps/todox/src/app/lexical/server/validation.ts
   ```

   Understand:
   - What validation logic exists
   - Request/response formats
   - Dependencies (headless Lexical editor)

3. **Create API Route - Validate**:
   ```bash
   # Location
   apps/todox/src/app/api/lexical/validate/route.ts
   ```

   Migrate `/validate-json` endpoint to Next.js API route:
   - Accept POST with JSON body
   - Return validation result
   - Use Effect patterns per `.claude/rules/effect-patterns.md`

4. **Create API Route - Set State**:
   ```bash
   # Location
   apps/todox/src/app/api/lexical/set-state/route.ts
   ```

   Migrate `/set-state` endpoint to Next.js API route.

5. **Update Client Code**:
   ```bash
   # Find any references to old server
   grep -r "1235\|validate-json\|set-state" apps/todox/src/app/lexical/
   ```

   Update URLs from `http://localhost:1235/...` to `/api/lexical/...`.

6. **Handle Authentication**:
   - Check existing middleware: `apps/todox/src/middleware.ts`
   - Ensure `/lexical` is protected
   - Test redirect to login when unauthenticated

7. **Verify**:
   ```bash
   # Quality checks
   bun run lint --filter=@beep/todox
   bun run check --filter=@beep/todox
   bun run build --filter=@beep/todox

   # Start dev server
   bun run dev --filter=@beep/todox

   # Test page (should redirect to login)
   curl -I http://localhost:3000/lexical

   # Test API (after login via browser)
   curl -X POST http://localhost:3000/api/lexical/validate \
     -H "Content-Type: application/json" \
     -d '{"editorState": {}}'
   ```

### Authentication Details

- **Test login**: `beep@hole.com` / `F55kb3iy!`
- **Login route**: `/auth/sign-in`
- **Middleware location**: `apps/todox/src/middleware.ts`

### Page Structure

```tsx
// apps/todox/src/app/lexical/page.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Lexical
const LexicalEditor = dynamic(() => import("./index"), { ssr: false });

export default function LexicalPage() {
  return (
    <div className="container mx-auto py-8">
      <LexicalEditor />
    </div>
  );
}
```

Note: May need metadata in separate `layout.tsx` if using client component.

### API Route Structure

```typescript
// apps/todox/src/app/api/lexical/validate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validation logic from server/validation.ts
    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 });
  }
}
```

### Reference Files

- Handoff details: `specs/lexical-playground-port/handoffs/HANDOFF_P3.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Existing middleware: `apps/todox/src/middleware.ts`
- Server validation: `apps/todox/src/app/lexical/server/validation.ts`

### Success Criteria

- [ ] `/lexical` returns 200 when authenticated
- [ ] `/lexical` redirects to login when unauthenticated
- [ ] `POST /api/lexical/validate` responds to requests
- [ ] `POST /api/lexical/set-state` responds to requests
- [ ] `bun run lint --filter=@beep/todox` passes
- [ ] `bun run check --filter=@beep/todox` passes
- [ ] `bun run build --filter=@beep/todox` passes

### After Completion

1. Update `specs/lexical-playground-port/REFLECTION_LOG.md` with Phase 3 learnings
2. Create `handoffs/HANDOFF_P4.md` with context for Runtime Error Fixes
3. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md` for next phase

### Gotchas

1. **Lexical requires client-side**: Use `"use client"` directive or dynamic import with `ssr: false`
2. **API routes use `request.json()`**: Not `request.body` like Express
3. **Headless Lexical in API routes**: May need adjustment for server execution
4. **Middleware auth**: Check if route needs explicit protection or inherits from pattern
