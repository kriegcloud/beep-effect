# Combined coverage and tsgo cache input review

This review records the merged root cache configuration after the coverage
artifact work and the git-visibility correction were developed on separate branches.
It authorizes updating configuration provenance for subject `//` only. It grants
no cache qualification and changes no qualification ledger state.

The merged `turbo.json` has SHA-256
`b3bff92042d97322cd3a53c1558f563d23115abb7404e951dffa120a798c93a1`.
Its effective task configuration retains both previously reviewed changes:

- The [coverage runtime review](coverage-runtime-cache-input-review-2026-10-20.md)
  covers the two hashed test environment keys, the 28 narrow exclusions of
  ignored nested worktrees, and the Turbo schema URL updates. Its complete task
  and source-digest tables remain the review basis for those changes.
- The [tsgo git-visibility review](tsgo-rules-git-visibility-cache-review-2026-10-21.md)
  covers the additional ignore files, root TypeScript files and root tsconfig
  patterns read by `//#lint:tsgo-rules`. The merged task retains those inputs.

Neither change replaces the other. The merge preserves the coverage invocation
metadata in test hashes, the existing worktree exclusions, and the complete
tsgo input set. Task commands, outputs, dependency edges and cache flags are
unchanged by this reconciliation. No additional input exclusion is authorized.

The two existing review documents are bound by their exact bytes:

| Review | SHA-256 |
| --- | --- |
| Coverage runtime and worktree inputs | `7eff829f9f205661ec959a1cb35abf0e9d53a4d914ba0e4dcd31ca8bf1546c7b` |
| Tsgo git visibility | `27b585ffbcd9a7eafdab61a588b0ab63e961243a2516ede9155338028fc7ce1a` |

The baseline's single root review reference must point to this combined review,
so both bodies of evidence remain discoverable. Existing workspace review
references remain intact. The official writer may refresh the merged root
configuration's source digest and associated configuration provenance; it must
not change unrelated configuration records or qualification decisions.

Retain profile `local-linux-x64-bun1.4.2`, epoch `qualification-v2`, and the
existing scope: lint for `@beep/identity`, `@beep/types`, `@beep/fc-runs` and
`@beep/test-runner`. Retain the qualification ledger byte-for-byte. Existing
excluded tuples remain excluded, and the 1,397 unassessed cached computations
remain unassessed.

The writer request must bind the exact provisional merged baseline text and
this document's exact bytes, with subjects restricted to `//`. Run the canonical
cache audit after application. Any further drift requires its own review;
neither this document nor the prior reviews authorize expanding the request.
