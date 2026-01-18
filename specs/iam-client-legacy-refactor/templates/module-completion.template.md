# Module Completion Checklist — {MODULE}

> Template for tracking complete module migration to canonical patterns.

---

## Module Info

| Property | Value |
|----------|-------|
| Module Name | `{module}` |
| Handler Count | {n} |
| Forms Needed | Yes/No |
| Complexity | Simple/Medium/High |

---

## Feature Migrations

| Feature | Contract | Handler | Mod | Index | Complete |
|---------|----------|---------|-----|-------|----------|
| {feature1} | ☐ | ☐ | ☐ | ☐ | ☐ |
| {feature2} | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## Module-Level Files

### layer.ts

- [ ] Created `layer.ts`
- [ ] Import all feature Wrappers
- [ ] Create `Group = Wrap.WrapperGroup.make(Feature1.Wrapper, Feature2.Wrapper, ...)`
- [ ] Create `layer = Group.toLayer({ Feature1: Feature1.Handler, ... })`
- [ ] Add JSDoc with `@module`, `@category {Module}`, `@since 0.1.0`

### service.ts

- [ ] Created `service.ts`
- [ ] Import `Group`, `layer` from `./layer.ts`
- [ ] Create `Service = Effect.Service<Service>()($I\`Service\`, { accessors: true, effect: Group.accessHandlers(...) })`
- [ ] Create `runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)))`
- [ ] Add JSDoc with `@module`, `@category {Module}`, `@since 0.1.0`

### atoms.ts

- [ ] Created `atoms.ts`
- [ ] Import `runtime`, `Service` from `./service.ts`
- [ ] Create atoms using `runtime.fn(F.flow(Service.FeatureName, withToast(...), Effect.asVoid))`
- [ ] Export `use()` hook returning all atom setters
- [ ] Add JSDoc with `@module`, `@category {Module}`, `@since 0.1.0`

### form.ts (if applicable)

- [ ] Created `form.ts`
- [ ] Import `useAppForm`, `formOptionsWithDefaults` from `@beep/ui/form`
- [ ] Import `Atoms` from `./atoms`
- [ ] Import feature Payload schemas
- [ ] Export `use()` hook returning all form instances
- [ ] Add JSDoc with `@module`, `@category {Module}`, `@since 0.1.0`

### mod.ts

- [ ] Created `mod.ts`
- [ ] Re-export all features: `export * from "./feature1"; export * from "./feature2";`
- [ ] Re-export module-level: `export * from "./layer.ts"; export * from "./service.ts"; ...`
- [ ] Add JSDoc with `@module`, `@category {Module}`, `@since 0.1.0`

### index.ts

- [ ] Updated `index.ts`
- [ ] Single namespace export: `export * as ModuleName from "./mod.ts";`
- [ ] Add JSDoc with `@module`, `@category {Module}`, `@since 0.1.0`

---

## Verification

- [ ] All handlers migrated to canonical pattern
- [ ] All handlers use `Wrapper.implement()` + `wrapIamMethod()`
- [ ] WrapperGroup uses positional args (not object)
- [ ] Service has `accessors: true`
- [ ] Runtime created with `Common.makeAtomRuntime()`
- [ ] Atoms use `withToast()` for feedback
- [ ] Forms use `useAppForm` + `formOptionsWithDefaults`
- [ ] Type-check passes: `bun run check --filter @beep/iam-client`
- [ ] Lint passes: `bun run lint --filter @beep/iam-client`
- [ ] Module exports from package `index.ts`

---

## Consumer Updates Needed

- [ ] Check for imports from old paths
- [ ] Update any direct handler usage
- [ ] Test affected UI components

---

## Notes

*Add any module-specific notes here*
