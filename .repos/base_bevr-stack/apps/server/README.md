# Server API

[Effect Platform](https://effect.website/docs/platform) backend API with
TypeScript, part of the [bEvr stack](../../README.md).

## Stack

- **Effect Platform** - Api framework
- **Bun** - JavaScript runtime
- **TypeScript** - Type safety
- **@repo/domain** - Shared types and schemas

## Getting Started

From the monorepo root:

```bash
# Start development server
bun dev --filter=server

# Build for production
bun run build --filter=server
```

The API runs on `http://localhost:9000` in development.

## Architecture

The server uses Effect Platform HTTP API for type-safe, functional HTTP
handling:

- **Type-safe Routes**: Shared types from `@repo/domain`
- **CORS Support**: Pre-configured for client communication
- **Effect Integration**: Functional error handling and data processing
- **Environment Agnostic**: Deploy to any JavaScript runtime

## Example Route

```typescript
import { ApiResponse } from "@repo/domain";

// Define API Group
class HelloGroup extends HttpApiGroup.make("hello")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(ApiResponse))
  .prefix("/hello") {}

const Api = HttpApi.make("Api").add(HelloGroup);

// Define Live Handler
const HelloGroupLive = HttpApiBuilder.group(Api, "hello", (handlers) =>
  handlers.handle("get", () => {
    const data: typeof ApiResponse.Type = {
        message: "Hello bEvr!",
      success: true,
    };
    return Effect.succeed(data);
  })
);
```

## Testing

The server uses **Vitest 4.x** with **@effect/vitest** for testing Effect-based
code.

```bash
# Run server tests
bun run test --filter=server

# Run specific test file
bun run test --filter=server -- src/index.test.ts
```

**Effect Testing Patterns:**

```typescript
import { Effect } from "effect";
import { describe, expect, it } from "@effect/vitest";

describe("MyService", () => {
  it.effect("should return data", () =>
    Effect.gen(function* () {
      const service = yield* MyService;
      const result = yield* service.getData();
      expect(result).toEqual(expectedData);
    })
  );
});
```

Use `it.effect()` for tests that return Effect values. The test runner
automatically handles Effect execution and error propagation.

## Learn More

- [Effect Documentation](https://effect.website)
- [bEvr Stack Overview](../../README.md)
