# Codegen And Drift Architecture

## Recommendation

Use the `@beep/acp` generator as the implementation precedent for V1.

The new package should have a package-local generator that pins upstream source
versions, downloads those exact sources, converts supported JSON Schema inputs
to Effect Schemas, writes generated modules under `src/_generated`, and formats
the generated output. Generated files should be committed and hidden behind
curated public exports.

## Codegen Shape

The generator should follow this shape:

- source pins declared as constants near the top of the script
- source metadata modeled as Effect Schemas
- download and file IO through Effect platform services
- process entrypoint through `Command.run`
- generated outputs under `src/_generated/<agent>/<domain>.gen.ts`
- banner comment stating the file is generated and must not be edited manually
- package check stays offline by reading committed generated files

The first generated sources should be:

- Codex config schema
- Codex hook schemas
- MCP schema
- ACP schema
- Claude Code SchemaStore mirrors
- rulesync release schemas

## Drift Modes

`--check` is the fast local mode. It must not contact the network. It verifies
committed generated files, source metadata, and selected local config files
against committed schemas.

`--strict` is the CI mode. It may fetch upstream version metadata, release
redirects, and content hashes. It compares upstream state to committed pins and
fails with a structured drift report when a source has moved.

`--refresh` is the update mode. It fetches selected upstream sources,
regenerates generated files, refreshes metadata, and prepares the diff for an
operator or scheduled PR workflow.

## Source Tiers

Tier 1 is machine-readable and should feed codegen. It uses version pins,
release tags, dated schema versions, or content hashes.

Tier 2 is official documentation. It should feed hand-authored schemas and a
semantic-field-diff parser that watches stable field tables, code blocks, and
configuration examples rather than all prose.

Tier 3 is public adapter or reference code. It should be used to resolve gaps
when official docs are incomplete, especially for file locations and adapter
conventions.

Tier 4 is shipped artifact introspection. It is last resort and must be marked
unofficial. It may identify hidden fields or plugin metadata, but it should not
override official docs without explicit evidence.

## Unknown Schema Policy

Unknown native surfaces must be represented explicitly. The package should
export metadata that says the cell is `unknown_schema`, why it is unknown, and
which source would unblock it.

V1 unknown cells include:

- Grok Build hook payload schema
- Grok Build plugin manifest schema
- Grok-native MCP shape

The implementation must not silently accept these cells as finished arbitrary
objects.

## Transform Policy

Transforms are only valid when the source and destination semantics match.
Every transform pair must declare whether it is lossless or lossy. Round-trip
tests are required for every transform pair.

Good first candidates are:

- Codex MCP TOML to Claude-style `.mcp.json`
- Claude-style `.mcp.json` to Junie project MCP JSON
- AGENTS.md-style instruction documents to compatible rules surfaces
- Agent Skills frontmatter across agents that use the shared skill format

Transforms for N/A or unknown cells are not allowed in V1.
