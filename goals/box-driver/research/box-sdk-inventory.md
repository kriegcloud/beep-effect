# Box SDK Inventory

## Status

Initial packet-authoring inventory created on 2026-06-04 from the installed
`box-node-sdk` v10.11.1 type surface (`node_modules/box-node-sdk/lib/**`). No
network/docs fetch was performed during authoring; counts are from the installed
`.d.ts`. The implementation agent must re-verify at implementation time (P1) and
record drift.

P1 refresh on 2026-06-07 confirmed the installed SDK is still `10.11.1`, but
the exact generated type surface has drifted from the authoring estimates:
`BoxClient` has 85 manager properties, the manager classes expose 347 public
methods (346 `Promise` methods plus synchronous `events.getEventStream`), and
`lib/schemas` contains 299 schema `.d.ts` files. The local source clone at
`/home/elpresidank/YeeBois/dev/box-node-sdk` is on commit
`2e5fbf7c97635b1fe80817361615f8e6eb977ce0`, branch `main...origin/main`, and
also reports package version `10.11.1`.

Implementation refresh later on 2026-06-07 found that a direct method-signature
scan undercounted non-JSON methods: several upload methods reference request
body DTOs that contain `ByteStream` fields. The generator now recursively checks
referenced DTO declarations for `ByteStream` / `EventStream`. Resulting surface:
333 generated JSON operations plus 14 hand-written byte/event operations, for
the full 347 non-deprecated method surface.

## Sources

### Installed SDK

- Package: `box-node-sdk`
- Installed version: `10.11.1` (`node_modules/box-node-sdk/package.json`)
- Declared in `packages/drivers/box/package.json` as `box-node-sdk: catalog:`
  (root catalog pins `^10.11.1`).
- Local source clone: `/home/elpresidank/YeeBois/dev/box-node-sdk`
  (`2e5fbf7c97635b1fe80817361615f8e6eb977ce0`, clean
  `main...origin/main`, version `10.11.1`). Use this clone as the primary
  source-code reference when the installed `.d.ts` needs implementation context.
- The SDK is itself generated (`sdk-gen`) from the Box OpenAPI spec. It ships
  camelCase TypeScript interfaces with `serialize`/`deserialize` helpers and a
  `rawData?: SerializedData` passthrough on every object. There is **no runtime
  validation** in the SDK.

### References (to fetch at P1 if needed)

- `https://developer.box.com/reference/`
- `https://github.com/box/box-node-sdk`
- `https://github.com/box/box-openapi`

## SDK Type Surface Inspected

- `lib/index.d.ts` — top-level exports (auth classes, `BoxClient`).
- `lib/client.d.ts` — `BoxClient` and its 85 manager properties.
- `lib/managers/*.d.ts` — manager classes and method signatures.
- `lib/schemas/*.d.ts` — 301 model interfaces.
- `lib/box/errors.d.ts` — `BoxSdkError` / `BoxApiError`.
- `lib/box/eventStream.d.ts` — long-polling `EventStream`.

## Surface Counts (observed)

- Manager properties on `BoxClient`: **85**.
- Public manager methods: **347** (`346` async `Promise<...>` methods plus
  synchronous `events.getEventStream`).
- Schema files: **299**.
- `@deprecated` manager methods: **0** (the exclude-deprecated rule applies but
  currently drops nothing; re-check at P1).

## Client Construction And Auth

`new BoxClient({ auth })`. Auth classes exported from `lib/index.d.ts`:

- `BoxDeveloperTokenAuth({ token })` — single developer token. **V1 default**
  live layer, fed by `CLOUD_BOX_TOKEN`.
- `BoxCcgAuth` + `CcgConfig({ clientId, clientSecret, enterpriseId?, userId? })`
  — Client Credentials Grant (server auth). **V1 first-class** layer.
- `BoxJwtAuth` + `JwtConfig` — JWT App Auth. **Deferred** (reachable via
  `makeLayerFromClient`).
- `BoxOAuth` + `OAuthConfig` — OAuth2 user-delegation. **Deferred** (redirect
  flow outside a driver's remit; reachable via `makeLayerFromClient`).

## Manager Access Pattern

Managers are readonly properties on `BoxClient`; methods are
`method(requiredId: string, optionalsInput?: { requestBody?, queryParams?,
headers?, cancellationToken? })`. Examples:

- `client.files.getFileById(fileId, optionalsInput?) => Promise<FileFull>`
- `client.folders.getFolderById(folderId, optionalsInput?) => Promise<FolderFull>`
- `client.search.searchForContent(requestBody, optionalsInput?) => Promise<SearchResults>`
- `client.users.getUserMe(optionalsInput?) => Promise<UserFull>`

Generated payload schemas must capture the positional id(s) + the `requestBody`/
`queryParams` from the optionals object.

## In-Scope Surface

**Full non-deprecated surface**: all 347 public methods across all 85 managers,
generated per-method and grouped by manager except for methods that involve
`ByteStream`/`EventStream` directly or through a referenced DTO and therefore
need hand-written streaming adapters.
Manager groups (from
`lib/client.d.ts`), by domain:

- Files/versions/metadata: `files`, `trashedFiles`, `fileVersions`,
  `fileMetadata`, `fileClassifications`, `fileWatermarks`, `fileRequests`,
  `fileVersionRetentions`, `fileVersionLegalHolds`, `skills`.
- Folders: `folders`, `trashedFolders`, `folderMetadata`,
  `folderClassifications`, `folderWatermarks`, `folderLocks`, `trashedItems`,
  `transfer`.
- Metadata/classifications: `metadataTemplates`, `classifications`,
  `metadataCascadePolicies`, `metadataTaxonomies`.
- Sharing/collab: `listCollaborations`, `userCollaborations`, `sharedLinksFiles`,
  `sharedLinksFolders`, `sharedLinksWebLinks`, `sharedLinksAppItems`,
  `collaborationAllowlistEntries`, `collaborationAllowlistExemptTargets`,
  `appItemAssociations`.
- Comments/tasks: `comments`, `tasks`, `taskAssignments`.
- Web links/collections/recent: `webLinks`, `trashedWebLinks`, `collections`,
  `recentItems`.
- Users/groups/enterprise: `users`, `externalUsers`, `sessionTermination`,
  `avatars`, `emailAliases`, `memberships`, `invites`, `groups`,
  `enterpriseConfigurations`, `devicePinners`, `termsOfServices`,
  `termsOfServiceUserStatuses`, `storagePolicies`, `storagePolicyAssignments`.
- Governance: `retentionPolicies`, `retentionPolicyAssignments`,
  `legalHoldPolicies`, `legalHoldPolicyAssignments`.
- Shield: `shieldInformationBarriers`, `shieldInformationBarrierReports`,
  `shieldInformationBarrierSegments`, `shieldInformationBarrierSegmentMembers`,
  `shieldInformationBarrierSegmentRestrictions`, `shieldLists`.
- Sign/workflows/docgen: `signRequests`, `signTemplates`, `workflows`,
  `automateWorkflows`, `docgen`, `docgenTemplate`.
- Hubs: `hubs`, `hubCollaborations`, `hubItems`, `hubDocument`.
- AI: `ai`, `aiStudio`.
- Integrations/misc: `integrationMappings`, `webhooks`, `authorization`,
  `archives`, `notes`.
- Non-JSON (see below): `downloads`, `uploads`, `chunkedUploads`, `zipDownloads`,
  `events`.

## Non-JSON / Streaming Methods (hand-written in Box.streaming.ts)

The generator must skip any method whose return OR parameter involves
`ByteStream` / `EventStream`, and log them. Ordinary JSON/API methods returning
`Promise<undefined>` (delete, revoke, apply, start, and similar operations)
remain in the generated full surface as decoded void/undefined operations;
otherwise the driver would fail the full-surface requirement. Observed
byte/event methods:

- `downloads.downloadFile(fileId, ...) => Promise<undefined | ByteStream>` →
  Effect `Stream<Uint8Array>`.
- `files.getFileThumbnailById(...) => Promise<undefined | ByteStream>` →
  Effect `Stream<Uint8Array>`.
- `avatars.getUserAvatar(...) => Promise<ByteStream>` →
  Effect `Stream<Uint8Array>`.
- `downloads.getDownloadFileUrl(...) => Promise<string>` is generated as a
  string-returning operation.
- `zipDownloads.getZipDownloadContent(...) => Promise<ByteStream>` and
  `zipDownloads.downloadZip(...) => Promise<ByteStream>` → `Stream<Uint8Array>`.
  `createZipDownload`/`getZipDownloadStatus` return JSON (generate normally).
- `uploads` / `chunkedUploads`: methods taking `requestBody: ByteStream` (e.g.
  `uploadFilePart`, `uploadFile`, `uploadFileVersion`, `uploadBigFile`,
  `uploadFilePartByUrl`) need byte input; they return JSON envelopes
  (`UploadSession`, `Files`, `UploadedPart`, `FileFull`). Hand-write the byte
  input and decode the JSON envelope. Pure-JSON session methods
  (`getFileUploadSession*`, `delete*`) can be generated.
- `events.getEventStream(...) => EventStream` (synchronous, long-polling Node
  `Readable`) → finalizer-backed Effect `Stream` of decoded events
  (`Stream.callback` + `Effect.acquireRelease` closing the `EventStream`).
  `events.getEvents`/`getEventsWithLongPolling` return JSON (generate normally).

Exact byte/event skip list from the 2026-06-07 implementation refresh:

- `avatars.createUserAvatar`
- `avatars.getUserAvatar`
- `chunkedUploads.uploadFilePartByUrl`
- `chunkedUploads.uploadFilePart`
- `chunkedUploads.reducer`
- `chunkedUploads.uploadBigFile`
- `downloads.downloadFile`
- `events.getEventStream`
- `files.getFileThumbnailById`
- `uploads.uploadFile`
- `uploads.uploadFileVersion`
- `uploads.uploadWithPreflightCheck`
- `zipDownloads.getZipDownloadContent`
- `zipDownloads.downloadZip`

## Excluded / Deferred

- `@deprecated` SDK methods — none today; generator logs any future ones.
- OAuth2 user-delegation auth flow — deferred; via `makeLayerFromClient`.
- JWT App Auth config layer — deferred; via `makeLayerFromClient`.

## Schema Modeling Policy (Pragmatic Generated Fidelity)

- Optional fields → `S.optionalKey` (NOT `Option`).
- Open enums (`'gsuite' | 'office_wopi' | ... | string`) →
  `S.Union([LiteralKit([...known]), S.String])`.
- Closed literal unions → `LiteralKit`.
- `rawData` dropped; decoding permissive (ignore excess) so SDK field additions
  do not break decode.
- `DateTime` (SDK branded type from `internal/utils`) → an appropriate string/date
  schema; confirm representation at P2.
- Dynamic `SerializedData`/unknown shapes → `S.Record(S.String, S.Unknown)` or
  `S.Unknown`; never `any`.

This is a documented divergence from firecrawl's Option-wrapped hand bar,
justified by scale (301 schemas), Box open-enum/field evolution, and the runpod
generated precedent. Record in `standards/architecture/DECISIONS.md` at
implementation.

## Error Model

`BoxApiError extends BoxSdkError`. `BoxApiError.responseInfo` carries
`statusCode`, `code`, `contextInfo`, `requestId`, `helpUrl`, mapping to the
existing `BoxError` fields `status`, `code`, `context_info`, `request_id`,
`help_url`. `BoxError` gains `fromUnknown(method, cause)` / `fromReason(...)`
factories plus a `BoxMethodName` `LiteralKit` and error-reason `LiteralKit`.

## Live Integration Smoke Scope

Read-only only, env-gated on `CLOUD_BOX_TOKEN`, skipped when absent:

- `users.getUserMe()` → decoded `UserFull`.
- `folders.getFolderById("0")` → root folder.

No create/update/delete in CI.

## Drift To Re-Check (P1)

- Installed `box-node-sdk` version vs `10.11.1`: confirmed on 2026-06-07.
- Manager count (85), public method count (347), schema count (299):
  confirmed on 2026-06-07.
- `@deprecated` method list (0 today): confirmed on 2026-06-07.
- Auth class names/fields and `BoxApiError` field shape: confirmed on
  2026-06-07.
- Non-JSON method return/param types: confirmed as the byte/event skip list
  above on 2026-06-07.
