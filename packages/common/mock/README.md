# @beep/mock

Deterministic mock data fixtures for UI development, demos, and dashboards. This package provides stable, side-effect-free data for development and testing without requiring database access or external services.

## Overview

`@beep/mock` delivers:
- **Deterministic data**: No randomness, `Date.now()`, or runtime I/O—guaranteed stable rendering across sessions
- **Index-based pickers**: Centralized `_mock` object with nested structure for easy data access
- **Scenario bundles**: Pre-composed datasets for common dashboard patterns (users, products, analytics, etc.)
- **Client-safe**: Browser and server compatible, no PII or sensitive data

## Installation

This package is part of the `beep-effect` monorepo and uses workspace protocol for internal dependencies:

```bash
bun add @beep/mock
```

**Peer dependencies**:
- `effect` — For Effect Array utilities
- `@beep/utils` — For time formatting helpers

## Package Structure

```
src/
├── assets.ts          # Base arrays (names, emails, numbers, strings)
├── _mock.ts           # Index-based picker object
├── _time.ts           # Deterministic ISO timestamps
├── _overview.ts       # Dashboard analytics/ecommerce/banking scenarios
├── _user.ts           # User profile & account management fixtures
├── _product.ts        # Product catalog fixtures
├── _blog.ts           # Blog/content fixtures
├── _files.ts          # File/document fixtures
├── _order.ts          # Order/transaction fixtures
├── _invoice.ts        # Invoice fixtures
├── _job.ts            # Job posting fixtures
├── _tour.ts           # Tour/travel fixtures
├── _others.ts         # Miscellaneous fixtures
└── index.ts           # Public exports
```

## Core API

### The `_mock` Picker Object

Central object for index-based data access:

```typescript
import { _mock } from "@beep/mock";

// Text pickers
_mock.id(0)              // → "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1"
_mock.postTitle(0)       // → Post title string
_mock.productName(0)     // → Product name string
_mock.sentence(0)        // → Sentence string
_mock.description(0)     // → Description string

// Contact pickers
_mock.email(0)           // → "nannie.abernathy70@yahoo.com"
_mock.phoneNumber(0)     // → Phone number string
_mock.fullAddress(0)     // → Full address string

// Name pickers
_mock.firstName(0)       // → First name
_mock.lastName(0)        // → Last name
_mock.fullName(0)        // → Full name
_mock.companyNames(0)    // → Company name
_mock.countryNames(0)    // → Country name

// Number pickers (nested)
_mock.number.price(0)    // → 83.74
_mock.number.rating(0)   // → 4.2
_mock.number.age(0)      // → 30
_mock.number.percent(0)  // → 10.1

// Image path builders (nested)
_mock.image.avatar(0)    // → "/assets/images/mock/avatar/avatar-1.webp"
_mock.image.cover(0)     // → "/assets/images/mock/cover/cover-1.webp"
_mock.image.product(0)   // → "/assets/images/mock/m-product/product-1.webp"
_mock.image.travel(0)    // → "/assets/images/mock/travel/travel-1.webp"

// Time picker
_mock.time(0)            // → ISO timestamp from _lastActivity array
```

### Deterministic Timestamps

The `_time.ts` module provides pre-generated ISO timestamps:

```typescript
import { _lastActivity } from "@beep/mock/_time";

// Array of 20 timestamps, descending from 2024-01-01 12:00:00 UTC
_lastActivity[0]  // → "2024-01-01T12:00:00.000Z"
_lastActivity[1]  // → "2023-12-30T11:00:00.000Z" (offset by 25 hours)
```

Implementation uses Effect Array utilities:

```typescript
import * as A from "effect/Array";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const REFERENCE_ACTIVITY_TIMESTAMP = Date.UTC(2024, 0, 1, 12, 0, 0);

export const _lastActivity = A.makeBy(20, (index) =>
  new Date(REFERENCE_ACTIVITY_TIMESTAMP - index * (MS_PER_DAY + MS_PER_HOUR)).toISOString()
);
```

## Usage Examples

### Basic Usage with Effect Utilities

Always use Effect collection utilities when working with mock data:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import { _userList } from "@beep/mock/_user";
import { _mock } from "@beep/mock";

// Extract emails using Effect Array utilities
const emails = F.pipe(
  _userList,
  A.map((user) => user.email)
);

// Filter and transform
const activeUsers = F.pipe(
  _userList,
  A.filter((user) => user.status === "active"),
  A.map((user) => ({
    id: user.id,
    displayName: user.name,
  }))
);

// Create custom fixture using picker
const customProfiles = A.makeBy(10, (index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  avatar: _mock.image.avatar(index),
  role: _mock.role(index),
}));
```

### Scenario Bundles

Pre-composed datasets for common use cases:

```typescript
import {
  _userAbout,
  _userFollowers,
  _userInvoices,
  _userPlans,
} from "@beep/mock";

// User profile data
const profile = _userAbout;
// {
//   id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2",
//   email: "ashlynn.ohara62@gmail.com",
//   role: "UX Designer",
//   company: "Lueilwitz and Sons",
//   country: "Germany",
//   coverUrl: "/assets/images/mock/cover/cover-4.webp",
//   totalFollowers: 1947,
//   totalFollowing: 9124,
//   ...
// }

// User followers (array of 18 items)
const followers = _userFollowers;

// User invoices (array)
const invoices = _userInvoices;
```

### Dashboard Analytics

```typescript
import {
  _analyticTasks,
  _ecommerceSalesOverview,
  _bankingRecentTransitions,
} from "@beep/mock";

// Analytics tasks overview
const tasks = _analyticTasks;

// E-commerce sales data
const sales = _ecommerceSalesOverview;

// Banking transactions
const transactions = _bankingRecentTransitions;
```

### Custom Compositions

Build new fixtures from base assets:

```typescript
import * as A from "effect/Array";
import { _mock } from "@beep/mock";
import { _lastActivity } from "@beep/mock/_time";

// Create notification feed
export const _notifications = A.makeBy(15, (index) => ({
  id: _mock.id(index),
  type: index % 3 === 0 ? "comment" : index % 2 === 0 ? "like" : "follow",
  author: {
    name: _mock.fullName(index),
    avatar: _mock.image.avatar(index),
  },
  createdAt: _lastActivity[index % 20]!,
  message: _mock.sentence(index),
  isUnread: _mock.boolean(index),
}));
```

## Available Scenario Bundles

### User Fixtures (`_user.ts`)
- `_userAbout` — Profile data with social links
- `_userFollowers` — Array of 18 follower objects
- `_userFriends` — Array of 18 friend objects
- `_userGallery` — Array of 12 gallery items
- `_userFeeds` — Array of 3 feed items with likes/comments
- `_userCards` — Payment cards
- `_userPayment` — Payment methods
- `_userAddressBook` — Saved addresses
- `_userInvoices` — Invoice history
- `_userPlans` — Subscription plans
- `_userList` — Complete user list
- `USER_STATUS_OPTIONS` — Status option constants

### Overview Fixtures (`_overview.ts`)
**App Analytics**:
- `_appRelated`, `_appInstalled`, `_appAuthors`, `_appInvoices`, `_appFeatured`

**General Analytics**:
- `_analyticTasks`, `_analyticPosts`, `_analyticOrderTimeline`, `_analyticTraffic`

**E-commerce**:
- `_ecommerceSalesOverview`, `_ecommerceBestSalesman`, `_ecommerceLatestProducts`, `_ecommerceNewProducts`

**Banking**:
- `_bankingContacts`, `_bankingCreditCard`, `_bankingRecentTransitions`

**Booking**:
- `_bookings`, `_bookingsOverview`, `_bookingReview`, `_bookingNew`

### Other Fixtures
- **Products** (`_product.ts`) — Product catalog data
- **Blog** (`_blog.ts`) — Blog posts and content
- **Files** (`_files.ts`) — File/document listings
- **Orders** (`_order.ts`) — Order/transaction data
- **Invoices** (`_invoice.ts`) — Invoice records
- **Jobs** (`_job.ts`) — Job postings
- **Tours** (`_tour.ts`) — Travel/tour packages
- **Others** (`_others.ts`) — Contacts, notifications, pricing, testimonials

## Image Assets

Image paths reference `/assets/images/mock/` directory structure. Your host application (e.g., `apps/web`) must provide these assets:

```
apps/web/public/assets/images/mock/
├── avatar/
│   ├── avatar-1.webp
│   ├── avatar-2.webp
│   └── ...
├── cover/
│   ├── cover-1.webp
│   └── ...
├── product/
├── travel/
├── course/
├── company/
└── portrait/
```

Path generation is 1-indexed:

```typescript
_mock.image.avatar(0)  // → "/assets/images/mock/avatar/avatar-1.webp"
_mock.image.avatar(5)  // → "/assets/images/mock/avatar/avatar-6.webp"
```

## Deep Imports

The package supports deep imports via glob exports:

```typescript
// Import specific modules directly
import { _userAbout } from "@beep/mock/_user";
import { _mock } from "@beep/mock/_mock";
import { _lastActivity } from "@beep/mock/_time";
import { _emails, _firstNames } from "@beep/mock/assets";

// Or use barrel export
import { _userAbout, _mock, _lastActivity } from "@beep/mock";
```

## Effect Patterns

This package follows Effect-first development principles:

### Required Effect Imports

```typescript
// Namespace imports for Effect modules
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
```

### Never Use Native Array Methods

```typescript
// ❌ FORBIDDEN
items.map((item) => item.name);
items.filter((item) => item.active);
Array.from({ length: 10 }, (_, i) => i);

// ✅ REQUIRED - Effect Array utilities
F.pipe(items, A.map((item) => item.name));
F.pipe(items, A.filter((item) => item.active));
A.makeBy(10, (i) => i);
```

### Working with Mock Data

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import { _mock } from "@beep/mock";

// Generate fixture array
const users = A.makeBy(20, (index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  email: _mock.email(index),
  avatar: _mock.image.avatar(index),
}));

// Transform with pipe
const userEmails = F.pipe(
  users,
  A.map((user) => user.email)
);

// Find first match
const adminUser = F.pipe(
  users,
  A.findFirst((user) => user.role === "admin")
);
```

## Design Principles

### Determinism
- No `Math.random()`, `Date.now()`, or runtime variability
- All data is pre-computed and static
- Guarantees consistent rendering across page reloads

### Client Safety
- No side effects, I/O, or platform APIs
- Browser and server compatible
- No real PII or sensitive information

### Stability
- Breaking shape changes require coordinating with consuming views
- Index ranges align with asset counts
- Maintain backward compatibility where possible

## Boundaries & Constraints

### What This Package Is
- Development/demo data source
- UI prototyping fixtures
- Storybook-style component data

### What This Package Is NOT
- Source of truth for domain entities
- Database seeding mechanism
- Production data generator
- Runtime data service

### Do Not
- Add randomness or `Date.now()` calls
- Introduce I/O operations (network, filesystem)
- Import domain models or business logic
- Use real PII or sensitive data
- Access environment variables or configs

## Extending the Package

### Adding New Base Data

1. Add arrays to `assets.ts`:

```typescript
// In assets.ts
export const _statusLabels = [
  "Active",
  "Pending",
  "Completed",
  "Cancelled",
  // ... ensure sufficient count
] as const;
```

2. Expose via `_mock.ts`:

```typescript
// In _mock.ts
import { _statusLabels } from "./assets";

export const _mock = {
  // ... existing pickers
  statusLabel: (index: number) => _statusLabels[index]!,
};
```

3. Use in scenario bundles:

```typescript
// In _order.ts
import * as A from "effect/Array";
import { _mock } from "./_mock";

export const _orderList = A.makeBy(24, (index) => ({
  id: _mock.id(index),
  customer: _mock.fullName(index),
  status: _mock.statusLabel(index % 4),
  total: _mock.number.price(index),
}));
```

### Adding New Timestamps

Adjust the count in `_time.ts`:

```typescript
// Increase from 20 to 50 timestamps
export const _lastActivity = A.makeBy(50, (index) =>
  new Date(REFERENCE_ACTIVITY_TIMESTAMP - index * (MS_PER_DAY + MS_PER_HOUR)).toISOString()
);
```

### Adding New Scenario Bundles

Create a new `_feature.ts` file:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import { _mock } from "./_mock";
import { _lastActivity } from "@beep/mock/_time";

export const _notifications = A.makeBy(15, (index) => ({
  id: _mock.id(index),
  title: _mock.sentence(index),
  createdAt: _lastActivity[index % 20]!,
  isRead: _mock.boolean(index),
}));
```

Export from `index.ts`:

```typescript
export * from "./_notifications";
```

## Development

### Commands

```bash
# Install dependencies
bun install

# Type checking
bun run check

# Linting
bun run lint
bun run lint:fix

# Testing
bun run test
bun run coverage

# Build
bun run build

# Development watch mode
bun run dev
```

### Filter for This Package

When running commands from the monorepo root:

```bash
bun run lint --filter=@beep/mock
bun run test --filter=@beep/mock
bun run build --filter=@beep/mock
```

## Known Limitations

### Index Bounds
Pickers use `!` assertion without bounds checking. Accessing out-of-bounds indexes returns `undefined`:

```typescript
_mock.id(999)  // May be undefined if base array is shorter
```

**Mitigation**: Ensure consumers use modulo operator or stay within documented ranges:

```typescript
// Safe cycling through indexes
_mock.id(index % 24)
```

### Asset Count Alignment
Image paths assume corresponding files exist. Verify asset counts match:

```typescript
// If you have 25 avatars:
_mock.image.avatar(24)  // ✅ Valid (1-indexed → avatar-25.webp)
_mock.image.avatar(30)  // ❌ May 404 if file doesn't exist
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { _userAbout } from "@beep/mock";

type UserAbout = typeof _userAbout;
// Inferred: {
//   id: string;
//   email: string;
//   role: string;
//   ...
// }
```

## Related Packages

- `@beep/utils` — Pure utility functions (imported for time formatting)
- `@beep/schema` — Schema definitions and validation (not used in runtime)
- `@beep/constants` — Application constants

## Contributing

When contributing to this package:

1. **Use Effect patterns**: `A.makeBy`, `F.pipe`, no native array methods
2. **Keep deterministic**: No randomness or `Date.now()`
3. **Maintain stability**: Coordinate shape changes with consuming views
4. **Verify assets**: Ensure image counts align with indexes
5. **Run verification**: `bun run check && bun run lint && bun run test`

## License

MIT

## Package Metadata

- **Name**: `@beep/mock`
- **Version**: `0.0.0`
- **Location**: `packages/common/mock`
- **Repository**: [beep-effect](https://github.com/kriegcloud/beep-effect)
