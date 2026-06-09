# P2 Precision Email Field Advisory

Date: 2026-06-08

## Completed

- Implemented the first `SFV4-precision-audit` advisory slice in
  `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`.
- The rule is AST-backed and intentionally narrow:
  - it only scans schema field object literals passed to `S.Class`,
    `S.Struct`, `S.TaggedClass`, `S.TaggedStruct`, `S.ErrorClass`, or
    `S.TaggedErrorClass`;
  - it only flags fields named exactly `email`;
  - it flags broad `S.String`, `S.String.pipe(...)`, and
    `S.optionalKey(S.String...)` expressions;
  - it ignores fields already using `Email`, `ContactEmail`,
    `S.NonEmptyString`, or explicit checks;
  - generated files stay excluded through the shared TypeScript source
    exclusion rules.
- Findings are inventoried as:
  - `kind`: `schema-policy-advisory`;
  - `status`: `advisory`;
  - `ruleId`: `SFV4-precision-audit`;
  - line and symbol metadata.
- Missing advisory inventory entries emit structured `[schema-first:issue]`
  warnings with rule-specific remediation toward `@beep/schema` `Email`, a
  local precise email schema, or an explicit external-protocol exception.
- Repo grounding:
  - `packages/foundation/modeling/schema/src/Email.ts` exports public
    `Email` and `EmailString`;
  - `packages/foundation/modeling/schema/src/internal/email.ts` defines the
    normalized branded email string schema and the redacted email wrapper.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```

The focused fixture proves `email: S.String` in a schema class emits a
structured `SFV4-precision-audit` advisory, while `email: Email` produces no
advisory.

The live repo currently reports:

```text
[schema-first] sfv4_precision_audit_advisories=0
```

The remaining tracked live precision exceptions are:

- `apps/oip-web/src/contact/ContactSubmission.model.ts`:
  `ContactSubmissionFormPayload.email`, because raw browser `FormData` staging
  intentionally preserves submitted email text before `ContactSubmission`
  performs domain normalization and validation;
- `packages/drivers/hubspot/src/HubSpot.errors.ts`:
  `HubSpotErrorOptions.email`, because driver diagnostics intentionally
  preserve invalid external input for error reporting.

Four earlier live advisories were remediated in P4 by introducing public
`EmailString` for non-redacted, displayable/serializable email string domains:

- `apps/oip-web/src/content/OipContent.model.ts`: `ContactContent.email`;
- `packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts`:
  `RuntimeDraftRecipient.email`;
- `packages/tooling/library/repo-utils/src/schemas/PackageJson.ts`:
  `BugsObject.email`;
- `packages/tooling/library/repo-utils/src/schemas/PackageJson.ts`:
  `PersonObject.email`.

## Still Pending

- `HubSpotUpsertContactRequest.email` was remediated with a local non-redacted
  precise schema because it is an outbound CRM identity field. HubSpot error
  context emails intentionally remain broad until a safer diagnostic shape is
  chosen, because invalid request input still needs to be reportable.
- Revisit the two precision exceptions if the raw browser form staging payload
  or HubSpot diagnostic options stop needing to preserve invalid values.
- Consider URL, path, slug, and domain field slices only after measuring their
  noise separately.
- Keep broad string exceptions explicit for external protocols that really do
  allow non-email strings in an `email` field.
