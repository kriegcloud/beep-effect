# P4 HubSpot Email Precision Pilot

Date: 2026-06-08

## Completed

- Remediated one `SFV4-precision-audit` advisory:
  `packages/drivers/hubspot/src/HubSpot.service.ts`
  `HubSpotUpsertContactRequest.email`.
- Added a local non-redacted `HubSpotContactEmail` schema with non-empty,
  maximum-length, and email-pattern checks.
- Kept the outbound request field as a plain string value for HTTP body
  construction while making the request schema reject malformed contact
  identities before the driver sends the CRM batch upsert.
- Refreshed `standards/schema-first.inventory.jsonc`; live precision advisories
  dropped from seven to six.

## Finding

The shared `@beep/schema` `Email` schema is redacted, which is correct for
domain/contact data but not always correct for wire objects that must serialize
the email as a string. This pilot uses a local precise schema because the
HubSpot request email is a protocol identity field, not merely log context.

HubSpot error-context email fields intentionally remain broad for now. If the
request itself is malformed, the driver still needs to preserve the invalid
input in a typed error for diagnostics; validating the error-context field with
the same request schema would risk hiding the original failure.

## Verification

```sh
cd packages/drivers/hubspot && bun run check
cd packages/drivers/hubspot && bun run lint
cd packages/drivers/hubspot && bun run test
cd packages/drivers/hubspot && bun run type-test
bun run beep lint schema-first
```

The live schema-first lint baseline after this pilot is:

```text
[schema-first] live_entries=361
[schema-first] tracked_entries=361
[schema-first] missing_entries=0
[schema-first] stale_entries=0
[schema-first] sfv4_precision_audit_advisories=6
```
