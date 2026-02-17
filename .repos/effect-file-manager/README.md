# Effect Files Example

A demonstration of file uploads with UploadThing and Effect (WebSocket RPC, real-time events).

## Overview

- File uploads via UploadThing presigned URLs
- Real-time file sync via WebSocket events
- Folder organization for files
- Effect-based RPC over WebSocket (NDJSON serialization)
- React client with @effect-atom/atom-react for state management
- OpenTelemetry tracing with Jaeger

## Getting Started

**Prerequisites:** Node.js 22.x, pnpm 10.x, Docker

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in UPLOADTHING_SECRET with your UploadThing API key

# Start PostgreSQL and Jaeger
docker compose up -d

# Run database migrations
pnpm db:migrate

# Start development servers (in separate terminals)
pnpm dev:server  # http://localhost:3001
pnpm dev:client  # http://localhost:5173
```

Jaeger UI is available at http://localhost:16686 for tracing.

## Project Structure

```
packages/
  domain/   # Shared types, schemas, and RPC definitions
  server/   # Node.js server with Effect
  client/   # React client with Vite
```

## License

MIT
