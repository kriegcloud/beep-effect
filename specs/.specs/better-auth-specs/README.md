# Better Auth API Specification Breakdown

> Source: `nextjs-better-auth-api-spec.json` (OpenAPI 1.1.0)
> Generated: 2025-12-18

This directory contains the complete Better Auth API specification broken down into focused, categorized documents for the Better Auth Server Migration project.

## Overview

- **Total Paths**: 138
- **Total Endpoints**: 138
- **Component Schemas**: 20
- **Category Documents**: 14

## Document Index

### Foundation Documents

| Document                               | Description                                                  |
|----------------------------------------|--------------------------------------------------------------|
| [SCHEMAS.md](./SCHEMAS.md)             | All component schema definitions (single source of truth)    |
| [COMMON_ERRORS.md](./COMMON_ERRORS.md) | Standard HTTP error responses (400, 401, 403, 404, 429, 500) |
| [VALIDATION.md](./VALIDATION.md)       | Quality assurance checklist and verification report          |

### Category Documents

| Category      | File                                   | Priority | Milestones | Endpoints | Description                                             |
|---------------|----------------------------------------|----------|------------|-----------|---------------------------------------------------------|
| Core          | [CORE.md](./CORE.md)                   | P0       | M0, M3-M8  | 29        | Root-level authentication and user management endpoints |
| Sign In       | [SIGN_IN.md](./SIGN_IN.md)             | P0       | M1         | 7         | User authentication endpoints                           |
| Sign Up       | [SIGN_UP.md](./SIGN_UP.md)             | P0       | M2         | 1         | User registration endpoints                             |
| Organization  | [ORGANIZATION.md](./ORGANIZATION.md)   | P1       | M10        | 35        | Multi-tenant organization and team management           |
| Two-Factor    | [TWO_FACTOR.md](./TWO_FACTOR.md)       | P1       | M11        | 8         | 2FA/MFA authentication endpoints                        |
| Admin         | [ADMIN.md](./ADMIN.md)                 | P2       | M9         | 15        | Administrative user management endpoints                |
| Passkey       | [PASSKEY.md](./PASSKEY.md)             | P2       | M12        | 7         | WebAuthn passkey authentication                         |
| SSO           | [SSO.md](./SSO.md)                     | P2       | M14        | 5         | Enterprise SSO and SAML endpoints                       |
| Phone Number  | [PHONE_NUMBER.md](./PHONE_NUMBER.md)   | P2       | M15        | 4         | Phone number authentication                             |
| API Key       | [API_KEY.md](./API_KEY.md)             | P2       | M15        | 5         | API key management                                      |
| Multi-Session | [MULTI_SESSION.md](./MULTI_SESSION.md) | P2       | M15        | 3         | Multi-device session management                         |
| OAuth 2.0     | [OAUTH2.md](./OAUTH2.md)               | P3       | M13        | 8         | OAuth 2.0 provider endpoints                            |
| Device        | [DEVICE.md](./DEVICE.md)               | P3       | M15        | 4         | Device code flow for OAuth                              |
| Miscellaneous | [MISC.md](./MISC.md)                   | P3       | M15        | 7         | Additional provider and utility endpoints               |

## Priority Breakdown

| Priority | Description              | Categories                                                | Total Endpoints |
|----------|--------------------------|-----------------------------------------------------------|-----------------|
| **P0**   | Core auth (MVP)          | CORE, SIGN_IN, SIGN_UP                                    | 37              |
| **P1**   | Multi-tenancy & security | ORGANIZATION, TWO_FACTOR                                  | 43              |
| **P2**   | Advanced auth methods    | ADMIN, PASSKEY, SSO, PHONE_NUMBER, API_KEY, MULTI_SESSION | 39              |
| **P3**   | Provider functionality   | OAUTH2, DEVICE, MISC                                      | 19              |

## Milestone Alignment

| Milestone(s) | Categories                                         | Total Endpoints |
|--------------|----------------------------------------------------|-----------------|
| M0, M3-M8    | CORE                                               | 29              |
| M1           | SIGN_IN                                            | 7               |
| M2           | SIGN_UP                                            | 1               |
| M9           | ADMIN                                              | 15              |
| M10          | ORGANIZATION                                       | 35              |
| M11          | TWO_FACTOR                                         | 8               |
| M12          | PASSKEY                                            | 7               |
| M13          | OAUTH2                                             | 8               |
| M14          | SSO                                                | 5               |
| M15          | PHONE_NUMBER, API_KEY, DEVICE, MULTI_SESSION, MISC | 23              |

## Component Schemas

All 20 component schemas are documented in [SCHEMAS.md](./SCHEMAS.md):

1. Account
2. Apikey
3. DeviceCode
4. Invitation
5. Jwks
6. Member
7. OauthAccessToken
8. OauthApplication
9. OauthConsent
10. Organization
11. OrganizationRole
12. Passkey
13. Session
14. SsoProvider
15. Team
16. TeamMember
17. TwoFactor
18. User
19. Verification
20. WalletAddress

## Document Format

All category documents follow a consistent structure:

1. **Header** - Category title, description, priority, milestones
2. **Endpoints** - Detailed documentation for each endpoint:
   - HTTP method and path
   - Description
   - Parameters (path/query)
   - Request body (with field tables)
   - Success response (200)
   - Error responses (reference to COMMON_ERRORS.md)
3. **Schema References** - Links to SCHEMAS.md using kebab-case anchors

## Usage Guidelines

### For Implementation

1. Start with **P0** categories (CORE, SIGN_IN, SIGN_UP) for MVP
2. Reference [SCHEMAS.md](./SCHEMAS.md) for all data structure definitions
3. Use [COMMON_ERRORS.md](./COMMON_ERRORS.md) for consistent error handling
4. Follow milestone order (M0 → M1 → M2 → ... → M15)

### For Documentation

- **Single Source of Truth**: All schemas in SCHEMAS.md only
- **Schema References**: Use format `See [\`SchemaName\`](SCHEMAS.md#schemaname)`
- **Error References**: Link to COMMON_ERRORS.md instead of repeating definitions
- **Anchor Format**: Kebab-case markdown anchors (e.g., `#user`, `#session`)

## Quality Assurance

See [VALIDATION.md](./VALIDATION.md) for:
- Endpoint coverage verification
- Schema completeness checklist
- Cross-reference validation
- Format consistency checks

## Categorization Rules

Endpoints are categorized using pattern matching (applied in order):

1. `/sign-in/*` → **SIGN_IN.md**
2. `/sign-up/*` → **SIGN_UP.md**
3. `/admin/*` → **ADMIN.md**
4. `/organization/*` → **ORGANIZATION.md**
5. `/two-factor/*` → **TWO_FACTOR.md**
6. `/passkey/*` → **PASSKEY.md**
7. `/oauth2/*` → **OAUTH2.md**
8. `/sso/*` → **SSO.md**
9. `/phone-number/*` → **PHONE_NUMBER.md**
10. `/api-key/*` → **API_KEY.md**
11. `/device/*` → **DEVICE.md**
12. `/multi-session/*` → **MULTI_SESSION.md**
13. `/siwe/*`, `/stripe/*`, `/.well-known/*`, `/one-tap/*`, `/token/*`, `/callback/*`, `/oauth-proxy-callback` → **MISC.md**
14. **Default**: All other paths → **CORE.md**

## Source Information

- **OpenAPI Version**: 1.1.0
- **API Title**: Better Auth
- **Source File**: `nextjs-better-auth-api-spec.json` (~680KB, ~23,500 lines)
- **Extraction Method**: Python scripts with jq validation
- **Generation Date**: 2025-12-18

## Next Steps

1. Review [VALIDATION.md](./VALIDATION.md) for quality assurance
2. Begin implementation with P0 categories
3. Reference category documents during development
4. Update schemas in SCHEMAS.md as API evolves
