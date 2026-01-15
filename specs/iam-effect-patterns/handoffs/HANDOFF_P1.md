# Handoff Document: Phase 1 - Deep Pattern Analysis

## Session Context

This handoff provides all context needed to execute Phase 1 of the IAM Effect Patterns specification. The goal is to perform comprehensive analysis of current patterns to inform the design of canonical patterns.

---

## Objective

Perform deep analysis of current IAM client and UI patterns to:
1. Document ALL handler signature variations
2. Identify ALL session signal notification points
3. Catalog ALL schema annotation approaches
4. Map error handling patterns
5. Identify boilerplate that can be factored out

---

## Files to Analyze

### Primary Analysis Targets

#### IAM Client Handlers
```
packages/iam/client/src/core/sign-out/sign-out.handler.ts
packages/iam/client/src/core/get-session/get-session.handler.ts
packages/iam/client/src/sign-in/email/sign-in-email.handler.ts
packages/iam/client/src/sign-up/email/sign-up-email.handler.ts
```

#### IAM Client Contracts
```
packages/iam/client/src/core/sign-out/sign-out.contract.ts
packages/iam/client/src/core/get-session/get-session.contract.ts
packages/iam/client/src/sign-in/email/sign-in-email.contract.ts
packages/iam/client/src/sign-up/email/sign-up-email.contract.ts
```

#### IAM Client Services
```
packages/iam/client/src/core/service.ts
packages/iam/client/src/sign-in/service.ts
packages/iam/client/src/sign-up/service.ts
```

#### Common Modules
```
packages/iam/client/src/_common/errors.ts
packages/iam/client/src/_common/common.schemas.ts
packages/iam/client/src/_common/common.annotations.ts
packages/iam/client/src/_common/common.types.ts
```

#### UI Atoms
```
packages/iam/ui/src/sign-in/email/sign-in-email.atom.ts
packages/iam/ui/src/sign-up/email/sign-up-email.atoms.ts
packages/iam/client/src/core/atoms.ts
```

#### Reference Patterns (Effect-Atom)
```
packages/shared/client/src/atom/files/atoms/files.atom.ts
packages/shared/client/src/atom/files/runtime.ts
packages/runtime/client/src/runtime.ts
```

---

## Analysis Questions

### Handler Signatures

For each handler, document:
1. Function name string passed to `Effect.fn()`
2. Parameter signature (optional, required, structured)
3. Return type
4. Whether it mutates session state

### Session Signal Analysis

Search for:
```typescript
client.$store.notify("$sessionSignal")
```

Document:
1. Which handlers call this
2. When in the handler it's called (before/after response decode)
3. Any conditional logic around the notification

### Error Handling

For each handler, document:
1. How `Effect.tryPromise` catch is handled
2. Whether `response.error` is checked
3. How decode errors are handled

### Schema Patterns

For each contract, document:
1. Schema class structure (`S.Class` vs `S.Struct`)
2. Annotation approach (`withFormAnnotations` vs direct)
3. Form default value definitions
4. Transformation patterns (`transformOrFail`, `transformOrFailFrom`)

### UI Atom Patterns

For each atom, document:
1. Runtime used (`signInRuntime`, `coreRuntime`, etc.)
2. Toast integration approach
3. Hook exposure pattern (`useAtomSet` options)
4. Any derived state atoms

---

## Expected Outputs

### 1. Handler Pattern Matrix

| Handler | Signature | Mutates Session | Notifies Signal | Checks Error |
|---------|-----------|-----------------|-----------------|--------------|
| sign-out | optional | Yes | ? | ? |
| get-session | none | No | No | ? |
| sign-in-email | required | Yes | ? | ? |
| sign-up-email | required | Yes | ? | ? |

### 2. Schema Pattern Matrix

| Contract | Annotation Method | Has Transform | Default Values |
|----------|-------------------|---------------|----------------|
| sign-out.Success | ? | ? | N/A |
| sign-in-email.Payload | ? | ? | ? |
| sign-in-email.Success | ? | ? | N/A |
| sign-up-email.Payload | ? | ? | ? |
| sign-up-email.Success | ? | ? | N/A |

### 3. Boilerplate Inventory

List repeated code patterns with:
- Pattern description
- Occurrence count
- Lines of code per occurrence
- Factoring opportunity

### 4. Inconsistency Report

Document all inconsistencies found with:
- Description
- Files affected
- Severity (critical, high, medium, low)
- Recommended standardization

---

## Output Location

Generate comprehensive analysis report at:
```
specs/iam-effect-patterns/outputs/current-patterns.md
```

---

## Success Criteria

- [ ] All 4 handlers fully analyzed
- [ ] All contracts documented
- [ ] Session signal usage completely mapped
- [ ] Error handling patterns cataloged
- [ ] Boilerplate opportunities quantified
- [ ] Report generated at specified location

---

## Agent Recommendations

### Primary: codebase-researcher

Use for systematic file exploration:
```
Analyze packages/iam/client/src/ and packages/iam/ui/src/ for:
1. Handler implementation patterns
2. Schema definition patterns
3. Error handling approaches
4. Session notification patterns
5. Service composition patterns
```

### Secondary: effect-code-writer (read-only mode)

Use to validate Effect idiom compliance:
```
Review analyzed patterns against Effect best practices:
1. Proper Effect.fn usage
2. Schema decode patterns
3. Error type design
```

---

## Gotchas

### File Renames in Progress

Git status shows file renames from `v1/` to root:
```
RM packages/iam/client/src/v1/_common/* -> packages/iam/client/src/_common/*
```

Ensure analysis uses the NEW locations (without `v1/`).

### Multiple Atom Files

There are atoms in both:
- `packages/iam/client/src/core/atoms.ts` (client package)
- `packages/iam/ui/src/sign-in/email/sign-in-email.atom.ts` (UI package)

Both patterns need analysis.

### Incomplete Sign-In Methods

`sign-in/` directory has many subdirectories (anonymous, oauth2, phone-number, social, sso, username) but only `email/` has `*.handler.ts`. Others have only forms/atoms. Document this asymmetry.

---

## Next Steps After Phase 1

Phase 1 output feeds into:
- **Phase 2**: Effect documentation research for best practices
- **Phase 3**: Pattern proposal design based on analysis findings

The analysis should specifically identify:
1. Which patterns to standardize
2. Which variations are intentional vs accidental
3. Priority order for refactoring
