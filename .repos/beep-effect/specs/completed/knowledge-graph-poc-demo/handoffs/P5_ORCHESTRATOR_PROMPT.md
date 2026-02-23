# Phase 5 Orchestrator Prompt

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

Copy-paste this prompt to start Phase 5 implementation.

---

## Context

Phases 1-4 implemented all functionality. Phase 5 is the final polish phase - comprehensive error handling, loading states, visual consistency, and demo-ready quality.

**Full Context:** `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P5.md`

**Previous Phases:**
- P1: Basic extraction UI
- P2: Relations & evidence UI
- P3: GraphRAG query interface
- P4: Entity resolution UI

---

## Your Mission

Polish to production quality with these deliverables:

1. **Error Handling** - Graceful handling of all failure modes
2. **Loading States** - Skeletons and progress indicators
3. **Visual Consistency** - Match todox app design
4. **Demo Guidance** - Hints and onboarding
5. **Performance** - Suspense, lazy loading
6. **Documentation** - Component docs

---

## Phase Tasks

| Task | Agent | Priority |
|------|-------|----------|
| Audit and fix error handling | Orchestrator | P0 |
| Add loading skeletons | Orchestrator | P0 |
| Visual consistency review | Orchestrator | P0 |
| Add demo hints/onboarding | Orchestrator | P1 |
| Performance optimization | Orchestrator | P1 |
| Final type check and lint | Orchestrator | P0 |
| Full demo flow testing | Orchestrator | P0 |

---

## Critical Patterns

**Error Boundary:**
```typescript
"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@beep/ui/components/alert";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <React.Suspense fallback={<LoadingSkeleton />}>
      {children}
    </React.Suspense>
  );
}

function ErrorAlert({ error }: { error: Error }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
```

**Loading Skeleton:**
```typescript
import { Skeleton } from "@beep/ui/components/skeleton";

function EntityCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </CardContent>
    </Card>
  );
}
```

**Demo Hint:**
```typescript
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/ui/components/tooltip";

function DemoHint({ children, hint }: { children: React.ReactNode; hint: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
```

---

## Success Criteria

- [ ] All error states handled with helpful messages
- [ ] Loading skeletons match content shape
- [ ] Visual design consistent with todox
- [ ] No console errors during demo
- [ ] Type check passes
- [ ] Lint passes
- [ ] Full demo flow works

---

## Verification

### Error Testing
```bash
# Simulate network failure
# In browser DevTools: Network tab > Offline
# Trigger extraction - should show error

# Simulate slow network
# Network tab > Slow 3G
# Trigger extraction - should show loading
```

### Visual Testing
1. Open todox app page side-by-side
2. Compare spacing, typography, colors
3. Check on 1024px and 768px widths

### Full Demo Flow
1. Load `/knowledge-demo`
2. Select and extract all 5 emails
3. View entities and relations
4. Click evidence, verify highlighting
5. Run GraphRAG query
6. Resolve entities
7. Verify clusters match expected
8. Clear and repeat

---

## Reference Files

1. `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P5.md` - Full context
2. `packages/ui/ui/src/components/skeleton.tsx` - Skeleton component
3. `packages/ui/ui/src/components/alert.tsx` - Alert component
4. `apps/todox/src/app/` - Design reference

---

## Important Notes

1. **Error Messages**: Be specific about what failed and suggest next steps.

2. **Loading Duration**: Extraction may take 5-10 seconds. Consider progress indicator with stages.

3. **Empty States**: All panels need empty states with helpful messages.

4. **Reset Function**: Add "Clear All" to reset demo state completely.

---

## Completion Checklist

Before marking spec complete:

- [ ] All type checks pass
- [ ] All lint checks pass
- [ ] No console errors
- [ ] Demo flow works end-to-end
- [ ] Error states tested
- [ ] Loading states visible
- [ ] REFLECTION_LOG.md updated
- [ ] Component props documented

---

## Final Handoff

After completing Phase 5:

1. Update `REFLECTION_LOG.md` with full spec learnings
2. Mark spec as complete in `specs/README.md`
3. Create PR if not already done
4. Celebrate - spec is done!
