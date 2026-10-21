# @beep/public-site

Public origin and reserved site routes for beep-effect.com.

## Surface

- See `src/index.ts` barrel — do not hand-maintain inventory tables here.

## Laws

- Root `AGENTS.md` and `standards/ARCHITECTURE.md` govern this package; record only genuinely package-specific deltas here.
- Apex law: `https://beep-effect.com` hosts ring-0 projections of the public substrate only. `/ns/` is reserved forever for identity dereference; `/taxonomy` is its discovery projection. Services and authenticated instances go on subdomains and are not modeled here.
- Reserved v1 routes: `/ns`, `/taxonomy`, `/docs`, `/api`, `/storybook`, `/llms.txt`, `/mcp`, `/labs/<name>`, `/goals`, `/explorations`, `/research`, `/.well-known/*`, `/sitemap.xml`. Adding or removing a route is a doctrine change (standards/architecture/DECISIONS.md), not a code edit alone.
- Ownership: hosted URLs come from this package (`hostedUrl`, `labRoute`); IRIs come from `@beep/identity`. Never write either as a string literal elsewhere; the `retired-iri-authorities` law allows the origin literal only here and in `@beep/identity`.
- This package depends on `@beep/identity`, never the reverse. Keep the drift test (`hostedUrl("ns") + "/"` equals the identity authority) green.
- Hosting is schema-typed configuration. Never read the environment here, and keep `src/` browser-safe (no `node:*`).
- Before handing back a change, run `bun run beep quality package-verify @beep/public-site` from the repository root. Use `--quick` only for a justified lint+check subset; a failure arms the checkout's shared P0 inbox.
