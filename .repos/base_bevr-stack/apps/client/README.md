# Client App

React frontend built with Vite and TypeScript, part of the
[bEvr stack](../../README.md).

## Stack

- **React 19** - UI framework
- **Vite 8** - Build tool and dev server
- **TypeScript** - Type safety
- **Effect 4-beta** - Functional programming utilities
- **@repo/domain** - Shared types and schemas

## Getting Started

From the monorepo root:

```bash
# Start development server
bun dev --filter=client

# Build for production
bun run build --filter=client
```

The app runs on `http://localhost:3000` in development.

## Architecture

The client is a standard React application with:

- **Shared Types**: Import from `@repo/domain` for type-safe API communication
- **Effect Integration**: Use Effect for functional programming patterns
- **Environment Variables**: Configure server URL via `VITE_SERVER_URL`

## Example Usage

```typescript
import { ApiResponse } from "@repo/domain";

// Type-safe API calls
const response = await fetch("/api/hello");
// Decode the response using Effect Schema
const res = Schema.decodeUnknownSync(ApiResponse)(await req.json());
```

## Testing

The client uses **Vitest 4.x with Browser Mode** (Playwright) for testing React
components in a real browser environment.

```bash
# Run client tests
bun run test --filter=client
```

**Test Setup:**

- **Browser Mode**: Tests run in Playwright-controlled browser
- **vitest-browser-react**: React testing utilities for Browser Mode
- **CSS Support**: Tailwind CSS is processed during tests

**Test File Structure:**

```typescript
import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
import { App } from "./app";

test("renders app", async () => {
  const screen = render(<App />);
  await expect.element(screen.getByText("Hello")).toBeInTheDocument();
});
```

Tests are colocated with source files using the `*.test.tsx` pattern.

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [bEvr Stack Overview](../../README.md)
