# Dependency review fixtures (#1882)

Recorded GitHub replies for `test/ci-dependency-review.test.ts`. Nothing here
is a dependency manifest: the files are JSON documents the test reads as data.

- `pr-911-photo-face-uv-lock.json`: five rows of
  `gh api --paginate --slurp repos/beep-effect/beep-effect/dependency-graph/compare/19d8b3df005dd9768e003a9efc716d84bf0ad12a...9fc17c2ed94893ac831ed12b4370c70dfc48a0af?per_page=100`
  (PR #911, which added `packages/tooling/tool/cli/python/photo-face/uv.lock`).
  `certifi` and `urllib3` are transitive lockfile packages, not direct
  `pyproject.toml` dependencies at that head.
- `pr-1592-lockfile-fixtures.json`: eighteen rows of the same call for PR #1592
  (`cb64e0484f218a0b04bd8356aef2ceb463644a7c...b56c98a04992a430463a10204a62cd8b3ac6f8a3`),
  whose `Security` job failed in the pinned dependency-review action on
  `scratchpad/test/lockfiles/fixtures/npm/v1/package-lock.json » lodash@4.17.23`
  (GHSA-r5fr-rjxr-66jc). Sixteen rows are fixture manifests; two are the real
  `scratchpad/effected/github/package.json` workspace.
- `manifest-inventory.json`: every manifest the dependency graph listed on
  2026-10-21 (GraphQL `dependencyGraphManifests`, 226) plus the tracked
  manifests it did not list (19), each classified as `production` or
  `synthetic-fixture`.

Captured 2026-10-21 with read-only `gh api` calls against the public
repository. Advisory data is GitHub's as of the capture, not as of each PR.
Rows are trimmed, never edited. To refresh, re-run the same calls and keep the
test expectations in step.
