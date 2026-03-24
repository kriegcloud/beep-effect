# @repo/domain

Shared types and schemas for the [bEvr stack](../../README.md), built with
Effect Schema.

## Overview

This package provides type-safe schemas and utilities shared between the client
and server applications. Uses Effect Schema for runtime validation and type
generation.

## Features

- **Effect Schema Integration** - Runtime validation with compile-time types
- **Shared Types** - Common interfaces used across apps
- **Type Safety** - End-to-end type safety from client to server
- **Functional Programming** - Built with Effect ecosystem patterns

## Usage

Import schemas in your apps:

```typescript
// In client or server
import { ApiResponse } from "@repo/domain/Api";

// Use types for API communication
const response: ApiResponse = await fetchData();

// Use schemas for validation
const valid = Schema.decodeUnknownSync(ApiResponse)(value);
```

## Structure

```txt
src/
├── Api.ts       # HttpApi definitions (REST endpoints)
├── Chat.ts      # Chat schemas and events
├── Rpc.ts       # RPC definitions (HTTP streaming)
└── WebSocket.ts # WebSocket RPC definitions (real-time)
```

## Learn More

- [Effect Schema Documentation](https://effect.website/docs/schema)
- [bEvr Stack Overview](../../README.md)
