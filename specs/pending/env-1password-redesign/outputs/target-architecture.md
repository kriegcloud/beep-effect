# Target Architecture

## Goal
A local env model that is:
- secure by default,
- easy to read/maintain,
- compatible with existing local workflows,
- free from interpolation chains.

## Design Decisions

### ENV-ADR-001: Local Secret Injection via 1Password CLI
Use `op run --env-file=.env -- <command>` as the canonical execution model for local development commands requiring secrets.

Rationale:
- avoids embedding secret retrieval in app code,
- aligns with shell/script workflows,
- minimizes migration complexity.

### ENV-ADR-002: Canonical `.env.example` is Required and Tracked
Maintain a committed root `.env.example` containing:
- namespace-grouped variables,
- section comments/ASCII blocks,
- non-secret placeholders only.

### ENV-ADR-003: Ban Interpolation in Canonical Env Files
No `${...}` interpolation in canonical env files.

Replacement policy:
- keep explicit literal values for local URLs/ports,
- compute derived values in runtime code/scripts where needed,
- avoid implicit coupling between keys.

### ENV-ADR-004: Keep Pretty Format as a Contract
Formatting (section headers, comments, grouping) is part of the maintainability contract.

Bootstrap/update tooling must preserve:
- section ordering,
- comments,
- spacing style.

## Proposed Section Taxonomy
1. `APP_*` core
2. logging + observability
3. data stores (`DB_PG_*`, `KV_REDIS_*`)
4. auth + oauth providers
5. cloud/integration providers
6. MCP/AI integration keys
7. public client-safe keys (`NEXT_PUBLIC_*`)

## Command Strategy (Draft)
- `op run --env-file=.env -- bun run services:up`
- `op run --env-file=.env -- bun run test`
- `op run --env-file=.env -- bun run build`

Final wrapper decisions are locked in Phase 2 after command-matrix review.
