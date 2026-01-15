# Template Variables Guide

This document defines the template variables used in the IAM Effect Patterns templates.

## Variable Reference

| Variable | Case Style | Description | Example |
|----------|------------|-------------|---------|
| `{{domain}}` | kebab-case | Domain/feature name | `sign-in`, `core` |
| `{{Domain}}` | PascalCase | Domain for class names | `SignIn`, `Core` |
| `{{method}}` | camelCase | Method/handler name | `email`, `signOut` |
| `{{Method}}` | PascalCase | Method for class names | `Email`, `SignOut` |
| `{{betterAuthMethod}}` | dot-path | Better Auth client path | `signIn.email`, `signOut` |
| `{{waitingMessage}}` | String | Toast waiting message | `"Signing in..."` |
| `{{successMessage}}` | String | Toast success message | `"Signed in successfully"` |
| `{{description}}` | String | Schema description | `"email sign-in"` |
| `{{Service}}` | PascalCase | Service class name | `SignInService` |
| `{{runtime}}` | camelCase | Runtime instance name | `signInRuntime` |

## Case Transformation Rules

### From kebab-case input

Given input: `sign-in-email`

| Output Variable | Transformation | Result |
|-----------------|----------------|--------|
| `{{domain}}` | Keep first part | `sign-in` |
| `{{Domain}}` | PascalCase first part | `SignIn` |
| `{{method}}` | camelCase second part | `email` |
| `{{Method}}` | PascalCase second part | `Email` |

### PascalCase Conversion

```
sign-in → SignIn
sign-out → SignOut
get-session → GetSession
email → Email
oauth2 → Oauth2
```

### camelCase Conversion

```
sign-in → signIn
sign-out → signOut
get-session → getSession
```

## Template Usage Examples

### handler.template.ts

```typescript
// Input: domain="sign-in", method="email"

// Effect.fn name uses kebab-case
Effect.fn("{{domain}}/{{method}}/handler")
// → Effect.fn("sign-in/email/handler")

// Client method uses dot notation
client.{{betterAuthMethod}}
// → client.signIn.email
```

### contract.template.ts

```typescript
// Input: domain="sign-in", method="email"

// Identifier uses kebab-case path
const $I = $IamClientId.create("{{domain}}/{{method}}");
// → $IamClientId.create("sign-in/email")

// Class name uses PascalCase
export class Payload extends S.Class<Payload>($I`Payload`)(...)
// (class name stays Payload, identifier determines scope)
```

### atom.template.ts

```typescript
// Input: Domain="SignIn", method="email", runtime="signInRuntime"

// Atom name uses camelCase method
export const {{method}}Atom = {{runtime}}.fn(...)
// → export const emailAtom = signInRuntime.fn(...)

// Hook uses PascalCase Domain
export const use{{Domain}} = () => {...}
// → export const useSignIn = () => {...}
```

## Common Patterns

### Core Domain

```
domain: core
Domain: Core
method: signOut / getSession
Method: SignOut / GetSession
betterAuthMethod: signOut / getSession
```

### Sign-In Domain

```
domain: sign-in
Domain: SignIn
method: email / social / oauth2
Method: Email / Social / Oauth2
betterAuthMethod: signIn.email / signIn.social / signIn.oauth2
```

### Sign-Up Domain

```
domain: sign-up
Domain: SignUp
method: email
Method: Email
betterAuthMethod: signUp.email
```

## File Naming Convention

Templates produce files following this pattern:

| Template | Output File Pattern |
|----------|---------------------|
| handler.template.ts | `{{domain}}-{{method}}.handler.ts` |
| contract.template.ts | `{{domain}}-{{method}}.contract.ts` |
| atom.template.ts | `{{domain}}-{{method}}.atom.ts` |

Examples:
- `sign-in-email.handler.ts`
- `sign-up-email.contract.ts`
- `core-sign-out.atom.ts`

## Directory Structure

Templates assume this directory structure:

```
packages/iam/client/src/
├── _common/           # Shared utilities, schemas, errors
├── {{domain}}/        # Domain directory (e.g., sign-in/)
│   ├── service.ts     # Service aggregating handlers
│   └── {{method}}/    # Method directory (e.g., email/)
│       ├── {{domain}}-{{method}}.contract.ts
│       ├── {{domain}}-{{method}}.handler.ts
│       └── index.ts
```

## Validation Checklist

Before using templates, verify:

- [ ] `{{domain}}` matches directory name
- [ ] `{{Domain}}` is valid PascalCase
- [ ] `{{method}}` matches subdirectory name
- [ ] `{{betterAuthMethod}}` matches Better Auth client API
- [ ] Toast messages are user-friendly
- [ ] Description is accurate for schema documentation
