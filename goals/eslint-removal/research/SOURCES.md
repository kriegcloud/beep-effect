# Sources and provenance

- Local branch and origin/main: b2c9ac98177e3994b4dcb39e37a78afab988dd41.
- Lint.command.ts: deprecated-API and docs workers execute oxlint.
- Quality/Tasks.ts: root docs sweep executes oxlint without a persistent result cache.
- Repo-configs source/import search: RuleAstSchemas/RuleHelpers have no retained production consumer.
- docs/runbooks/typescript-toolchain.md and goals/tsc-rs-gates/SPEC.md Decision Log:
  tsc-rs 0.6.0 runs gates; effect-tsgo 0.51.1 remains for editor/rule tools.
- graft grep covered live ESLint consumers; graft callers could not resolve the
  module name, so exhaustive source and barrel searches established import paths.
- No external research or copied third-party implementation was needed.
