# Cache baseline review: wave 2d-2

Reviewed 2026-10-23 for wave 2d-2 of `goals/effected-promotion` (SPEC D-44,
D-48 to D-51).

`bun run beep quality cache-policy` reported 6 blocking findings, all
introduced by this branch and all of one kind: configuration drift for
`@beep/md`, on six task tuples (`#build`, `#check`, `#doctest`,
`#lint:deprecated-apis`, `#test`, `#test:property`), and, after the policy
fingerprint was regenerated, one more on `//#lint:policy-fingerprint`.

The cause is one manifest edit. `@beep/md` gains `@beep/markdown` as a
workspace dependency for the subpath-only syntax bridge (`./Md.syntax`,
`./Md.parse`), plus the two `exports` and `publishConfig.exports` keys. Its
scripts block is unchanged (`bun run beep lint package-scripts` reports 0
drifting manifests), and it adds no third-party dependency. The
`tsconfig.json` project reference to `../markdown`, the
`tsconfig.check.json` and `vitest.config.ts` wiring, the root
`tsconfig.json`, `vitest.aliases.generated.json`,
`standards/fallow.boundaries.generated.jsonc` and `bun.lock` edits only
record that new workspace edge.

The root (`//`) changed too. `@beep/repo-cli` depends on `@beep/md`, so the
policy-tool input set that `bun run beep lint policy-fingerprint --write`
derives from repo-cli's workspace closure gains the `package.json` and
`src/**` globs of `@beep/markdown`, `@beep/yaml`, `@beep/toml` and
`@beep/jsonc`. That regenerates `standards/policy-tools.fingerprint.json`
and the `//#lint:policy-fingerprint` inputs in `turbo.json` (8 globs each),
which `cache-policy` reports as one configuration drift on
`//#lint:policy-fingerprint`. No other root task changes.

## Turbo coupling (review correction 9)

Measured on this branch against `origin/main` 83e7243e9e by walking the
workspace dependency closure of every `@beep/*` manifest, which is the graph
Turbo's `^build` dependency follows:

- `@beep/md` has 17 direct and 53 transitive workspace dependents.
- 52 of the 53 gain `@beep/markdown`, `@beep/yaml`, `@beep/toml` and
  `@beep/jsonc` as new upstream packages: 208 new upstream edges, and no
  other package enters any closure. The 53rd, `@beep/scratchpad`, already
  depended on `@beep/markdown`.
- Spot check: `turbo run check --filter=@beep/skill-contract --dry=json` now
  plans 16 tasks, including `@beep/markdown#build`, `@beep/yaml#build`,
  `@beep/toml#build` and `@beep/jsonc#build`.

The cost is cache invalidation: an edit to any of the four packages now
reruns `build`, `check`, `test` and `coverage` in those 52 dependents. Since
the four packages landed (2026-10-20), `origin/main` has 156 commits. 10 of
them touched the source or manifest of one of the four packages without
touching `@beep/md`, against 3 that touched `@beep/md`. Under this branch,
those 10 would also have invalidated the 52 dependents: 6.4% of main
commits, measured during the promotion burst, when the four packages were
being converted.

SPEC D-50 sets the threshold: if, in the 30 days after wave 2d-3 merges,
commits that touch the four packages but not `@beep/md` exceed 5% of
`origin/main` commits, the bridge moves to its own package through a D-02
amendment. The burst figure is recorded for comparison and is not that
measurement.

Recording these subjects accepts the existing posture with the new dependency
edge. No qualification is granted, and no other subject changes.
