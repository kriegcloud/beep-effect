# R11 Multi-Account-Per-Org Plan (Google Workspace)

## Quick Findings (and mismatches to address)
- **Current OAuth API surface cannot disambiguate multiple Google accounts per user.** `AuthContext.oauth.getProviderAccount` and `getAccessToken` accept only `{ providerId, userId }`, which becomes ambiguous as soon as a user links two Google accounts. The implementation returns the first row for `(userId, providerId)` without an account selector. This is a functional flaw for multi-account-per-org. See `/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/src/AuthContext.layer.ts`.
- **Provider account identity is already locked for Documents mapping but not enforced everywhere.** Decision D-03 is LOCKED: `providerAccountId = IAM account.id` stored as a typed string. Some integration code still refers to “accountId” (provider subject) or assumes one account per provider. This needs explicit alignment. See `/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md` and `/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P1_PR_BREAKDOWN.md`.
- **UX surfaces are missing the selection step.** The plan assumes a “Connections” UI (D-01) but there is no account selection UI and no API to select which linked Google account to use for sync/extraction.

If the above isn’t fixed, multi-account per org will silently use the first linked Google account and lead to cross-account data pull or inconsistent mapping.

## Current Model (Better Auth + IAM)

### Better Auth account storage
- `iam_account` has:
  - `accountId` (external provider account identifier)
  - `providerId` (e.g., `google`)
  - `userId`
  - OAuth tokens, expiry, scope, etc.
  - Unique index on `(providerId, accountId)` to prevent duplicate external accounts.
  - Composite index `(userId, providerId)` but **not** unique. So multiple accounts per provider per user are allowed by schema.
  - Source: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/tables/src/tables/account.table.ts`

### IAM domain model
- `Account.Model` mirrors the table; `accountId` is explicitly described as the external provider account ID.
  - Source: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/domain/src/entities/account/account.model.ts`

### OAuth API surface exposed to integrations
- `AuthContext.oauth.getAccessToken({ providerId, userId })` and `getProviderAccount({ providerId, userId })`.
- Implementation reads the first `iam_account` row for `(providerId, userId)`.
  - Source: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/src/AuthContext.layer.ts`

### Google Workspace integration
- `GoogleAuthClientLive` uses `AuthContext.oauth.getAccessToken` and `getProviderAccount` with `providerId = "google"`.
- Scope validation uses the single selected account (first match). No account selection signal exists.
  - Source: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts`

## Locked Decision: Provider Account Identifier
- **D-03 (LOCKED):** `providerAccountId = IAM account.id` stored as a typed string (no FK) for document mapping and idempotency.
  - Source: `/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md`
- This must be treated as the **stable internal pointer** used across slices (Documents, Knowledge, Comms) and in sync/extraction orchestration.
- The external provider subject (`account.accountId`) remains needed for display/debug, but **not** as the primary identity key in cross-slice data.

## Required UX + API Contracts for Multi-Account Selection

### UX surface (Connections tab)
The Connections UI must do more than link/unlink:
1. **List all linked Google accounts** for the current user.
   - Data source: `iam.core.listAccounts` (already modeled). See `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/core/list-accounts/contract.ts`.
2. **Allow selecting one or more Google accounts** for org-level sync/extraction.
3. **Store selection at org scope**, not user scope.
   - Multi-account-per-org means the org chooses which linked accounts feed org data. The user’s personal account linking is a prerequisite, not the selection itself.

### API contracts to add or change

#### 1) Add account selection to OAuth API (integration layer)
**Problem:** current `getAccessToken`/`getProviderAccount` only take `providerId + userId`.

**Required change:** add an account selector to avoid ambiguity.

Proposed shape (AuthContext OAuth API):
```ts
// In @beep/shared-domain/Policy OAuthApi
getAccessToken: (params: {
  providerId: string;
  userId: string;
  accountId?: string; // IAM account.id (preferred)
}) => Effect.Effect<Option<OAuthTokenResult>, OAuthTokenError>

getProviderAccount: (params: {
  providerId: string;
  userId: string;
  accountId?: string; // IAM account.id
}) => Effect.Effect<Option<OAuthAccount>, OAuthAccountsError>
```

Implementation detail in `/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/src/AuthContext.layer.ts`:
- When `accountId` is provided, query by `id` (IAM account.id) + `userId` + `providerId`.
- When missing, **return an explicit error if multiple accounts exist** instead of arbitrary first row.

#### 2) Add “Org Google Connection” contract
A dedicated org-scoped table/service should record which IAM account ids are connected for Gmail extraction.

Minimal contract suggestion:
```ts
// Org-level connection record
{
  id: string,
  organizationId: string,
  providerId: "google",
  providerAccountId: string, // IAM account.id
  status: "active" | "revoked" | "needs_relink" | "missing_scopes",
  displayLabel?: string, // email or profile label if available
  createdAt: Date,
  updatedAt: Date
}
```

**Why:** multi-account-per-org is a selection problem, not a linking problem. You need a durable, org-scoped binding to drive sync/extraction and to key documents by `providerAccountId`.

#### 3) Scope expansion / relink contract
This already exists in `R6_OAUTH_SCOPE_EXPANSION_FLOW.md` and D-02, but must be account-specific:
- Error payload should include `providerAccountId` so the UI can relink the correct account.
- Relink call should target the specific account (see failure modes below).

## UX Flow (End-to-End)

1. **User links Google account(s)**
   - Use `iam.core.linkSocial` or `iam.oauth2.link` with scopes.
   - After callback, Better Auth writes `iam_account` row.

2. **Connections screen shows linked accounts**
   - `iam.core.listAccounts` returns `id`, `providerId`, `accountId`, `scope`.
   - UI groups by `providerId = google` and lists each account.

3. **Org selects which Google account(s) are active for sync**
   - New org contract persists `{ organizationId, providerAccountId }` rows.
   - Sync/extraction uses those rows to resolve which account to use.

4. **Extraction / sync uses explicit account id**
   - When performing Gmail operations, inject `providerAccountId` into `AuthContext.oauth.*` methods.
   - This prevents cross-account token selection.

5. **Documents mapping uses providerAccountId = IAM account.id**
   - This is already locked by D-03, and should be the same identifier stored in org connection records and used in document source mapping.

## Failure Modes + Required Handling

### 1) Account switched during OAuth
**Symptom:** user links a different Google account than intended (or Google reuses last account silently).

**Required mitigation:**
- Enforce an account selection prompt on link/relink flows, or explicitly show the account label returned after link and require confirmation before enabling sync.
- If OAuth callback returns an accountId that is not the intended `providerAccountId`, treat as a new account and require explicit selection.

### 2) Token revoked or refresh fails
**Symptom:** `getAccessToken` returns none or refresh fails → `GoogleAuthenticationError`.

**Required handling:**
- Mark org connection as `revoked` or `needs_relink`.
- Present UI action “Reconnect Google” scoped to that account.
- Sync should stop for that account, but other accounts remain active.

### 3) Partial scopes
**Symptom:** `GoogleScopeExpansionRequiredError` thrown when required scopes missing.

**Required handling:**
- Surface typed error with `missingScopes`, `providerAccountId`, and relink parameters.
- UI relink should target the account that needs expansion.

### 4) Multiple accounts but no selection
**Symptom:** without account selection, AuthContext chooses first account row; data could leak or be incorrect.

**Required handling:**
- If `accountId` not provided and multiple accounts exist for provider/user, return an explicit error (e.g., `OAuthAccountsError` with reason `MultipleAccountsNoSelection`).
- UI should prompt the user to pick an account for the org.

### 5) Account unlinked while org connection remains
**Symptom:** Org connection points to an account.id that no longer exists.

**Required handling:**
- On list connections, validate account existence; mark connection as `revoked` or `orphaned`.
- Cleanup job can soft-delete invalid connections.

## Provider Account ID Storage Guidance

**Primary key for cross-slice mapping:**
- `providerAccountId` must be **IAM account.id**. This aligns with D-03 and ensures the internal key is stable even if the external provider changes account identifiers or emails.

**External provider account id usage:**
- Use `iam_account.accountId` only for display/debugging and for ensuring uniqueness on link.
- Do not use `account.accountId` for Documents mapping or org connection identifiers.

## Concrete Changes Required (Minimal Set)

1. **Extend AuthContext OAuth API** to accept `accountId` (IAM account.id). If not provided and multiple accounts exist, return explicit error.
2. **Add org-level connection persistence** keyed by `providerAccountId` with status and optional label.
3. **Update GoogleAuthClientLive** to accept `providerAccountId` from callers and pass through to OAuth API selectors.
4. **Update extraction/sync entrypoints** to require an org connection (account id) rather than relying on implicit “current user’s Google account.”
5. **Connection UI** that lists accounts and lets org choose which to activate (D-01).

## References
- Account table schema: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/tables/src/tables/account.table.ts`
- Account domain model: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/domain/src/entities/account/account.model.ts`
- AuthContext OAuth API: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/shared/domain/src/Policy.ts`
- AuthContext implementation: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/src/AuthContext.layer.ts`
- GoogleAuthClientLive: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts`
- Locked decision D-03 (providerAccountId): `/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md`
- Scope expansion plan: `/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R6_OAUTH_SCOPE_EXPANSION_FLOW.md`
