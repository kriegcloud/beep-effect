---
root: true
targets: ["**"]
description: "Core agent instructions"
globs: ["**"]
---

# Agent Instructions

Use command first discovery:

- `bun run beep docs laws`
- `bun run beep docs skills`
- `bun run beep docs policies`
- `bun run beep docs find <topic>`

Core expectations:

1. Keep code clear, direct, and maintainable.
2. Prefer Effect first patterns required by repository law.
3. Avoid unsafe typing escapes and untyped runtime errors.
4. Keep domain logic free of disallowed native utilities.
5. Keep comments minimal unless they explain non obvious intent.
6. Complete work only when check, lint, test, and docgen pass.

Validation loop:

- Run `pnpm lint-fix` after edits.
- Run `pnpm check`.
- Run `pnpm test` for affected scope.
- Run `pnpm build` when build outputs are affected.
- Run `pnpm docgen` when exported APIs change.

Pathless config rule:

- Keep agent instruction text lightweight and pathless.
- Use command names in guidance, not file links or module paths.
