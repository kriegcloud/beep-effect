# HttpClient — Agent Context

> Best practices for using `@effect/platform/HttpClient` in this codebase.

## Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `client.get(url, options?)` | GET request | `Effect<HttpClientResponse, HttpClientError, R>` |
| `client.post(url, options?)` | POST request | `Effect<HttpClientResponse, HttpClientError, R>` |
| `client.put(url, options?)` | PUT request | `Effect<HttpClientResponse, HttpClientError, R>` |
| `client.patch(url, options?)` | PATCH request | `Effect<HttpClientResponse, HttpClientError, R>` |
| `client.del(url, options?)` | DELETE request | `Effect<HttpClientResponse, HttpClientError, R>` |
| `HttpClient.fetchOk` | Default fetch client | `Effect<HttpClient, never>` |
| `HttpClient.make()` | Custom client | `HttpClient` |

## Codebase Patterns

### Basic GET Request

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const fetchUser = (userId: string) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    const response = yield* client.get(`https://api.example.com/users/${userId}`);

    // Decode JSON response
    const json = yield* response.json;
    const user = yield* S.decodeUnknown(UserSchema)(json);

    return user;
  });
```

### POST with JSON Body

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const createUser = (userData: CreateUserInput) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    const response = yield* client.post("https://api.example.com/users", {
      body: HttpClientRequest.jsonBody(userData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = yield* response.json;
    return yield* S.decodeUnknown(UserSchema)(json);
  });
```

### Response Schema Decoding

ALWAYS decode responses with Effect Schema:

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export class ApiUser extends S.Class<ApiUser>("ApiUser")({
  id: S.String,
  email: S.String,
  name: S.String,
}) {}

const fetchAndDecodeUser = (userId: string) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    const response = yield* client.get(`/users/${userId}`);

    // Use HttpClientResponse.schemaBodyJson for automatic decoding
    const user = yield* HttpClientResponse.schemaBodyJson(ApiUser)(response);

    return user;
  });
```

### Error Handling

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientError from "@effect/platform/HttpClientError";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { userId: S.String }
) {}

const fetchUser = (userId: string) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    const response = yield* client.get(`/users/${userId}`).pipe(
      Effect.catchTag("ResponseError", (error) => {
        if (error.response.status === 404) {
          return Effect.fail(new UserNotFoundError({ userId }));
        }
        return Effect.fail(error);
      })
    );

    return yield* response.json;
  });
```

### Custom Headers and Authentication

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const authenticatedClient = (apiKey: string) =>
  F.pipe(
    HttpClient.HttpClient,
    Effect.map(
      HttpClient.mapRequest(
        HttpClientRequest.prependUrl("https://api.example.com"),
        HttpClientRequest.setHeader("Authorization", `Bearer ${apiKey}`),
        HttpClientRequest.setHeader("X-API-Version", "2024-01-01")
      )
    )
  );

const fetchWithAuth = (apiKey: string, path: string) =>
  Effect.gen(function* () {
    const client = yield* authenticatedClient(apiKey);
    const response = yield* client.get(path);
    return yield* response.json;
  });
```

### Retry Logic

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";

const fetchWithRetry = (url: string) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    const response = yield* client.get(url).pipe(
      Effect.retry(
        Schedule.exponential(Duration.millis(100)).pipe(
          Schedule.compose(Schedule.recurs(3))
        )
      ),
      Effect.catchTag("ResponseError", (error) => {
        // Only retry on 5xx errors
        if (error.response.status >= 500) {
          return Effect.fail(error);
        }
        // Don't retry 4xx errors
        return Effect.fail(error);
      })
    );

    return yield* response.json;
  });
```

## Layer Composition

### Bun Runtime

```typescript
import { HttpClient } from "@effect/platform-bun";
import * as Layer from "effect/Layer";

export const ApiClientLive = Layer.mergeAll(
  HttpClient.layerUndici,  // Provides HttpClient service
  // ... other layers
);
```

### Node Runtime

```typescript
import { HttpClient } from "@effect/platform-node";
import * as Layer from "effect/Layer";

export const ApiClientLive = Layer.mergeAll(
  HttpClient.layerUndici,  // Provides HttpClient service
  // ... other layers
);
```

### Browser Runtime

```typescript
import { HttpClient } from "@effect/platform-browser";
import * as Layer from "effect/Layer";

export const ApiClientLive = Layer.mergeAll(
  HttpClient.layer,  // Provides HttpClient service (uses fetch)
  // ... other layers
);
```

### Custom Client Configuration

```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

const CustomHttpClientLive = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const defaultClient = yield* HttpClient.HttpClient;

    return F.pipe(
      defaultClient,
      HttpClient.mapRequest(
        HttpClientRequest.prependUrl("https://api.example.com"),
        HttpClientRequest.setHeader("User-Agent", "beep-effect/1.0")
      ),
      HttpClient.timeout(Duration.seconds(30)),
      HttpClient.retry({
        times: 3,
        schedule: Schedule.exponential(Duration.millis(100)),
      })
    );
  })
).pipe(Layer.provide(HttpClient.layerUndici));
```

## Anti-Patterns

### FORBIDDEN - Using fetch directly

```typescript
// FORBIDDEN - Native fetch
const response = await fetch("https://api.example.com/users");
const json = await response.json();

// REQUIRED - HttpClient
import * as HttpClient from "@effect/platform/HttpClient";
const client = yield* HttpClient.HttpClient;
const response = yield* client.get("https://api.example.com/users");
const json = yield* response.json;
```

### FORBIDDEN - Using axios or other HTTP libraries

```typescript
// FORBIDDEN - axios
import axios from "axios";
const response = await axios.get("https://api.example.com/users");

// REQUIRED - HttpClient
import * as HttpClient from "@effect/platform/HttpClient";
const client = yield* HttpClient.HttpClient;
const response = yield* client.get("https://api.example.com/users");
```

### FORBIDDEN - Skipping response validation

```typescript
// FORBIDDEN - Unsafe JSON parsing
const client = yield* HttpClient.HttpClient;
const response = yield* client.get("/users/123");
const json = yield* response.json;
const user = json as User;  // Type casting!

// REQUIRED - Schema validation
const response = yield* client.get("/users/123");
const user = yield* HttpClientResponse.schemaBodyJson(UserSchema)(response);
```

### FORBIDDEN - Throwing errors

```typescript
// FORBIDDEN - Throwing exceptions
const client = yield* HttpClient.HttpClient;
const response = yield* client.get("/users/123");
if (response.status === 404) {
  throw new Error("User not found");  // WRONG!
}

// REQUIRED - Effect.fail with tagged errors
import * as S from "effect/Schema";

export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { userId: S.String }
) {}

const response = yield* client.get("/users/123").pipe(
  Effect.catchTag("ResponseError", (error) => {
    if (error.response.status === 404) {
      return Effect.fail(new UserNotFoundError({ userId: "123" }));
    }
    return Effect.fail(error);
  })
);
```

### FORBIDDEN - Ignoring error types

```typescript
// FORBIDDEN - Losing error information
const response = yield* client.get("/users").pipe(
  Effect.catchAll(() => Effect.succeed([]))  // Swallows error details
);

// REQUIRED - Preserve error types or map to domain errors
const response = yield* client.get("/users").pipe(
  Effect.catchTag("ResponseError", (error) => {
    // Log structured error
    yield* Effect.logError("API request failed", {
      status: error.response.status,
      url: error.request.url,
    });
    return Effect.fail(new ApiFetchError({ cause: error }));
  })
);
```

## Related Modules

- **HttpClientRequest** (`@effect/platform/HttpClientRequest`) — Request construction
- **HttpClientResponse** (`@effect/platform/HttpClientResponse`) — Response handling
- **HttpClientError** (`@effect/platform/HttpClientError`) — Error types

## Source Reference

[.repos/effect/packages/platform/src/HttpClient.ts](/home/elpresidank/YeeBois/projects/beep-effect2/.repos/effect/packages/platform/src/HttpClient.ts)
