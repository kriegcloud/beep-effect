# Better Auth Schema Transformations — Reflection Log

> Cumulative learnings from implementing Better Auth to domain model transformations.

---

## Reflection Protocol

After completing each entity transformation, answer:

1. **What worked well?** (techniques to keep)
2. **What didn't work?** (approaches to avoid)
3. **What was surprising?** (unexpected findings)
4. **What prompt refinements are needed?** (methodology improvements)

---

## Initial Learnings (From User Entity Reference Implementation)

### Date: 2025-01-14 — Phase 0: User Entity (Reference)

#### What Worked Well

1. **Returning encoded form in decode**: The `transformOrFail` decode function must return the **encoded** representation (`S.Schema.Encoded<typeof Model>`), not an instance of the model. This allows the Model's internal schema transformations to handle type conversions (Date → DateTime.Utc, string → Redacted).

2. **ID validation pattern**: Using `SharedEntityIds.<EntityId>.is(ba.id)` to validate that Better Auth IDs match the expected `${table}__${uuid}` format caught a critical assumption — Better Auth is configured with `generateId: false`.

3. **Required Field Validation**: All required fields (`_rowId`, `version`, `source`, audit fields) MUST be present in Better Auth response. Using `require*` helpers ensures configuration errors surface immediately rather than being masked by placeholder values.

4. **Type assertion for encoded form**: The pattern `as S.Schema.Encoded<typeof Model>` is necessary when returning the encoded object because TypeScript can't infer the complex conditional types.

#### What Didn't Work

1. **Returning Model instance**: Initially tried `return new User.Model({...})` which caused type errors because `transformOrFail` expects the encoded representation to flow through the target schema's transformations.

2. **Direct field mapping without null handling**: Better Auth uses `nullish()` (null | undefined) but domain models use `Option.none()` requiring explicit `?? null` coercion.

#### Surprising Findings

1. **BetterAuthError import path**: The error class is at `@better-auth/core/error`, not `@better-auth/core`. This caused a build error in a separate file.

2. **image field handling**: Better Auth's `image` field is `string | null | undefined` but our schema class expects `string | undefined`, requiring `?? undefined` in the encode direction.

#### Prompt Refinements

- **ALWAYS check imports**: When using Better Auth types, verify the exact export path in `tmp/better-auth/packages/core/`
- **ALWAYS handle nullable vs optional**: Use `?? null` for decode (into domain), `?? undefined` for encode (into Better Auth)
- **ALWAYS validate ID format before processing**: Early validation prevents confusing downstream errors

---

## Phase Reflections

### Phase 1: Core Entities (Session, Account)

#### Session Entity

### Date: 2025-01-15 — Phase 1: Session Entity Implementation

#### What Worked Well

1. **Struct+Record Extension Pattern**: Using `F.pipe(S.Struct({...}), S.extend(S.Record({...})))` successfully handles Better Auth's plugin-added fields. This pattern allows unknown properties to pass through while maintaining type safety for core fields.

2. **Type Annotations Over Type Assertions**: Replacing banned `as S.Schema.Encoded<typeof Model>` with explicit type annotations (`const encodedSession: SessionModelEncoded = {...}`) provides compile-time validation without violating codebase rules. TypeScript validates the object structure at assignment time.

3. **Shared Helper Extraction**: Moving `require*` helpers and `toDate()` to `transformation-helpers.ts` eliminated duplication between User and Session transformations. This established a pattern for future entity transformations.

4. **Comprehensive ID Validation**: Validating all ID fields (session, user, organization, team, impersonatedBy) with early `ParseResult.fail` returns prevents confusing downstream errors. Each validation provides clear error messages indicating expected vs actual format.

5. **Required Field Detection**: The transformation correctly identifies `activeOrganizationId` as REQUIRED in the domain model and fails early if Better Auth doesn't provide it. This catches configuration issues immediately.

6. **Encode Direction Date Handling**: The `toDate()` helper cleanly handles multiple date representations (Date, DateTime.Utc, string, number) when encoding back to Better Auth format.

#### What Didn't Work

1. **Initial transformOrFail Confusion**: Initially unclear whether `transformOrFail.decode` should return `Effect<Type>` or `Effect<Encoded>` when `strict: true`. Documentation review revealed it must return `Effect<Encoded>` — the schema framework internally decodes Encoded → Type.

2. **ParseResult.decode/encode Misuse**: Early attempts tried calling `ParseResult.decode(Session.Model)(encodedSession)` at the end of the decode callback. This is wrong — the callback should return the encoded object directly. The schema framework handles the decode step.

3. **Nullable vs Optional Confusion**: Better Auth uses `S.optionalWith(..., { nullable: true })` (field can be null/undefined/missing) while domain models use `null` for Option.none(). Required careful `?? null` coercion in decode and `?? undefined` in encode to maintain contract.

#### Surprising Findings

1. **transformOrFail.decode Returns Encoded Form**: The most counterintuitive finding — when `strict: true`, the decode callback returns `Effect<Target.Encoded>`, NOT `Effect<Target.Type>`. The schema framework internally decodes the Encoded form to Type. This pattern applies to ALL transformOrFail schemas.

2. **Session Has More Foreign Keys Than User**: Session entity references User (userId), Organization (activeOrganizationId), Team (activeTeamId), and User again (impersonatedBy). Each FK required format validation, making Session transformation more complex than User.

3. **Plugin Fields Are Runtime-Only**: Better Auth plugins add fields (activeOrganizationId, activeTeamId, impersonatedBy) that don't appear in Better Auth's TypeScript types. Using `S.extend(S.Record(...))` was essential to handle these fields without schema errors.

4. **Required vs Optional Misalignment**: Better Auth's TypeScript types show `activeOrganizationId` as optional, but our domain model requires it. This means the transformation will fail if Better Auth isn't configured with the organization plugin or if sessions are created without an active organization.

#### Prompt Refinements

**Original instruction**: "Implement the Session transformation following the User pattern"

**Problem**: Didn't emphasize the difference between `transformOrFail.decode` returning Encoded vs Type, causing initial confusion and iteration.

**Refined instruction**:
```
When implementing transformOrFail schemas with strict: true:
1. The decode callback MUST return Effect<Target.Encoded, ParseIssue, R>
2. Do NOT call ParseResult.decode/encode at the end of the callback
3. Return the encoded object directly with explicit type annotation
4. The schema framework internally decodes Encoded → Type
5. Use `const encoded: ModelEncoded = {...}` instead of type assertions
```

**Original instruction**: "Use the same ID validation pattern as User"

**Problem**: Didn't specify what to do when domain model fields are REQUIRED but Better Auth fields are optional.

**Refined instruction**:
```
For each foreign key field in the Better Auth schema:
1. Check if it's REQUIRED in the domain model
2. If REQUIRED but Better Auth has it optional, add explicit null/undefined check
3. Fail early with descriptive error if required field is missing
4. Validate ID format with SharedEntityIds.XXXId.is() for all present FKs
5. Include all ID values in error messages for debugging
```

#### Methodology Improvements

- [x] Extract shared transformation helpers to `transformation-helpers.ts`
- [x] Establish "type annotation over type assertion" pattern for encoded objects
- [x] Document that transformOrFail.decode returns Encoded form (added to session.schemas.ts comments)
- [ ] Create a transformation checklist template for remaining entities
- [ ] Add unit tests for Session transformation edge cases (missing required fields, invalid ID formats)

#### Codebase-Specific Insights

1. **Better Auth Configuration Assumption**: The codebase assumes Better Auth is configured with `generateId: false` and organization/team plugins enabled. Session transformations will fail if these assumptions don't hold.

2. **Required Fields Must Be Present**: All required fields (`_rowId`, `version`, `source`, audit fields) MUST be provided by Better Auth. The `require*` helpers fail with `ParseResult.Type` if missing, surfacing configuration errors immediately rather than masking them with placeholder values.

3. **Session Has Most Complex FK Graph**: Session entity references more foreign entities (User, Organization, Team, User again for impersonation) than any other entity, making it the most complex transformation to validate.

4. **Date Conversion Is Bidirectional**: The `toDate()` helper shows that date conversion happens in both directions — Better Auth → Domain (Date → DateTime.Utc) happens via schema, Domain → Better Auth (DateTime.Utc → Date) happens via helper.

#### Account Entity

### Date: 2025-01-15 — Phase 2: Account Entity Implementation

#### What Worked Well

1. **Phase 1 Patterns Applied Seamlessly**: The patterns established in Session (type annotation, Struct+Record, shared helpers, ID validation) transferred directly to Account with no modifications needed. Implementation time was significantly reduced compared to Session.

2. **Simple Field Mapping**: Account fields mapped cleanly to domain model fields. Unlike Session which had complex FK relationships, Account primarily has identity fields (providerId, accountId, userId) and optional OAuth tokens.

3. **FieldSensitiveOptionOmittable Encoding**: OAuth tokens (accessToken, refreshToken, idToken) use `BS.FieldSensitiveOptionOmittable` which expects `null | string` in encoded form. The `?? null` pattern works identically to regular Option fields.

4. **FieldOptionOmittable with DateTime**: Token expiry fields (accessTokenExpiresAt, refreshTokenExpiresAt) use `BS.FieldOptionOmittable` with `DateTimeUtcFromAllAcceptable`. The encoded form accepts `null | Date`, and the `?? null` coercion works correctly.

5. **Fewer FK Validations Required**: Account only has `userId` as a foreign key (vs Session's 4 FKs), making the validation logic simpler and more focused.

6. **Biome Auto-Fixed Import Order**: Biome automatically fixed import ordering (Account import moved before $IamClientId), confirming the lint:fix workflow catches these issues.

#### What Didn't Work

1. **Nothing significant**: The Phase 1 patterns were robust enough that no major issues arose. The implementation was essentially mechanical pattern application.

#### Surprising Findings

1. **Password Field Complexity**: The domain model uses `BS.FieldOptionOmittable(BS.Password)` for the password field, but Better Auth's schema shows `password: z.string().nullish()`. The Password type may have additional validation (hashing checks), but for this transformation we simply pass the nullable string through. Future work may need to handle password hashing validation.

2. **No Returned: False Filtering Needed**: The orchestrator prompt mentioned checking for `returned: false` fields in Better Auth schema. However, the account schema doesn't use `returned` annotations — all fields are returned. The transformation schema includes password for completeness, with a comment noting it's typically not returned by the API.

3. **Entity ID Namespace Difference**: Account uses `IamEntityIds.AccountId` (iam namespace: `iam_account__`) while User/Session use `SharedEntityIds` (shared namespace: `shared_user__`, `shared_session__`). This is correct — Account is an IAM-specific entity while User/Session are shared kernel entities.

4. **Simpler Than Expected**: Account transformation was simpler than Session despite having more optional fields. The complexity in Session came from multiple FK validations and required field checking, not field count.

#### Prompt Refinements

**Original instruction**: "Create Account.Model transformation following Session patterns"

**Observation**: This was sufficiently clear. No refinement needed.

**New guidance for future entities**:
```
When creating transformations for entities with sensitive fields:
1. Check if field uses BS.FieldSensitiveOptionOmittable (Redacted wrapper)
2. Encoded form is `null | string` — NOT `null | Redacted<string>`
3. The schema handles Redacted wrapping during decode
4. In encode direction, field may be Redacted<string> — may need Redacted.value() if calling Better Auth APIs directly
```

#### Methodology Improvements

- [x] Confirmed Phase 1 patterns are reusable without modification
- [x] Established that simpler entities (fewer FKs) take ~50% less implementation time
- [ ] Consider creating a transformation template that pre-fills boilerplate for new entities
- [ ] Add integration test that verifies round-trip: BetterAuth → Domain → BetterAuth

#### Codebase-Specific Insights

1. **Entity ID Namespaces**: Account belongs to IAM slice (`iam_account__`), confirming that entity ID prefixes indicate which domain slice "owns" the entity. This will be important for entities like Organization that might be shared.

2. **Sensitive Field Pattern Consistency**: OAuth tokens follow the same `FieldSensitiveOptionOmittable` pattern as passwords, ensuring consistent handling of credentials across the domain model.

3. **Account Is Linkage Entity**: Account represents the linkage between a User and an external OAuth provider. Multiple accounts can link to one user (Google + GitHub accounts for same user). This explains why userId is the only FK — the account is the junction entity.

4. **Password Storage**: The password field on Account (not User) indicates Better Auth stores passwords per-provider-account. A user with email/password and OAuth will have separate Account records, with password only on the credential account.

---

### Phase 2: Auth Support Entities (Verification, RateLimit)

#### Verification Entity

### Date: 2025-01-15 — Phase 3 (Spec P2): Verification Entity Implementation

#### What Worked Well

1. **Established Patterns Continue to Work**: The Struct+Record extension, type annotation pattern, shared helpers, and ID validation from Session/Account all transferred seamlessly to Verification. The implementation was essentially mechanical pattern application.

2. **Simple Field Structure**: Verification has only 3 entity-specific fields (identifier, value, expiresAt) plus the standard audit fields. This made the transformation straightforward compared to Session's complex FK graph.

3. **No FK Validation Required**: Unlike Session (4 FKs) or Account (1 FK), Verification has no foreign key references. This eliminated the need for FK format validation, making the transformation simpler.

4. **expiresAt FieldOptionOmittable Handling**: The `expiresAt` field uses `BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable)` which expects `null | Date` in encoded form. The Better Auth schema provides a non-nullable Date, which works directly without coercion.

5. **Biome Import Order Auto-Fix**: As with Account, Biome automatically reordered imports (moved `@beep/iam-domain/entities` before `@beep/identity/packages`), confirming the lint:fix workflow catches these consistently.

#### What Didn't Work

1. **Nothing significant**: The established patterns were robust enough that no issues arose. Implementation time was minimal.

#### Surprising Findings

1. **Verification Token Returned by Default**: The orchestrator prompt warned to check for `returned: false` on the `value` field since it contains the verification token. However, Better Auth's verification schema does NOT mark `value` as `returned: false` — tokens are returned by default. This is a potential security consideration depending on API exposure.

2. **NonEmptyString vs String**: Domain model uses `S.NonEmptyString` for identifier and value fields, while Better Auth uses plain `z.string()`. The transformation passes strings directly and lets the domain schema handle validation. Empty strings would fail at the schema level, not the transformation.

3. **expiresAt is Required in Better Auth, Optional in Domain**: Better Auth requires `expiresAt` in the verification schema, but the domain model wraps it with `FieldOptionOmittable`. This means all Better Auth verifications have expiry, but the domain model allows for verifications without expiry. The transformation handles this by passing the Date directly (which becomes `Option.some(DateTime.Utc)`).

4. **Minimal Entity Graph**: Verification is an isolated entity — no foreign keys, no plugin fields, no sensitive fields. This makes it the simplest transformation of the three implemented so far.

#### Prompt Refinements

**Original instruction**: "Check for returned: false fields"

**Observation**: This guidance is valuable but Verification doesn't use it. The pattern to check is:
```typescript
// In Better Auth schema definition:
value: z.string().annotate({ returned: false })
```
Verification lacks this annotation, so all fields are included.

**Refined guidance for future entities**:
```
When checking for returned: false:
1. Read the entity schema in tmp/better-auth/packages/core/src/db/schema/
2. Look for .annotate({ returned: false }) or { returned: false } in field definitions
3. If field has returned: false, EXCLUDE from BetterAuthXXXSchema
4. If no such annotation, include the field in the schema
5. Note that returned: false fields are typically sensitive (passwords, tokens, secrets)
```

#### Methodology Improvements

- [x] Confirmed pattern works for entities with no FKs (simpler than Session/Account)
- [x] Established that simpler entities (no FKs, no plugin fields) take ~30% of Session implementation time
- [x] Verified expiresAt pattern for FieldOptionOmittable with DateTimeUtc
- [ ] Consider adding security note about token exposure in client schemas

#### Codebase-Specific Insights

1. **Verification ID Namespace**: Verification uses `IamEntityIds.VerificationId` (prefix: `iam_verification__`), confirming it's an IAM-specific entity like Account.

2. **Token Lifecycle**: Verification entities represent short-lived authentication tokens. The `expiresAt` field is critical for token validity checks. Domain code should always check expiry before using verification tokens.

3. **Multiple Verification Types**: Better Auth uses the same Verification entity for email verification, password reset, and magic links. The `identifier` field stores the email/phone, and `value` stores the token. No explicit type field exists — verification type is determined by context.

4. **Security Surface**: The `value` field contains the actual verification token. Since Better Auth returns it by default, client code must be careful not to expose this in logs or error messages.

---

### Phase 4 (Spec P4): RateLimit Entity Implementation

#### RateLimit Entity

### Date: 2026-01-15 — Phase 4: RateLimit Entity Implementation

#### What Worked Well

1. **Established Patterns Applied to Unique Case**: Despite RateLimit's unique characteristics (no coreSchema extension), the Struct+Record pattern, type annotation approach, and shared helpers all worked correctly. The pattern is robust enough to handle entities that differ from the "standard" Better Auth schema structure.

2. **Record Extension Captures Database-Added Fields**: RateLimit is the first entity where Better Auth provides ZERO identity/audit fields. The `S.extend(S.Record({...}))` pattern successfully captured `id`, `_rowId`, `version`, `createdAt`, `updatedAt`, and all audit fields from the database layer. This validates the pattern for any entity regardless of Better Auth's native schema.

3. **Explicit Null Validation for M.Generated Fields**: TypeScript caught that `requireDate` returns `Date | null` but `M.Generated` fields (createdAt, updatedAt) expect non-null values. Adding explicit null validation (`if (createdAtRaw === null) return yield* ParseResult.fail(...)`) with type narrowing resolved the type error and added runtime safety.

4. **BigIntFromNumber Transparent Handling**: The `lastRequest` field uses `S.BigIntFromNumber` in the domain model (encoded: number, Type: bigint). The transformation simply passes the number through, and the domain schema handles the bigint conversion. No special handling was needed in the transformation itself.

5. **ID Validation Pattern Works for Database-Generated IDs**: Even though Better Auth doesn't provide the ID (unlike Session/Account/Verification), the validation pattern still works because the database adds IDs in the expected branded format (`iam_rate_limit__<uuid>`).

#### What Didn't Work

1. **Initial createdAt/updatedAt Type Error**: The first implementation passed `createdAt` (type: `Date | null`) directly to `RateLimitModelEncoded.createdAt` (expected: `Date`). TypeScript correctly flagged this, requiring explicit null validation and type narrowing.

#### Surprising Findings

1. **Better Auth RateLimit Doesn't Extend coreSchema**: Unlike ALL other Better Auth entities (User, Session, Account, Verification, etc.), RateLimit's schema defines ONLY `key`, `count`, `lastRequest`. No `id`, `createdAt`, `updatedAt`. This is documented in Better Auth's source:
   ```typescript
   // tmp/better-auth/packages/core/src/db/schema/rate-limit.ts
   export const rateLimitSchema = z.object({
     key: z.string(),
     count: z.number(),
     lastRequest: z.number()  // No coreSchema extension!
   });
   ```

2. **Database Layer Adds All Identity Fields**: Since Better Auth doesn't provide IDs, the database must generate them. The Record extension pattern captures these database-added fields. This confirms the architectural assumption: Better Auth is configured with `generateId: false`, and the database layer generates all branded IDs.

3. **M.Generated Fields Have Stricter Encoded Types**: Fields wrapped in `M.Generated` (like `createdAt`, `updatedAt`) have non-nullable encoded types, while `BS.FieldOptionOmittable` fields (like `deletedAt`) accept `null`. This distinction matters when using `requireDate` which returns `Date | null`.

4. **BigIntFromNumber is Transparent in Transformations**: The `lastRequest` field transformation is trivial — just pass the number through. The complexity of bigint ↔ number conversion is entirely handled by the Schema, not the transformation. This is a strength of the Effect Schema design.

5. **RateLimit is Ephemeral Data**: Rate limit records are short-lived (typically cleared after the rate limit window). This explains why Better Auth doesn't invest in coreSchema infrastructure for them — they're operational data, not persistent entities.

#### Prompt Refinements

**Original instruction**: "Better Auth's RateLimit schema does NOT extend coreSchema"

**Observation**: This was correctly stated but the implications needed to be explicitly connected:
- No `id` from Better Auth → must validate ID from Record extension
- No `createdAt`/`updatedAt` from Better Auth Struct → must extract from Record extension
- All audit fields from Record extension

**Refined guidance for non-coreSchema entities**:
```
When implementing transformations for entities WITHOUT coreSchema:
1. Better Auth Struct fields: ONLY the native fields (key, count, lastRequest)
2. ID field: Extract from Record extension, NOT from Struct
3. createdAt/updatedAt: Extract from Record extension, NOT from Struct
4. All audit fields: Extract from Record extension
5. Validate M.Generated fields are non-null after extraction (requireDate returns Date | null)
6. The Record extension handles ALL database-added fields uniformly
```

**New type narrowing pattern**:
```typescript
// For M.Generated fields that must not be null:
const createdAtRaw = yield* requireDate(ba, "createdAt", ast);
if (createdAtRaw === null) {
  return yield* ParseResult.fail(new ParseResult.Type(ast, createdAtRaw, "createdAt is required"));
}
const createdAt = createdAtRaw; // TypeScript narrows to Date
```

#### Methodology Improvements

- [x] Confirmed Struct+Record pattern handles entities with minimal Better Auth schemas
- [x] Discovered M.Generated vs FieldOptionOmittable null handling distinction
- [x] Validated BigIntFromNumber transformation is transparent (no special handling needed)
- [x] Established type narrowing pattern for M.Generated fields after requireDate
- [ ] Consider adding a check to transformation templates: "Does entity extend coreSchema?"
- [ ] Future entities should note whether they have non-standard Better Auth schemas

#### Codebase-Specific Insights

1. **RateLimit ID Namespace**: RateLimit uses `IamEntityIds.RateLimitId` (prefix: `iam_rate_limit__`), confirming it's an IAM-specific entity like Account and Verification.

2. **Ephemeral vs Persistent Entities**: RateLimit is the first "ephemeral" entity transformed. Its short lifecycle explains the minimal Better Auth schema. Future transformations should distinguish ephemeral (RateLimit) from persistent (User, Session, Account) entities.

3. **M.Generated vs FieldOptionOmittable Type Distinction**:
   - `M.Generated` fields: Required in database, encoded type is non-nullable
   - `BS.FieldOptionOmittable` fields: Optional in database, encoded type is `null | T`
   - This distinction affects transformation code when using `requireDate` helper

4. **Database Layer Responsibilities**: For RateLimit, the database layer is responsible for:
   - Generating branded IDs (`iam_rate_limit__<uuid>`)
   - Setting `createdAt`/`updatedAt` timestamps
   - Providing all audit fields (`source`, `deletedAt`, `createdBy`, etc.)
   - Providing `_rowId` and `version` for concurrency

---

### Phase 5 (Next): Organization Entities (Organization, Member)

_To be filled after Phase 5 completion_

---

### Phase 6: WalletAddress Entity (SIWE Plugin)

### Date: 2026-01-15 — Phase 6: WalletAddress Entity Implementation

#### What Worked Well

1. **RateLimit Pattern Transfer**: WalletAddress follows the same pattern as RateLimit — missing `id` and `updatedAt` from Better Auth. The SIWE plugin schema only defines `userId`, `address`, `chainId`, `isPrimary`, and `createdAt`. All identity and audit fields come from the database via Record extension. This pattern transferred directly from Phase 4.

2. **Plugin Schema Consistency**: The SIWE plugin schema (`tmp/better-auth/packages/better-auth/src/plugins/siwe/schema.ts`) matches expectations from the orchestrator prompt analysis. No surprises or undocumented fields.

3. **No Sensitive Fields**: Unlike TwoFactor (Phase 5), WalletAddress has NO `returned: false` fields. All plugin fields are API-safe, making this transformation useful for standard API responses as well as internal flows.

4. **Quick Implementation**: With established patterns (Struct+Record, require* helpers, type annotations, ID validation), implementation was straightforward. No new patterns needed.

5. **Biome Auto-Fixes**: Unused import (`requireBoolean`) caught by type check and removed. Biome fixed minor formatting. Clean verification pass.

#### What Didn't Work

1. **Initial Import of Unused Helper**: Included `requireBoolean` import initially but didn't use it. Caught by `tsc` error TS6133. Minor cleanup required.

#### Surprising Findings

1. **Minimal Plugin Schema**: SIWE plugin WalletAddress has only 5 fields (excluding database-provided fields). This is even simpler than RateLimit (3 Better Auth native fields + database fields).

2. **`chainId` Type**: Better Auth uses `number` for `chainId`, while domain uses `S.Int`. The schema handles number → S.Int coercion transparently (no special handling needed, similar to BigIntFromNumber pattern from RateLimit).

3. **`isPrimary` Boolean Default**: Domain model uses `BS.BoolWithDefault(false)`, and Better Auth schema also defaults to `false`. The `S.optionalWith` pattern handles this cleanly.

4. **No Special Blockchain Address Validation**: Better Auth stores wallet addresses as plain strings without on-chain validation (checksum, format). Domain model uses `S.NonEmptyString` but doesn't validate Ethereum address format. This is likely intentional — validation happens at sign-in time, not persistence time.

#### Prompt Refinements

The orchestrator prompt was accurate. No refinements needed.

**Validated guidance**: The "extract from Record extension" pattern for missing `id`/`updatedAt` was documented correctly in the orchestrator prompt. The pattern applied directly.

#### Methodology Improvements

- [x] Confirmed SIWE plugin follows same pattern as RateLimit (no coreSchema inheritance)
- [x] Validated plugin schemas can differ significantly from core schemas
- [x] Established that blockchain-specific fields (addresses, chainIds) need no special handling
- [ ] Future: Consider whether blockchain address format validation should be added to domain

#### Codebase-Specific Insights

1. **WalletAddress ID Namespace**: WalletAddress uses `IamEntityIds.WalletAddressId` (prefix: `iam_wallet_address__`), confirming it's an IAM-specific entity.

2. **Plugin Hierarchy**: SIWE (Sign-In With Ethereum) is a Better Auth plugin, not core functionality. Plugin schemas may have different characteristics:
   - Core schemas: Session, User, Account, Verification (extend coreSchema)
   - Plugin schemas without coreSchema: RateLimit, WalletAddress
   - Plugin schemas with sensitive data: TwoFactor

3. **Multi-Chain Support**: The `chainId` field enables multi-chain wallet linking. Users can have multiple wallet addresses across different chains (Ethereum mainnet, Polygon, Arbitrum, etc.).

4. **Primary Wallet Pattern**: The `isPrimary` flag suggests users can have multiple wallets but designate one as primary. This is a common pattern for default selection in multi-wallet UIs.

---

### Phase 5: Security Entities (TwoFactor)

### Date: 2026-01-15 — Phase 5: TwoFactor Entity Implementation

#### What Worked Well

1. **Record Extension for `returned: false` Fields**: TwoFactor is unique because ALL plugin-specific fields (`secret`, `backupCodes`, `userId`) have `returned: false` in Better Auth. The Struct only contains coreSchema fields (`id`, `createdAt`, `updatedAt`), but the Record extension successfully captures sensitive fields when present in internal data flows. This mirrors the RateLimit pattern where database-provided fields come through the Record extension.

2. **Explicit Transformation Scope Documentation**: Adding clear documentation that the transformation "only works when sensitive fields ARE present" and listing valid use cases (internal/admin flows, database queries, testing) prevents misuse. The transformation will fail fast with descriptive errors for standard API responses.

3. **Consistent Pattern Application**: Despite the unique `returned: false` challenge, the established patterns (Struct+Record, type annotation, require* helpers, ID validation) transferred directly. No new patterns were needed for the implementation itself.

4. **Descriptive Error Messages for Missing Sensitive Fields**: Added specific error messages explaining that fields "may have returned: false in API response" helps developers understand why the transformation failed in specific contexts.

5. **M.Sensitive vs BS.FieldSensitiveOptionOmittable Distinction**: Domain model uses `M.Sensitive` (required, wrapped for sensitivity) for secrets, not `BS.FieldSensitiveOptionOmittable` (optional). This informed that secret/backupCodes are REQUIRED in domain, making the transformation validation behavior correct.

#### What Didn't Work

1. **Initial Confusion About ALL Fields Having `returned: false`**: The orchestrator prompt emphasized excluding `returned: false` fields, which made sense for most entities. But TwoFactor has ALL plugin fields marked this way, requiring a mental shift: the transformation exists for internal data flows, not API responses.

#### Surprising Findings

1. **`userId` Also Has `returned: false`**: Unexpectedly, even the `userId` foreign key has `returned: false` in Better Auth's TwoFactor schema. This means API responses contain ONLY `id`, `createdAt`, `updatedAt` — effectively useless for client transformations. The TwoFactor status is typically exposed through the User entity's `twoFactorEnabled` field instead.

2. **Security-First Schema Design**: Better Auth's decision to mark ALL TwoFactor fields as `returned: false` demonstrates security-first design. TOTP secrets and backup codes should NEVER be exposed via API. This is the correct approach, even though it means client transformations have limited utility.

3. **Plugin Schemas vs Core Schemas**: TwoFactor is from the two-factor plugin (`tmp/better-auth/packages/better-auth/src/plugins/two-factor/schema.ts`), not core Better Auth. Plugin schemas may have different security postures than core schemas.

4. **Transformation Serves Internal Flows Only**: Unlike Session/Account/Verification which transform API responses, TwoFactor transformation only works for:
   - Internal/admin data flows with full database access
   - Database query results before API serialization
   - Testing with mock data that includes all fields

#### Prompt Refinements

**Original instruction**: "EXCLUDE returned: false fields"

**Problem**: This instruction is correct for most entities but needs nuance. When ALL plugin fields have `returned: false`, the schema becomes minimal (only coreSchema fields), and the transformation serves a different purpose.

**Refined guidance for `returned: false` handling**:
```
When checking for returned: false fields:
1. If SOME fields have returned: false → Exclude those from Struct, include others
2. If ALL plugin fields have returned: false → Struct contains only coreSchema fields
3. The Record extension still captures returned: false fields when present (internal flows)
4. Document clearly that transformation works ONLY when sensitive fields ARE present
5. Add descriptive error messages mentioning "returned: false" for failed validations
6. Consider whether a transformation is even useful for API-only use cases
```

**New pattern for fully-sensitive entities**:
```typescript
/**
 * NOTE: Better Auth marks ALL plugin fields as `returned: false`.
 * This transformation only works for internal data flows where sensitive
 * fields ARE present (database queries, admin APIs, testing).
 * Standard API responses lack these fields and will fail transformation.
 */
```

#### Methodology Improvements

- [x] Confirmed Record extension captures `returned: false` fields when present
- [x] Established documentation pattern for transformations with limited scope
- [x] Validated M.Sensitive vs BS.FieldSensitiveOptionOmittable distinction
- [ ] Consider adding a "transformation scope" enum/tag (API-safe vs Internal-only)
- [ ] Future entities should note if transformation has limited utility

#### Codebase-Specific Insights

1. **TwoFactor ID Namespace**: TwoFactor uses `IamEntityIds.TwoFactorId` (prefix: `iam_two_factor__`), confirming it's an IAM-specific entity.

2. **Security Entity Characteristics**: TwoFactor is the first "security" entity transformed. Security entities may have different transformation characteristics (all fields sensitive, transformation for internal use only).

3. **M.Sensitive for Required Secrets**: Domain model uses `M.Sensitive(S.NonEmptyString)` for secrets, indicating:
   - The field is REQUIRED (not wrapped in FieldOptionOmittable)
   - The field contains sensitive data (wrapped in M.Sensitive for logging/debugging)
   - Encoded form is plain string; schema handles sensitivity wrapping

4. **API Response vs Internal Data**: This is the first entity where the transformation explicitly serves different data sources than API responses. Future entities should consider whether they're transforming API responses or internal data.

---

## Accumulated Improvements

### MASTER_ORCHESTRATION.md Updates

| Update | Reason | Applied |
|--------|--------|---------|
| _None yet_ | | |

### Common Patterns Discovered

| Pattern | Description | Example |
|---------|-------------|---------|
| Encoded return type | `transformOrFail.decode` returns encoded form, NOT Type | `const encoded: ModelEncoded = {...}; return encoded;` |
| Type annotation over assertion | Use explicit type annotation instead of `as` | `const encoded: SessionModelEncoded = {...}` |
| Struct+Record extension | Handle unknown plugin fields from Better Auth | `F.pipe(S.Struct({...}), S.extend(S.Record({...})))` |
| ID validation | Validate branded ID format early | `SharedEntityIds.XXXId.is(id)` |
| Null coercion decode | Convert `nullish` to explicit `null` for domain | `field ?? null` |
| Undefined coercion encode | Convert `null` to `undefined` for Better Auth | `field ?? undefined` |
| Required field helpers | Validate and extract required fields, FAIL if missing | `yield* requireNumber(ba, "_rowId", ast)` |
| Required field validation | Fail early if domain requires but BA provides optional | `if (!ba.field) return yield* ParseResult.fail(...)` |
| Shared helpers | Extract common logic to transformation-helpers.ts | `toDate()`, `requireNumber()`, `requireString()`, etc. |
| M.Generated null validation | Validate M.Generated fields are non-null after requireDate | `if (createdAtRaw === null) return yield* ParseResult.fail(...)` |
| Non-coreSchema extraction | Extract all identity/audit fields from Record extension | ID, createdAt, updatedAt all from Record for RateLimit |
| BigIntFromNumber transparency | Pass number through, let schema handle bigint conversion | `lastRequest: betterAuthRateLimit.lastRequest` |
| `returned: false` field handling | Exclude from Struct, but Record extension captures when present | TwoFactor: Struct has only coreSchema, secrets come from Record |
| Internal-only transformation scope | Document when transformation serves internal flows only | TwoFactor transformation requires full database data |
| Plugin without coreSchema | SIWE/RateLimit plugins don't extend coreSchema; all identity fields from DB | WalletAddress: no id/updatedAt in Struct |
| Descriptive `returned: false` errors | Explain why field is missing in error message | `"field may have returned: false in API response"` |

### Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Correct Approach |
|--------------|--------------|------------------|
| Return Model instance in decode | Type mismatch, skips transformations | Return encoded object with type annotation |
| Return Type from transformOrFail.decode | Schema expects Encoded when strict: true | Return `const encoded: ModelEncoded = {...}` |
| Call ParseResult.decode at end of decode | Doubles the decode step, causes type errors | Return encoded object directly |
| Use type assertion `as S.Schema.Encoded<typeof Model>` | Banned pattern in codebase | Use explicit type annotation instead |
| Skip ID validation | Silent failures downstream | Validate first with `ParseResult.fail` |
| Use `undefined` for Option fields in decode | Domain expects `null` for None | Use `?? null` in decode direction |
| Use `null` for optional fields in encode | Better Auth expects `undefined` | Use `?? undefined` in encode direction |
| Use S.Class for Better Auth schemas | Can't handle unknown plugin fields | Use S.Struct + S.extend(S.Record(...)) |
| Assume all entities extend coreSchema | RateLimit has no id/createdAt/updatedAt | Check each entity's Better Auth schema source |
| Skip null validation for M.Generated | requireDate returns Date \| null, M.Generated expects Date | Add explicit null check with type narrowing |
| Expect `returned: false` fields in API responses | Better Auth never returns these fields via API | Document transformation scope; use for internal flows only |
| Confuse M.Sensitive with BS.FieldSensitiveOptionOmittable | Different optionality: M.Sensitive is required, FSOO is optional | Check domain model wrapper to understand field requirement |

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques

1. _To be filled_
2. _To be filled_
3. _To be filled_

### Top 3 Wasted Efforts

1. _To be filled_
2. _To be filled_
3. _To be filled_

### Recommended Changes for Next Spec

1. _To be filled_
