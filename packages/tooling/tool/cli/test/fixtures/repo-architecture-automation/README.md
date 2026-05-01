# Repo Architecture Automation Fixture

This fixture is the checked golden slice for the repo architecture automation
initiative. It is synthetic by design: `fixture-lab/Specimen` proves topology
without becoming product roadmap code.

## Contents

- `registry/fixture-lab.specimen.json` - schema-shaped generator input
- `../../../packages/fixture-lab/specimen/*` - live workspace packages that
  currently serve as the checked golden output

The fixture packages are intentionally private and synthetic. They exist so the
golden slice is exercised by normal repo quality commands before generator
extraction begins.

`standards/ARCHITECTURE.md` is binding for the live fixture topology. The
registry describes `fixture-lab/Specimen` as the `entities/Specimen` concept,
and each role package exposes only the explicit boundary subpaths listed there.

The generator must eventually render the live golden tree into a temp
directory, compare cleanly, run twice, and prove the second run is a no-op.
