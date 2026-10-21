# Cache baseline review: wave 1b

Reviewed 2026-10-21 for wave 1b of `goals/effected-promotion` (SPEC D-23 to D-25).

`bun run beep quality cache-policy` reported 129 blocking findings, all introduced
by this branch (the `origin/main` baseline checkout reports none):

- Unreviewed expansions for the six new workspaces, eight task tuples each
  (`#build`, `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`,
  `#lint:jsdoc`, `#lint:laws`, `#test`): `@beep/toml`, `@beep/yaml`,
  `@beep/glob`, `@beep/managed-section`, `@beep/git` and `@beep/memfs`.
- Configuration drift on the seventeen consumers that D-25 moved from
  `@beep/test-utils/MemoryFileSystem` to `@beep/memfs/MemoryFileSystem`:
  `@beep/ai-sync`, `@beep/docket-intake`, `@beep/exiftool`, `@beep/jsonl`,
  `@beep/law-practice-server`, `@beep/mcpb-kit`, `@beep/observability`,
  `@beep/ontology`, `@beep/practice-gateway`, `@beep/practice-kg-mcp`,
  `@beep/practice-mail-tagging`, `@beep/practice-setup`,
  `@beep/professional-desktop`, `@beep/repo-ai-metrics`, `@beep/repo-cli`,
  `@beep/repo-utils` and `@beep/workspace-server`. Each drifted tuple
  (`#build`, `#check`, `#lint:deprecated-apis`, `#test`, plus `#doctest` and
  `#test:property` where the package has them) follows from the new
  `@beep/memfs` workspace dependency in its manifest; no command, input,
  output or cache flag changed.

No root (`//`) expansion or drift was reported.

Each new workspace was scaffolded by `bun run beep create-package`
(foundation/modeling for toml, yaml, glob and managed-section; drivers for git;
tooling/test-kit for memfs). Its scripts block is the generated task set, and
none carries a `turbo.json`, as the library scaffold emits none.

Recording these subjects accepts the existing posture for the six new
workspaces and the dependency-only drift of the seventeen consumers. No
qualification is granted, and no other subject changes.
