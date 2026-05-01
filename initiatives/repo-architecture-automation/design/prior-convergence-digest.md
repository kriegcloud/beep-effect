# Prior Convergence Digest

The previous `repo-architecture-convergence` packet was an execution-heavy plan
for moving the existing repo into the architecture standard through seven
phases:

- P0 baseline census and routing canon;
- P1 live ledgers and gate templates;
- P2 enablement and wiring cutover;
- P3 shared-kernel and non-slice extraction;
- P4 repo-memory migration;
- P5 editor migration;
- P6 remaining operational, app, and agent cutovers;
- P7 final architecture and repo-law verification.

Its useful decisions are retained here:

- repo changes, command gates, search audits, and evidence matter more than
  packet completion;
- compatibility aliases and temporary shims need owners, expiry, and deletion
  proof;
- app entrypoints, generators, docgen, identity registries, root configs, and
  agent guidance are architecture surfaces;
- migration evidence should be reproducible, not narrative.

The active strategy changes because the migration economics changed. Rather
than carry the old topology through a long compatibility program, this branch
archives the pre-automation world and reduces the active checkout to a lean
slate. The new proof artifact is the `fixture-lab/Specimen` golden slice, and
future product topology should be generated from the registry-backed `beep`
factory derived from that fixture.

The full old packet remains recoverable through git history and the archive
branch:

`archive/pre-repo-architecture-automation-2026-04-27`
