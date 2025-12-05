# AGENTS.md — `@beep/mock`

> **Package**: `@beep/mock` — Mock data fixtures for UI development
> **Location**: `packages/common/mock`
> **Type**: Pure data library (no I/O, no side effects)

## Purpose & Scope
- Deterministic, client-safe fixtures for UI demos and dashboards across `apps/web` and slice UI packages.
- Pure data only: no I/O, env access, randomness, or domain/business logic. Keep consumable in browser and server runtimes.
- Provides indexed pickers via `_mock` object plus scenario-specific bundles for common dashboard patterns.

> **Note**: The package.json description ("A library for system wide errors & error utilities") is outdated and should be updated to: "Deterministic mock data fixtures for UI development and demos".

## Surface Map (src/)

### Core Data Assets
- **`assets.ts`** — Base arrays for mock data primitives:
  - IDs, booleans, numbers (prices, ratings, ages, percents)
  - Names (first, last, full, company, country)
  - Contact info (emails, phone numbers, addresses)
  - Content (post titles, product names, tour names, job titles, task names, course names, file names, event names, sentences, descriptions)
  - Tags, roles

### Picker Utilities
- **`_mock.ts`** — Centralized index-based picker object with nested structure:
  - Text pickers: `id()`, `role()`, `courseNames()`, `fileNames()`, `eventNames()`, `taskNames()`, `postTitle()`, `jobTitle()`, `tourName()`, `productName()`, `sentence()`, `description()`
  - Contact pickers: `email()`, `phoneNumber()`, `fullAddress()`
  - Name pickers: `firstName()`, `lastName()`, `fullName()`, `companyNames()`, `countryNames()`
  - Number pickers (nested): `number.percent()`, `number.rating()`, `number.age()`, `number.price()`, `number.nativeS()`, `number.nativeM()`, `number.nativeL()`
  - Image path builders (nested): `image.cover()`, `image.avatar()`, `image.travel()`, `image.course()`, `image.company()`, `image.product()`, `image.portrait()`
  - Time picker: `time()` (pulls from `_lastActivity`)

- **`_time.ts`** — Deterministic timestamp array (`_lastActivity`) generated via `A.makeBy` with reference date of 2024-01-01 12:00:00 UTC, offset by index.

### Scenario Bundles
- **`_overview.ts`** — Dashboard overview scenarios:
  - App analytics: `_appRelated`, `_appInstalled`, `_appAuthors`, `_appInvoices`, `_appFeatured`
  - General analytics: `_analyticTasks`, `_analyticPosts`, `_analyticOrderTimeline`, `_analyticTraffic`
  - E-commerce: `_ecommerceSalesOverview`, `_ecommerceBestSalesman`, `_ecommerceLatestProducts`, `_ecommerceNewProducts`
  - Banking: `_bankingContacts`, `_bankingCreditCard`, `_bankingRecentTransitions`
  - Booking: `_bookings`, `_bookingsOverview`, `_bookingReview`, `_bookingNew`

- **`_user.ts`** — User-centric scenarios:
  - Profile data: `_userAbout`, `_userFollowers`, `_userFriends`, `_userGallery`, `_userFeeds`, `_userCards`
  - Account management: `_userPayment`, `_userAddressBook`, `_userInvoices`, `_userPlans`
  - User lists: `_userList`
  - Constants: `USER_STATUS_OPTIONS`

- **`_product.ts`** — Product catalog fixtures
- **`_blog.ts`** — Blog/content fixtures
- **`_files.ts`** — File/document fixtures
- **`_order.ts`** — Order/transaction fixtures
- **`_invoice.ts`** — Invoice fixtures
- **`_job.ts`** — Job posting fixtures
- **`_tour.ts`** — Tour/travel fixtures
- **`_others.ts`** — Miscellaneous fixtures (contacts, notifications, pricing, testimonials)

### Exports
- **`index.ts`** — Re-exports all scenario bundles, `_mock` picker, and `assets` for public consumption.

## Import Patterns

### From External Consumers
```typescript
// Importing scenario bundles
import { _userAbout, _userInvoices, _userPlans } from "@beep/mock";

// Importing the picker object
import { _mock } from "@beep/mock";

// Using the picker
const avatar = _mock.image.avatar(5);
const name = _mock.fullName(5);
```

### Deep Imports (Supported)
The package exports with glob pattern `./*`, allowing direct file imports:
```typescript
import { _userAbout } from "@beep/mock/_user";
import { _mock } from "@beep/mock/_mock";
import { _lastActivity } from "@beep/mock/_time";
```

### Internal Cross-File Imports
Within the package, use package aliases:
```typescript
// ✅ Preferred
import { _lastActivity } from "@beep/mock/_time";
import { _mock } from "./_mock";

// ❌ Avoid relative paths for cross-package imports
import { _lastActivity } from "../../../_time";
```

## Usage Snapshots

### Dashboard Layout
- **`apps/web/src/app/dashboard/_layout-client.tsx`** — Renders layout chrome from `_contacts`, `_notifications`.

### Account Management Views
- **`apps/web/src/features/account/view/account-billing-view.tsx`** — Pulls `_userAddressBook`, `_userInvoices`, `_userPayment`, `_userPlans`.
- **`apps/web/src/features/account/view/account-socials-view.tsx`** — Uses `_userAbout` profile data.

## Authoring Guardrails

### Effect-First Data Construction
- **Prefer Effect collections**: When adding or refactoring data, use `F.pipe` + `A.*`/`Str.*` over native `.map/.filter/.split` and loops.
- **Current state**: Some scenario files (`_user.ts`, `_overview.ts`, etc.) currently use native `Array.from()` and `.map()`. When refactoring or adding new fixtures, migrate to Effect patterns:
  ```typescript
  // ❌ Current pattern in some files
  Array.from({ length: 18 }, (_, index) => ({ ... }))

  // ✅ Preferred Effect pattern
  A.makeBy(18, (index) => ({ ... }))
  ```
- **Namespace imports**: Always use namespace imports for Effect modules:
  ```typescript
  import * as A from "effect/Array";
  import * as F from "effect/Function";
  import * as Str from "effect/String";
  ```

### Data Quality & Safety
- **Deterministic**: Never introduce `Date.now()`, random generators, or per-request mutations. Extend `_time.ts` or base arrays in `assets.ts` instead.
- **Client-safe**: Keep data neutral (no secrets, no real PII, no internal URLs). Content should be safe for screenshots and seeded previews.
- **Stable shapes**: Many dashboard widgets rely on existing keys; coordinate shape changes with the consuming views in the same PR.

### Architectural Boundaries
- **No cross-slice coupling**: Avoid pulling slice-specific models or services; fixtures must remain generic and side-effect free.
- **No runtime dependencies**: Only depend on `@beep/utils` for pure utilities like `format-time`. Avoid service layers, DB clients, or Effect runtime layers.
- **Asset alignment**: If adding new image indices, ensure corresponding files exist under `/assets/images/mock/...` in the host app (`apps/web/public/assets/images/mock/`).

## Adding New Fixtures

### Workflow
1. **Add base data to `assets.ts`**: Create new const arrays for primitive values (names, numbers, strings).
2. **Expose picker in `_mock.ts`**: Add an index-based function to the `_mock` object for easy access.
3. **Build scenario bundles**: Compose scenario-specific objects in appropriate `_*.ts` files using Effect utilities and `_mock` pickers.
4. **Extend timestamps**: If you need more timestamps, adjust the length parameter in `_time.ts` (`A.makeBy(N, ...)`) instead of hardcoding ISO strings.

### Examples

#### Adding a new base array to assets.ts
```typescript
export const _statusLabels = [
  "Active",
  "Pending",
  "Completed",
  "Cancelled",
  // ... 20 more entries
] as const;
```

#### Exposing picker in _mock.ts
```typescript
export const _mock = {
  // ... existing pickers
  statusLabel: (index: number) => _statusLabels[index]!,
};
```

#### Using in scenario bundle
```typescript
// In _order.ts or other scenario file
import * as A from "effect/Array";
import { _mock } from "./_mock";

export const _orderList = A.makeBy(24, (index) => ({
  id: _mock.id(index),
  customer: _mock.fullName(index),
  status: _mock.statusLabel(index % 4), // Cycle through statuses
  total: _mock.number.price(index),
}));
```

### Documentation
- Add concise inline comments only when structure is non-obvious (e.g., explaining index/category coupling).
- Keep narrative documentation in this AGENTS.md file, not in source files.

## Verification
- `bun run lint --filter=@beep/mock`
- `bun run test --filter=@beep/mock`
- `bun run build --filter=@beep/mock`

## Dependencies

### Peer Dependencies (from package.json)
```json
{
  "effect": "catalog:",
  "@effect/platform": "catalog:",
  "@beep/schema": "workspace:^",
  "@beep/utils": "workspace:^",
  "@beep/constants": "workspace:^",
  "@beep/identity": "workspace:^",
  "@effect/cluster": "catalog:",
  "@effect/workflow": "catalog:",
  "@beep/invariant": "workspace:^",
  "uuid": "catalog:",
  "picocolors": "catalog:"
}
```

### Actual Runtime Usage
Most peer dependencies are not actively used in the current implementation. The package primarily uses:
- **`effect/Array`** — `A.makeBy` in `_time.ts`
- **`@beep/utils/format-time`** — `today` helper in `_overview.ts`
- **`@beep/mock/_time`** — Internal cross-file import for timestamps

The package is intentionally lean to remain client-safe and side-effect free.

## Contributor Checklist
- [ ] Used Effect collection/string helpers (`A.makeBy`, `F.pipe`, etc.); no new native array/string or loop constructs.
- [ ] Data remains deterministic and side-effect free; no randomness or `Date.now()`.
- [ ] Asset counts and indexes line up with available mock images in `apps/web/public/assets/images/mock/`.
- [ ] Existing consumers keep working or were updated alongside shape changes.
- [ ] Lint/test/build commands pass for `@beep/mock`.
- [ ] No slice-specific imports or domain logic introduced; fixtures remain generic.

---

## Known Issues & Technical Debt

### 1. Package Description Mismatch
**Issue**: `package.json` description says "A library for system wide errors & error utilities" (copy-pasted from `@beep/errors`).

**Fix needed**: Update to: "Deterministic mock data fixtures for UI development and demos".

### 2. Inconsistent Array Construction Patterns
**Issue**: Many scenario files use native `Array.from()` and `.map()` instead of Effect patterns:
- `_user.ts` — Lines 32, 39, 46, etc. use `Array.from({ length: N }, (_, index) => ...)`
- `_overview.ts` — Uses native `.map()` for data transformation

**Current pattern**:
```typescript
export const _userFollowers = Array.from({ length: 18 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  // ...
}));
```

**Preferred pattern**:
```typescript
export const _userFollowers = A.makeBy(18, (index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  // ...
}));
```

**Status**: This is a codebase-wide inconsistency that should be addressed during refactoring. New code should follow the Effect pattern, but existing code works correctly.

### 3. Over-declared Peer Dependencies
**Issue**: The package declares many peer dependencies that are not actively used:
- `@beep/schema` — Not imported anywhere
- `@beep/constants` — Not imported anywhere
- `@beep/identity` — Not imported anywhere
- `@beep/invariant` — Not imported anywhere
- `@effect/cluster` — Not imported anywhere
- `@effect/workflow` — Not imported anywhere
- `@effect/platform` — Not imported anywhere
- `uuid` — Not imported anywhere
- `picocolors` — Not imported anywhere

**Actually used**:
- `effect` — For `A.makeBy` in `_time.ts`
- `@beep/utils` — For `format-time` utilities in `_overview.ts`

**Impact**: Low (peer dependencies don't add to bundle size), but creates confusion about actual dependencies.

**Fix needed**: Clean up peer dependencies in `package.json` to only include what's actually used.

### 4. Missing Type Safety for Indexes
**Issue**: The `_mock` picker functions use `number` type for indexes without validation. Accessing out-of-bounds indexes returns `undefined` (with `!` assertion).

**Example**:
```typescript
export const _mock = {
  id: (index: number) => _id[index]!, // No bounds checking
  // ...
};
```

**Risk**: Runtime errors if consumers use indexes beyond array bounds.

**Potential fix**: Use branded types or Schema validation for index bounds, or return `Option<T>` instead of using `!` assertion.

---

## Quick Reference

| Category | Command |
|----------|---------|
| **Lint** | `bun run lint --filter=@beep/mock` |
| **Test** | `bun run test --filter=@beep/mock` |
| **Build** | `bun run build --filter=@beep/mock` |
| **Type Check** | `bun run check --filter=@beep/mock` |
