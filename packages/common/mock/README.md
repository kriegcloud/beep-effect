# @beep/mock

Deterministic mock data fixtures for UI development and demos.

## Purpose

`@beep/mock` provides stable, side-effect-free test data for UI development and testing without requiring database access or external services. This package delivers deterministic fixtures that guarantee consistent rendering across sessions, making it ideal for:
- Component development and demos
- Dashboard prototyping
- UI testing scenarios
- Storybook stories

Key features:
- **Deterministic data**: No randomness or runtime I/O—guaranteed stable rendering across sessions
- **Index-based pickers**: Centralized `_mock` object with nested structure for easy data access
- **Scenario bundles**: Pre-composed datasets for common dashboard patterns (users, products, analytics, etc.)
- **Client-safe**: Browser and server compatible, no PII or sensitive data
- **Effect-first**: Uses Effect collection utilities following monorepo patterns

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/mock": "workspace:*"
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Effect Array utilities (`A.makeBy`) |
| `@beep/utils` | Time formatting helpers |

**Note**: The package declares additional peer dependencies that are not actively used in the current implementation. See [Known Issues](#known-issues) section.

## Key Exports

| Export | Description |
|--------|-------------|
| `_mock` | Index-based picker object for generating individual data points |
| `_userAbout`, `_userList`, etc. | User profile and account management fixtures |
| `_analyticTasks`, `_ecommerceSalesOverview`, etc. | Dashboard overview scenarios |
| `_productList` | Product catalog fixtures |
| `_orderList` | Order/transaction fixtures |
| `_invoiceList` | Invoice fixtures |
| `_jobList` | Job posting fixtures |
| Base arrays from `assets` | Raw data arrays for custom composition |

**Note**: `_lastActivity` (timestamp array) is available via deep import `@beep/mock/_time`, not re-exported from the main index.

## Usage

### Basic Example with `_mock` Picker

The `_mock` object provides index-based access to all mock data primitives:

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

The `_time.ts` module provides pre-generated ISO timestamps (requires deep import):

```typescript
import { _lastActivity } from "@beep/mock/_time";

// Array of 20 timestamps, descending from 2024-01-01 12:00:00 UTC
_lastActivity[0]  // → "2024-01-01T12:00:00.000Z"
_lastActivity[1]  // → "2023-12-30T11:00:00.000Z" (offset by 25 hours)

// Access via _mock picker
import { _mock } from "@beep/mock";
_mock.time(0)  // → "2024-01-01T12:00:00.000Z"
```

**Note**: The timestamp generation uses native `Date` at module load time to create static ISO strings. This is acceptable for deterministic fixture data, though runtime date operations should use `effect/DateTime`.

### Working with Scenario Bundles

Use pre-composed datasets for common UI patterns:

```typescript
import {
  _userAbout,
  _userList,
  _analyticTasks,
} from "@beep/mock";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Use pre-composed profile data
const profile = _userAbout;

// Transform user list with Effect utilities
const activeUsers = F.pipe(
  _userList,
  A.filter((user) => user.status === "active"),
  A.map((user) => ({
    id: user.id,
    displayName: user.name,
  }))
);
```

### Creating Custom Fixtures

Build new fixtures from `_mock` picker:

```typescript
import * as A from "effect/Array";
import { _mock } from "@beep/mock";

const customProfiles = A.makeBy(10, (index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  avatar: _mock.image.avatar(index),
  role: _mock.role(index),
}));
```

### Deep Imports

The package supports deep imports via glob exports pattern (`./*` in package.json):

```typescript
// Import specific modules directly
import { _userAbout } from "@beep/mock/_user";
import { _mock } from "@beep/mock/_mock";
import { _lastActivity } from "@beep/mock/_time";
import { _emails, _firstNames } from "@beep/mock/assets";

// Or use barrel export
import { _userAbout, _mock } from "@beep/mock";
// Note: _lastActivity not re-exported from main index
```

## Available Fixtures

The package exports scenario bundles organized by domain:

**User Fixtures**: Profile data, followers, invoices, plans, payment methods
**Analytics Fixtures**: Tasks, posts, traffic, order timelines
**E-commerce Fixtures**: Sales overview, products, best salesmen
**Banking Fixtures**: Contacts, credit cards, transactions
**Booking Fixtures**: Bookings, reviews, overview data
**Product Fixtures**: Product catalog data
**Order Fixtures**: Order/transaction data
**Invoice Fixtures**: Invoice records
**Job Fixtures**: Job postings
**Tour Fixtures**: Travel/tour packages
**Other Fixtures**: Contacts, notifications, pricing, testimonials

See AGENTS.md for complete export listing.

## Integration

### Image Assets

Image paths generated by `_mock.image.*` reference `/assets/images/mock/` directory. Your host application must provide these assets:

```
apps/web/public/assets/images/mock/
├── avatar/       # User avatars (1-indexed)
├── cover/        # Cover images
├── product/      # Product images
├── travel/       # Travel/tour images
├── course/       # Course images
├── company/      # Company logos
└── portrait/     # Portrait images
```

Path generation is 1-indexed:

```typescript
_mock.image.avatar(0)  // → "/assets/images/mock/avatar/avatar-1.webp"
_mock.image.avatar(5)  // → "/assets/images/mock/avatar/avatar-6.webp"
```

### Consumer Apps

Used by:
- `apps/web` — Dashboard layouts, account views
- `apps/notes` — Component demos
- Package UI layers — Storybook stories

## Development

### Commands

```bash
# Type check
bun run --filter @beep/mock check

# Lint
bun run --filter @beep/mock lint
bun run --filter @beep/mock lint:fix

# Test
bun run --filter @beep/mock test

# Build
bun run --filter @beep/mock build

# Development watch
bun run --filter @beep/mock dev
```

## Notes

### Effect Pattern Compliance

This package follows Effect-first patterns with one notable exception:
- **Current state**: Some scenario files use native `Array.from()` and `.map()` instead of `A.makeBy` and `F.pipe`
- **New code**: Should use Effect utilities (`A.makeBy`, `F.pipe`, etc.)
- **Existing code**: Works correctly but represents technical debt

When working with mock data in consuming code, always use Effect utilities:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

// ✅ REQUIRED
const filtered = F.pipe(
  _userList,
  A.filter((user) => user.status === "active")
);

// ❌ FORBIDDEN
const filtered = _userList.filter((user) => user.status === "active");
```

### Determinism

- No randomness or runtime variability
- Static data pre-computed at module load
- Guarantees consistent rendering across sessions
- Timestamp generation uses native `Date` at module load (acceptable for static fixtures)

### Boundaries

**This package provides**:
- Development/demo data
- UI prototyping fixtures
- Component testing data

**This package does NOT**:
- Generate production data
- Seed databases
- Define domain entities
- Perform I/O operations

### Asset Alignment

Image paths assume corresponding files exist in the host app. If you have 25 avatars but request index 30, it will generate a path to a non-existent file:

```typescript
_mock.image.avatar(24)  // ✅ Valid (→ avatar-25.webp)
_mock.image.avatar(30)  // ❌ May 404 if file doesn't exist
```

For complete details on known issues and technical debt, see the AGENTS.md file.
