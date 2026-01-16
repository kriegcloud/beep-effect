# IAM Client Methods Final Spec

> Complete IAM client coverage by implementing remaining Better Auth client method handlers.

## Quick Start

```bash
# Read this spec
Read specs/iam-client-methods-final/ORCHESTRATOR_HANDOFF.md

# MANDATORY: Read reference spec first
Read specs/full-iam-client/HANDOFF_CREATION_GUIDE.md
Read specs/full-iam-client/REFLECTION_LOG.md
Read specs/full-iam-client/handoffs/HANDOFF_REFLECTOR_SYNTHESIS.md
```

## Context

The `full-iam-client` spec implemented 35+ handlers for:
- Multi-session management
- Password operations
- Email verification
- Two-factor authentication
- Organization management

This spec implements the **remaining** methods:
- Sign-in methods (username, passkey, SSO, phone, anonymous)
- Core session operations (list, revoke, revokeAll)
- Account management (update, delete, change email)
- Account linking (social providers)
- Admin operations
- API key management
- Device authorization
- SCIM (if applicable)

## Reference Material (MANDATORY)

| Document | Purpose |
|----------|---------|
| `specs/full-iam-client/HANDOFF_CREATION_GUIDE.md` | Handoff requirements |
| `specs/full-iam-client/REFLECTION_LOG.md` | Learnings from execution |
| `specs/full-iam-client/handoffs/HANDOFF_REFLECTOR_SYNTHESIS.md` | Synthesized patterns |
| `packages/iam/client/CLAUDE.md` | Package patterns |

## Phase Overview

| Phase | Focus | Est. Handlers |
|-------|-------|---------------|
| P0 | Discovery & Method Verification | - |
| P1 | Sign-In Methods | 5 |
| P2 | Core Session Methods | 4 |
| P3 | Core Account Methods | 3 |
| P4 | Account Linking | 3 |
| P5 | Admin Plugin | 3-5 |
| P6 | API Key Plugin | 3-4 |
| P7 | SSO Plugin | 2-3 |
| P8 | Device Authorization | 2-3 |
| P9 | Anonymous Extended | 1-2 |
| P10 | Verification & Docs | - |

## Key Learnings from `full-iam-client`

1. **Always verify method names** - BA docs often differ from actual code
2. **Use `S.optionalWith({ nullable: true })`** - BA returns `null`, not `undefined`
3. **Check response shapes** - Not all methods return `{ data, error }`
4. **Verify before implementing** - Prevents schema correction mid-phase

## Output Structure

```
specs/iam-client-methods-final/
├── README.md
├── ORCHESTRATOR_HANDOFF.md
├── REFLECTION_LOG.md          # Create after first phase
├── handoffs/
│   ├── HANDOFF_P1.md
│   ├── HANDOFF_P2.md
│   └── ...
└── outputs/
    └── method-inventory-final.md
```

## Success Criteria

- [ ] All remaining methods implemented
- [ ] Type checks pass
- [ ] Lint passes
- [ ] Documentation updated
- [ ] Reflection log complete
