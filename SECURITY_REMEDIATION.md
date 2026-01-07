# Security Remediation Plan

**Date**: 2026-01-06
**Repository**: `kriegcloud/beep-effect`
**Status**: Action Required

---

## Executive Summary

An audit identified potential security vulnerabilities. Investigation confirmed:

| Finding | Status | Action Required |
|---------|--------|-----------------|
| Secrets in `.env` / `.env.local` | **Not in git history** | Rotate if exposed elsewhere |
| XSS via `dangerouslySetInnerHTML` | Confirmed | Code fix required |
| AI endpoint input validation | Confirmed | Code fix required |
| Permissive linting rules | Confirmed | Config hardening |

---

## Phase 1: Immediate Containment

### 1.1 Verify No Secrets in Git History (COMPLETED)

```bash
# These commands confirmed no .env files in history:
git rev-list --all | xargs git ls-tree -r --name-only 2>/dev/null | grep -E '\.env$|\.env\.local$'
# Result: Empty (no matches)

git log -p --all -S 'sk-' --oneline | head -30  # No API keys found
git log -p --all -S 'AKIA' --oneline | head -30 # No AWS keys found
```

**Result**: `.env` and `apps/notes/.env.local` are properly gitignored and never committed.

### 1.2 Credential Rotation (PRECAUTIONARY)

Even though secrets weren't committed to git, rotate them if:
- They've been shared via other channels (Slack, email, screenshots)
- The machine has been compromised
- Anyone who shouldn't have access has seen them

| Service | Rotation URL | Priority |
|---------|--------------|----------|
| OpenAI API Key | https://platform.openai.com/api-keys | High |
| Anthropic API Key | https://console.anthropic.com/ | High |
| AWS Credentials | https://console.aws.amazon.com/iam/ | High |
| Google OAuth | https://console.cloud.google.com/apis/credentials | Medium |
| GitHub OAuth | https://github.com/settings/developers | Medium |
| Microsoft OAuth | https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps | Medium |
| Resend API Key | https://resend.com/api-keys | Medium |
| ElevenLabs API Key | https://elevenlabs.io/ | Low |
| Dub.co Token | https://dub.co/settings/tokens | Low |

---

## Phase 2: Code Security Fixes

### 2.1 XSS Vulnerability - `dangerouslySetInnerHTML`

**Location**: `packages/ui/ui/src/layouts/components/notifications-drawer/notification-item.tsx:28`

**Risk**: Dynamic content rendered without sanitization allows script injection.

**Fix**:

```bash
bun add dompurify
bun add -D @types/dompurify
```

```typescript
// Before (VULNERABLE)
<div dangerouslySetInnerHTML={{ __html: notification.text }} />

// After (SAFE)
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.text) }} />
```

**Alternative**: If HTML rendering isn't required, use plain text:
```typescript
<div>{notification.text}</div>
```

### 2.2 AI Endpoint Hardening

**Locations**:
- `apps/notes/src/server/hono/routes/ai.ts:35`
- `apps/notes/src/server/hono/routes/ai.ts:58`

**Issues**:
1. Uses `z.any()` for input validation
2. Accepts client-supplied API keys
3. Runs under public middleware

**Fixes**:

```typescript
// Before (VULNERABLE)
const schema = z.object({
  ctx: z.any(),
  messages: z.any(),
  apiKey: z.string().optional(),
});

// After (HARDENED)
import { Schema as S } from "@effect/schema";

const MessageSchema = S.Struct({
  role: S.Literal("user", "assistant", "system"),
  content: S.String.pipe(S.maxLength(100000)),
});

const AIRequestSchema = S.Struct({
  ctx: S.Struct({
    // Define expected context fields explicitly
    documentId: S.String.pipe(S.pattern(/^[a-zA-Z0-9_-]+$/)),
  }),
  messages: S.Array(MessageSchema).pipe(S.maxItems(100)),
  // Remove apiKey - use server-side credentials only
});
```

**Additional hardening**:
1. Add rate limiting per user/IP
2. Require authentication
3. Log all AI requests for audit
4. Implement request size limits

---

## Phase 3: Prevention Measures

### 3.1 Pre-commit Hook for Secret Detection

Install `gitleaks`:

```bash
# Install gitleaks
brew install gitleaks  # macOS
# or
curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz | tar xz

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
    echo "gitleaks detected secrets in staged changes. Commit blocked."
    exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
```

### 3.2 CI Secret Scanning

Add to `.github/workflows/security.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: typescript
      - uses: github/codeql-action/analyze@v3
```

### 3.3 Biome Security Rules

Update `biome.jsonc` to enable security rules:

```jsonc
{
  "linter": {
    "rules": {
      "security": {
        "recommended": true,
        "noDangerouslySetInnerHtml": "error",
        "noGlobalEval": "error"
      },
      "suspicious": {
        "noExplicitAny": "error"
      }
    }
  }
}
```

### 3.4 Gitignore Verification

Current `.gitignore` properly excludes:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.keys
```

Add `.gitleaksignore` for false positives:

```bash
cat > .gitleaksignore << 'EOF'
# Ignore example/placeholder values
.env.example:placeholder
apps/notes/.env.example:placeholder
EOF
```

---

## Phase 4: IF Secrets ARE Found in History

If future investigation reveals secrets in git history, execute this procedure:

### 4.1 Install BFG Repo Cleaner

```bash
# Download BFG
curl -L -o bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
```

### 4.2 Create Secrets File

```bash
cat > secrets-to-remove.txt << 'EOF'
sk-proj-ACTUAL_KEY_HERE
AKIA_ACTUAL_KEY_HERE
actual_oauth_secret_here
EOF
```

### 4.3 Execute History Rewrite

```bash
# Clone a fresh mirror
git clone --mirror git@github.com:kriegcloud/beep-effect.git beep-effect-mirror

cd beep-effect-mirror

# Remove secrets from all history
java -jar ../bfg.jar --replace-text ../secrets-to-remove.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (COORDINATE WITH TEAM FIRST)
git push --force
```

### 4.4 Notify All Contributors

```
SECURITY NOTICE - beep-effect Repository

The repository history has been rewritten to remove exposed credentials.

Required actions:
1. Delete your local clone
2. Re-clone the repository: git clone git@github.com:kriegcloud/beep-effect.git
3. DO NOT push old history

All credentials have been rotated. If you have them stored locally, they are now invalid.
```

---

## Checklist

- [ ] Phase 1: Rotate any potentially exposed credentials
- [ ] Phase 2.1: Fix XSS in notification-item.tsx
- [ ] Phase 2.2: Harden AI endpoint with proper schemas
- [ ] Phase 3.1: Install pre-commit hook
- [ ] Phase 3.2: Add CI security scanning
- [ ] Phase 3.3: Enable Biome security rules
- [ ] Phase 3.4: Add .gitleaksignore

---

## References

- [gitleaks](https://github.com/gitleaks/gitleaks) - Secret detection
- [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) - History rewriting
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
