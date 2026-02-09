# Incremental OAuth Consent / Scope Expansion Flow (Better Auth + Google)

## Quick Findings (and gaps vs the request)
- Social account linking is enabled server-side and fully modeled in the IAM client, but the IAM UI currently does not expose social sign-in or account linking. The social sign-in UI file is empty and the views have the social blocks commented out, so there is no end-user path to trigger a re-link flow today. This is a concrete gap relative to “end-to-end” handling.
- `GoogleScopeExpansionRequiredError` is created in the Google Workspace integration layer and propagated through adapters, but no RPC/HTTP contract currently models this error. Without a typed error contract, client UI cannot reliably detect and prompt for scope expansion.

## Where Social Linking Lives (IAM server, client, UI)

### Server
- Account linking is enabled in Better Auth options:
  - `account.accountLinking.enabled = true`, `allowDifferentEmails = true`, `trustedProviders = serverEnv.oauth.authProviderNames`.
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/server/src/adapters/better-auth/Options.ts`.
- Social provider configuration (including Google) is wired from environment:
  - `socialProviders` built from `serverEnv.oauth.provider[provider]`.
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/server/src/adapters/better-auth/Options.ts`.
- Better Auth is mounted at `/api/v1/auth/*` and serves its internal OAuth endpoints via the app server:
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/src/BetterAuthRouter.layer.ts`.

### Client
- OAuth2 link contract includes explicit `scopes` for incremental consent:
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/oauth2/link/contract.ts`.
- OAuth2 link handler calls Better Auth `oauth2.link` and returns an authorization URL to redirect the browser:
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/oauth2/link/handler.ts`.
- OAuth2 sign-in (generic) also accepts `scopes` to request incremental permissions:
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/sign-in/oauth2/contract.ts`.
- Social sign-in (provider = `google`) exists as a client contract + handler (no scopes field here, unlike OAuth2 sign-in):
  - Files:
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/sign-in/social/contract.ts`
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/sign-in/social/handler.ts`
- List/unlink accounts APIs exist and expose the stored `scope` string on each account:
  - Files:
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/core/list-accounts/contract.ts`
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/core/unlink-account/contract.ts`

### UI
- Sign-in social UI file exists but is empty, and sign-in view has social components commented out:
  - Files:
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/ui/src/sign-in/social/sign-in-social.from.tsx`
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/ui/src/sign-in/sign-in.view.tsx`
- Sign-up view also omits the social block (only email form renders):
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/ui/src/sign-up/sign-up.view.tsx`
- The IAM UI AGENTS guide explicitly notes social auth components are present but disabled in views:
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/ui/AGENTS.md`.

## How Scopes Are Stored and Checked
- Better Auth stores a space-separated `scope` string in the account table. The AuthContext layer reads it from `iam_account.scope` and exposes it via `AuthContext.oauth.getProviderAccount`:
  - File: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/src/AuthContext.layer.ts`.
- The Google Workspace integration checks scope coverage and throws `GoogleScopeExpansionRequiredError` when missing:
  - Error shape definition:
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/integrations/google-workspace/domain/src/errors/auth.errors.ts`
  - Scope validation logic:
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts`.
- Gmail and Calendar adapters call `getValidToken(REQUIRED_SCOPES)`, so the error bubbles from those adapters:
  - Gmail adapter + required scopes:
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/comms/server/src/adapters/GmailAdapter.ts`
  - Calendar adapter + required scopes:
    - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts`

## Current End-to-End Flow (As Implemented)
1. A server-side operation (Gmail/Calendar adapter) calls `GoogleAuthClient.getValidToken(requiredScopes)`.
2. `GoogleAuthClientLive` reads the stored scope string for the Google account from `iam_account.scope`.
3. If required scopes are missing, it throws `GoogleScopeExpansionRequiredError` with `currentScopes`, `requiredScopes`, and `missingScopes`.
4. There is no explicit error contract in RPC endpoints for this error in the shared RPC groups, so clients cannot reliably react to it without ad-hoc error parsing.

## Missing Pieces (Concrete)
- No UI for linking/re-linking accounts exists in IAM UI.
- No typed RPC error contract exposes `GoogleScopeExpansionRequiredError` data.
- No explicit “re-link Google” action exists in the MVP UI surface (`apps/todox` Settings → Connections). `apps/web` should not host this MVP surface.

## Recommended End-to-End Handling for `GoogleScopeExpansionRequiredError`

### 1. Server: Error Payload / Contract Shape
Add an explicit error schema to the relevant RPC endpoints (e.g., Gmail extraction, Gmail list/send, Calendar events). The contract should carry the required and missing scopes so the client can prompt for re-consent.

**Recommended error shape (schema-level):**
```ts
export class GoogleScopeExpansionRequired extends S.TaggedError<GoogleScopeExpansionRequired>()(
  "GoogleScopeExpansionRequiredError",
  {
    message: S.String,
    providerId: S.Literal("google"),
    currentScopes: S.Array(S.String),
    requiredScopes: S.Array(S.String),
    missingScopes: S.Array(S.String),
    relink: S.Struct({
      callbackURL: S.String,
      errorCallbackURL: S.String,
      scopes: S.Array(S.String)
    })
  }
) {}
```

**Why this shape:**
- Mirrors the existing domain error (`GoogleScopeExpansionRequiredError`) so the data is already available.
- Includes a `relink` block so the UI doesn’t need to derive callback URLs.
- Keeps `providerId` explicit for multi-provider expansion.

### 2. Server: How to Produce the Error
- When an operation fails with `GoogleScopeExpansionRequiredError`, map it directly into the RPC error channel or HTTP error response. Do not downcast to a generic error.
- If using RPC, include the error in `Rpc.make(..., { error: GoogleScopeExpansionRequired })` so the client can decode it.

### 3. Client/UI: Prompt and Re-Link Flow
**Suggested UI behavior:**
- Detect `GoogleScopeExpansionRequiredError` and show a modal or inline callout:
  - Title: “Google needs additional permissions.”
  - Body: show `missingScopes` (friendly labels mapped from scope strings).
  - CTA: “Re-authorize Google.”

**Re-link implementation:**
- Call IAM client `oauth2.link` with the expanded scopes and redirect to the returned URL.
  - Contract: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/oauth2/link/contract.ts`
  - Handler: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/iam/client/src/oauth2/link/handler.ts`

**Minimal re-link request:**
```ts
const payload = {
  providerId: "google",
  callbackURL: "/settings?settingsTab=connections",
  errorCallbackURL: "/settings?settingsTab=connections&relink=failed",
  scopes: [...requiredScopes]
};
```

### 4. UI Wiring Location (Suggested)
Given the locked spec decision (D-01), the canonical location is:
- TodoX Settings → Connections tab (`settingsTab=connections`) in `apps/todox`.
- `apps/web` should not host this MVP surface.

## Concrete Scope Constants and Usage
- Gmail scopes live in:
  - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/integrations/google-workspace/domain/src/scopes/gmail.scopes.ts`
- Calendar scopes live in:
  - `/home/elpresidank/YeeBois/projects/beep-effect3/packages/integrations/google-workspace/domain/src/scopes/calendar.scopes.ts`
- Adapters enforce required scopes:
  - Gmail: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/comms/server/src/adapters/GmailAdapter.ts`
  - Calendar: `/home/elpresidank/YeeBois/projects/beep-effect3/packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts`

## Summary
- **Incremental OAuth detection** is implemented in the Google Workspace integration layer and surfaced via `GoogleScopeExpansionRequiredError`.
- **Account linking** is enabled in IAM server and fully supported in IAM client via `oauth2.link` with `scopes`.
- **UI + contract exposure** for scope expansion is missing; without a typed error contract and a re-link UI, the flow cannot complete end-to-end.
