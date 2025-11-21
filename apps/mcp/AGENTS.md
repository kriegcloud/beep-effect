# AGENTS.md — `apps/mcp`

## Purpose & Fit
- Hosts the Model Context Protocol (MCP) server for the monorepo, wiring `@effect/ai` toolkits behind an Effect/Bun HTTP host on `/mcp`.
- Intended to expose repository-aware tools (e.g., docs lookups, runtime introspection) to local editors and agent clients without touching app/web runtimes.
- Keeps the MCP URL (`APP_MCP_URL`) aligned with CSP/trusted-origin config surfaced from `@beep/core-env`.

## Surface Map
- `src/server.ts` — entrypoint scaffold showing how to build an `AiToolkit`, register it with `McpServer.toolkit`, and host via `HttpRouter` + `NodeHttpServer`. The content is currently commented until a concrete toolset ships.
- `package.json` — scripts for dev/build/lint/test and `@effect/*` dependencies that underpin the MCP layer.
- `tsconfig.build.json` / `tsconfig.test.json` — targeted compiler configs for emitted artifacts and Bun tests.
- `build/` — generated ESM + d.ts output from `bun run build`; `start` reads from here.
- `test/Dummy.test.ts` — placeholder Bun test to preserve the pipeline wiring.

## Runtime & Env Notes
- `APP_MCP_URL` is read by `packages/core/env/src/server.ts` and should match the HTTP host exposed by this app (default `http://localhost:8081`). Keep it listed in `SECURITY_TRUSTED_ORIGINS`.
- Host path should remain `/mcp` unless coordinated with consumers; changing it requires env/CSP updates across the stack.
- Prefer Bun hosting via `NodeHttpServer.layer(createServer, { port })` when materializing the server layer; avoid ad hoc Node HTTP plumbing.

## Tooling & Docs Shortcuts
- Commands from repo root (preferred): `bun run dev --filter=@beep/mcp`, `bun run check --filter=@beep/mcp`, `bun run lint --filter=@beep/mcp`, `bun run test --filter=@beep/mcp`, `bun run build --filter=@beep/mcp`, `bun run lint:circular --filter=@beep/mcp`.
- Audit env consumers: `jetbrains__search_in_files_by_text` `{ "projectPath": "/home/elpresidank/YeeBois/projects/beep-effect", "searchText": "APP_MCP_URL", "maxUsageCount": 20 }`.
- Effect AI / MCP APIs: resolve via `context7__resolve-library-id` with `"effect"` or search `effect_docs__effect_docs_search` for `McpServer` / `AiToolkit` to refresh signatures before implementing new tools.

## Authoring Guardrails
- Namespace all Effect imports (`import * as Effect from "effect/Effect"` etc.) and obey the no-native-array/string rule from the root guardrails when implementing tool handlers (use `effect/Array`, `effect/String`, `effect/Function`).
- Schema definitions must use PascalCase constructors (`S.Struct`, `S.Array`, `S.Literal`)—no lowercase schema helpers.
- Keep tool implementations pure and telemetry-friendly; avoid side effects outside Effect and log via structured `Effect.log*` if needed.
- Compose layers with `Layer.mergeAll` / `Layer.provide` rather than manual server bootstrapping so observability layers can be added cleanly later.
- Align any port/path changes with `APP_MCP_URL` and downstream security headers before committing.

## Quick Recipe (minimal toolkit host)
```ts
import { createServer } from "node:http";
import * as AiTool from "@effect/ai/AiTool";
import * as AiToolkit from "@effect/ai/AiToolkit";
import * as McpServer from "@effect/ai/McpServer";
import * as HttpRouter from "@effect/platform/HttpRouter";
import * as NodeHttpServer from "@effect/platform-bun/NodeHttpServer";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

const Ping = AiTool.make("Ping", {
  description: "MCP liveness probe",
  parameters: S.Struct({}),
  success: S.Struct({ message: S.Literal("pong") }),
  failure: S.Never,
});

const PingToolkit = AiToolkit.make(Ping);

const pingToolkitLayer = PingToolkit.toLayer({
  Ping: () => Effect.succeed({ message: "pong" }),
});

const ServerLayer = Layer.mergeAll(McpServer.toolkit(PingToolkit), HttpRouter.Default.serve()).pipe(
  Layer.provide(
    McpServer.layerHttp({
      name: "Beep MCP",
      version: "0.1.0",
      path: "/mcp",
    })
  ),
  Layer.provide(pingToolkitLayer),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 8081 }))
);

Layer.launch(ServerLayer).pipe(BunRuntime.runMain);
```

## Verifications
- `bun run check --filter=@beep/mcp` — TypeScript project references stay healthy.
- `bun run lint --filter=@beep/mcp` — Biome guardrails (Effect imports + formatting).
- `bun run test --filter=@beep/mcp` — Bun tests (currently placeholder).
- `bun run build --filter=@beep/mcp` — Ensures emitted `build/` artifacts stay in sync with sources.

## Contributor Checklist
- [ ] Updated `APP_MCP_URL` docs and `SECURITY_TRUSTED_ORIGINS` if host/port/path changed.
- [ ] New toolkits define Schema-backed parameters and results; no native array/string helpers in handlers.
- [ ] Layers compose via `Layer.mergeAll` / `Layer.provide`; no manual `http.createServer`.
- [ ] Added or refreshed tests if behavior changed.
- [ ] Ran the verification commands above (or requested the user to run them) before handoff.
