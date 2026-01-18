# Handler Migration Checklist — {MODULE}/{FEATURE}

> Template for tracking individual handler migration from legacy to canonical patterns.

---

## Pattern Selection

> **Decision Criteria**: Use Transform Pattern only if form has fields NOT sent to API, API requires computed values, or field names differ between form and API.

### Select Pattern (check one):

- [ ] **Simple Pattern** (DEFAULT — most handlers)
  - Fields map 1:1 to Better Auth API
  - Single `Payload` class with `formValuesAnnotation()`
  - No `PayloadFrom` or transform needed
  - Example: `sign-in/email/contract.ts`

- [ ] **Transform Pattern** (computed fields only)
  - Form has fields NOT sent to API (e.g., `passwordConfirm`)
  - API requires computed values (e.g., `fullName` from `firstName` + `lastName`)
  - Field names differ between form and API
  - Use `PayloadFrom` class (form input) + `Payload` class (API output)
  - Use `S.transformOrFail()` with validation
  - Example: `sign-up/email/contract.ts`

### Pattern-Specific Checklist

**If Simple Pattern** (selected above):
- [ ] Define `Payload` class with `formValuesAnnotation()` for encoded defaults
- [ ] Use `S.Class` directly (no transform)

**If Transform Pattern** (selected above):
- [ ] Define `PayloadFrom` class for form input (user-facing fields)
- [ ] Define `Payload` class for API output (wire format)
- [ ] Create transform: `S.transformOrFail(PayloadFrom, Payload, ...)`
- [ ] Add validation in transform (e.g., password confirmation match)
- [ ] Add `formValuesAnnotation()` to `PayloadFrom` (not `Payload`)

---

## Pre-Migration

- [ ] Read current contract: `{feature}.contract.ts`
- [ ] Read current handler: `{feature}.handler.ts`
- [ ] Verify Better Auth method signature via LSP hover
- [ ] Note any schema discrepancies

## File Operations

- [ ] Rename `{feature}.contract.ts` → `contract.ts`
- [ ] Rename `{feature}.handler.ts` → `handler.ts`
- [ ] Create `mod.ts` (barrel file)
- [ ] Update `index.ts` (namespace export)

## Contract Migration

- [ ] Add JSDoc `@fileoverview` comment
- [ ] Add `@module @beep/iam-client/{module}/{feature}/contract`
- [ ] Add `@category {Module}/{Feature}`
- [ ] Add `@since 0.1.0`
- [ ] Import from `@beep/iam-client/_internal` (Common)
- [ ] Import from `@beep/wrap` (W)
- [ ] Add `formValuesAnnotation()` to Payload (if has payload)
- [ ] Create `Wrapper = W.Wrapper.make("Feature", { payload, success, error: Common.IamError })`
- [ ] Migrate password fields to `S.Redacted(S.String)` if needed
- [ ] Add JSDoc to Payload class
- [ ] Add JSDoc to Success class
- [ ] Add JSDoc to Wrapper

## Handler Migration

- [ ] Add JSDoc `@fileoverview` comment
- [ ] Add `@module @beep/iam-client/{module}/{feature}/handler`
- [ ] Add `@category {Module}/{Feature}`
- [ ] Add `@since 0.1.0`
- [ ] Replace `createHandler` with `Contract.Wrapper.implement()`
- [ ] Use `Common.wrapIamMethod({ wrapper, mutatesSession })`
- [ ] Add JSDoc to Handler with `@example`

## Index/Mod Files

- [ ] Create `mod.ts`:
  ```typescript
  export * from "./contract.ts";
  export * from "./handler.ts";
  ```
- [ ] Update `index.ts`:
  ```typescript
  export * as FeatureName from "./mod.ts";
  ```

## Verification

- [ ] Type-check passes: `bun run check --filter @beep/iam-client`
- [ ] Lint passes: `bun run lint --filter @beep/iam-client`
- [ ] No TypeScript errors in IDE

---

## Notes

*Add any migration-specific notes here*
