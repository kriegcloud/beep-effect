# Plugin compatibility spike

All configured docs rules registered via aliases in a temporary oxlint config. No crashes or
findings on packages/tooling/library/repo-utils/src. Oxlint: 4.05s, exit 0;
`beep lint jsdoc --package packages/tooling/library/repo-utils`: 7.50s, exit 0.
See spike-oxlint.log and spike-eslint.log. A clean corpus proves loading/execution, not invalid
case parity; targeted rule tests must establish that separately.
Official API: https://oxc.rs/docs/guide/usage/linter/js-plugins.html (read 2026-10-14).

The complete spike includes require-file-overview on src/index.ts and disables every native
category. With two threads it completes in 2.56s, exit 0 (spike-complete.log). The owned
plugin config completes on the same corpus in 2.23s, exit 0 (owned-repo-utils.log).
All five mandatory rules, category, TSDoc syntax and the original advisory rules loaded;
none crashed. Formatting warnings are retained only in this comparison config.
