# beep-effect

Effect v4 monorepo. `bun` package manager. Turborepo build system.

Verification sources:

- Effect v4 API: `.repos/effect-smol/packages/effect/src/`
- Knowledge graph: `graphiti-memory` MCP tool (requires active MCP registration and session availability)
- Migration guides: `.repos/effect-smol/migration/`

# CODEBASE LAWS v1 (Compact)

Detailed guidance lives in [standards/effect-laws-v1.md](./standards/effect-laws-v1.md).

1. Use `A/O/P/R/S` aliases only: `effect/Array`, `Option`, `Predicate`, `Record`, `Schema`.
2. For other stable modules, prefer root imports from `"effect"`; `effect/unstable/*` is allowed.
3. No `any`, type assertions, `@ts-ignore`, or non-null assertions.
4. No runtime `typeof ... === ...`; use `effect/Predicate`.
5. No native `Object/Map/Set/Date/Error/String/Array/JSON` in domain logic; boundary-only via allowlist.
6. JSDoc required for exported APIs in package/tooling source; examples must pass docgen.
7. Exceptions require allowlist entry with `reason`, `owner`, `issue`, optional `expiresOn`.
8. Do not finish work with failing `check`, `lint`, `test`, or `docgen`.
