# Fallow 3.34 migration hold

The recovery branch pins Fallow to 3.33.1, the minor version selected on main,
while retaining the zero-findings dead-code baseline and blocking check.
No finding allowance or suppression was added.

Fallow 3.34 changed path globs: `*` stays within a path segment and `**` crosses
directories. The existing configuration therefore has a different reachability
graph after the dependency update. The release explicitly warns that this can
surface new findings. See the
[3.34 release notes](https://github.com/fallow-rs/fallow/releases/tag/v3.34.0).

On the same recovery checkout, 3.33.1 reported one unused export and one unused
development dependency; 3.34.1 reported 63 blocking dead-code findings. The
latter includes generated source artifacts and class members. Several class
findings have live consumers: `ParserOptions.new`, `CsvCodecOptions.decodeEffect`,
and the CSV escape getters. Re-exported `Schema` aliases also produced duplicate
class-member findings. The optional semantic pass timed out after 120 seconds
and retained the conservative findings, so it did not establish their validity.
Other new findings may be real unused code; this version hold does not classify
all 63 as false positives.

The two 3.33.1 findings were repaired:

- `NativeAddonExternals` is an internal bundle setting, so its unused export was removed.
- The desktop Vite alias now resolves `decode-named-character-reference` by package
  specifier with `import.meta.resolve`, preserving the dependency edge and avoiding
  an assumed hoisted `node_modules` path.

`beep quality fallow dead-code --check --base origin/main` then reported zero
findings with Fallow 3.33.1. The baseline, configuration entry roots, and blocking
policy are unchanged.

Before upgrading past 3.33, migrate and review the entry and ignore glob semantics,
trace the new findings, and retain paired used/unused fixtures for class aliases
and schema factory inheritance. Remove this exact pin only after that migration
passes the unchanged zero-findings gate. Reversal is the root catalog and lockfile
version update; no application data or public schema API changed for the hold.
