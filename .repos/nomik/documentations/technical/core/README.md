# @nomik/core

Shared infrastructure, types, and configuration for all NOMIK packages.

## Key Components

### 1. Types (`src/types/`)
- **`nodes.ts`**: Defines the `GraphNode` discriminated union (`FileNode`, `FunctionNode`, `ClassNode`, etc.).
- **`edges.ts`**: Defines `GraphEdge` types (`CONTAINS`, `CALLS`, `IMPORTS`, etc.).

### 2. Configuration (`src/config/`)
- Uses `zod` for runtime validation of `nomik.config.ts`.
- Supports environment variables via `dotenv-flow`.
- **`defineConfig`**: Helper for type-safe configuration in consumer projects.

### 3. Error Handling (`src/errors/`)
- **`NomikError`**: Base class for all system errors.
- **`ParseError`**: Tree-sitter parsing failures.
- **`GraphConnectionError`**: Neo4j connectivity issues.

### 4. Logger (`src/logger/`)
- Wraps `pino` for structured JSON logging.
- Configurable via `LOG_LEVEL` env var.
