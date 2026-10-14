# Reproduce the strict-project candidate

Use a disposable feature lane. All paths below are repo-relative. Do not register
or commit the parity corpus as a workspace package. Changes outside the new
packet are experimental and must be removed on a NO-GO.

1. Install exact oxlint 1.88.0 and oxlint-tsgolint 7.0.2004 with Bun in the
   disposable checkout; save the starting manifest/lock bytes for restoration.
   Do not use npm's read-only cache. Check both installed package versions.
2. Copy candidate-profile.json.txt to .oxlintrc.deprecated-apis.jsonc at the repo
   root. Config scope and ignore globs are relative to that location.
3. Materialize each candidate-projects.json entry at its recorded path, with
   its contents serialized as JSON. Apply root-fallback.patch.txt. These inherit
   the existing strict root project, not looser handwritten compiler flags.
4. Reconstitute the corpus from the parent's research/p2-artifacts/README.md.
   Its tsconfig include becomes ["src", "scripts"] and rootDir becomes ".".
   Copy baseline-profile.mjs.txt to .cache/p2b-tools/eslint.config.mjs (that
   location is significant to its root URL). This baseline uses the same rule,
   plugin, parser and project service, without a default fallback for now-owned
   files; production ignore patterns are retained.
5. Compare the corpus, normalizing both JSON outputs to file, line, backtick
   symbol and sorting. See corpus-parity.json for the ten expected identities.
6. Run admitted dependency builds before the full scan:

```sh
XDG_RUNTIME_DIR=/run/user/1000 \
DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus \
beep-heavy -- bunx turbo run build --filter='@beep/repo-cli^...' --filter='@beep/ui^...'

XDG_RUNTIME_DIR=/run/user/1000 \
DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus \
beep-heavy -- bunx turbo run build
```

7. Run the full candidate command in history/2026-10-14-p2b-re-spike.md.
   Search OXC_LOG for Got tsconfig and Done assigning. Exclude declarations,
   generated files and all other profile ignores when counting eligible subjects.
   Expected result: zero unassigned in-scope TS/TSX; 305 config errors and eleven
   production deprecations on this head. Corpus findings are additional seeds.
8. Compare the seven parent-site files and Library.evidence.ts with the baseline.
   Exact commands and exits are in verification.jsonl. A subsequent GO must also
   run the full uncached baseline using the existing bounded shard architecture.
9. Repair the triaged preconditions before a qualified /usr/bin/time -v cold
   benchmark. Hosted <=150s qualification remains pending for the orchestrator.
10. Restore manifest/lock/root-config bytes, remove only experiment-created
    configs and the reconstructed corpus, then bun install --frozen-lockfile
    --ignore-scripts to return installed dependencies to the original pins.

The installed fast-xml-parser advertises entityDecoder as an options object in
src/fxp.d.ts while OrderedObjParser.js uses it as an instance. A minimal smoke
is new XMLParser({entityDecoder:{namedEntities:{nbsp:" "},numericAllowed:true}})
.parse("<text>A&nbsp;B</text>"): it throws reset-is-not-a-function. Do not
replace htmlEntities mechanically based only on the deprecation message.

## Resumed final contract

The steps above describe the initial experiment. Retained strict projects and
source repairs are now executable production changes, not disposable research.
Keep them even on a measured NO-GO. The original verdict was reclassified as
preconditions incomplete; gates not yet run. Preserve the original history text.

Current candidate is pinned in the root catalog: oxlint 1.88.0 and
oxlint-tsgolint 7.0.2004. The native CLI supplies --threads=4 and
--disable-nested-config, with the dedicated root profile. Its full/hosted body
scans apps, packages and infra; package/affected modes retain caller scope/base.

The full comparison uses the same uncached ESLint deprecated-rule profile with
strict real projects, no fallback. Cover every top-level app and package tree;
the historical shard list omits documents and ontology. Final reconciliation
requires equality of the 5200 typed-file sets, then compares normalized findings.
The final 38-shard summary and cold command are in gate-results-resume.json;
exact commands/exits are in verification-resume.jsonl. The parity corpus stays
unregistered, is normalized to ten identities per engine, then removed.

A real @nodable/entities EntityDecoder is the non-deprecated replacement for
htmlEntities. Match COMMON_HTML+CURRENCY, numericAllowed, a 100000-character
expansion limit applying to all entities, and is-unsafe HTML/XML input filtering.
The earlier options-object smoke used the wrong API shape; it did not demonstrate
an upstream bug. Differential legacy/replacement parser cases and caption proof
regressions now establish equivalent behavior without a suppression.

The final parser lifetime is per parse, matching the legacy factory. Restore
xml-parser-parity.mjs.txt to an ignored .mjs path for the nine-case differential
reproducer, including XML 1.1 followed by a declaration-free document. The
retained caption suite exercises the same boundary in 16 integration cases.
