# Cache baseline review: epistemics foundation extraction (P1)

Reviewed 2026-10-22 (re-reviewed on merge 66f3ab65be) for P1 of `goals/epistemics-foundation-extraction`.

`bun run beep cache audit` reports 47 blocking findings that this branch
introduced. All come from creating the `@beep/epistemics` workspace and adding
it as a dependency:

- **Unreviewed expansion** for the new workspace `@beep/epistemics`. It has
  eight task tuples: `#build`, `#check`, `#docgen`, `#lint`,
  `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws` and `#test`. The
  workspace was scaffolded by `bun run beep create-package` in
  foundation/modeling. Its scripts block is the generated task set, and like
  the library scaffold it has no `turbo.json`.
- **Configuration drift** on the eight workspaces that now import
  `@beep/epistemics`. In each, the drifted tuples follow from the new
  `"@beep/epistemics": "workspace:^"` dependency in its `package.json` and the
  matching `tsconfig.json` and `tsconfig.check.json` project references that
  `bun run beep tsconfig-sync` added. No command, input glob, output or cache
  flag changed.

  | Subject | Drifted tuples |
  | --- | --- |
  | `@beep/epistemic-domain` | `#build`, `#check`, `#doctest`, `#lint:deprecated-apis`, `#test`, `#test:property` |
  | `@beep/epistemic-server` | `#build`, `#check`, `#lint:deprecated-apis`, `#test` |
  | `@beep/epistemic-tables` | `#build`, `#check`, `#lint:deprecated-apis`, `#test`, `#test:property` |
  | `@beep/epistemic-ui` | `#build`, `#check`, `#lint:deprecated-apis`, `#test` |
  | `@beep/epistemic-use-cases` | `#build`, `#check`, `#doctest`, `#lint:deprecated-apis`, `#test`, `#test:property` |
  | `@beep/law-practice-use-cases` | `#build`, `#check`, `#lint:deprecated-apis`, `#test`, `#test:property` |
  | `@beep/professional-desktop` | `#build`, `#check`, `#lint:deprecated-apis`, `#test`, `#test:property` |
  | `@beep/semantica` | `#build`, `#check`, `#lint:deprecated-apis`, `#test` |

  The `@beep/epistemic-ui` dependency is a devDependency, because it is
  imported only from tests and stories.

  `@beep/semantica` also drops its `@beep/epistemic-domain` dependency, along
  with the matching `tsconfig.json` and `tsconfig.check.json` references.
  Every semantica import of the epistemic vocabulary now resolves to
  `@beep/epistemics`, and fallow dead-code reports the old dependency unused.

  `@beep/epistemic-domain`'s manifest has one more change. Its `exports` map
  drops the four subpaths whose modules moved to `@beep/epistemics`:
  `./values/ClaimDispositionStatus`, `./values/ClaimGate`,
  `./values/EdgeRelation` and `./values/EvidenceSpan`.

`@beep/scratchpad` also gained the dependency. The policy does not report it,
and its recorded projection is unchanged.

An earlier version of this review also recorded the root subject `//`. Main's
#2005 had changed only the `$schema` URL in 19 `turbo.json` files without
refreshing the baseline, so its recorded source digests were stale. Main's
#1934 (24e6c8ca09) re-recorded the baseline, and this branch has merged it
(66f3ab65be). Every recorded `turbo.json` digest now matches, and the audit
reports no source drift. `//` is therefore no longer part of this request.

Recording these nine subjects accepts the existing posture for the new
workspace and the dependency-only drift of its eight importers. Scope, profile
and epoch are unchanged. No qualification is granted, and no other subject
changes.
