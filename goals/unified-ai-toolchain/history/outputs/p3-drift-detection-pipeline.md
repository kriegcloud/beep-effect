# P3 Drift Detection Pipeline

## Status

Complete.

## Implementation

The package exposes three drift paths:

- `check`: offline local verification of generated files and repo dogfooding
- `drift --strict`: networked hash comparison against committed Tier-1 source
  metadata
- `refresh` or `drift --refresh`: fetch pinned Tier-1 sources and rewrite
  generated artifacts

The strict checker compares committed SHA-256 hashes in
`src/_generated/source-metadata.gen.ts` against current fetched source bodies.
The synthetic drift test uses `checkSourceDriftWithFetcher` to inject a moved
upstream body without contacting the network.

## Evidence

- `bun run --cwd packages/tooling/library/ai-sync check`
  - local/offline artifact check passed
- `bun run --cwd packages/tooling/library/ai-sync drift --strict`
  - strict drift check passed against the current pinned Tier-1 sources
- `bun run --cwd packages/tooling/library/ai-sync test`
  - synthetic drift reports a structured finding for a replaced source body

## Notes

The default package check remains offline. Network access is reserved for
strict drift and refresh/generate commands.
