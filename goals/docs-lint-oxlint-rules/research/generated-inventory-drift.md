# Full inventory regeneration

The requested `bun run jsdoc:inventory` regenerated both documentation inventory outputs.
It reports 147 packages, 81 open packages, 1388 open exports and 912 open modules. The
hosted ratchet independently passed with zero non-generated legacy findings.

The committed inventory predates substantial main-source changes. Regeneration changes
hundreds of thousands of JSON lines and many report rows in untouched packages. The
files are generator output, never manually edited; the orchestrator may split the inherited
refresh from the docs-lint source change. No totals or coverage baseline was refreshed.
