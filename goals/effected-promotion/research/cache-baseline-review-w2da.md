# Cache baseline review: wave 2d-A

Reviewed 2026-10-23 for wave 2d-A of `goals/effected-promotion` (SPEC D-46,
D-47).

`bun run beep quality cache-policy` reported 12 blocking findings and one
review finding. All of them are introduced by this branch, and all are
configuration drift from two manifest edits plus their generated projections:

- `@beep/repo-cli` (`#build`, `#check`, `#doctest`, `#lint:deprecated-apis`,
  `#test`, `#test:property`): `package.json` gains the dependency
  `"@beep/markdown": "workspace:^"`, because the four adopted sites import
  `@beep/markdown/FrontmatterSource`, `MarkdownDocument` and `MarkdownNode`.
  `tsconfig.json` and `tsconfig.check.json` gain the matching project
  reference through `bun run beep tsconfig-sync`.
- `@beep/skill-contract` (`#build`, `#check`, `#doctest`,
  `#lint:deprecated-apis`, `#test`): the same dependency and references,
  because `SkillProjection.ts` imports `@beep/markdown/FrontmatterSource`.
- `//#lint:policy-fingerprint` and the `turbo.json` review finding:
  `bun run beep lint policy-fingerprint --write` adds
  `packages/foundation/modeling/{markdown,jsonc,toml,yaml}/{package.json,src/**}`
  to the policy-tool input set in `standards/policy-tools.fingerprint.json`
  and the task's `inputs` in `turbo.json`. repo-cli is a policy tool, and
  `@beep/markdown` with its codec dependencies `@beep/jsonc`, `@beep/toml`
  and `@beep/yaml` is now in its runtime closure.

No script word changes in either manifest (`bun run beep lint package-scripts`
reports 0 drifting manifests), no third-party dependency is added, and every
new edge points at a workspace package already in the graph. `bun.lock` and
`standards/fallow.boundaries.generated.jsonc` only record the two new edges.

Recording these subjects accepts the existing posture for the changed task
identities. No qualification is granted, and no other subject changes.
