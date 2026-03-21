# bEvr Stack

A modern full-stack TypeScript monorepo with end-to-end type safety, using Bun,
Effect, Vite, and React. Heavily inspired by the [bhvr](https://bhvr.dev/) stack
but the addition of Effect and Turborepo. Includes a Model Context Protocol
(MCP) server for AI assistant integrations.

![screenshot of client app](./e2e/smoke.spec.ts-snapshots/app-layout-chromium-darwin.png)

## Features

- **End-to-end TypeScript**: Full type safety from client to server
- **Shared Domain**: Common types and utilities across all apps
- **Effect Integration**: Built for composable, functional programming with
  [Effect](https://effect.website)
- **MCP Server**: [Model Context Protocol](https://modelcontextprotocol.io/)
  server for AI assistant tools and resources
- **Modern Tooling**: [Turborepo](https://turbo.build/), [Bun](https://bun.sh/),
  [Vite](https://vitejs.dev/), and [React](https://react.dev/)
- **Zero Config**: Pre-configured linting and formatting with
  [Biome](https://biomejs.dev)
- **Flexible Deployment**: Deploy anywhere without vendor lock-in

## Quick Start

```bash
# Install dependencies
bun install

# Start development
bun dev

# Build for production
bun run build
```

### Formatting and Linting

Format and lint the codebase using Ultracite:

```bash
# Format code
bun format

# Lint code
bun lint

# Type check
bun run type-check
```

### Testing

Run tests across the monorepo:

```bash
# Run all unit tests
bun run test

# Run tests for specific apps
bun run test --filter=client
bun run test --filter=server

# Run E2E and visual regression tests
bun run test:e2e

# Update visual regression baselines
bun run test:e2e -- --update-snapshots
```

### Test Stack

- **Client**: Vitest 4.x with Browser Mode (Playwright), vitest-browser-react
- **Server**: Vitest 4.x with Node environment, @effect/vitest
- **E2E**: Playwright with visual regression testing

### CI/CD Workflows

| Workflow       | Trigger   | Purpose                       |
| -------------- | --------- | ----------------------------- |
| `check-client` | PR + main | Fast: lint, types, unit tests |
| `check-server` | PR + main | Fast: lint, types, unit tests |
| `post-merge`   | main only | Slow: E2E, visual regression  |

Visual regression baselines are stored in `e2e/smoke.spec.ts-snapshots/` and
should be committed to git. Update them when UI changes are intentional.

## Project Structure

```txt
.
├── apps/
│   ├── client/             # React frontend (Vite + React)
│   ├── server/             # Bun + Effect backend API
│   └── server-mcp/         # Model Context Protocol server
├── e2e/                     # Playwright end-to-end tests
├── packages/
│   ├── ai/                 # AI services and toolkits
│   ├── config-typescript/  # TypeScript configurations
│   ├── domain/             # Shared Schema definitions
│   ├── observability/      # OpenTelemetry setup
│   └── presence/           # Presence tracking service
├── docker-compose.yaml     # Docker Compose configuration for deployment
├── package.json            # Root package.json with workspaces
└── turbo.json              # Turborepo configuration
```

### Apps

| App          | Description                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `client`     | A [React](https://react.dev) app built with [Vite](https://vitejs.dev)                                          |
| `server`     | A [Effect Platform](https://effect.website) backend API                                                         |
| `server-mcp` | A [Model Context Protocol](https://modelcontextprotocol.io/) server built with [Effect](https://effect.website) |

### Packages

| Package                   | Description                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@repo/config-typescript` | TypeScript configurations used throughout the monorepo                                                             |
| `@repo/domain`            | Shared Schema definitions using [Effect Schema](https://effect.website/docs/schema) used by both client and server |
| `@repo/ai`                | AI tooling and service layers built on [@effect/ai](https://github.com/tim-smart/effect-io-ai)                     |
| `@repo/observability`     | Shared OpenTelemetry setup                                                                                         |
| `@repo/presence`          | Presence tracking service for WebSocket clients                                                                    |

## Development

```bash
# Start development server
bun dev
# Run specific app
bun dev --filter=client
bun dev --filter=server
bun dev --filter=server-mcp


# Build all apps
bun run build

# Test MCP server functionality (MCPJam Inspector)
bun --filter=server-mcp run inspector
```

## Deployment

To run the application using Docker, you can use the provided
`docker-compose.yaml` file.

First, ensure you have Docker and Docker Compose installed on your system.

Then, run the following command to build and start the services in the
background:

```bash
docker-compose up -d --build
```

This will start all three services: `client`, `server`, and `server-mcp`.

### Environment Variables

You can configure the deployment using environment variables:

```bash
# Example .env file
CLIENT_PORT=3000
SERVER_PORT=9000
MCP_PORT=9009
```

## Type Safety

Import shared types from the domain package:

```typescript
import { ApiResponse } from "@repo/domain/Api";
```

## Learn More

- [Turborepo](https://turborepo.com/docs)
- [Effect](https://effect.website/docs/introduction)
- [Vite](https://vitejs.dev/guide/)
