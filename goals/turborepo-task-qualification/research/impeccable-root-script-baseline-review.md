# Impeccable root-script removal baseline review

2026-10-17. Review by Claude Opus 5.5, medium, in the repository-simplification-residue
driver lane (fix for main 4a9e6aacdc).

PR #1900 retired repository Impeccable. In the root `package.json` it removed the
`impeccable:detect` script and the four Impeccable-only dependencies (`css-select`,
`css-tree`, `domutils`, `htmlparser2`). Removing a root script changes the scripts digest
that every cached root (`//#`) computation folds in. So `quality:cache-policy` reported
`configuration-drift` on all 28 cached root tasks.

The same re-baseline also refreshes the 17 `turbo.json` `projection.sources` digests. These
are raw file hashes, and they match the `turbo.json` bytes at this head. They do not come
from #1900, which changed no `turbo.json`. Sixteen package `turbo.json` files changed in
PR #1837 (52f218fc), and the root `turbo.json` changed in PR #1833 (b536e1bb). Since then the
audit has shown them as non-blocking `configuration-source-drift` reviews. Recording them
here only brings the source digests up to date with those merged changes.

No root task's command, inputs, outputs, environment or dependencies changed, and no
computation was added or removed.

The only review subject is `//`. This record re-baselines the root projection to the
post-#1900 scripts digest. It keeps the existing scope, profile, epoch and qualification
ledger, and it grants no reuse qualification. Reversal: revert this commit; the previous
baseline digest is recorded as `previous` in the request.
