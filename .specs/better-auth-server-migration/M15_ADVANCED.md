# Milestone 15: Advanced Endpoints

> **Status**: PENDING
> **Spec References**:
> - [.specs/better-auth-specs/PHONE_NUMBER.md](../better-auth-specs/PHONE_NUMBER.md)
> - [.specs/better-auth-specs/API_KEY.md](../better-auth-specs/API_KEY.md)
> - [.specs/better-auth-specs/DEVICE.md](../better-auth-specs/DEVICE.md)
> - [.specs/better-auth-specs/MULTI_SESSION.md](../better-auth-specs/MULTI_SESSION.md)
> - [.specs/better-auth-specs/MISC.md](../better-auth-specs/MISC.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: ❌ Need creation
- Infra handlers: ❌ Need creation

**Next Action**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read all five spec documents (links above)
- [ ] Verify endpoint count: 23 total (4 phone, 5 api-key, 4 device, 3 multi-session, 7 misc)
- [ ] Check for custom authentication requirements
- [ ] Identify endpoints with complex nested objects (API Key metadata, permissions)
- [ ] Review Better Auth method names for all 23 endpoints

## Overview

This milestone implements advanced authentication and utility endpoints across five categories:

1. **Phone Number (4 endpoints)**: Phone-based authentication flows including OTP verification and password reset
2. **API Key (5 endpoints)**: Programmatic API key management with rate limiting and permissions
3. **Device (4 endpoints)**: OAuth device code flow (RFC 8628) for device authorization
4. **Multi-Session (3 endpoints)**: Multi-device session management and switching
5. **Miscellaneous (7 endpoints)**: Provider integrations (SIWE, One Tap, OAuth proxy) and utilities

These are advanced features used less frequently than core auth flows, grouped together for efficiency.

## Endpoints Summary

### Phone Number (4 endpoints)

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /phone-number/request-password-reset | `v1/phone-number/request-password-reset.ts` | `v1/phone-number/request-password-reset.ts` | `phoneNumber.requestPasswordReset` |
| POST | /phone-number/reset-password | `v1/phone-number/reset-password.ts` | `v1/phone-number/reset-password.ts` | `phoneNumber.resetPassword` |
| POST | /phone-number/send-otp | `v1/phone-number/send-otp.ts` | `v1/phone-number/send-otp.ts` | `phoneNumber.sendPhoneNumberOTP` |
| POST | /phone-number/verify | `v1/phone-number/verify.ts` | `v1/phone-number/verify.ts` | `phoneNumber.verify` |

### API Key (5 endpoints)

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /api-key/create | `v1/api-key/create.ts` | `v1/api-key/create.ts` | `apiKey.create` |
| POST | /api-key/delete | `v1/api-key/delete.ts` | `v1/api-key/delete.ts` | `apiKey.delete` |
| GET | /api-key/get | `v1/api-key/get.ts` | `v1/api-key/get.ts` | `apiKey.get` |
| GET | /api-key/list | `v1/api-key/list.ts` | `v1/api-key/list.ts` | `apiKey.list` |
| POST | /api-key/update | `v1/api-key/update.ts` | `v1/api-key/update.ts` | `apiKey.update` |

### Device (4 endpoints)

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /device/approve | `v1/device/approve.ts` | `v1/device/approve.ts` | `device.approve` |
| POST | /device/code | `v1/device/code.ts` | `v1/device/code.ts` | `device.code` |
| POST | /device/deny | `v1/device/deny.ts` | `v1/device/deny.ts` | `device.deny` |
| POST | /device/token | `v1/device/token.ts` | `v1/device/token.ts` | `device.token` |

### Multi-Session (3 endpoints)

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| GET | /multi-session/list-device-sessions | `v1/multi-session/list-device-sessions.ts` | `v1/multi-session/list-device-sessions.ts` | `multiSession.listDeviceSessions` |
| POST | /multi-session/revoke | `v1/multi-session/revoke.ts` | `v1/multi-session/revoke.ts` | `multiSession.revoke` |
| POST | /multi-session/set-active | `v1/multi-session/set-active.ts` | `v1/multi-session/set-active.ts` | `multiSession.setActive` |

### Miscellaneous (7 endpoints)

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| GET | /.well-known/openid-configuration | `v1/misc/openid-configuration.ts` | `v1/misc/openid-configuration.ts` | **Built-in endpoint** (no explicit API method) |
| GET | /oauth-proxy-callback | `v1/misc/oauth-proxy-callback.ts` | `v1/misc/oauth-proxy-callback.ts` | **Plugin-managed redirect** (no explicit API method) |
| POST | /one-tap/callback | `v1/misc/one-tap-callback.ts` | `v1/misc/one-tap-callback.ts` | `oneTap.callback` (verify) |
| POST | /siwe/nonce | `v1/misc/siwe-nonce.ts` | `v1/misc/siwe-nonce.ts` | `siwe.nonce` |
| POST | /siwe/verify | `v1/misc/siwe-verify.ts` | `v1/misc/siwe-verify.ts` | `siwe.verify` |
| POST | /stripe/webhook | `v1/misc/stripe-webhook.ts` | `v1/misc/stripe-webhook.ts` | **Webhook handler** (Better Auth manages internally) |
| GET | /token | `v1/misc/token.ts` | `v1/misc/token.ts` | `token()` (JWT plugin) |

> **Note**: Several misc endpoints are built-in or plugin-managed by Better Auth and may not expose explicit `auth.api.*` methods. These endpoints are handled automatically by Better Auth plugins (OIDC, OAuth Proxy, Stripe, JWT).

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### Phone Number Group

##### Create Group Directory
- [ ] Create directory `packages/iam/domain/src/api/v1/phone-number/`

##### `request-password-reset.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/phone-number/request-password-reset.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /phone-number/request-password-reset`
  - Spec anchor: `PHONE_NUMBER.md#post-phone-numberrequest-password-reset`
  - Better Auth method: `phoneNumber.requestPasswordReset`
  - Implementation: Request OTP for password reset via phone number
- [ ] Add `Payload` class stub with fields: `phoneNumber`
- [ ] Add `Success` class stub with fields: `status` (boolean true)
- [ ] Add `Contract` export

##### `reset-password.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/phone-number/reset-password.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /phone-number/reset-password`
  - Spec anchor: `PHONE_NUMBER.md#post-phone-numberreset-password`
  - Better Auth method: `phoneNumber.resetPassword`
  - Implementation: Reset password using phone number OTP
- [ ] Add `Payload` class stub with fields: `otp`, `phoneNumber`, `newPassword`
- [ ] Add `Success` class stub with fields: `status` (boolean true)
- [ ] Add `Contract` export

##### `send-otp.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/phone-number/send-otp.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /phone-number/send-otp`
  - Spec anchor: `PHONE_NUMBER.md#post-phone-numbersend-otp`
  - Better Auth method: `phoneNumber.sendPhoneNumberOTP`
  - Implementation: Send OTP to phone number
- [ ] Add `Payload` class stub with fields: `phoneNumber`
- [ ] Add `Success` class stub with fields: `message` (optional string)
- [ ] Add `Contract` export

##### `verify.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/phone-number/verify.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /phone-number/verify`
  - Spec anchor: `PHONE_NUMBER.md#post-phone-numberverify`
  - Better Auth method: `phoneNumber.verify`
  - Implementation: Verify phone number with OTP
- [ ] Add `Payload` class stub with fields: `phoneNumber`, `code`, `disableSession` (optional bool), `updatePhoneNumber` (optional bool)
- [ ] Add `Success` class stub with fields: `status` (boolean), `token` (optional string), `user` (optional object)
- [ ] Add `Contract` export

##### `_group.ts` (Phone Number)
- [ ] Create `packages/iam/domain/src/api/v1/phone-number/_group.ts`
- [ ] Import all 4 phone number endpoints
- [ ] Create Group class `iam.phoneNumber` with `.prefix("/phone-number")`
- [ ] Add all 4 contracts to group
- [ ] Export all endpoints as namespaces

##### `index.ts` (Phone Number)
- [ ] Create `packages/iam/domain/src/api/v1/phone-number/index.ts`
- [ ] Barrel export all 4 endpoints and group

#### API Key Group

##### Create Group Directory
- [ ] Create directory `packages/iam/domain/src/api/v1/api-key/`

##### `create.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/api-key/create.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /api-key/create`
  - Spec anchor: `API_KEY.md#post-api-keycreate`
  - Better Auth method: `apiKey.create`
  - Implementation: Create new API key with rate limiting and permissions
- [ ] Add `Payload` class stub with fields: `name`, `expiresIn`, `userId`, `prefix`, `remaining`, `metadata`, `refillAmount`, `refillInterval`, `rateLimitTimeWindow`, `rateLimitMax`, `rateLimitEnabled`, `permissions`
- [ ] Add `Success` class stub with all API key fields (18 fields including `key` - see API_KEY.md line 36-60)
- [ ] Add `Contract` export
- [ ] Note: `metadata` field is stored as object in response but may need JSON string serialization; `permissions` is object (map of array) in response

##### `delete.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/api-key/delete.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /api-key/delete`
  - Spec anchor: `API_KEY.md#post-api-keydelete`
  - Better Auth method: `apiKey.delete`
  - Implementation: Delete existing API key
- [ ] Add `Payload` class stub with fields: `keyId`
- [ ] Add `Success` class stub with fields: `success` (boolean)
- [ ] Add `Contract` export

##### `get.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/api-key/get.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `GET /api-key/get`
  - Spec anchor: `API_KEY.md#get-api-keyget`
  - Better Auth method: `apiKey.get`
  - Implementation: Retrieve API key by ID
- [ ] Add `UrlParams` class stub with fields: `id` (optional string)
- [ ] Add `Success` class stub with all API key fields except `key` (17 fields - see API_KEY.md line 98-119)
- [ ] Add `Contract` export with `.setUrlParams(UrlParams)`
- [ ] Note: `permissions` field is type `string` (JSON string) in GET response, not object

##### `list.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/api-key/list.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `GET /api-key/list`
  - Spec anchor: `API_KEY.md#get-api-keylist`
  - Better Auth method: `apiKey.list`
  - Implementation: List all API keys for authenticated user
- [ ] Add `Success` class stub (array of API keys - spec incomplete, needs investigation)
- [ ] Add `Contract` export

##### `update.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/api-key/update.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /api-key/update`
  - Spec anchor: `API_KEY.md#post-api-keyupdate`
  - Better Auth method: `apiKey.update`
  - Implementation: Update existing API key
- [ ] Add `Payload` class stub with fields: `keyId`, `userId`, `name`, `enabled`, `remaining`, `refillAmount`, `refillInterval`, `metadata`, `expiresIn`, `rateLimitEnabled`, `rateLimitTimeWindow`, `rateLimitMax`, `permissions`
- [ ] Add `Success` class stub with all API key fields except `key` (17 fields - see API_KEY.md line 161-182)
- [ ] Add `Contract` export
- [ ] Note: `permissions` field is type `string` (JSON string) in response

##### `_group.ts` (API Key)
- [ ] Create `packages/iam/domain/src/api/v1/api-key/_group.ts`
- [ ] Import all 5 api-key endpoints
- [ ] Create Group class `iam.apiKey` with `.prefix("/api-key")`
- [ ] Add all 5 contracts to group
- [ ] Export all endpoints as namespaces

##### `index.ts` (API Key)
- [ ] Create `packages/iam/domain/src/api/v1/api-key/index.ts`
- [ ] Barrel export all 5 endpoints and group

#### Device Group

##### Create Group Directory
- [ ] Create directory `packages/iam/domain/src/api/v1/device/`

##### `approve.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/device/approve.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /device/approve`
  - Spec anchor: `DEVICE.md#post-deviceapprove`
  - Better Auth method: `device.approve`
  - Implementation: Approve device authorization
- [ ] Add `Payload` class stub with fields: `userCode`
- [ ] Add `Success` class stub with fields: `success` (optional boolean)
- [ ] Add `Contract` export

##### `code.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/device/code.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /device/code`
  - Spec anchor: `DEVICE.md#post-devicecode`
  - Better Auth method: `device.code`
  - Implementation: Request device and user code (RFC 8628)
- [ ] Add `Payload` class stub with fields: `client_id`, `scope` (optional)
- [ ] Add `Success` class stub with fields: `device_code`, `user_code`, `verification_uri`, `verification_uri_complete`, `expires_in`, `interval`
- [ ] Add `Contract` export

##### `deny.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/device/deny.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /device/deny`
  - Spec anchor: `DEVICE.md#post-devicedeny`
  - Better Auth method: `device.deny`
  - Implementation: Deny device authorization
- [ ] Add `Payload` class stub with fields: `userCode`
- [ ] Add `Success` class stub with fields: `success` (optional boolean)
- [ ] Add `Contract` export

##### `token.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/device/token.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /device/token`
  - Spec anchor: `DEVICE.md#post-devicetoken`
  - Better Auth method: `device.token`
  - Implementation: Exchange device code for access token (RFC 8628)
- [ ] Add `Payload` class stub with fields: `grant_type`, `device_code`, `client_id`
- [ ] Add `Success` class stub with fields: `session` (Session.Model), `user` (User.Model)
- [ ] Add `Contract` export

##### `_group.ts` (Device)
- [ ] Create `packages/iam/domain/src/api/v1/device/_group.ts`
- [ ] Import all 4 device endpoints
- [ ] Create Group class `iam.device` with `.prefix("/device")`
- [ ] Add all 4 contracts to group
- [ ] Export all endpoints as namespaces

##### `index.ts` (Device)
- [ ] Create `packages/iam/domain/src/api/v1/device/index.ts`
- [ ] Barrel export all 4 endpoints and group

#### Multi-Session Group

##### Create Group Directory
- [ ] Create directory `packages/iam/domain/src/api/v1/multi-session/`

##### `list-device-sessions.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/multi-session/list-device-sessions.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `GET /multi-session/list-device-sessions`
  - Spec anchor: `MULTI_SESSION.md#get-multi-sessionlist-device-sessions`
  - Better Auth method: `multiSession.listDeviceSessions`
  - Implementation: List all device sessions
- [ ] Add `Success` class stub (spec incomplete - needs investigation for response schema)
- [ ] Add `Contract` export

##### `revoke.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/multi-session/revoke.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /multi-session/revoke`
  - Spec anchor: `MULTI_SESSION.md#post-multi-sessionrevoke`
  - Better Auth method: `multiSession.revoke`
  - Implementation: Revoke a device session
- [ ] Add `Payload` class stub with fields: `sessionToken`
- [ ] Add `Success` class stub with fields: `status` (optional boolean)
- [ ] Add `Contract` export

##### `set-active.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/multi-session/set-active.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /multi-session/set-active`
  - Spec anchor: `MULTI_SESSION.md#post-multi-sessionset-active`
  - Better Auth method: `multiSession.setActive`
  - Implementation: Set the active session
- [ ] Add `Payload` class stub with fields: `sessionToken`
- [ ] Add `Success` class stub with fields: `session` (Session.Model)
- [ ] Add `Contract` export

##### `_group.ts` (Multi-Session)
- [ ] Create `packages/iam/domain/src/api/v1/multi-session/_group.ts`
- [ ] Import all 3 multi-session endpoints
- [ ] Create Group class `iam.multiSession` with `.prefix("/multi-session")`
- [ ] Add all 3 contracts to group
- [ ] Export all endpoints as namespaces

##### `index.ts` (Multi-Session)
- [ ] Create `packages/iam/domain/src/api/v1/multi-session/index.ts`
- [ ] Barrel export all 3 endpoints and group

#### Miscellaneous Group

##### Create Group Directory
- [ ] Create directory `packages/iam/domain/src/api/v1/misc/`

##### `openid-configuration.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/misc/openid-configuration.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `GET /.well-known/openid-configuration`
  - Spec anchor: `MISC.md#get-well-knownopenid-configuration`
  - Better Auth method: TBD (verify from Better Auth)
  - Implementation: OpenID Connect discovery endpoint
- [ ] Add `Success` class stub (spec incomplete - standard OIDC config schema)
- [ ] Add `Contract` export with special path `/.well-known/openid-configuration`

##### `oauth-proxy-callback.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/misc/oauth-proxy-callback.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `GET /oauth-proxy-callback`
  - Spec anchor: `MISC.md#get-oauth-proxy-callback`
  - Better Auth method: TBD (verify from Better Auth)
  - Implementation: OAuth proxy callback handler
- [ ] Add `UrlParams` class stub with fields: `callbackURL`, `cookies`
- [ ] Add `Success` class stub (spec incomplete - likely redirect)
- [ ] Add `Contract` export

##### `one-tap-callback.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/misc/one-tap-callback.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /one-tap/callback`
  - Spec anchor: `MISC.md#post-one-tapcallback`
  - Better Auth method: TBD (verify from Better Auth)
  - Implementation: Google One Tap authentication callback
- [ ] Add `Payload` class stub with fields: `idToken`
- [ ] Add `Success` class stub with fields: `session` (Session.Model), `user` (User.Model)
- [ ] Add `Contract` export with path `/one-tap/callback`

##### `siwe-nonce.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/misc/siwe-nonce.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /siwe/nonce`
  - Spec anchor: `MISC.md#post-siwenonce`
  - Better Auth method: TBD (verify from Better Auth)
  - Implementation: Sign-In with Ethereum nonce generation
- [ ] Add `Payload` class stub with fields: `walletAddress`, `chainId`
- [ ] Add `Success` class stub (spec incomplete - likely nonce string)
- [ ] Add `Contract` export with path `/siwe/nonce`

##### `siwe-verify.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/misc/siwe-verify.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /siwe/verify`
  - Spec anchor: `MISC.md#post-siweverify`
  - Better Auth method: TBD (verify from Better Auth)
  - Implementation: Sign-In with Ethereum signature verification
- [ ] Add `Payload` class stub with fields: `message`, `signature`, `walletAddress`, `chainId`, `email` (optional)
- [ ] Add `Success` class stub (spec incomplete - likely session/user)
- [ ] Add `Contract` export with path `/siwe/verify`

##### `stripe-webhook.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/misc/stripe-webhook.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `POST /stripe/webhook`
  - Spec anchor: `MISC.md#post-stripewebhook`
  - Better Auth method: TBD (verify from Better Auth)
  - Implementation: Stripe webhook handler
- [ ] Add `Payload` class stub (spec incomplete - Stripe webhook event)
- [ ] Add `Success` class stub (spec incomplete - likely acknowledgment)
- [ ] Add `Contract` export with path `/stripe/webhook`

##### `token.ts`
- [ ] Create stub file `packages/iam/domain/src/api/v1/misc/token.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint: `GET /token`
  - Spec anchor: `MISC.md#get-token`
  - Better Auth method: TBD (verify from Better Auth)
  - Implementation: Get JWT token
- [ ] Add `Success` class stub with fields: `token` (optional string)
- [ ] Add `Contract` export

##### `_group.ts` (Miscellaneous)
- [ ] Create `packages/iam/domain/src/api/v1/misc/_group.ts`
- [ ] Import all 7 misc endpoints
- [ ] Create Group class `iam.misc`
- [ ] Note: NO `.prefix()` call - misc endpoints have custom paths (/.well-known/*, /siwe/*, /stripe/*, etc.)
- [ ] Add all 7 contracts to group
- [ ] Export all endpoints as namespaces
- [ ] Each endpoint must specify its full path in Contract definition

##### `index.ts` (Miscellaneous)
- [ ] Create `packages/iam/domain/src/api/v1/misc/index.ts`
- [ ] Barrel export all 7 endpoints and group

#### Update V1 API

##### Update `packages/iam/domain/src/api/v1/api.ts`
- [ ] Import PhoneNumber, ApiKey, Device, MultiSession, Misc groups
- [ ] Add all 5 groups to V1.Api class

##### Update `packages/iam/domain/src/api/v1/index.ts`
- [ ] Barrel export PhoneNumber, ApiKey, Device, MultiSession, Misc

### Boilerplate Infra Handlers

#### Phone Number Group

##### Create Group Directory
- [ ] Create directory `packages/iam/infra/src/api/v1/phone-number/`

##### `request-password-reset.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/phone-number/request-password-reset.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.phoneNumber.requestPasswordReset()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `reset-password.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/phone-number/reset-password.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.phoneNumber.resetPassword()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `send-otp.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/phone-number/send-otp.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.phoneNumber.sendPhoneNumberOTP()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `verify.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/phone-number/verify.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.phoneNumber.verify()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `_group.ts` (Phone Number)
- [ ] Create `packages/iam/infra/src/api/v1/phone-number/_group.ts`
- [ ] Import all 4 phone number handlers
- [ ] Create Routes with all 4 handlers registered
- [ ] Export Service, ServiceError, ServiceDependencies types

##### `index.ts` (Phone Number)
- [ ] Create `packages/iam/infra/src/api/v1/phone-number/index.ts`
- [ ] Barrel export all 4 handlers and group

#### API Key Group

##### Create Group Directory
- [ ] Create directory `packages/iam/infra/src/api/v1/api-key/`

##### `create.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/api-key/create.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.apiKey.create()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `delete.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/api-key/delete.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.apiKey.delete()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `get.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/api-key/get.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `UrlParams` (GET request)
- [ ] Add `Handler` stub with TODO template for `auth.api.apiKey.get()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `list.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/api-key/list.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type (no params for list)
- [ ] Add `Handler` stub with TODO template for `auth.api.apiKey.list()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `update.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/api-key/update.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.apiKey.update()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `_group.ts` (API Key)
- [ ] Create `packages/iam/infra/src/api/v1/api-key/_group.ts`
- [ ] Import all 5 api-key handlers
- [ ] Create Routes with all 5 handlers registered
- [ ] Export Service, ServiceError, ServiceDependencies types

##### `index.ts` (API Key)
- [ ] Create `packages/iam/infra/src/api/v1/api-key/index.ts`
- [ ] Barrel export all 5 handlers and group

#### Device Group

##### Create Group Directory
- [ ] Create directory `packages/iam/infra/src/api/v1/device/`

##### `approve.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/device/approve.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.device.approve()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `code.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/device/code.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.device.code()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `deny.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/device/deny.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.device.deny()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `token.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/device/token.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.device.token()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `_group.ts` (Device)
- [ ] Create `packages/iam/infra/src/api/v1/device/_group.ts`
- [ ] Import all 4 device handlers
- [ ] Create Routes with all 4 handlers registered
- [ ] Export Service, ServiceError, ServiceDependencies types

##### `index.ts` (Device)
- [ ] Create `packages/iam/infra/src/api/v1/device/index.ts`
- [ ] Barrel export all 4 handlers and group

#### Multi-Session Group

##### Create Group Directory
- [ ] Create directory `packages/iam/infra/src/api/v1/multi-session/`

##### `list-device-sessions.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/multi-session/list-device-sessions.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type (GET, no params)
- [ ] Add `Handler` stub with TODO template for `auth.api.multiSession.listDeviceSessions()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `revoke.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/multi-session/revoke.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.multiSession.revoke()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `set-active.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/multi-session/set-active.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for `auth.api.multiSession.setActive()`
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `_group.ts` (Multi-Session)
- [ ] Create `packages/iam/infra/src/api/v1/multi-session/_group.ts`
- [ ] Import all 3 multi-session handlers
- [ ] Create Routes with all 3 handlers registered
- [ ] Export Service, ServiceError, ServiceDependencies types

##### `index.ts` (Multi-Session)
- [ ] Create `packages/iam/infra/src/api/v1/multi-session/index.ts`
- [ ] Barrel export all 3 handlers and group

#### Miscellaneous Group

##### Create Group Directory
- [ ] Create directory `packages/iam/infra/src/api/v1/misc/`

##### `openid-configuration.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/misc/openid-configuration.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type (GET, no params)
- [ ] Add `Handler` stub with TODO template for Better Auth method (TBD)
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `oauth-proxy-callback.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/misc/oauth-proxy-callback.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `UrlParams`
- [ ] Add `Handler` stub with TODO template for Better Auth method (TBD)
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `one-tap-callback.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/misc/one-tap-callback.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for Better Auth method (TBD)
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `siwe-nonce.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/misc/siwe-nonce.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for Better Auth method (TBD)
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `siwe-verify.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/misc/siwe-verify.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for Better Auth method (TBD)
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `stripe-webhook.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/misc/stripe-webhook.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type using `Payload`
- [ ] Add `Handler` stub with TODO template for Better Auth method (TBD)
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `token.ts`
- [ ] Create stub file `packages/iam/infra/src/api/v1/misc/token.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type (GET, no params)
- [ ] Add `Handler` stub with TODO template for Better Auth method (TBD)
- [ ] Add placeholder `Effect.fail(new Error("Not implemented"))`

##### `_group.ts` (Miscellaneous)
- [ ] Create `packages/iam/infra/src/api/v1/misc/_group.ts`
- [ ] Import all 7 misc handlers
- [ ] Create Routes with all 7 handlers registered
- [ ] Export Service, ServiceError, ServiceDependencies types

##### `index.ts` (Miscellaneous)
- [ ] Create `packages/iam/infra/src/api/v1/misc/index.ts`
- [ ] Barrel export all 7 handlers and group

#### Update V1 Infra API

##### Update `packages/iam/infra/src/api/v1/api.ts`
- [ ] Import PhoneNumber, ApiKey, Device, MultiSession, Misc route groups
- [ ] Add all 5 groups to V1.ApiLive layer

##### Update `packages/iam/infra/src/api/v1/index.ts`
- [ ] Barrel export PhoneNumber, ApiKey, Device, MultiSession, Misc

### Boilerplate Verification

- [ ] All 23 endpoint stub files created with complete JSDoc
- [ ] All 5 group files created (phone-number, api-key, device, multi-session, misc)
- [ ] All group files updated with imports/registrations
- [ ] V1 api.ts and index.ts updated in both domain and infra
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts - Phone Number

#### `request-password-reset.ts`
- [ ] Implement `Payload` class fields:
  - `phoneNumber: S.String` (with validation pattern)
- [ ] Implement `Success` class fields:
  - `status: S.Boolean`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `reset-password.ts`
- [ ] Implement `Payload` class fields:
  - `otp: S.String`
  - `phoneNumber: S.String`
  - `newPassword: CommonFields.UserPassword`
- [ ] Implement `Success` class fields:
  - `status: S.Boolean`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `send-otp.ts`
- [ ] Implement `Payload` class fields:
  - `phoneNumber: S.String`
- [ ] Implement `Success` class fields:
  - `message: S.optionalWith(S.String, { nullable: true })`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `verify.ts`
- [ ] Implement `Payload` class fields:
  - `phoneNumber: S.String`
  - `code: S.String`
  - `disableSession: S.optionalWith(S.Boolean, { nullable: true })`
  - `updatePhoneNumber: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Implement `Success` class fields:
  - `status: S.Boolean`
  - `token: S.optionalWith(S.String, { nullable: true })`
  - `user: S.optionalWith(S.Unknown, { nullable: true })` (or specific schema if defined)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

### 2. Domain Contracts - API Key

**Import EntityIds**:
```typescript
import { SharedEntityIds, IamEntityIds } from "@beep/shared-domain";
```

#### `create.ts`
- [ ] Implement `Payload` class with all 12 fields from spec (API_KEY.md line 19-34, use `ApiKey.Model.jsonCreate` for guidance)
  - Note: `userId` field should use `SharedEntityIds.UserId`
  - Note: Payload may require JSON string serialization for complex fields before sending to Better Auth
- [ ] Implement `Success` class with all 18 API key fields including `key` (API_KEY.md line 36-60, use `ApiKey.Model.json` for guidance)
  - Note: `metadata` stored as object in response; `permissions` is object (map of array) in response
  - Note: `expiresAt` should use `BS.EpochMillisFromAllAcceptable` if present (Better Auth uses epoch millis for all expiresAt fields)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `delete.ts`
- [ ] Implement `Payload` class fields:
  - `keyId: IamEntityIds.ApiKeyId`
- [ ] Implement `Success` class fields:
  - `success: S.Boolean`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `get.ts`
- [ ] Implement `UrlParams` class fields:
  - `id: S.optionalWith(IamEntityIds.ApiKeyId, { as: "Option", nullable: true })`
- [ ] Implement `Success` class with all 17 API key fields (no `key`) - see API_KEY.md line 98-119, use `ApiKey.Model.json` for guidance
- [ ] Note: `permissions` field is `S.String` (JSON string), not object
- [ ] Note: `expiresAt` should use `BS.EpochMillisFromAllAcceptable` if present (Better Auth uses epoch millis for all expiresAt fields)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `list.ts`
- [ ] Implement `Success` class as `S.Array` of API key objects (without `key` field)
- [ ] Note: Spec incomplete - response schema not documented in API_KEY.md line 129-132
- [ ] Investigate Better Auth types for exact response schema: `auth.api.apiKey.list()`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `update.ts`
- [ ] Implement `Payload` class with all 13 fields from spec (API_KEY.md line 142-157, use `ApiKey.Model.jsonUpdate` for guidance)
- [ ] Implement `Success` class with all 17 API key fields (no `key`) - see API_KEY.md line 161-182, use `ApiKey.Model.json` for guidance
- [ ] Note: `permissions` field is `S.String` (JSON string) in response, may need JSON serialization in payload
- [ ] Note: `expiresAt` should use `BS.EpochMillisFromAllAcceptable` if present (Better Auth uses epoch millis for all expiresAt fields)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

### 3. Domain Contracts - Device

#### `approve.ts`
- [ ] Implement `Payload` class fields:
  - `userCode: S.String`
- [ ] Implement `Success` class fields:
  - `success: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `code.ts`
- [ ] Implement `Payload` class fields:
  - `client_id: S.String`
  - `scope: S.optionalWith(S.String, { nullable: true })`
- [ ] Implement `Success` class fields (RFC 8628 response - see DEVICE.md line 48-57, use `DeviceCode.Model.json` for guidance):
  - `device_code: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `user_code: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `verification_uri: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
  - `verification_uri_complete: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
  - `expires_in: S.optionalWith(S.Number, { as: "Option", nullable: true })`
  - `interval: S.optionalWith(S.Number, { as: "Option", nullable: true })`
- [ ] Note: All response fields are optional per RFC 8628 spec
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `deny.ts`
- [ ] Implement `Payload` class fields:
  - `userCode: S.String`
- [ ] Implement `Success` class fields:
  - `success: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `token.ts`
- [ ] Implement `Payload` class fields (DEVICE.md line 90-95):
  - `grant_type: S.String` (should be literal "urn:ietf:params:oauth:grant-type:device_code" per RFC 8628)
  - `device_code: S.String`
  - `client_id: S.String`
- [ ] Implement `Success` class fields (DEVICE.md line 99-102):
  - `session: S.optionalWith(Session.Model, { as: "Option" })`
  - `user: S.optionalWith(User.Model, { as: "Option" })`
- [ ] Note: Response follows OAuth 2.0 token response format
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

### 4. Domain Contracts - Multi-Session

**Import EntityIds**:
```typescript
import { SharedEntityIds } from "@beep/shared-domain";
```

#### `list-device-sessions.ts`
- [ ] Implement `Success` class (spec incomplete - no response schema in MULTI_SESSION.md line 15-17)
- [ ] Investigate Better Auth types for response schema: `auth.api.multiSession.listDeviceSessions()`
- [ ] Likely `S.Array(Session.Model)` or similar session list structure
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `revoke.ts`
- [ ] Implement `Payload` class fields (MULTI_SESSION.md line 25-29):
  - `sessionToken: SharedEntityIds.SessionId`
- [ ] Implement `Success` class fields (MULTI_SESSION.md line 33-35):
  - `status: S.optionalWith(S.Boolean, { as: "Option", nullable: true })`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `set-active.ts`
- [ ] Implement `Payload` class fields (MULTI_SESSION.md line 44-49):
  - `sessionToken: SharedEntityIds.SessionId`
- [ ] Implement `Success` class fields (MULTI_SESSION.md line 52-55):
  - `session: S.optionalWith(Session.Model, { as: "Option", nullable: true })`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

### 5. Domain Contracts - Miscellaneous

**Import EntityIds** (for SIWE endpoints):
```typescript
import { IamEntityIds } from "@beep/shared-domain";
```

#### `openid-configuration.ts`
- [ ] Implement `Success` class (standard OIDC discovery schema)
- [ ] Note: Spec incomplete - no response schema in MISC.md line 15-17
- [ ] Reference OpenID Connect Discovery 1.0 spec for standard fields
- [ ] Investigate Better Auth implementation for exact response structure
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `oauth-proxy-callback.ts`
- [ ] Implement `UrlParams` class fields (MISC.md line 26-30):
  - `callbackURL: S.Unknown` (spec explicitly says unknown type)
  - `cookies: S.Unknown` (spec explicitly says unknown type)
- [ ] Implement `Success` class (no documented response schema - likely HTTP redirect)
- [ ] Note: May return empty response or redirect header
- [ ] Investigate Better Auth behavior for this endpoint
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `one-tap-callback.ts`
- [ ] Implement `Payload` class fields (MISC.md line 40-44):
  - `idToken: S.String` (Google ID token from One Tap API)
- [ ] Implement `Success` class fields (MISC.md line 47-51):
  - `session: S.optionalWith(Session.Model, { as: "Option", nullable: true })`
  - `user: S.optionalWith(User.Model, { as: "Option", nullable: true })`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `siwe-nonce.ts`
- [ ] Implement `Payload` class fields (MISC.md line 59-63):
  - `walletAddress: IamEntityIds.WalletAddressId`
  - `chainId: S.String` (Blockchain chain ID)
- [ ] Implement `Success` class (spec incomplete - no response schema in MISC.md line 65)
- [ ] Investigate Better Auth SIWE plugin for nonce response format
- [ ] Likely `{ nonce: S.String }` or similar
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `siwe-verify.ts`
- [ ] Implement `Payload` class fields (MISC.md line 72-80):
  - `message: S.String` (SIWE message to verify)
  - `signature: S.String` (Cryptographic signature)
  - `walletAddress: IamEntityIds.WalletAddressId`
  - `chainId: S.String`
  - `email: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Implement `Success` class (spec incomplete - no response schema in MISC.md line 82)
- [ ] Investigate Better Auth SIWE plugin for verification response
- [ ] Likely returns session/user like other auth endpoints
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `stripe-webhook.ts`
- [ ] Implement `Payload` class (Stripe webhook event - no schema in MISC.md line 86-88)
- [ ] Reference Stripe webhook event types documentation
- [ ] Investigate Better Auth Stripe plugin for webhook handling
- [ ] May use raw body or parsed Stripe Event object
- [ ] Implement `Success` class (likely `{ received: S.Boolean }` or empty response)
- [ ] Note: Webhook signature verification is critical for security
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `token.ts`
- [ ] Implement `Success` class fields (MISC.md line 96-100):
  - `token: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Note: Returns JWT token for authenticated session
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

### 6. Infra Handlers - Phone Number

**Helper Selection**: See `packages/iam/infra/src/api/common/schema-helpers.ts` for available helpers. Import:
```typescript
import { runAuthEndpoint, runAuthQuery, runAuthCommand, forwardCookieResponse } from "../../common/schema-helpers";
```

#### `request-password-reset.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns status object
  - Call `auth.api.phoneNumber.requestPasswordReset()`
  - Map `payload.phoneNumber` to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `reset-password.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `forwardCookieResponse` - Password in payload (Redacted field)
  - Encode payload with `S.encode(V1.PhoneNumber.ResetPassword.Payload)(payload)`
  - Call `auth.api.phoneNumber.resetPassword()` with encoded payload fields
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `send-otp.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns message object
  - Call `auth.api.phoneNumber.sendPhoneNumberOTP()`
  - Map `payload.phoneNumber` to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `verify.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns status/token/user
  - Call `auth.api.phoneNumber.verify()`
  - Map all payload fields to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

### 7. Infra Handlers - API Key

#### `create.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns full API key (including key)
  - Call `auth.api.apiKey.create()`
  - Map all 12 payload fields to body
  - Handle complex metadata/permissions serialization
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `delete.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthCommand` - POST returning `{ success: true }`
  - Call `auth.api.apiKey.delete()`
  - Map `payload.keyId` to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `get.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` - GET with query params, returns API key (no key field)
  - Call `auth.api.apiKey.get()`
  - Map `urlParams.id` to query
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `list.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` - GET with no params, returns API keys array
  - Call `auth.api.apiKey.list()`
  - No parameters
  - Decode response with `Success` (array)
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `update.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns API key (no key field)
  - Call `auth.api.apiKey.update()`
  - Map all 13 payload fields to body
  - Handle complex metadata/permissions serialization
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

### 8. Infra Handlers - Device

#### `approve.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns success object
  - Call `auth.api.device.approve()`
  - Map `payload.userCode` to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `code.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns device code object
  - Call `auth.api.device.code()`
  - Map payload fields to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `deny.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns success object
  - Call `auth.api.device.deny()`
  - Map `payload.userCode` to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `token.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns session/user
  - Call `auth.api.device.token()`
  - Map payload fields to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

### 9. Infra Handlers - Multi-Session

#### `list-device-sessions.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` - GET with no params, returns sessions array
  - Call `auth.api.multiSession.listDeviceSessions()`
  - No parameters
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `revoke.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns status object
  - Call `auth.api.multiSession.revoke()`
  - Map `payload.sessionToken` to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `set-active.ts`
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns session object
  - Call `auth.api.multiSession.setActive()`
  - Map `payload.sessionToken` to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

### 10. Infra Handlers - Miscellaneous

**Note**: Several misc endpoints are **plugin-managed** or built-in. Verify method names and use manual proxying where needed.

#### `openid-configuration.ts`
- [ ] Verify Better Auth method name
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` or manual proxying (built-in OIDC endpoint)
  - Call appropriate Better Auth method
  - No parameters
  - Decode response with `Success`
  - Handle OIDC standard response
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `oauth-proxy-callback.ts`
- [ ] Verify Better Auth method name
- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse` (plugin-managed redirect)
  - Call appropriate Better Auth method
  - Map urlParams (unknown types) to query
  - Handle redirect response
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `one-tap-callback.ts`
- [ ] Verify Better Auth method name
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns session/user
  - Call appropriate Better Auth method (likely `oneTap.callback`)
  - Map `payload.idToken` to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `siwe-nonce.ts`
- [ ] Verify Better Auth method name
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns nonce object
  - Call appropriate Better Auth method (`siwe.nonce`)
  - Map payload fields to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `siwe-verify.ts`
- [ ] Verify Better Auth method name
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns session/user
  - Call appropriate Better Auth method (`siwe.verify`)
  - Map all payload fields to body
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `stripe-webhook.ts`
- [ ] Verify Better Auth method name
- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying (webhook handler managed by Stripe plugin)
  - Call appropriate Better Auth method
  - Handle Stripe webhook payload
  - Verify webhook signature (if needed)
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

#### `token.ts`
- [ ] Verify Better Auth method name
- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` - GET with no params, returns token object
  - Call appropriate Better Auth method (`token()` from JWT plugin)
  - No parameters
  - Decode response with `Success`
  - Forward cookies
- [ ] Remove placeholder
- [ ] Update JSDoc @example

### 11. Verification

- [ ] `bun run check` passes for all packages
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-infra` succeeds
- [ ] All 23 endpoints appear in OpenAPI spec at server `/docs`
- [ ] Phone number endpoints grouped under `iam.phoneNumber`
- [ ] API key endpoints grouped under `iam.apiKey`
- [ ] Device endpoints grouped under `iam.device`
- [ ] Multi-session endpoints grouped under `iam.multiSession`
- [ ] Misc endpoints grouped under `iam.misc`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Implementation Considerations

1. **Phone Number Validation**: Consider using Effect Schema patterns for phone number validation (international format)
2. **API Key Metadata**: The `metadata` and `permissions` fields are stored as JSON strings - need proper serialization/deserialization
3. **Rate Limiting**: API key rate limiting fields are complex - ensure proper number/boolean handling
4. **Device Code Flow**: Follows RFC 8628 - verify compliance with standard
5. **Multi-Session**: Session management across devices - ensure session token validation
6. **SIWE**: Web3 authentication - wallet signature verification is critical
7. **Stripe Webhook**: Webhook signature verification is essential for security
8. **Misc Endpoints**: Several endpoints have incomplete specs - may need Better Auth source investigation

### Better Auth Method Name Resolution

For misc endpoints, verify method names from Better Auth types:
- Check `auth.api.*` TypeScript autocomplete
- Review Better Auth source code if needed
- Document actual method names in implementation

### Spec Gaps to Address

The following endpoints have incomplete response schemas in the OpenAPI spec and require investigation:

1. **API Key List** (`GET /api-key/list`): Response schema not documented (API_KEY.md line 129-132)
   - Action: Check Better Auth types for `auth.api.apiKey.list()`
   - Expected: Array of API key objects (without `key` field)

2. **Multi-Session List** (`GET /multi-session/list-device-sessions`): No response schema (MULTI_SESSION.md line 15-17)
   - Action: Check Better Auth types for `auth.api.multiSession.listDeviceSessions()`
   - Expected: Array of Session objects with device metadata

3. **OpenID Configuration** (`GET /.well-known/openid-configuration`): No response schema (MISC.md line 15-17)
   - Action: Reference OpenID Connect Discovery 1.0 specification
   - Expected: Standard OIDC discovery document

4. **OAuth Proxy Callback** (`GET /oauth-proxy-callback`): Unknown param types and no response (MISC.md line 26-32)
   - Action: Investigate Better Auth OAuth proxy implementation
   - Expected: Likely HTTP redirect response

5. **SIWE Nonce** (`POST /siwe/nonce`): No response schema (MISC.md line 59-65)
   - Action: Check Better Auth SIWE plugin implementation
   - Expected: `{ nonce: string }` or similar

6. **SIWE Verify** (`POST /siwe/verify`): No response schema (MISC.md line 72-82)
   - Action: Check Better Auth SIWE plugin implementation
   - Expected: Session and User objects (like other auth endpoints)

7. **Stripe Webhook** (`POST /stripe/webhook`): No request or response schemas (MISC.md line 86-88)
   - Action: Reference Stripe webhook event types and Better Auth Stripe plugin
   - Expected: Raw webhook body or Stripe Event object

Implementation agents should consult:
- Better Auth TypeScript types (`auth.api.*` autocomplete)
- Better Auth source code for specific plugins
- Relevant standards (OIDC, RFC 8628, Stripe API docs)

### Security Notes

- Phone numbers should be validated for format
- API keys contain sensitive data - ensure proper redaction in logs
- Webhook endpoints (Stripe) need signature verification
- SIWE signature verification is cryptographic - rely on Better Auth implementation
- Device code flow has timing constraints (expires_in, interval)

---

## Documentation Validation Report

**Validation Date**: 2025-12-19
**Validator**: Claude Code with Context7 Better Auth Documentation
**Sources**: Better Auth v1.2.9 - v1.3.10 official documentation

### Summary

Cross-referenced all 23 endpoints in M15 against official Better Auth documentation. Found **1 incorrect method name** and clarified **7 miscellaneous endpoints** that are plugin-managed or built-in.

### Corrections Made

#### 1. Phone Number - Send OTP (CORRECTED)

**Endpoint**: `POST /phone-number/send-otp`

**Original M15 Reference**: `phoneNumber.sendOtp`
**Corrected Reference**: `phoneNumber.sendPhoneNumberOTP`

**Evidence**: Better Auth documentation consistently references this as `sendPhoneNumberOTP`:
- Client method: `authClient.phoneNumber.sendPhoneNumberOTP({ phoneNumber })`
- Type definition shows `sendPhoneNumberOTP` in the phone number plugin API
- Server implementation exposes `/phone-number/send-otp` endpoint with this method name

**Impact**: Medium - Affects 3 locations in M15 (endpoint table, boilerplate checklist, implementation checklist)

**Status**: ✅ FIXED

---

### Validated Method Names

#### Phone Number Plugin (4 endpoints)

| Endpoint | Method Reference | Status | Notes |
|----------|-----------------|--------|-------|
| `POST /phone-number/request-password-reset` | `phoneNumber.requestPasswordReset` | ✅ Verified | Documented in phone number plugin |
| `POST /phone-number/reset-password` | `phoneNumber.resetPassword` | ✅ Verified | Documented in phone number plugin |
| `POST /phone-number/send-otp` | `phoneNumber.sendPhoneNumberOTP` | ✅ **Corrected** | Was `sendOtp`, now `sendPhoneNumberOTP` |
| `POST /phone-number/verify` | `phoneNumber.verify` | ✅ Verified | Also called `verifyPhoneNumber` in some contexts |

#### API Key Plugin (5 endpoints)

| Endpoint | Method Reference | Status | Notes |
|----------|-----------------|--------|-------|
| `POST /api-key/create` | `apiKey.create` | ✅ Verified | Also `createApiKey` |
| `POST /api-key/delete` | `apiKey.delete` | ✅ Verified | Accepts `keyId` parameter |
| `GET /api-key/get` | `apiKey.get` | ✅ Verified | Returns API key by ID (no `key` field) |
| `GET /api-key/list` | `apiKey.list` | ✅ Verified | Returns array of API keys |
| `POST /api-key/update` | `apiKey.update` | ✅ Verified | Also `updateApiKey` |

#### Device Flow Plugin (4 endpoints)

| Endpoint | Method Reference | Status | Notes |
|----------|-----------------|--------|-------|
| `POST /device/approve` | `device.approve` | ✅ Verified | RFC 8628 compliant |
| `POST /device/code` | `device.code` | ✅ Verified | Returns device_code, user_code, etc. |
| `POST /device/deny` | `device.deny` | ✅ Verified | Denies device authorization |
| `POST /device/token` | `device.token` | ✅ Verified | Polls for access token |

#### Multi-Session Plugin (3 endpoints)

| Endpoint | Method Reference | Status | Notes |
|----------|-----------------|--------|-------|
| `GET /multi-session/list-device-sessions` | `multiSession.listDeviceSessions` | ✅ Verified | Returns array of sessions |
| `POST /multi-session/revoke` | `multiSession.revoke` | ✅ Verified | Revokes session by token |
| `POST /multi-session/set-active` | `multiSession.setActive` | ✅ Verified | Switches active session |

#### Miscellaneous Endpoints (7 endpoints)

| Endpoint | Method Reference | Status | Notes |
|----------|-----------------|--------|-------|
| `GET /.well-known/openid-configuration` | **Built-in endpoint** | ⚠️ Clarified | OIDC discovery - no explicit API method |
| `GET /oauth-proxy-callback` | **Plugin-managed redirect** | ⚠️ Clarified | OAuth Proxy plugin handles automatically |
| `POST /one-tap/callback` | `oneTap.callback` | ⚠️ To verify | Likely handled by plugin, verify `auth.api.oneTap.*` |
| `POST /siwe/nonce` | `siwe.nonce` | ✅ Verified | SIWE plugin nonce generation |
| `POST /siwe/verify` | `siwe.verify` | ✅ Verified | SIWE plugin signature verification |
| `POST /stripe/webhook` | **Webhook handler** | ⚠️ Clarified | Managed internally by Stripe plugin |
| `GET /token` | `token()` | ✅ Verified | JWT plugin - `authClient.token()` |

---

### Clarifications on Miscellaneous Endpoints

#### 1. OpenID Configuration (`/.well-known/openid-configuration`)

**Status**: Built-in OIDC endpoint
**Better Auth Handling**: Automatically exposed when JWT or OIDC Provider plugins are enabled
**Implementation Note**: This is a standard OIDC discovery endpoint. Better Auth serves it automatically - you likely don't need to proxy this through your custom API unless you want to augment the response.

**Documentation Reference**:
```json
{
  "issuer": "https://auth.example.com",
  "authorization_endpoint": "https://auth.example.com/api/auth/oauth2/authorize",
  "token_endpoint": "https://auth.example.com/api/auth/oauth2/token",
  "userinfo_endpoint": "https://auth.example.com/api/auth/oauth2/userinfo",
  "jwks_uri": "https://auth.example.com/.well-known/jwks.json"
}
```

#### 2. OAuth Proxy Callback (`/oauth-proxy-callback`)

**Status**: Plugin-managed redirect
**Better Auth Handling**: The OAuth Proxy plugin intercepts and redirects OAuth callbacks automatically
**Implementation Note**: This endpoint is managed by the `oAuthProxy()` plugin. It transparently handles OAuth provider callbacks and redirects to your `callbackURL`. You may not need to expose this as a custom RPC endpoint.

**Documentation Reference**: OAuth Proxy plugin handles redirect flow automatically when `authClient.signIn.social()` is called.

#### 3. One Tap Callback (`/one-tap/callback`)

**Status**: To verify - likely `oneTap.callback` or plugin-managed
**Better Auth Handling**: Google One Tap plugin may handle this automatically
**Implementation Note**: Check if this requires explicit `auth.api.oneTap.callback()` or if the plugin manages it. The One Tap plugin documentation shows client-side `authClient.oneTap()` but doesn't explicitly document a callback API method.

**Recommendation**: Test with Better Auth types to confirm exact method name, or treat as plugin-managed if no explicit API method exists.

#### 4. Stripe Webhook (`/stripe/webhook`)

**Status**: Webhook handler managed by Stripe plugin
**Better Auth Handling**: The `@better-auth/stripe` plugin processes webhooks internally via `onEvent` and `onWebhook` handlers
**Implementation Note**: Stripe webhooks require signature verification. Better Auth's Stripe plugin handles this automatically. You may want to proxy this for additional logging/processing, but the plugin already handles the core webhook verification and event processing.

**Documentation Reference**: Configure via `stripe({ onEvent: async (event) => { ... } })` in plugin setup.

---

### Implementation Recommendations

1. **Phone Number Send OTP**: Update all references from `sendOtp` to `sendPhoneNumberOTP`
2. **Miscellaneous Endpoints**: Consider whether these need custom RPC wrappers:
   - **OIDC Config**: Likely serve directly from Better Auth (no wrapper needed)
   - **OAuth Proxy Callback**: Likely managed by plugin (no wrapper needed)
   - **One Tap Callback**: Verify if explicit API method exists
   - **Stripe Webhook**: May only need logging wrapper, core handling by plugin

3. **Testing Strategy**:
   - Test each plugin endpoint directly via Better Auth first
   - Only create RPC wrappers if you need custom validation, logging, or business logic
   - Some endpoints (OIDC config, OAuth callback) may not require Effect wrappers

4. **Documentation Completeness**:
   - All core plugin methods (phone, API key, device, multi-session, SIWE) are well-documented
   - Built-in endpoints (OIDC, webhooks) are handled automatically by Better Auth
   - Verify one-tap callback behavior with Better Auth types or source code

---

### Validation Confidence Levels

- **High Confidence (18 endpoints)**: Explicitly documented in Better Auth with code examples
- **Medium Confidence (4 endpoints)**: Documented but may be plugin-managed (OIDC, OAuth proxy, Stripe webhook, one-tap)
- **Corrected (1 endpoint)**: Phone number send OTP method name fixed

**Overall M15 Documentation Quality**: Strong foundation with minor corrections needed.
