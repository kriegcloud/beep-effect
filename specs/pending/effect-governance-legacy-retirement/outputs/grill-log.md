# Grill Log

- This package starts **after** the earlier `effect-governance-replacement` package reached `full replacement`.
- Treat `lint:effect-governance` as already-authoritative. Do not reopen that verdict inside this package.
- Keep the Effect lane separate from the JSDoc and TSDoc lane.
- Do not assume repo-wide ESLint removal is required for success.
- Build an explicit live inventory of the remaining legacy surface before ranking retirement options.
- Treat root scripts, Turbo metadata, `@beep/repo-configs`, `@beep/repo-cli`, and stale docs or trust references as separate retirement buckets.
- Allow three honest end states only:
  - `full retirement`
  - `minimal shim retained`
  - `no-go yet`
- P0, P1, and P2 are read-only outside this spec package.
- P2 must choose one retirement posture before any repo mutations happen.
- P4 must verify retirement against the locked inventory and remove-or-retain matrix rather than inventing fresh targets late.
