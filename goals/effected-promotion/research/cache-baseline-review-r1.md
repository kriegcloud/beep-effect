# Cache baseline review: roadmap PR R1

Reviewed 2026-10-23 for roadmap PR R1 of `goals/effected-promotion` (the semver owner switch, W4-h).

`bun run beep quality cache-policy` reported 10 blocking findings, all
introduced by this branch and all of one kind: configuration drift for
`@beep/repo-cli` on six task tuples (`#build`, `#check`, `#doctest`,
`#lint:deprecated-apis`, `#test`, `#test:property`) and for
`@beep/repo-configs` on four (`#check`, `#lint:deprecated-apis`, `#test`,
`#test:property`).

The cause is two manifest edits, one line each. `@beep/repo-cli` gains
`@beep/semver` as a workspace dependency, because the VersionSync
`BunResolver` and `DockerResolver` now parse and order versions with
`SemVer`. `@beep/repo-configs` gains it because `CacheClientPin.version`
is now `SemVer.PinnableVersionString`. Neither scripts block changes
(`bun run beep lint package-scripts` reports 0 drifting manifests), and no
third-party dependency is added. The `tsconfig.json` and
`tsconfig.check.json` project references to `semver`,
`standards/fallow.boundaries.generated.jsonc` and `bun.lock` edits only
record those two workspace edges.

The root (`//`) does not change. `bun run beep lint policy-fingerprint
--write` leaves `standards/policy-tools.fingerprint.json` byte-identical:
repo-cli already reached `@beep/semver` through `@beep/github`, so its
fingerprinted closure gains no glob.

## Turbo coupling

Measured on this branch after merging `origin/main` 6f25dd7c4d (and before that against 9846549000 and the base 6c0bb54d55, with the same result each time), by walking the
workspace dependency closure (dependencies, devDependencies, peer and
optional, `workspace:` specifiers only) of every manifest:

- `@beep/repo-cli`: no new upstream package. `@beep/semver` was already in
  its closure through `@beep/github`.
- `@beep/repo-configs` gains one upstream package, `@beep/semver`, whose own
  dependencies (`@beep/identity`, `@beep/schema`) it already had.
- Its dependents `@beep/oip-web` and the root workspace gain the same one
  edge. No other workspace's closure grows.

Three closures grow by one package each; nothing else moves.

Recording these subjects accepts the existing posture for the two edited
manifests. No qualification is granted, and no other subject changes.
