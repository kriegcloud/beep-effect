# Repo Checks Retirement

`@beep/repo-checks` was a script-only package used to inject root quality gates
into Turbo. The target architecture does not preserve script-only tooling
packages as canonical packages.

Its behavior moves into `@beep/repo-cli`:

- root `check` runs Turbo package checks plus repo-level tsgo diagnostic scripts;
- root `lint` runs Turbo package lint plus repo-level policy, docs, spelling,
  circularity, and typo checks;
- root `lint --fix` keeps package fixes and the effect-imports write pass;
- root `test --types` keeps a Turbo-visible `type-test` task hosted by
  `@beep/repo-cli`.

