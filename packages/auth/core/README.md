# @palantir/pack.auth

Authentication types and interfaces for PACK applications.

## Overview

This package provides the core authentication types, interfaces, and utilities used across PACK applications. It defines the contract for authentication but does not include specific implementations - those are provided by companion packages like `@palantir/pack.auth.foundry`.

## Key Concepts

### Authentication vs Validation

PACK distinguishes between two important concepts:

- **Authentication** (`isAuthenticated()`): Whether the app has a token/credentials available
- **Validation** (`isValidated()`): Whether those credentials have been verified with the platform

This separation allows for:

- Fast startup without blocking network calls
- Explicit control over when validation occurs
- Support for pre-existing token scenarios

### Example Flow

```typescript
import { createClient } from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";

const client = createClient(baseUrl, ontologyRid, auth);
const app = initPackApp(client, options);

// Authenticated immediately if token is available
console.log(app.auth.isAuthenticated()); // true (for static tokens)
console.log(app.auth.isValidated()); // false (not yet validated)
console.log(app.auth.getCurrentUser()); // undefined (no user data yet)

// Explicitly validate when needed
const isValid = await app.auth.validateToken();
if (isValid) {
  console.log(app.auth.isValidated()); // true
  console.log(app.auth.getCurrentUser()); // UserRef with platform data
}
```

## Core Types

### AuthModule

The main authentication interface providing:

- Token access (`getToken()`, `getTokenOrUndefined()`)
- Authentication state (`isAuthenticated()`, `isValidated()`)
- User information (`getCurrentUser()`)
- Auth lifecycle (`signIn()`, `signOut()`, `refresh()`)
- State changes (`onAuthStateChange()`)
- Token validation (`validateToken()`)

### AuthState

Represents the current authentication state:

- `Authenticating`: Currently in progress
- `Authenticated`: Has valid credentials
- `Unauthenticated`: No credentials or signed out
- `Error`: Authentication failed

### UserRef

Provides access to current user information with caching:

- `userId`: Platform user identifier
- `get()`: Fetch full user data from platform API
- Built-in 5-minute cache for performance

## Usage

This package is typically used indirectly through `initPackApp()` from `@palantir/pack.app`. The auth module is automatically available on the app instance:

```typescript
import { createClient } from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";
import { initPackApp } from "@palantir/pack.app";

// Create OSDK client with authentication
const auth = createPublicOauthClient(
  "your-client-id",
  "https://your-foundry-instance.com",
  "http://localhost:3000/callback",
);
const client = createClient(baseUrl, ontologyRid, auth);

const app = initPackApp(client, {
  app: { appId: "your-app" },
});

// Auth module is available as app.auth
await app.auth.signIn();
const user = app.auth.getCurrentUser();
```

## Implementation Packages

- **@palantir/pack.auth-foundry**: Foundry-specific auth implementations (OAuth, static tokens)
- Additional implementation packages can be created for other platforms
