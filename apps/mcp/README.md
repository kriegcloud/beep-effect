# @beep/mcp

Effect-first Model Context Protocol (MCP) server scaffold for the Beep monorepo. This workspace is where repository-aware MCP tools will live so editors and agents can call into Effect-powered services without leaking platform concerns.

## What lives here
- `src/server.ts` — entrypoint scaffold demonstrating how to wrap an `@effect/ai` toolkit with `McpServer` and `@effect/platform-bun` HTTP hosting on `/mcp`. The sample is commented until a concrete toolset is ready.
- `build/` — compiled ESM output + type declarations from `bun run build`.
- `test/Dummy.test.ts` — placeholder Bun test to keep the pipeline wired.
- `tsconfig*.json` — build/test/IDE configs; `tsconfig.build.json` drives the published output.

## Running locally
- Environment: set `APP_MCP_URL` in `.env` (defaults to `http://localhost:8081` in `.env.example`) and keep it listed in `SECURITY_TRUSTED_ORIGINS` alongside app/auth URLs.
- Dev server (watch): `bun run dev --filter=@beep/mcp` — runs `tsx watch src/server.ts`.
- Typecheck: `bun run check --filter=@beep/mcp`.
- Lint: `bun run lint --filter=@beep/mcp` (or `lint:fix` to apply Biome fixes).
- Circular refs audit: `bun run lint:circular --filter=@beep/mcp`.
- Tests: `bun run test --filter=@beep/mcp` (coverage via `coverage` script).
- Build: `bun run build --filter=@beep/mcp`, then `bun run start --filter=@beep/mcp` to boot the compiled server once a toolkit is implemented.

## Implementation notes
- Host path is expected to remain `/mcp` so clients can connect via `APP_MCP_URL/mcp`. If you change it, update `packages/core/env` consumers and CSP/trusted origins.
- Prefer Bun runtime hosting via `NodeHttpServer.layer` and `Layer.launch`, mirroring the commented scaffold. Avoid ad hoc `http.createServer` usage outside the Effect platform abstractions.
- Add MCP tools via `@effect/ai` `AiToolkit` + `AiTool` definitions with Schema-backed parameters/success types; keep them pure and telemetry-friendly so downstream logging layers can decorate results.

