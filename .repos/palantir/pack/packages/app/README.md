# @palantir/pack.app

Main PACK interface package providing the primary entry point for initializing PACK applications.

## Overview

This package provides the main interface for PACK applications, including initialization functions and core type definitions. It contains the application setup logic and re-exports essential types from `@palantir/pack.core`.

## Key Exports

- `initPackApp` - Function to initialize an PACK application instance
- `PackApp` - Type definition for PACK application instances

## Usage

### Basic Usage

```typescript
import { createClient } from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";
import { initPACKApp } from "@palantir/pack.app";

// First, create an OSDK client with your authentication
const auth = createPublicOauthClient(
  "your-client-id",
  "https://your-foundry-instance.com",
  "https://yourapp.com/callback",
);

const client = createClient(
  "https://your-foundry-instance.com",
  "ri.ontology.main.ontology.your-ontology",
  auth,
);

// Then initialize PACK with the client
const app = initPackApp(client, {
  app: {
    appId: "your-app-id",
    appVersion: "1.0.0",
  },
});
```

### Authentication Options

```typescript
import {
  createConfidentialOauthClient,
  createPublicOauthClient,
} from "@osdk/oauth";

// Public OAuth (browser apps)
const publicAuth = createPublicOauthClient(
  "your-client-id",
  "https://your-foundry-instance.com",
  "https://yourapp.com/callback",
);

// Confidential OAuth (server apps)
const confidentialAuth = createConfidentialOauthClient(
  "your-client-id",
  "your-client-secret",
  "https://your-foundry-instance.com",
);

// Static token (CLI/service)
const tokenProvider = () => Promise.resolve("your-token");

// Create client with chosen auth method
const client = createClient(baseUrl, ontologyRid, auth);

// Optional: Override auth in PACK options
const app = initPackApp(client, {
  app: { appId: "your-app" },
  auth: customTokenProvider, // Override client's auth
});
```

## Dependencies

This package depends on `@palantir/pack.core` for its core functionality and provides the main application interface layer.
