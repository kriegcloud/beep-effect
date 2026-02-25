# CODEBASE LAWS V1

Command first discovery:

- `bun run beep docs laws`
- `bun run beep docs skills`
- `bun run beep docs policies`
- `bun run beep docs find <topic>`

Core rules:

1. Use Effect first APIs and canonical aliases required by repository law.
2. No any, no type assertions, no ts ignore, and no non null assertions.
3. Avoid direct runtime type checks when Predicate based checks exist.
4. Keep domain logic free of native mutable containers and native date, error, json, and string utilities except approved boundaries.
5. In tooling source, use typed schema based errors.
6. Exported APIs require jsdoc and docgen clean examples.
7. Exceptions require allowlist metadata with reason, owner, and issue context.
8. Do not complete work with failing check, lint, test, or docgen.
9. Keep agent instruction text pathless and run `bun run agents:pathless:check` after editing agent config surfaces.
