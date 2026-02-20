# @palantir/pack.auth-foundry

Foundry-specific authentication implementations for PACK applications.

## Overview

This package provides concrete authentication services that implement the `@palantir/pack.auth` interfaces for Palantir Foundry platforms. It includes support for various authentication methods including OAuth flows and static token providers.

## Authentication Services

### StaticTokenService

For applications with pre-existing tokens (CLI tools, service accounts, etc.):

```typescript
import { createStaticTokenService } from "@palantir/pack.auth-foundry";

const tokenProvider = () => Promise.resolve("your-existing-token");
const service = createStaticTokenService(tokenProvider, baseUrl);

// Starts authenticated immediately
console.log(service.isAuthenticated()); // true
console.log(service.isValidated()); // false (until explicitly validated)

// Validate when needed
await service.validateToken(); // Calls platform API to verify token
console.log(service.getCurrentUser()); // UserRef with platform data
```

### PublicOauthService

For browser applications requiring user login:

```typescript
import { createPublicOauthClient } from "@osdk/oauth";
import { createPublicOauthService } from "@palantir/pack.auth-foundry";

const oauthClient = createPublicOauthClient(clientId, baseUrl, redirectUrl);
const service = createPublicOauthService(oauthClient, baseUrl);

// Starts unauthenticated
console.log(service.isAuthenticated()); // false

// User must sign in
await service.signIn(); // Redirects to OAuth flow
console.log(service.isAuthenticated()); // true (after successful OAuth)

// Validate to get user data
await service.validateToken();
console.log(service.getCurrentUser()); // UserRef with platform data
```

### ConfidentialOauthService

For server-side applications with client credentials:

```typescript
import { createConfidentialOauthClient } from "@osdk/oauth";
import { createConfidentialOauthService } from "@palantir/pack.auth-foundry";

const oauthClient = createConfidentialOauthClient(
  clientId,
  clientSecret,
  baseUrl,
);
const service = createConfidentialOauthService(oauthClient, baseUrl);

// Starts authenticated after initial token fetch
await service.signIn(); // Performs client credentials flow
console.log(service.isAuthenticated()); // true

// Validate to get user data (may not be available for service accounts)
await service.validateToken();
```

## Authentication vs Validation

All services follow the same pattern:

- **Authenticated**: Has a token available locally
- **Validated**: Token has been verified with the Foundry platform

This separation allows for:

- **Fast startup**: No blocking API calls during initialization
- **Explicit validation**: Apps control when validation occurs
- **Token reuse**: Works with existing/cached tokens
- **User data access**: Only available after validation

```typescript
// Immediately after creation
service.isAuthenticated(); // May be true (static/confidential) or false (public)
service.isValidated(); // Always false initially
service.getCurrentUser(); // Always undefined initially

// After validation
await service.validateToken();
service.isValidated(); // true if token is valid
service.getCurrentUser(); // UserRef if validation succeeded
```

## Integration

This package is typically used through `@palantir/pack.app`'s `initPackApp()` function, which automatically creates the appropriate service based on the OSDK client's authentication:

```typescript
import { createClient } from "@osdk/client";
import {
  createConfidentialOauthClient,
  createPublicOauthClient,
} from "@osdk/oauth";
import { initPackApp } from "@palantir/pack.app";

// Public OAuth (browser apps)
const publicAuth = createPublicOauthClient(
  "your-client-id",
  "https://your-foundry-instance.com",
  "http://localhost:3000/callback",
);
const publicClient = createClient(baseUrl, ontologyRid, publicAuth);
const app = initPackApp(publicClient, { app: { appId: "your-app" } });

// Static token (CLI/service)
const tokenProvider = () => Promise.resolve("your-token");
const tokenClient = createClient(baseUrl, ontologyRid, tokenProvider);
const app = initPackApp(tokenClient, { app: { appId: "your-app" } });

// Confidential OAuth (server apps)
const confidentialAuth = createConfidentialOauthClient(
  "your-client-id",
  "your-client-secret",
  "https://your-foundry-instance.com",
);
const confidentialClient = createClient(baseUrl, ontologyRid, confidentialAuth);
const app = initPackApp(confidentialClient, { app: { appId: "your-app" } });

// Override auth with custom token provider
const app = initPackApp(client, {
  app: { appId: "your-app" },
  auth: customTokenProvider, // Override client's auth
});
```

The services handle platform-specific details like:

- OAuth flow management
- Token refresh and expiration
- Platform API integration for validation
- User data fetching and caching
- State change notifications

## Platform APIs

Token validation uses the Foundry platform API:

- **Endpoint**: `${baseUrl}/multipass/api/users/me`
- **Purpose**: Verify token validity and fetch user information
- **Caching**: User data cached for 5 minutes via UserRef
- **Error handling**: Network errors and invalid tokens handled gracefully
