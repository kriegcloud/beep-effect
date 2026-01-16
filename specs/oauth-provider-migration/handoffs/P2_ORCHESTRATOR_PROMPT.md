# Phase 2: Domain Model Entities - Orchestrator Prompt

## Objective

Create 4 domain model entities for OAuth Provider in `packages/iam/domain/src/entities/`.

## Prerequisites

- Phase 1 complete: Entity IDs exist in `@beep/shared-domain`

## Context

The entity folders already exist but are empty:
- `OAuthClient/`
- `OAuthAccessToken/`
- `OAuthRefreshToken/`
- `OAuthConsent/`

## Files to Create/Modify

### Per Entity (4 entities)
- `<Entity>/<Entity>.model.ts` - M.Class model definition
- `<Entity>/index.ts` - Barrel export

### Index Update
- `packages/iam/domain/src/entities/index.ts` - Add exports for all 4

## Pattern Reference

Use `packages/iam/domain/src/entities/Account/Account.model.ts` as the canonical pattern:

```typescript
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthClient/OAuthClient.model");

export class Model extends M.Class<Model>($I`OAuthClientModel`)(
  makeFields(IamEntityIds.OAuthClientId, {
    // ... fields
  }),
  $I.annotations("OAuthClientModel", {
    title: "OAuth Client Model",
    description: "OAuth client application registration",
  })
) {
  static readonly utils = modelKit(Model);
}
```

## Entity Field Specifications

### OAuthClient

```typescript
makeFields(IamEntityIds.OAuthClientId, {
  clientId: S.NonEmptyString.annotations({
    description: "Public client identifier",
  }),
  clientSecret: BS.FieldSensitiveOptionOmittable(
    S.NonEmptyString.annotations({
      description: "Hashed client secret",
    })
  ),
  disabled: BS.toOptionalWithDefault(S.Boolean, false).annotations({
    description: "Whether client is disabled",
  }),
  skipConsent: BS.FieldOptionOmittable(S.Boolean.annotations({
    description: "Skip consent screen",
  })),
  enableEndSession: BS.FieldOptionOmittable(S.Boolean.annotations({
    description: "Enable end session endpoint",
  })),
  scopes: BS.FieldOptionOmittable(S.Array(S.String).annotations({
    description: "Allowed scopes",
  })),
  userId: BS.FieldOptionOmittable(SharedEntityIds.UserId.annotations({
    description: "Owner user ID",
  })),
  name: BS.FieldOptionOmittable(S.NonEmptyString.annotations({
    description: "Display name",
  })),
  uri: BS.FieldOptionOmittable(S.String.annotations({
    description: "Client URI",
  })),
  icon: BS.FieldOptionOmittable(S.String.annotations({
    description: "Icon URL",
  })),
  contacts: BS.FieldOptionOmittable(S.Array(S.String).annotations({
    description: "Contact emails",
  })),
  tos: BS.FieldOptionOmittable(S.String.annotations({
    description: "Terms of service URL",
  })),
  policy: BS.FieldOptionOmittable(S.String.annotations({
    description: "Privacy policy URL",
  })),
  softwareId: BS.FieldOptionOmittable(S.String.annotations({
    description: "Software identifier",
  })),
  softwareVersion: BS.FieldOptionOmittable(S.String.annotations({
    description: "Software version",
  })),
  softwareStatement: BS.FieldOptionOmittable(S.String.annotations({
    description: "Software statement JWT",
  })),
  redirectUris: S.Array(S.String).annotations({
    description: "Redirect URIs",
  }),
  postLogoutRedirectUris: BS.FieldOptionOmittable(S.Array(S.String).annotations({
    description: "Post-logout redirect URIs",
  })),
  tokenEndpointAuthMethod: BS.FieldOptionOmittable(S.String.annotations({
    description: "Token endpoint auth method",
  })),
  grantTypes: BS.FieldOptionOmittable(S.Array(S.String).annotations({
    description: "Allowed grant types",
  })),
  responseTypes: BS.FieldOptionOmittable(S.Array(S.String).annotations({
    description: "Allowed response types",
  })),
  public: BS.FieldOptionOmittable(S.Boolean.annotations({
    description: "Public client flag",
  })),
  type: BS.FieldOptionOmittable(S.String.annotations({
    description: "Client type",
  })),
  referenceId: BS.FieldOptionOmittable(S.String.annotations({
    description: "External reference ID",
  })),
  metadata: BS.FieldOptionOmittable(S.Unknown.annotations({
    description: "Custom metadata",
  })),
})
```

### OAuthAccessToken

```typescript
makeFields(IamEntityIds.OAuthAccessTokenId, {
  token: BS.FieldSensitiveOptionOmittable(
    S.String.annotations({
      description: "Access token value",
    })
  ),
  clientId: S.NonEmptyString.annotations({
    description: "OAuth client identifier",
  }),
  sessionId: BS.FieldOptionOmittable(SharedEntityIds.SessionId.annotations({
    description: "Associated session ID",
  })),
  userId: BS.FieldOptionOmittable(SharedEntityIds.UserId.annotations({
    description: "Token owner user ID",
  })),
  referenceId: BS.FieldOptionOmittable(S.String.annotations({
    description: "External reference ID",
  })),
  refreshId: BS.FieldOptionOmittable(IamEntityIds.OAuthRefreshTokenId.annotations({
    description: "Linked refresh token ID",
  })),
  expiresAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable.annotations({
    description: "Token expiration time",
  })),
  scopes: S.Array(S.String).annotations({
    description: "Granted scopes",
  }),
})
```

### OAuthRefreshToken

```typescript
makeFields(IamEntityIds.OAuthRefreshTokenId, {
  token: S.NonEmptyString.annotations({
    description: "Refresh token value",
  }),
  clientId: S.NonEmptyString.annotations({
    description: "OAuth client identifier",
  }),
  sessionId: BS.FieldOptionOmittable(SharedEntityIds.SessionId.annotations({
    description: "Associated session ID",
  })),
  userId: SharedEntityIds.UserId.annotations({
    description: "Token owner user ID",
  }),
  referenceId: BS.FieldOptionOmittable(S.String.annotations({
    description: "External reference ID",
  })),
  expiresAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable.annotations({
    description: "Token expiration time",
  })),
  revoked: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable.annotations({
    description: "Revocation timestamp",
  })),
  scopes: S.Array(S.String).annotations({
    description: "Granted scopes",
  }),
})
```

### OAuthConsent

```typescript
makeFields(IamEntityIds.OAuthConsentId, {
  clientId: S.NonEmptyString.annotations({
    description: "OAuth client identifier",
  }),
  userId: BS.FieldOptionOmittable(SharedEntityIds.UserId.annotations({
    description: "Consenting user ID",
  })),
  referenceId: BS.FieldOptionOmittable(S.String.annotations({
    description: "External reference ID",
  })),
  scopes: S.Array(S.String).annotations({
    description: "Consented scopes",
  }),
})
```

## Index File Pattern

Each entity needs an `index.ts`:
```typescript
export * from "./<Entity>.model";
```

## Main Index Update

Add to `packages/iam/domain/src/entities/index.ts`:
```typescript
export * as OAuthClient from "./OAuthClient";
export * as OAuthAccessToken from "./OAuthAccessToken";
export * as OAuthRefreshToken from "./OAuthRefreshToken";
export * as OAuthConsent from "./OAuthConsent";
```

## Implementation Steps

1. **Read Account.model.ts** for pattern reference
2. **Create OAuthClient.model.ts** following the pattern
3. **Create OAuthClient/index.ts** barrel export
4. **Repeat for OAuthAccessToken, OAuthRefreshToken, OAuthConsent**
5. **Update entities/index.ts** with all 4 exports
6. **Verify** with `bun run check --filter @beep/iam-domain`

## Verification

```bash
bun run check --filter @beep/iam-domain
```

Expected: No type errors

## Handoff

When complete:
1. Update `specs/oauth-provider-migration/REFLECTION_LOG.md` with learnings
2. Proceed to Phase 3 (Tables)
