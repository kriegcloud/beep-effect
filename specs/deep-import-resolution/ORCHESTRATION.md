# Deep Import Resolution - Orchestration Prompt

**SPEC_NAME**: deep-import-resolution
**Purpose**: Orchestrate sub-agents to resolve deep import violations in the beep-effect codebase

---

## Context

You are an orchestration agent responsible for resolving `/internal/` import violations in the beep-effect monorepo. These violations occur when one package imports directly from another package's `/internal/` directory, bypassing the public API.

## Current State

The codebase has been analyzed and **1 violation** was found:

| File | Line | Violation |
|------|------|-----------|
| `packages/iam/server/src/adapters/better-auth/Emails.ts` | 5 | Imports from `@beep/shared-server/internal/email/adapters/resend/errors` |

## Your Task

Execute the fix described in `specs/deep-import-resolution/PLAN.md`.

### Step 1: Apply the Fix

Edit `packages/iam/server/src/adapters/better-auth/Emails.ts`:

1. **Remove line 5** (the internal import):
   ```typescript
   // DELETE:
   import type { ResendError } from "@beep/shared-server/internal/email/adapters/resend/errors";
   ```

2. **Modify line 83** - change `ResendError` to `Email.ResendError`:
   ```typescript
   // BEFORE:
   readonly sendOTP: (params: SendOTPEmailPayload) => Effect.Effect<void, ResendError, never>;

   // AFTER:
   readonly sendOTP: (params: SendOTPEmailPayload) => Effect.Effect<void, Email.ResendError, never>;
   ```

### Step 2: Verify the Fix

Run type checking to ensure the fix is correct:

```bash
bun run check --filter=@beep/iam-server
```

### Step 3: Verify No Other Violations Exist

Confirm no other `/internal/` cross-package imports exist:

```bash
grep -rn 'from.*@beep/[^"'"'"']+/internal' packages/ apps/ tooling/ --include="*.ts" | grep -v '^ *\*'
```

Expected output: No matches (or only JSDoc comments starting with ` * `).

### Step 4: Report Completion

Update `specs/deep-import-resolution/PLAN.md`:
- Mark all checklist items as completed: `- [x]`
- Add a completion timestamp

## Success Criteria

1. No TypeScript errors in `@beep/iam-server`
2. No cross-package `/internal/` imports remain
3. The `Email.ResendError` type is correctly resolved via the public API

## Constraints

- Do NOT modify the internal module structure
- Do NOT add new exports to bypass the fix
- Do NOT suppress TypeScript errors
- Follow Effect patterns as documented in AGENTS.md

## Rollback Plan

If the fix causes issues:
1. Revert changes to `Emails.ts`
2. Document why the internal import was necessary
3. Consider exposing `ResendError` through a different public API path

---

## Agent Spawning (Optional)

If orchestrating sub-agents, spawn with:

```
subagent_type: package-error-fixer
prompt: "Fix all type, build, and lint errors in @beep/iam-server after removing the internal import"
```

However, this fix is simple enough that a single agent should handle it directly.
