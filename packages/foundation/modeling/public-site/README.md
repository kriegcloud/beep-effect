# @beep/public-site

Public origin and reserved site routes for beep-effect.com.

`beep-effect.com` is the single public origin for everything developer- and
agent-facing that this repository projects. This package owns the hosting map:
the origin literal, the reserved route table, and typed constructors for hosted
URLs.

## The apex law

- The apex `https://beep-effect.com` hosts ring-0 projections of the public
  substrate only.
- `/ns/` is reserved forever for identity dereference. `/taxonomy` is its HTML
  discovery projection; dereference and discovery stay separate.
- Subdomains are for services and instances that are not projections (a
  practice instance, the proxy, anything authenticated). They are not modeled
  here.
- `www` redirects to the apex (infrastructure, not code).

## Reserved routes (v1)

Reserved now, deployed later by per-surface goals.

| Route | Kind | Hosts |
| --- | --- | --- |
| `/ns` | nested path | identity dereference (exact registry) |
| `/taxonomy` | nested path | HTML discovery projection of `/ns` |
| `/docs` | nested path | package documentation |
| `/api` | nested path | Scalar docs for every HttpApi contract (today `apps/labs/api-docs`) |
| `/storybook` | nested path | Storybook |
| `/llms.txt` | file | agent index |
| `/mcp` | nested path | MCP surface |
| `/labs/<name>` | lab | hosted projection of `apps/labs/<name>` via `labRoute` |
| `/goals` | nested path | goal packet projections |
| `/explorations` | nested path | exploration packet projections |
| `/research` | nested path | research projections |
| `/.well-known/*` | nested path | origin-scoped well-known resources |
| `/sitemap.xml` | file | sitemap |

Labs keep the `/labs` segment so nothing lab-grade reads as official. `<name>`
is the portless name with `.labs.beep.localhost` stripped.

## Ownership

- Hosted URLs come from `@beep/public-site` (`hostedUrl`, `labRoute`).
- IRIs come from `@beep/identity` (`$I` and its composers).
- Never write either as a string literal elsewhere. The
  `retired-iri-authorities` law rejects `https://beep-effect.com` literals in
  code outside `@beep/identity` and `@beep/public-site`.
- `@beep/public-site` depends on `@beep/identity`, never the reverse. A test
  here asserts `hostedUrl("ns") + "/"` equals the identity authority so the two
  literals cannot drift.

## Usage

```ts
import { hostedUrl, labRoute } from "@beep/public-site"

hostedUrl("docs") // "https://beep-effect.com/docs"
hostedUrl("docs", "identity/Id") // "https://beep-effect.com/docs/identity/Id"
hostedUrl("llms.txt") // "https://beep-effect.com/llms.txt"
labRoute("api-docs.labs.beep.localhost") // "https://beep-effect.com/labs/api-docs"
```

Return types are the exact URL templates. File routes and `labs` take no path at
the type level. Literal lab names are checked as DNS labels at the type level;
decode dynamic names through `LabPortlessName` first.

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Integration test
bun run test:integration

# Lint
bun run lint:fix
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/public-site` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
