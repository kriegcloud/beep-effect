---
title: source-metadata.gen.ts
nav_order: 2
parent: "@beep/ai-sync"
---

## source-metadata.gen.ts overview

Generated source metadata with content hashes for Tier-1 sources.

**Example**

```ts
import { GENERATED_TIER_ONE_SOURCE_METADATA } from "@beep/ai-sync/_generated/source-metadata.gen"

console.log(GENERATED_TIER_ONE_SOURCE_METADATA.length)
```

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [GENERATED_TIER_ONE_SOURCE_METADATA](#generated_tier_one_source_metadata)
---

# constants

## GENERATED_TIER_ONE_SOURCE_METADATA

Generated source metadata with content hashes for Tier-1 sources.

**Example**

```ts
import { GENERATED_TIER_ONE_SOURCE_METADATA } from "@beep/ai-sync/_generated/source-metadata.gen"

console.log(GENERATED_TIER_ONE_SOURCE_METADATA.length)
```

**Signature**

```ts
declare const GENERATED_TIER_ONE_SOURCE_METADATA: readonly [{ readonly id: "acp-schema"; readonly agent: "acp"; readonly domain: "protocol"; readonly tier: "tier_1"; readonly url: "https://raw.githubusercontent.com/agentclientprotocol/agent-client-protocol/v0.13.3/schema/schema.json"; readonly versionPin: "v0.13.3"; readonly contentHash: "02d8df14f03105d5b40d8961b859c3ee40da2a39c34787fddd29dc7c1c039351"; readonly isOfficial: true; readonly driftMechanism: "version_and_hash"; }, { readonly id: "claude-code-marketplace"; readonly agent: "claude-code"; readonly domain: "marketplace"; readonly tier: "tier_1"; readonly url: "https://json.schemastore.org/claude-code-marketplace.json"; readonly contentHash: "42c3f80413638e93a420256d942f409104b651379b9ac2451cc636f581de2ffc"; readonly isOfficial: false; readonly driftMechanism: "hash"; }, { readonly id: "claude-code-plugin-manifest"; readonly agent: "claude-code"; readonly domain: "plugin-manifest"; readonly tier: "tier_1"; readonly url: "https://json.schemastore.org/claude-code-plugin-manifest.json"; readonly contentHash: "3f69938d71a47a72fa60050b2050dd620054708911defc1c1dcd7188dcb169f5"; readonly isOfficial: false; readonly driftMechanism: "hash"; }, { readonly id: "claude-code-settings"; readonly agent: "claude-code"; readonly domain: "settings"; readonly tier: "tier_1"; readonly url: "https://json.schemastore.org/claude-code-settings.json"; readonly contentHash: "288891440e366ac4459210370f9e76a16612587cde3c32eaa69f116f268aa2fe"; readonly isOfficial: false; readonly driftMechanism: "hash"; }, { readonly id: "codex-config"; readonly agent: "codex"; readonly domain: "config"; readonly tier: "tier_1"; readonly url: "https://raw.githubusercontent.com/openai/codex/rust-v0.133.0/codex-rs/core/config.schema.json"; readonly versionPin: "rust-v0.133.0"; readonly contentHash: "39797d5fda11f43ae25d5383de131a981f2354cfca99cb40832ec22c2a5d4a34"; readonly isOfficial: true; readonly driftMechanism: "version_and_hash"; }, { readonly id: "codex-hooks"; readonly agent: "codex"; readonly domain: "hooks"; readonly tier: "tier_1"; readonly url: "https://raw.githubusercontent.com/openai/codex/rust-v0.133.0/codex-rs/hooks/schema/generated/session-start.command.input.schema.json"; readonly versionPin: "rust-v0.133.0"; readonly contentHash: "690c0eef7c9f3ddcd41e24207b81b362101a300b4abec076b990a1cd79a66e20"; readonly isOfficial: true; readonly driftMechanism: "version_and_hash"; }, { readonly id: "mcp-schema"; readonly agent: "mcp"; readonly domain: "protocol"; readonly tier: "tier_1"; readonly url: "https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.json"; readonly versionPin: "2025-11-25"; readonly contentHash: "7b2d96fd95efd2216aa953606b83f5a740ddeaa5ebd3a5d27b45a8296545a118"; readonly isOfficial: true; readonly driftMechanism: "version_and_hash"; }, { readonly id: "rulesync-config"; readonly agent: "rulesync"; readonly domain: "unified-config"; readonly tier: "tier_1"; readonly url: "https://github.com/dyoshikawa/rulesync/releases/latest/download/config-schema.json"; readonly contentHash: "f41b757318fadfbaebff3d94bed8efbcd1251879a33106469d432633355eb356"; readonly isOfficial: false; readonly driftMechanism: "hash"; }, { readonly id: "rulesync-mcp"; readonly agent: "rulesync"; readonly domain: "mcp-servers"; readonly tier: "tier_1"; readonly url: "https://github.com/dyoshikawa/rulesync/releases/latest/download/mcp-schema.json"; readonly contentHash: "9d7c500303d8c90b6788c9c5ffe5e758fddc3e8aaaea15c80feb0c03d681bf48"; readonly isOfficial: false; readonly driftMechanism: "hash"; }]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/_generated/source-metadata.gen.ts#L22)

Since v0.0.0