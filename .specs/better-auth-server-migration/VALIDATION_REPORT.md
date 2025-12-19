# Better Auth API Validation Report

**Date**: 2025-12-19  
**Reviewer**: Claude (Documentation Cross-Reference)  
**Scope**: M13 (OAuth2) and M14 (SSO) milestone documents

---

## Executive Summary

Cross-referenced M13-M14 planning documents against official Better Auth documentation. Found **critical architectural misunderstandings** regarding how Better Auth exposes OAuth2 and SSO endpoints.

**Status**: ✅ All corrections applied to milestone documents

---

## Findings

### M13: OAuth2 Provider Endpoints

#### Issue: Incorrect API Method Assumptions

**Problem**: The milestone document assumed Better Auth exposes `auth.api.oauth2.*` methods for all OAuth2 provider endpoints.

**Reality**: Better Auth's `oidcProvider()` plugin **auto-handles all OAuth2 provider endpoints internally**. There are **NO** explicit `auth.api.oauth2.*` methods.

#### Affected Endpoints (8 total)

All M13 endpoints were incorrectly documented:

| Endpoint | Incorrect Reference | Correct Approach |
|----------|-------------------|------------------|
| `GET /oauth2/authorize` | `oauth2.authorize` | Auto-handled by `oidcProvider()` plugin |
| `GET /oauth2/callback/:providerId` | `oauth2.callback` | Auto-handled by `oidcProvider()` plugin |
| `GET /oauth2/client/:id` | `oauth2.getClient` | Auto-handled by `oidcProvider()` plugin |
| `POST /oauth2/consent` | `oauth2.consent` | Auto-handled by `oidcProvider()` plugin |
| `POST /oauth2/link` | `oauth2.link` | Auto-handled by `oidcProvider()` plugin |
| `POST /oauth2/register` | `oauth2.register` | Auto-handled by `oidcProvider()` plugin |
| `POST /oauth2/token` | `oauth2.token` | Auto-handled by `oidcProvider()` plugin |
| `GET /oauth2/userinfo` | `oauth2.userinfo` | Auto-handled by `oidcProvider()` plugin |

#### Required Implementation Pattern

OAuth2 handlers must **proxy/forward** requests to Better Auth's internal handler:

```typescript
// ❌ INCORRECT - These methods don't exist
await auth.api.oauth2.authorize(params);
await auth.api.oauth2.token(payload);

// ✅ CORRECT - Proxy entire request to Better Auth
// Better Auth handles OAuth2 logic internally when oidcProvider() plugin is mounted
```

#### Corrections Applied

- Updated endpoint table "Better Auth Method" column to indicate auto-handling
- Added CRITICAL note section explaining OAuth2 provider architecture
- Updated all 8 handler implementation checklists with proxy/forward instructions
- Removed references to non-existent `auth.api.oauth2.*` methods

---

### M14: SSO Endpoints

#### Issue: Mixed Method Name Errors

**Problem**: Some SSO endpoints were referenced with incorrect method names, and auto-handled endpoints were mistakenly assumed to have explicit API methods.

#### Affected Endpoints (5 total)

| Endpoint | Incorrect Reference | Correct Method/Approach |
|----------|-------------------|------------------------|
| `GET /sso/callback/:providerId` | `sso.callback` | Auto-handled by `sso()` plugin |
| `POST /sso/register` | `sso.register` | `auth.api.registerSSOProvider()` ✅ |
| `POST /sso/saml2/callback/:providerId` | `sso.saml2Callback` | Auto-handled by `sso()` plugin |
| `POST /sso/saml2/sp/acs/:providerId` | `sso.saml2SpAcs` | Auto-handled by `sso()` plugin |
| `GET /sso/saml2/sp/metadata` | `sso.saml2SpMetadata` | `auth.api.spMetadata()` ✅ |

#### SSO Architecture Pattern

Better Auth SSO follows a **mixed pattern**:

**Auto-handled (3 endpoints):**
- Callback endpoints are handled internally by the `sso()` plugin
- Handlers must proxy requests to Better Auth

**Explicit API methods (2 endpoints):**
- `auth.api.registerSSOProvider()` - Provider registration
- `auth.api.spMetadata()` - SAML metadata retrieval

#### Corrections Applied

- Updated endpoint table with correct method names
- Fixed `/sso/register` handler to call `auth.api.registerSSOProvider()`
- Fixed `/sso/saml2/sp/metadata` handler to call `auth.api.spMetadata()`
- Updated callback/ACS handlers to proxy requests (no API method exists)
- Added CRITICAL note section explaining mixed pattern
- Listed all incorrect method names to avoid in implementation

---

## Documentation Sources Verified

### OAuth2 Provider Plugin
- ✅ `oidcProvider()` plugin configuration
- ✅ Dynamic client registration (`POST /oauth2/register`)
- ✅ Token endpoint (`POST /oauth2/token`)
- ✅ Consent endpoint (`POST /oauth2/consent`)
- ✅ Userinfo endpoint (`GET /oauth2/userinfo`)

### SSO Plugin
- ✅ `sso()` plugin configuration (`@better-auth/sso` package)
- ✅ OIDC provider registration
- ✅ SAML 2.0 configuration
- ✅ Service provider metadata endpoints
- ✅ Callback and ACS endpoint handling
- ✅ `auth.api.registerSSOProvider()` server method
- ✅ `auth.api.spMetadata()` server method

---

## Impact Assessment

### High Priority

**M13 (OAuth2)**:
- All 8 endpoint handlers require architectural changes
- Cannot proceed with current "call `auth.api.oauth2.*`" approach
- Must implement request proxying/forwarding to Better Auth

**M14 (SSO)**:
- 3 endpoint handlers require proxy pattern (callback, SAML callback, SAML ACS)
- 2 endpoint handlers have correct explicit methods but wrong names

### Risk Mitigation

✅ **Corrections applied** to milestone documents before implementation begins  
✅ **Critical notes** added to prevent incorrect implementation  
✅ **Example patterns** provided for proxy-based handlers

---

## Recommendations

### For Implementation Phase

1. **OAuth2 (M13)**: Research how to proxy requests to Better Auth's `oidcProvider()` plugin handler
   - May require accessing Better Auth's internal request handler
   - Check if Better Auth exposes a handler function for mounting at custom paths
   - Consider whether OAuth2 endpoints should be directly handled by Better Auth (no custom handlers needed)

2. **SSO (M14)**: Implement explicit API methods first, then investigate proxy pattern
   - Start with `/sso/register` and `/sso/saml2/sp/metadata` (clear API methods)
   - Research callback/ACS handler proxying similar to OAuth2

3. **Architecture Review**: Consider if custom handlers are necessary
   - Better Auth may handle these endpoints automatically when plugins are configured
   - Custom Effect-based handlers may only be needed for validation/transformation
   - Evaluate if paths can be directly mounted to Better Auth handlers

### For Documentation

1. Update any upstream specs or OpenAPI definitions to reflect auto-handling
2. Document the proxy pattern once implementation approach is validated
3. Create examples showing Better Auth plugin configuration

---

## Conclusion

The milestone documents reflected a misunderstanding of how Better Auth exposes its OAuth2 and SSO functionality. Better Auth uses a **plugin-based architecture** where:

- **OAuth2 Provider**: Fully auto-handled by `oidcProvider()` plugin
- **SSO**: Mixed pattern with auto-handled callbacks and explicit registration methods

All corrections have been applied to M13 and M14 documents. Implementation can now proceed with accurate architectural guidance.

**Next Steps**:
1. Research Better Auth request handler access/mounting patterns
2. Prototype proxy-based handler for one OAuth2 endpoint
3. Validate approach before boilerplating all handlers

---

**Validated Against**:
- Better Auth official documentation (github.com/better-auth/better-auth)
- Context7 Better Auth library documentation
- OIDC Provider plugin documentation
- SSO plugin documentation (`@better-auth/sso`)
