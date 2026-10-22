# Cache baseline review: epistemics foundation extraction (P1)

Reviewed 2026-10-22 for P1 of `goals/epistemics-foundation-extraction`.

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

  `@beep/epistemic-domain`'s manifest has one more change. Its `exports` map
  drops the four subpaths whose modules moved to `@beep/epistemics`:
  `./values/ClaimDispositionStatus`, `./values/ClaimGate`,
  `./values/EdgeRelation` and `./values/EvidenceSpan`.

`@beep/scratchpad` also gained the dependency. The policy does not report it,
and its recorded projection is unchanged.

The audit also prints review-level `configuration-source-drift` lines for 19
`turbo.json` files, which belong to the root subject `//`. They are inherited
from main and not caused by this branch. `git diff e66bd500f5 -- turbo.json
'**/turbo.json'` is empty, and in e66bd500f5 (#2005) the turbo bump changed only
the `$schema` URL in each file, from `v2-11-9` to `v2-11-10`. The baseline
recorder refuses this request without `//` (`Unreviewed: //`), because the
recorded source digests changed. `//` is therefore recorded with those 19
source digests. Its task nodes and global configuration are byte-equal to the
recorded projection: I compared them field by field against a fresh census. No
root task changed.

Recording these ten subjects accepts three things: the existing posture for
the new workspace, the dependency-only drift of its eight importers, and the
`$schema`-only source drift inherited on `//`. Scope, profile
and epoch are unchanged. No qualification is granted, and no other subject
changes.
