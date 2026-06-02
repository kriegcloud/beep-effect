# OIP State And Asset Bucket Rename Evidence

Date: 2026-06-02

## Scope

- Migrated the temporary Pulumi S3 backend from `opip-law-pulumi-state` to
  `oip-law-pulumi-state`.
- Archived every versioned object from the historical backend into the new
  bucket before deleting the old bucket.
- Replaced the managed asset buckets through Pulumi:
  - `assets.opip.law` -> `assets.oip.law`
  - `staging-assets.opip.law` -> `staging-assets.oip.law`
- Retained the Pulumi project and stack namespace `opip-web` for state
  continuity.
- Did not cut over production DNS.

## Script

The migration used `ops/migrate-oip-state-bucket.ts`.

Preflight reported:

- AWS identity resolved in account `832907639880`.
- Source bucket `opip-law-pulumi-state` existed.
- Target bucket `oip-law-pulumi-state` did not yet exist.
- No current Pulumi lock objects were present.
- Source held 41 current `.pulumi` objects, 313 object versions, and 14 delete
  markers.

Migration reported:

- Target bucket `oip-law-pulumi-state` was created and hardened.
- Current Pulumi state was copied into the target bucket.
- 313 historical source object versions were archived under
  `.pulumi-migration-archive/2026-06-02T19-37-02.652Z/objects/`.
- A migration manifest was written under
  `.pulumi-migration-archive/latest-oip-state-bucket-migration.json`.
- Required `opip-web` stack state objects were verified in the new backend.

Final deletion reported:

- 327 source object version/delete-marker records were deleted.
- Source bucket `opip-law-pulumi-state` was deleted.

## Pulumi Proof

- `pulumi login s3://oip-law-pulumi-state` succeeded.
- Staging and production stacks were visible from the new backend.
- Staging `pulumi up` replaced the five managed S3 asset resources and changed
  outputs to:
  - `assetsBucketName: staging-assets.oip.law`
  - `stateBackendUrl: s3://oip-law-pulumi-state`
- Production `pulumi up` replaced the five managed S3 asset resources and
  changed outputs to:
  - `assetsBucketName: assets.oip.law`
  - `stateBackendUrl: s3://oip-law-pulumi-state`
- Final `pulumi preview --diff` was no-op for both stacks:
  - staging: 15 unchanged resources
  - production: 19 unchanged resources

## AWS Proof

- `oip-law-pulumi-state` exists in `us-east-1`.
- `assets.oip.law` exists in `us-east-1`.
- `staging-assets.oip.law` exists in `us-east-1`.
- `opip-law-pulumi-state` returns `404`.
- `assets.opip.law` returns `404`.
- `staging-assets.opip.law` returns `404`.
- New asset buckets have versioning enabled, public access blocked, and default
  SSE-S3 encryption enabled.
- The new state bucket contains 315 migration archive objects totaling
  17,483,325 bytes.
- The new state bucket contains 156 stack state object versions under
  `.pulumi/stacks/opip-web/` and no delete markers there.

## Remaining Gates

- OIP Cloudflare records for `staging.oip.law`, `www.oip.law`, and production
  cutover remain pending.
- OPIP legacy redirect records remain modeled and intentionally unapplied until
  provider cutover approval.
- Legacy OPIP host redirects and `/opip` path redirects remain intentional app
  behavior.
