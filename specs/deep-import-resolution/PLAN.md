# Deep Import Resolution Plan

**SPEC_NAME**: deep-import-resolution
**Created**: 2025-01-07
**Status**: Ready for execution

## Executive Summary

After comprehensive analysis of the beep-effect codebase, we found that the reported "1,495 instances of `@beep/package-name/internal/...` imports" was a mischaracterization. The actual findings are:

| Category | Count | Status |
|----------|-------|--------|
| JSDoc documentation examples | ~100 | Not violations (documentation only) |
| Intentional subpath imports | ~2,843 | By design (enabled in package.json) |
| **Actual cross-package `/internal/` violations** | **1** | **Needs fix** |

## The Single Violation

### Location
```
packages/iam/server/src/adapters/better-auth/Emails.ts:5
```

### Current (Problematic) Import
```typescript
import type { ResendError } from "@beep/shared-server/internal/email/adapters/resend/errors";
```

### Why It's a Violation
- Imports directly from an `/internal/` directory in a different package
- The same type is already available via the public API: `Email.ResendError`
- The file already uses `Email.ResendError` in lines 75, 76, 79, 82 - line 83 is inconsistent

### Recommended Fix

**Remove line 5:**
```typescript
// DELETE THIS LINE:
import type { ResendError } from "@beep/shared-server/internal/email/adapters/resend/errors";
```

**Change line 83 from:**
```typescript
readonly sendOTP: (params: SendOTPEmailPayload) => Effect.Effect<void, ResendError, never>;
```

**To:**
```typescript
readonly sendOTP: (params: SendOTPEmailPayload) => Effect.Effect<void, Email.ResendError, never>;
```

## Checklist

- [x] **Fix 1**: Remove internal import on line 5 of `Emails.ts`
- [x] **Fix 2**: Replace `ResendError` with `Email.ResendError` on line 83
- [x] **Verify**: Run `bun run check --filter=@beep/iam-server` to ensure types resolve correctly

**Completed**: 2025-01-07

## Import Mapping

| Old Import Path | New Import Path |
|-----------------|-----------------|
| `@beep/shared-server/internal/email/adapters/resend/errors` → `ResendError` | `@beep/shared-server/Email` → `Email.ResendError` |

## Why Other Deep Imports Are Not Violations

The tsconfig.base.jsonc and package.json explicitly enable subpath imports:

```json
// package.json exports
"exports": {
  ".": "./src/index.ts",
  "./*": "./src/*"  // <-- Intentionally allows @beep/package/subpath
}
```

```json
// tsconfig.base.jsonc paths
"@beep/shared-server/*": ["./packages/shared/server/src/*"]
```

These patterns are architectural decisions for:
- `/api` - Contract and type definitions
- `/entities` - Domain models
- `/db` - Database layer
- `/adapters` - Infrastructure adapters
- `/components` - UI hierarchies

Only `/internal/` directories represent implementation details that should not be imported cross-package.
