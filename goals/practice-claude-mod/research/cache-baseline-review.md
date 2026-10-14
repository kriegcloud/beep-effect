# Cache baseline review: `@beep/practice-claude-mod`

Reviewed 2026-10-14 for the first-slice PR of `goals/practice-claude-mod`.

`bun run beep quality cache-policy` reported the new workspace's computations
as unreviewed expansions: `#build`, `#check`, `#lint`,
`#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws` and `#test`, plus
configuration-source drift for `apps/practice-claude-mod/turbo.json`.

They are the standard generated app tasks (`bun run beep lint
package-scripts`) with the same commands, inputs, outputs and cache flags as
the sibling practice apps; `turbo.json` is the `create-package` service-app
template (`build.outputs: []`). The plugin-only scripts (`plugin:build`,
`plugin:test`) are not turbo tasks.

Recording them in the baseline accepts the existing posture for this new
subject only; no qualification is granted and no other subject changes.

The root subject `//` changes too: the root `package.json` workspaces list
gains `apps/practice-claude-mod`, which moves the shared root digest. No root
command, input, output, env, dependency edge or cache flag changes.

## Re-record after the gate repair (same day)

The gate repair added the `@beep/test-runner` dev dependency and its
tsconfig reference, which moves the dependency digest of
`#build`, `#check`, `#lint:deprecated-apis` and `#test`. Commands, outputs,
env and cache flags are unchanged; no qualification is granted.
