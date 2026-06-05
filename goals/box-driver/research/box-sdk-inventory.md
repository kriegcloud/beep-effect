# Box SDK Inventory

## Status

Initial packet-authoring inventory created on 2026-06-04 from the installed
`box-node-sdk` v10.11.1 type surface (`node_modules/box-node-sdk/lib/**`). No
network/docs fetch was performed during authoring; counts are from the installed
`.d.ts`. The implementation agent must re-verify at implementation time (P1) and
record drift.

## Sources

### Installed SDK

- Package: `box-node-sdk`
- Installed version: `10.11.1` (`node_modules/box-node-sdk/package.json`)
- Declared in `packages/drivers/box/package.json` as `box-node-sdk: catalog:`
  (root catalog pins `^10.11.1`).
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
- Async (`Promise<...>`) manager methods: **~305**.
- Schema files: **301**.
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

**Full non-deprecated surface**: all ~305 async methods across all 85 managers,
generated per-method and grouped by manager. Manager groups (from
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

The generator must skip any method whose return OR a parameter involves
`ByteStream` / `EventStream` / `undefined`-only returns, and log them. Observed:

- `downloads.downloadFile(fileId, ...) => Promise<undefined | ByteStream>` →
  Effect `Stream<Uint8Array>`.
- `downloads.getDownloadFileUrl(...) => Promise<string>` (JSON-ish; can be
  generated as a string-returning op).
- `zipDownloads.getZipDownloadContent(...) => Promise<ByteStream>` and
  `zipDownloads.downloadZip(...) => Promise<ByteStream>` → `Stream<Uint8Array>`.
  `createZipDownload`/`getZipDownloadStatus` return JSON (generate normally).
- `uploads` / `chunkedUploads`: methods taking `requestBody: ByteStream` (e.g.
  `uploadFilePart`, `uploadFile`, `uploadFileVersion`, `uploadBigFile`,
  `uploadFilePartByUrl`) need byte input; they return JSON envelopes
  (`UploadSession`, `Files`, `UploadedPart`, `FileFull`). Hand-write the byte
  input, decode the JSON envelope. Pure-JSON session methods
  (`getFileUploadSession*`, `delete*`) can be generated.
- `events.getEventStream(...) => EventStream` (synchronous, long-polling Node
  `Readable`) → finalizer-backed Effect `Stream` of decoded events
  (`Stream.callback` + `Effect.acquireRelease` closing the `EventStream`).
  `events.getEvents`/`getEventsWithLongPolling` return JSON (generate normally).

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

- Installed `box-node-sdk` version vs `10.11.1`.
- Manager count (85), async method count (~305), schema count (301).
- `@deprecated` method list (0 today).
- Auth class names/fields and `BoxApiError` field shape.
- Non-JSON method return/param types across the five streaming managers.
