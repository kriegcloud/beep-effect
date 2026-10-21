# Round-one documentation repair proof

Addressed PR #1930 review comments `4333008342` and `4333008350` using the
retained review snapshot. No source, test, dependency inventory, external
status, commit or publication change was made in this lane.

- `SPEC.md` now uses the actual packet raw path and an exact `git ls-files`
  comparison allowing only `raw/.gitignore`. Unlike working-tree status,
  this also detects a committed raw report in a clean checkout. Executed the
  documented check from the repository root: exit 0. The tracked listing is
  exactly `goals/codex-security-findings-2026-10-20/raw/.gitignore`.
- `DEPENDABOT.md` now labels the initial 104-alert capture as historical and
  gives the refreshed 123-alert table: 103 fixtures, 16 Python, four Rust.
  Table descriptions distinguish completed scoped remediation/proof from
  pending merged-revision dependency-graph and exact alert closure evidence.
- `dependabot-fixtures-proof.md` now carries the 103-alert remaining gate and
  explains the nine added Vite alerts on the existing historical paths. No
  corpus bytes or capture-count claims changed.

The refreshed table agrees with the 123-entry `ops/dependabot.json` inventory;
that exact-ID inventory remains untouched. Scoped `git diff --check` passed.
External closure remains post-merge and is not asserted by this receipt.
