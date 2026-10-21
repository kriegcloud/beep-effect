# tsgo-rules git-visibility cache review

`lint:tsgo-rules` used to walk the disk, so git-ignored scratch residue (for
example `scratchpad/.jsdoc-loop/**` tsconfigs) failed the check locally while CI
passed. The check now keeps only files that `git ls-files --cached --others
--exclude-standard` lists. Which files it reads therefore depends on the
repository's `.gitignore` files as well as on file contents.

The `//#lint:tsgo-rules` input set changes to match what the check reads:

- adds `.gitignore` and `**/.gitignore`, so editing an ignore rule invalidates a
  cached pass. The `//#lint:oxlint` input set already hashes the same globs.
- adds the root-level `*.{cts,mts,ts,tsx}`. The directive scan has always read
  root files such as `vitest.setup.ts`, `vitest.shared.ts` and the `*.config.ts`
  files, but the input set never hashed them.
- replaces `tsconfig.base.json` and `tsconfig.json` with the root-level
  `tsconfig*.json`. The profile scan reads every root tsconfig, including
  `tsconfig.configs.json`.

The task command, outputs, `dependsOn`, cache flag, qualification scope,
profile, epoch and qualification states do not change. Two cases stay unkeyed:
a change to the index alone (`git add -f` or `git rm --cached` with identical
contents) and edits to `.git/info/exclude` or `core.excludesFile`. Turbo cannot
hash either, and hosted CI runs this lane uncached on a fresh checkout.

This reviews the declared input-set change only. It is not evidence that any
computation is newly qualified or that a quality gate has passed.

Current `turbo.json` SHA-256: `6a81f3b809fd6990a9db45868be59b860f8f3f2aeaa15b3caba429720044bb1c`.

Drifted computations (subject `//`):

- `//#lint:tsgo-rules`
