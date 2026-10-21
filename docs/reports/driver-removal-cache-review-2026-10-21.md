# Driver removal cache review

2026-10-21. Review by Claude Opus 5.5, medium effort, in the lane that removes four unused driver
workspaces: retired:venice-ai, retired:xai, retired:firecrawl and retired:face-detection.

The cheap-gates cache audit reported fifteen blocking `configuration-drift` findings and one
`configuration-source-drift` review for `turbo.json`. A complete comparison of the executable
projection against the previous baseline (SHA-256
`0a83a58e93a6119d6ff10c9177927eb55fc97590dc6caad051dd3fbe037209d0`, the baseline on `main` at
`da36bcb37e`, which this branch merged) finds only subtractive changes:

- 58 computations are removed, all owned by the four deleted workspaces (15 + 15 + 14 + 14). Their
  four review records are dropped with them. No computation is added.
- 25 computations change only their resolved dependency lists. Each list loses the edges to the
  deleted workspaces and gains nothing.
- 131 computations change only their effective configuration. Each one loses entries and gains
  nothing.
- The global configuration is unchanged. The only configuration source whose bytes change is
  `turbo.json`, from SHA-256 `6a81f3b809fd6990a9db45868be59b860f8f3f2aeaa15b3caba429720044bb1c` to
  `d2ede075c2069c88b304f4f196efcdfc6a3dfdd87b93a3c3ae393b85317eaa6d`.

## Dependency-only changes

`@beep/repo-cli` no longer depends on the face-detection and firecrawl drivers. The Files lane removed
the face-detection command, and the Research lane removed the capture command with its Firecrawl
web acquisition. The manifest is now SHA-256
`b51883e8a490dfa2e87b7679c99f5e74991dea9c35e3598a11b70e81fcc1ac8b`. Affected computations:

- `@beep/repo-cli#audit`
- `@beep/repo-cli#build`
- `@beep/repo-cli#check`
- `@beep/repo-cli#coverage`
- `@beep/repo-cli#doctest`
- `@beep/repo-cli#lint:deprecated-apis`
- `@beep/repo-cli#package-test-typecheck`
- `@beep/repo-cli#test`
- `@beep/repo-cli#test:property`

`@beep/semantica` no longer depends on the xAI driver. The live xAI gold proposer was removed, and gold
proposal now only replays. The manifest is now SHA-256
`bf72987c345605f39694dc94e0b700c74be3097a9bc83f2fb75052ba0d72190b`. Affected computations:

- `@beep/semantica#audit`
- `@beep/semantica#build`
- `@beep/semantica#check`
- `@beep/semantica#coverage`
- `@beep/semantica#dev`
- `@beep/semantica#lint:deprecated-apis`
- `@beep/semantica#package-test-typecheck`
- `@beep/semantica#test`

`@beep/lejeune-bolt-workbench` no longer depends on the Venice driver. Its provider smoke now covers
Anthropic only. The manifest is now SHA-256
`fdff7019a12655f813e84faca322186c54218f56f9d0637e80698fa698e7cbab`. Affected computations:

- `@beep/lejeune-bolt-workbench#audit`
- `@beep/lejeune-bolt-workbench#build`
- `@beep/lejeune-bolt-workbench#check`
- `@beep/lejeune-bolt-workbench#coverage`
- `@beep/lejeune-bolt-workbench#dev`
- `@beep/lejeune-bolt-workbench#lint:deprecated-apis`
- `@beep/lejeune-bolt-workbench#package-test-typecheck`
- `@beep/lejeune-bolt-workbench#test`

## Configuration-only changes

- `//#lint:policy-fingerprint` loses four inputs: the manifests and source trees of the face-detection
  and firecrawl drivers. The CLI's policy computation no longer imports them. No input is added.
- `//#lint:typos` loses its two exclusions for the Venice OpenAPI documents, which were deleted with
  that driver. No input is added.
- 129 `test:integration` and `test:integration:parallel` computations lose the environment names
  `AI_VENICE_API_KEY` and `FIRECRAWL_API_KEY` from their shared root task definition. These tasks
  are not cached, so this changes no reuse decision.

## Subjects changed only by the integration environment names

These subjects change only through their uncached `test:integration` and `test:integration:parallel`
computations, which lose `AI_VENICE_API_KEY` and `FIRECRAWL_API_KEY` from the shared root task
definition. No cached computation of theirs changes, so no reuse decision changes:

- `@beep/acp`
- `@beep/agents-client`
- `@beep/agents-server`
- `@beep/agents-tables`
- `@beep/ai-provider-cli`
- `@beep/ai-sync`
- `@beep/api-transport`
- `@beep/architecture-lab-client`
- `@beep/architecture-lab-config`
- `@beep/architecture-lab-domain`
- `@beep/architecture-lab-proof`
- `@beep/architecture-lab-server`
- `@beep/architecture-lab-tables`
- `@beep/architecture-lab-ui`
- `@beep/architecture-lab-use-cases`
- `@beep/box`
- `@beep/box-provisioning`
- `@beep/brand`
- `@beep/codegen-kit`
- `@beep/commands`
- `@beep/db-admin`
- `@beep/discord`
- `@beep/dock`
- `@beep/dock-react`
- `@beep/doc-text`
- `@beep/documents-domain`
- `@beep/documents-server`
- `@beep/documents-tables`
- `@beep/documents-use-cases`
- `@beep/drizzle`
- `@beep/ecfr`
- `@beep/editor`
- `@beep/effect-drizzle`
- `@beep/epistemic-client`
- `@beep/epistemic-config`
- `@beep/epistemic-server`
- `@beep/epistemic-tables`
- `@beep/epistemic-ui`
- `@beep/exiftool`
- `@beep/fc-runs`
- `@beep/ffmpeg`
- `@beep/file-processing`
- `@beep/freshbooks`
- `@beep/github-commands`
- `@beep/github-references`
- `@beep/govinfo`
- `@beep/gov-legal-mcp`
- `@beep/html`
- `@beep/hubspot`
- `@beep/jsonc`
- `@beep/jsonl`
- `@beep/law-practice-tables`
- `@beep/lexical-schema`
- `@beep/libpff`
- `@beep/m365`
- `@beep/m365-mcp`
- `@beep/mcpb-kit`
- `@beep/mcp-kit`
- `@beep/nlp-mcp`
- `@beep/obs`
- `@beep/occt`
- `@beep/onepassword-cli`
- `@beep/ontology`
- `@beep/ontology-client`
- `@beep/ontology-config`
- `@beep/ontology-domain`
- `@beep/ontology-server`
- `@beep/ontology-ui`
- `@beep/ontology-use-cases`
- `@beep/openai`
- `@beep/openai-compat`
- `@beep/openclaw`
- `@beep/pacer`
- `@beep/palantiri`
- `@beep/pandoc-ast`
- `@beep/pdf-tools`
- `@beep/pglite`
- `@beep/phoenix`
- `@beep/poppler`
- `@beep/postgres`
- `@beep/pretext`
- `@beep/professional-desktop`
- `@beep/public-site`
- `@beep/qa-capture`
- `@beep/runpod`
- `@beep/sanity`
- `@beep/schema-org`
- `@beep/semver`
- `@beep/shared-use-cases`
- `@beep/skill-contract`
- `@beep/spdx`
- `@beep/t3-code`
- `@beep/tailscale`
- `@beep/technical-drawing`
- `@beep/tesseract`
- `@beep/test-runner`
- `@beep/test-utils`
- `@beep/tika`
- `@beep/uspto`
- `@beep/uspto-mcp`
- `@beep/windows-secrets`
- `@beep/wink`
- `@beep/workspace-server`
- `@beep/workspace-tables`
- `@beep/workspace-use-cases`
- `@beep/xstate`

## Root subject

The root subject `//` changes through `//#lint:policy-fingerprint` and `//#lint:typos` only, so this
review replaces its record. Its previous record, the `//#lint:schema-tag-idioms` review in
`docs/reports/schema-tag-idioms-cache-review-2026-10-21.md`, is already part of the previous
baseline. The `//#lint:schema-tag-idioms` and `//#lint:tsgo-rules` computations are identical
before and after this refresh.

## What this review does not change

Scope (`@beep/identity#lint`, `@beep/types#lint`, `@beep/fc-runs#lint`, `@beep/test-runner#lint`),
profile `local-linux-x64-bun1.4.2`, epoch `qualification-v2`, the qualification ledger and every
qualification state stay as they were. None of the four scope tasks has a projection change. The
refresh records the smaller graph and grants no new qualification. Subjects whose nodes did not change
keep their earlier review records and basis documents.

To reverse it, revert this review together with the baseline commit.
