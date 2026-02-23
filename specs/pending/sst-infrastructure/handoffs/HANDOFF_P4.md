# P4 — Multi-Stage + CI/CD

**Date:** 2026-02-23
**Status:** PENDING
**Depends on:** P3 (end-to-end deployment working for `dev` stage)

---

## Working Memory (Current Phase)

### Goal

Add multi-stage logic (dev/staging/production/PR-preview), CI/CD integration via GitHub Actions, and production hardening. At phase exit, the infrastructure supports multiple environments with appropriate isolation, protection, and automated deployment.

### Deliverables

1. Stage-conditional logic in all `infra/*.ts` modules (resource naming, sizing, protection)
2. `.github/workflows/sst-deploy.yml` — CI/CD workflow for SST deployments
3. `.github/workflows/sst-preview.yml` — PR preview environment creation/teardown
4. 1Password production vault/items configured with production-specific values
5. Minimal IAM policy document for SST's AWS state storage
6. Updated spec README with final verification results

### Success Criteria

- [ ] `bunx sst deploy --stage production` creates production resources with `protect: true` and `removal: "retain"`
- [ ] `bunx sst deploy --stage pr-123` creates an isolated preview environment (secrets from 1Password dev vault)
- [ ] `bunx sst remove --stage pr-123` cleanly tears down the preview environment
- [ ] GitHub Actions workflow deploys on push to `main` (production) and on PR open/sync (preview)
- [ ] GitHub Actions workflow tears down preview on PR close/merge
- [ ] IAM policy document exists for minimum AWS permissions

### Blocking Issues

- `OP_SERVICE_ACCOUNT_TOKEN` must be set as a GitHub Actions secret (stored in 1Password vault `beep-automation-admin/beep-sync-service-account`). This single token provides access to all provider tokens and app secrets via 1Password.
- **OIDC IAM roles must be created** in both AWS accounts (dev: `487243850762`, prod: `703222328573`). The `github-sst-deploy` role with appropriate trust policy must exist before CI workflows can run. See step 7a.

### Key Constraints

- **Production resources must be protected.** `protect: true` prevents accidental deletion. `removal: "retain"` keeps resources even if removed from code.
- **PR previews must be ephemeral.** Created on PR open, torn down on PR close/merge. Use 1Password dev vault secrets — do NOT require manual secret setup per PR.
- **CI/CD must be serialized per stage.** Parallel deploys to the same stage cause state corruption. Use GitHub Actions concurrency groups.
- **Neon free tier limits preview databases.** With only 1 project allowed on free tier, PR previews MUST skip Neon provisioning (already handled in `infra/database.ts` from P2 — `isPrPreview` guard). This is acceptable for v1.
- **Railway cost multiplication is the primary budget risk.** Each SST stage creates a separate Railway project. PR previews should skip Railway entirely for v1 to avoid runaway costs. Railway services are only needed for `dev`, `staging`, and `production` stages.
- **Vercel is the only service safe to provision per-PR.** Vercel Hobby plan has no per-project cost. PR previews can create Vercel projects freely.

### Implementation Order

1. **Add stage-conditional logic to `infra/railway.ts`:**

   ```typescript
   const isProduction = $app.stage === "production";
   const isPrPreview = $app.stage.startsWith("pr-");

   // PR previews skip Railway entirely to avoid cost multiplication.
   // Each Railway project incurs base costs. PR previews only get Vercel.
   if (isPrPreview) {
     // Export undefined for all Railway outputs — web.ts must handle this.
     export const railwayProjectId = undefined;
     export const proxyUrl = undefined;
     return; // or guard all resource creation below
   }

   const project = new railway.Project("RailwayProject", {
     name: `beep-${$app.stage}`,
     description: `Knowledge Graph Explorer — ${$app.stage}`,
   });

   const defaultEnvId = project.defaultEnvironment.apply(env => env.id);

   // ... rest of railway.ts from P1 (FalkorDB, Graphiti, Proxy services)
   ```

   **Stage differences:**
   - **Naming:** `beep-production` vs `beep-dev` vs `beep-staging`
   - **PR previews:** Skip Railway entirely (no Railway project created)
   - **Resource sizing:** No functional differences for v1 (Railway Hobby plan doesn't support custom sizing)
   - **`defaultEnvId`:** Must use `project.defaultEnvironment.apply(env => env.id)` pattern (see P1 corrections)

2. **Add stage-conditional logic to `infra/database.ts`:**

   Already implemented in P2 using ternary pattern:

   ```typescript
   const isPrPreview = $app.stage.startsWith("pr-");

   // PR previews skip Neon entirely (free tier: 1 project limit).
   // neon.Project auto-creates default branch, database, role, endpoint.
   // connectionUri and connectionUriPooler are computed outputs with credentials.
   const neonProject = !isPrPreview
     ? new neon.Project("NeonProject", {
         name: `beep-${$app.stage}`,
         pgVersion: 17,
         regionId: "aws-us-east-1",
         branch: {
           name: "main",
           databaseName: "beep_auth",
           roleName: "beep_user",
         },
       })
     : undefined;

   // Exports are optional — web.ts must handle undefined values for PR previews.
   export const connectionUri = neonProject?.connectionUri;
   export const connectionUriPooler = neonProject?.connectionUriPooler;
   ```

   **Important:** On Neon free tier (1 project), only `dev` and `production` get their own Neon projects. `staging` must share the `dev` Neon project or skip Neon. PR previews always skip.

   **Future:** Neon branching (paid plan) can create lightweight database branches per PR — much cheaper than separate projects.

3. **Add stage-conditional logic to `infra/web.ts`:**

   Already implemented in P3. Key stage-conditional behaviors:

   ```typescript
   const isProduction = $app.stage === "production";
   const isPrPreview = $app.stage.startsWith("pr-");

   // Vercel targets: production stage → "production" scope; all others → "preview" + "development"
   const targets = isProduction
     ? ["production"]
     : ["preview", "development"];

   const project = new vercel.Project("VercelProject", {
     name: `beep-${$app.stage}`,
     framework: "nextjs",
     buildCommand: "bun run build",
     installCommand: "bun install",
     rootDirectory: "apps/web",
     gitRepository: {
       type: "github",
       repo: "kriegcloud/beep-effect2",
       productionBranch: "main",
     },
   });

   // For PR previews: Railway and Neon outputs are undefined.
   // web.ts must conditionally set env vars — skip GRAPHITI_API_URL, DATABASE_URL, etc.
   // when their source values are undefined.
   // The app must handle missing services gracefully (show "service unavailable" rather than crash).
   ```

   **PR preview env var handling:** When `proxyUrl` (Railway) or `connectionUri` (Neon) are undefined, either: (a) skip setting those env vars on Vercel, or (b) set them to a sentinel value like `"not-provisioned"` so the app can detect and degrade gracefully.

4. **Write `.github/workflows/sst-deploy.yml`:**

   ```yaml
   name: SST Deploy

   on:
     push:
       branches: [main]
     workflow_dispatch:
       inputs:
         stage:
           description: 'Deploy stage'
           required: true
           default: 'production'
           type: choice
           options:
             - production
             - staging
             - dev

   concurrency:
     group: sst-deploy-${{ github.event.inputs.stage || 'production' }}
     cancel-in-progress: false  # Never cancel in-progress production deploys

   jobs:
     deploy:
       runs-on: ubuntu-latest
       timeout-minutes: 15
       permissions:
         contents: read
         id-token: write  # Required for AWS OIDC federation

       steps:
         - uses: actions/checkout@v4

         - name: Determine AWS account
           id: aws
           run: |
             STAGE="${{ github.event.inputs.stage || 'production' }}"
             if [ "$STAGE" = "production" ]; then
               echo "role-arn=arn:aws:iam::703222328573:role/github-sst-deploy" >> $GITHUB_OUTPUT
             else
               echo "role-arn=arn:aws:iam::487243850762:role/github-sst-deploy" >> $GITHUB_OUTPUT
             fi

         - name: Configure AWS credentials (OIDC)
           uses: aws-actions/configure-aws-credentials@v4
           with:
             role-to-assume: ${{ steps.aws.outputs.role-arn }}
             aws-region: us-east-1

         - name: Load secrets from 1Password
           uses: 1password/load-secrets-action@v2
           with:
             export-env: true
           env:
             OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
             # Non-AWS provider tokens (AWS handled by OIDC above)
             RAILWAY_TOKEN: op://beep-dev-secrets/beep-build/RAILWAY_TOKEN
             NEON_API_KEY: op://beep-dev-secrets/beep-build/NEON_API_KEY
             VERCEL_API_TOKEN: op://beep-dev-secrets/beep-build/VERCEL_API_TOKEN
             # App secrets
             BETTER_AUTH_SECRET: op://beep-dev-secrets/beep-app-core/AUTH_SECRET
             BETTER_AUTH_URL: op://beep-dev-secrets/beep-app-core/BETTER_AUTH_URL
             ALLOWED_EMAILS: op://beep-dev-secrets/beep-app-core/APP_ADMINS_EMAILS
             FALKORDB_PASSWORD: op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD
             GRAPHITI_API_KEY: op://beep-dev-secrets/beep-data/GRAPHITI_API_KEY
             OPENAI_API_KEY: op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY
             RESEND_API_KEY: op://beep-dev-secrets/beep-email/EMAIL_RESEND_API_KEY

         - uses: oven-sh/setup-bun@v2
           with:
             bun-version: latest

         - run: bun install --frozen-lockfile

         - name: Deploy SST
           run: bunx sst deploy --stage ${{ github.event.inputs.stage || 'production' }}
   ```

   **Notes:**
   - **One GitHub secret needed:** `OP_SERVICE_ACCOUNT_TOKEN` (1Password) — no AWS keys stored anywhere.
   - **OIDC federation** (`aws-actions/configure-aws-credentials@v4`) assumes an IAM role per-account. The stage determines which account: `production` → prod account (`703222328573`), all others → dev account (`487243850762`).
   - OIDC credentials are short-lived (1 hour default). No static AWS keys to rotate or leak.
   - `id-token: write` permission is required for the GitHub Actions OIDC provider to issue tokens.
   - The `1password/load-secrets-action` resolves non-AWS `op://` references and exports them as masked environment variables.
   - `cancel-in-progress: false` ensures a production deploy is never interrupted mid-flight.

5. **Write `.github/workflows/sst-preview.yml`:**

   ```yaml
   name: SST PR Preview

   on:
     pull_request:
       types: [opened, synchronize, reopened, closed]

   concurrency:
     group: sst-preview-pr-${{ github.event.pull_request.number }}
     cancel-in-progress: true  # Cancel stale preview deploys on new push

   jobs:
     deploy-preview:
       if: github.event.action != 'closed'
       runs-on: ubuntu-latest
       timeout-minutes: 15
       permissions:
         contents: read
         id-token: write  # Required for AWS OIDC federation
         pull-requests: write  # Needed for PR comment

       steps:
         - uses: actions/checkout@v4

         - name: Configure AWS credentials (OIDC)
           uses: aws-actions/configure-aws-credentials@v4
           with:
             role-to-assume: arn:aws:iam::487243850762:role/github-sst-deploy
             aws-region: us-east-1

         - name: Load secrets from 1Password
           uses: 1password/load-secrets-action@v2
           with:
             export-env: true
           env:
             OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
             # Provider tokens (all needed even though PR previews skip Railway/Neon resources)
             RAILWAY_TOKEN: op://beep-dev-secrets/beep-build/RAILWAY_TOKEN
             NEON_API_KEY: op://beep-dev-secrets/beep-build/NEON_API_KEY
             VERCEL_API_TOKEN: op://beep-dev-secrets/beep-build/VERCEL_API_TOKEN
             # App secrets
             BETTER_AUTH_SECRET: op://beep-dev-secrets/beep-app-core/AUTH_SECRET
             BETTER_AUTH_URL: op://beep-dev-secrets/beep-app-core/BETTER_AUTH_URL
             ALLOWED_EMAILS: op://beep-dev-secrets/beep-app-core/APP_ADMINS_EMAILS
             FALKORDB_PASSWORD: op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD
             GRAPHITI_API_KEY: op://beep-dev-secrets/beep-data/GRAPHITI_API_KEY
             OPENAI_API_KEY: op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY
             RESEND_API_KEY: op://beep-dev-secrets/beep-email/EMAIL_RESEND_API_KEY

         - uses: oven-sh/setup-bun@v2
           with:
             bun-version: latest

         - run: bun install --frozen-lockfile

         - name: Deploy PR Preview
           run: bunx sst deploy --stage pr-${{ github.event.pull_request.number }}

         - name: Comment PR with preview URL
           if: success()
           uses: actions/github-script@v7
           with:
             script: |
               // Find existing bot comment to update (avoid duplicate comments on re-push)
               const { data: comments } = await github.rest.issues.listComments({
                 issue_number: context.issue.number,
                 owner: context.repo.owner,
                 repo: context.repo.repo,
               });
               const botComment = comments.find(c =>
                 c.user.type === 'Bot' && c.body.includes('Preview deployed:')
               );
               const body = `Preview deployed: https://beep-pr-${context.issue.number}.vercel.app\n\n_Note: Railway and Neon are not provisioned for PR previews. Some features may be unavailable._`;
               if (botComment) {
                 await github.rest.issues.updateComment({
                   comment_id: botComment.id,
                   owner: context.repo.owner,
                   repo: context.repo.repo,
                   body,
                 });
               } else {
                 await github.rest.issues.createComment({
                   issue_number: context.issue.number,
                   owner: context.repo.owner,
                   repo: context.repo.repo,
                   body,
                 });
               }

     teardown-preview:
       if: github.event.action == 'closed'
       runs-on: ubuntu-latest
       timeout-minutes: 10
       permissions:
         contents: read
         id-token: write  # Required for AWS OIDC federation

       steps:
         - uses: actions/checkout@v4

         - name: Configure AWS credentials (OIDC)
           uses: aws-actions/configure-aws-credentials@v4
           with:
             role-to-assume: arn:aws:iam::487243850762:role/github-sst-deploy
             aws-region: us-east-1

         - name: Load secrets from 1Password
           uses: 1password/load-secrets-action@v2
           with:
             export-env: true
           env:
             OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
             # Provider tokens
             RAILWAY_TOKEN: op://beep-dev-secrets/beep-build/RAILWAY_TOKEN
             NEON_API_KEY: op://beep-dev-secrets/beep-build/NEON_API_KEY
             VERCEL_API_TOKEN: op://beep-dev-secrets/beep-build/VERCEL_API_TOKEN
             # App secrets — required because `sst remove` evaluates the full program
             # (infra/secrets.ts requireEnv() runs even during teardown)
             BETTER_AUTH_SECRET: op://beep-dev-secrets/beep-app-core/AUTH_SECRET
             BETTER_AUTH_URL: op://beep-dev-secrets/beep-app-core/BETTER_AUTH_URL
             ALLOWED_EMAILS: op://beep-dev-secrets/beep-app-core/APP_ADMINS_EMAILS
             FALKORDB_PASSWORD: op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD
             GRAPHITI_API_KEY: op://beep-dev-secrets/beep-data/GRAPHITI_API_KEY
             OPENAI_API_KEY: op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY
             RESEND_API_KEY: op://beep-dev-secrets/beep-email/EMAIL_RESEND_API_KEY

         - uses: oven-sh/setup-bun@v2
           with:
             bun-version: latest

         - run: bun install --frozen-lockfile

         - name: Remove PR Preview
           # continue-on-error: teardown failure should not block PR merge
           continue-on-error: true
           run: bunx sst remove --stage pr-${{ github.event.pull_request.number }}
   ```

   **Key improvements over naive version:**
   - Only ONE GitHub Actions secret (`OP_SERVICE_ACCOUNT_TOKEN`) — all others resolved from 1Password
   - **Zero static AWS keys** — OIDC federation via `aws-actions/configure-aws-credentials@v4`
   - `pull-requests: write` permission for PR comments, `id-token: write` for OIDC
   - Updates existing bot comment instead of creating duplicates on each push
   - `continue-on-error: true` on teardown — a failed teardown should not block PR merge
   - Teardown needs ALL secrets (provider tokens + app secrets) because `sst remove` evaluates the full program — `infra/secrets.ts` `requireEnv()` runs even during resource removal

6. **Configure production secrets in 1Password:**

   Production secrets are managed in 1Password — NOT via `sst secret set`. Two approaches:

   **Option A: Separate production vault (recommended for teams)**
   Create a `beep-production-secrets` vault with the same item/field structure as `beep-dev-secrets`, but with production-specific values. Create `.env.op.production`:
   ```bash
   # No AWS keys — OIDC handles AWS auth (locally via SSO, CI via aws-actions/configure-aws-credentials)
   RAILWAY_TOKEN=op://beep-production-secrets/beep-build/RAILWAY_TOKEN
   NEON_API_KEY=op://beep-production-secrets/beep-build/NEON_API_KEY
   VERCEL_API_TOKEN=op://beep-production-secrets/beep-build/VERCEL_API_TOKEN
   BETTER_AUTH_SECRET=op://beep-production-secrets/beep-app-core/AUTH_SECRET
   BETTER_AUTH_URL=op://beep-production-secrets/beep-app-core/BETTER_AUTH_URL
   ALLOWED_EMAILS=op://beep-production-secrets/beep-app-core/APP_ADMINS_EMAILS
   FALKORDB_PASSWORD=op://beep-production-secrets/beep-data/FALKORDB_PASSWORD
   GRAPHITI_API_KEY=op://beep-production-secrets/beep-data/GRAPHITI_API_KEY
   OPENAI_API_KEY=op://beep-production-secrets/beep-ai/AI_OPENAI_API_KEY
   RESEND_API_KEY=op://beep-production-secrets/beep-email/EMAIL_RESEND_API_KEY
   ```

   **Option B: Same vault, different items (simpler for solo dev)**
   Add `-production` suffixed items to `beep-dev-secrets` (e.g., `beep-app-core-production`). Update `.env.op.production` `op://` references accordingly.

   **Production deploy (local):**
   ```bash
   # SSO handles AWS auth (targets prod account 703222328573 via beep-prod profile)
   aws sso login --profile beep-prod
   op run --env-file=.env.op.production -- bunx sst deploy --stage production
   ```

   **CI production deploy:** The `sst-deploy.yml` workflow automatically uses the correct AWS account via OIDC (production stage → prod account role). Non-AWS secrets from 1Password may need to be swapped to production vault references — use a conditional `op://` path or matrix strategy.

7. **Create minimal IAM policy** for SST state storage:

   Create `infra/iam-policy.json`:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "SSTBootstrap",
         "Effect": "Allow",
         "Action": [
           "sts:GetCallerIdentity"
         ],
         "Resource": "*"
       },
       {
         "Sid": "SSTStateStorage",
         "Effect": "Allow",
         "Action": [
           "s3:CreateBucket",
           "s3:GetBucketLocation",
           "s3:GetBucketVersioning",
           "s3:PutBucketVersioning",
           "s3:PutBucketPolicy",
           "s3:GetBucketPolicy",
           "s3:PutBucketPublicAccessBlock",
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::sst-state-*",
           "arn:aws:s3:::sst-state-*/*"
         ]
       },
       {
         "Sid": "SSTSecretStorage",
         "Effect": "Allow",
         "Action": [
           "ssm:GetParameter",
           "ssm:GetParameters",
           "ssm:PutParameter",
           "ssm:DeleteParameter",
           "ssm:DeleteParameters",
           "ssm:GetParametersByPath",
           "ssm:DescribeParameters"
         ],
         "Resource": "arn:aws:ssm:*:*:parameter/sst/*"
       }
     ]
   }
   ```

   **Notes:**
   - `sts:GetCallerIdentity` is needed for SST bootstrap (identifies the AWS account).
   - `s3:PutBucketPolicy` and `s3:PutBucketPublicAccessBlock` are needed on first deploy when SST creates its state bucket.
   - SST v3 (Ion) stores state in S3. SSM Parameter Store permissions are retained even though secrets are managed by 1Password — SST may use SSM internally for state metadata. It does NOT use DynamoDB for locking (unlike Terraform).
   - **Apply this policy in BOTH AWS accounts** (dev: `487243850762`, prod: `703222328573`). Each account gets its own SST state bucket.
   - This is a starting point. Run `sst deploy` with `--verbose` and check for access denied errors to refine. After the first deploy creates the S3 bucket, `s3:CreateBucket` can be removed.
   - **For CI:** Attach this policy to the `github-sst-deploy` IAM role in each account (created in step 7a below). OIDC federation means no static AWS keys — the role is assumed via GitHub Actions' OIDC token.
   - **For local dev:** SSO profiles (`beep-dev`/`beep-prod`) provide access. The SSO role's permissions should include at least the actions in this policy.

7a. **Set up GitHub Actions OIDC federation** (one-time per AWS account):

   This eliminates all static AWS credentials. GitHub Actions assumes an IAM role via OIDC tokens.

   **In EACH AWS account** (dev: `487243850762`, prod: `703222328573`):

   a. **Create the OIDC identity provider** (if not already present):
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
     --profile beep-dev  # repeat with --profile beep-prod
   ```

   b. **Create the IAM role** with the SST policy from step 7:
   ```bash
   # Create trust policy file (dev account — allows any branch/PR)
   cat > /tmp/trust-policy-dev.json << 'EOF'
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": {
         "Federated": "arn:aws:iam::487243850762:oidc-provider/token.actions.githubusercontent.com"
       },
       "Action": "sts:AssumeRoleWithWebIdentity",
       "Condition": {
         "StringEquals": {
           "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
         },
         "StringLike": {
           "token.actions.githubusercontent.com:sub": "repo:kriegcloud/beep-effect2:*"
         }
       }
     }]
   }
   EOF

   # Create trust policy file (prod account — main branch only)
   cat > /tmp/trust-policy-prod.json << 'EOF'
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": {
         "Federated": "arn:aws:iam::703222328573:oidc-provider/token.actions.githubusercontent.com"
       },
       "Action": "sts:AssumeRoleWithWebIdentity",
       "Condition": {
         "StringEquals": {
           "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
           "token.actions.githubusercontent.com:sub": "repo:kriegcloud/beep-effect2:ref:refs/heads/main"
         }
       }
     }]
   }
   EOF

   # Create roles
   aws iam create-role --role-name github-sst-deploy \
     --assume-role-policy-document file:///tmp/trust-policy-dev.json \
     --profile beep-dev

   aws iam create-role --role-name github-sst-deploy \
     --assume-role-policy-document file:///tmp/trust-policy-prod.json \
     --profile beep-prod

   # Attach the SST policy from step 7
   aws iam put-role-policy --role-name github-sst-deploy \
     --policy-name sst-state-access \
     --policy-document file://infra/iam-policy.json \
     --profile beep-dev

   aws iam put-role-policy --role-name github-sst-deploy \
     --policy-name sst-state-access \
     --policy-document file://infra/iam-policy.json \
     --profile beep-prod
   ```

   **Trust policy scoping:**
   - **Dev account** uses `StringLike` with `repo:kriegcloud/beep-effect2:*` — allows any branch, PR, or workflow.
   - **Prod account** uses `StringEquals` with `repo:kriegcloud/beep-effect2:ref:refs/heads/main` — only allows the main branch. This prevents non-production workflows from assuming the production role.

   **Verification:**
   ```bash
   # Verify roles exist
   aws iam get-role --role-name github-sst-deploy --profile beep-dev
   aws iam get-role --role-name github-sst-deploy --profile beep-prod

   # Verify trust policies
   aws iam get-role --role-name github-sst-deploy --profile beep-dev \
     --query 'Role.AssumeRolePolicyDocument' --output json
   aws iam get-role --role-name github-sst-deploy --profile beep-prod \
     --query 'Role.AssumeRolePolicyDocument' --output json
   ```

8. **Set GitHub Actions secret** in the repository settings:

   | Secret Name | Value | Source |
   |---|---|---|
   | `OP_SERVICE_ACCOUNT_TOKEN` | 1Password service account token | `beep-automation-admin/beep-sync-service-account` |

   This is the **only** GitHub Actions secret needed. All provider tokens and app secrets are resolved from 1Password at workflow runtime via `1password/load-secrets-action@v2`.

   To set it:
   ```bash
   # Read the token from 1Password
   op read "op://beep-automation-admin/beep-sync-service-account/OP_SERVICE_ACCOUNT_TOKEN"
   # Copy the output and set it as a GitHub Actions secret:
   # Settings > Secrets and variables > Actions > New repository secret
   ```

9. **Test the full lifecycle:**

   ```bash
   # Deploy production (using production env file)
   op run --env-file=.env.op.production -- bunx sst deploy --stage production

   # Deploy a PR preview (using dev env file — PR previews share dev secrets)
   op run --env-file=.env.op.dev -- bunx sst deploy --stage pr-test

   # Verify PR preview resources exist
   # (check Vercel dashboard — Railway/Neon are skipped for PR previews)

   # Tear down PR preview
   op run --env-file=.env.op.dev -- bunx sst remove --stage pr-test

   # Verify PR preview resources are gone
   ```

---

## Episodic Memory (Previous Context)

### P0-P3 Outcomes

- SST initialized, all providers installed
- Railway project with 3 services deployed and verified
- Neon database provisioned
- 1Password vault fields created and validated, `op run` wiring tested
- Vercel project created with env vars wired from Railway/Neon outputs
- End-to-end `bunx sst deploy --stage dev` works
- Import DAG: secrets -> railway/database -> web (no circular deps)

### Provider Gaps Discovered (from P1-P3 Research)

- **`@sst-provider/railway` v0.4.4 is 2+ years behind TF provider v0.6.1.** Missing: `regions` list block (v0.5.0+), `workspace_id` (v0.6.0+), volume creation bug fixes (v0.6.1). Volume nested block may fail — if so, configure manually in Railway dashboard and document as a gap.
- **Railway `defaultEnvironment` access pattern:** Must use `project.defaultEnvironment.apply(env => env.id)` — services don't expose `environmentId` directly.
- **Railway `ServiceDomain` requires `subdomain`** (required field, not optional).
- **Railway has no `restartPolicy` or `healthCheck` attributes** on the service resource. These are Railway platform defaults or must be configured via `railway.toml`.
- **Neon simplified:** `neon.Project` auto-creates all defaults. No separate Branch/Database/Endpoint resources needed.
- **CI workflows must pass all 3 provider tokens** even for PR previews that skip Railway/Neon — provider initialization happens regardless of whether resources are created.

---

## Semantic Memory (Project Constants)

### Stage Strategy

| Stage | Trigger | AWS Account | Railway | Neon | Vercel | Secrets | Protection |
|---|---|---|---|---|---|---|---|
| `production` | Push to `main` | Prod (`703222328573`) | Full project | Dedicated project | Production env vars | 1Password (prod vault) | `protect: true`, `removal: "retain"` |
| `staging` | Manual dispatch | Dev (`487243850762`) | Full project | Skipped (shares dev) | Preview env vars | 1Password (dev vault) | `protect: false`, `removal: "remove"` |
| `dev` | Manual dispatch | Dev (`487243850762`) | Full project | Dedicated project | Preview + dev env vars | 1Password (dev vault) | `protect: false`, `removal: "remove"` |
| `pr-{N}` | PR open/sync | Dev (`487243850762`) | **Skipped** | **Skipped** | Preview env vars | 1Password (dev vault) | `protect: false`, `removal: "remove"` |
| `<username>` | `sst dev` (personal) | Dev (`487243850762`) | **Skipped** | **Skipped** | Dev env vars | 1Password (dev vault) | `protect: false`, `removal: "remove"` |

**Key constraints driving this table:**
- **Neon free tier: 1 project.** Only `dev` and `production` get dedicated Neon projects. `staging` must share `dev`'s database or be skipped.
- **Railway cost: ~$5-10/project/month.** PR previews and personal stages skip Railway entirely. Only `dev`, `staging`, and `production` provision Railway services.
- **Vercel Hobby: no per-project cost.** All stages can safely create Vercel projects.

### GitHub Actions Secrets Required

| Secret | Purpose |
|---|---|
| `OP_SERVICE_ACCOUNT_TOKEN` | 1Password service account — resolves all provider tokens and app secrets at workflow runtime via `1password/load-secrets-action@v2` |

All other secrets (AWS, Railway, Neon, Vercel, app secrets) are stored in 1Password vaults and resolved dynamically. No additional GitHub Actions secrets are needed.

### Cost Impact of Multiple Stages

| Stage Type | Railway | Neon | Vercel | Monthly Cost |
|---|---|---|---|---|
| Production | ~$8-10 (3 services) | $0 (free tier) | $0 (Hobby) | ~$8-10 |
| Dev | ~$8-10 (3 services) | $0 (free tier, separate project) | $0 | ~$8-10 |
| Staging | ~$8-10 (3 services) | $0 (shares dev Neon) | $0 | ~$8-10 |
| PR Preview | **$0 (skipped)** | **$0 (skipped)** | $0 | ~$0 |
| Personal (`sst dev`) | **$0 (skipped)** | **$0 (skipped)** | $0 | ~$0 |

**Total estimated monthly cost (3 core stages):** ~$24-30/month for Railway. Neon and Vercel remain on free tiers.

**Cost optimization strategies:**
1. **PR previews skip Railway + Neon** (implemented) — prevents runaway costs from active PRs
2. **Share a Railway project across dev + staging** — reduces from 3 projects to 2 (requires environment-level isolation within one project, which may not be well-supported by the Railway provider)
3. **Skip staging entirely for v1** — just use `dev` + `production` (~$16-20/month)
4. **Railway Hobby plan billing:** $5/developer/month + usage-based compute. 3 services (FalkorDB, Graphiti, Proxy) each consume compute independently.

---

## Procedural Memory (Reference Links)

- [SST Workflow (Stages)](https://sst.dev/docs/workflow/)
- [SST Share Across Stages](https://sst.dev/docs/share-across-stages/)
- [SST Console Autodeploy](https://sst.dev/docs/console/#autodeploy)
- [GitHub Actions Concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)
- [Spec README ADR-007, ADR-008](../README.md)

---

## Verification Steps

```bash
# 0. Ensure SSO sessions are active
aws sso login --profile beep-dev
aws sso login --profile beep-prod

# 1. Production deploy (SSO → prod account, 1Password → non-AWS secrets)
op run --env-file=.env.op.production -- bunx sst deploy --stage production

# 2. Verify protection
# Attempt to remove production (should fail or warn)
op run --env-file=.env.op.production -- bunx sst remove --stage production
# Expected: error or confirmation prompt due to protect: true

# 3. PR preview lifecycle (SSO → dev account, 1Password → dev secrets, Railway/Neon skipped)
op run --env-file=.env.op.dev -- bunx sst deploy --stage pr-test
op run --env-file=.env.op.dev -- bunx sst remove --stage pr-test

# 3a. Verify state isolation — dev and prod state buckets are in different accounts
aws s3 ls --profile beep-dev | grep sst-state
aws s3 ls --profile beep-prod | grep sst-state

# 4. Verify 1Password secrets resolve correctly
op read "op://beep-dev-secrets/beep-app-core/AUTH_SECRET" > /dev/null && echo "OK" || echo "FAIL"
op read "op://beep-dev-secrets/beep-build/RAILWAY_TOKEN" > /dev/null && echo "OK" || echo "FAIL"

# 5. Verify GitHub Actions secret is set
gh secret list | grep OP_SERVICE_ACCOUNT_TOKEN

# 5a. Verify OIDC roles exist in both accounts
aws iam get-role --role-name github-sst-deploy --profile beep-dev --query 'Role.Arn'
aws iam get-role --role-name github-sst-deploy --profile beep-prod --query 'Role.Arn'

# 6. GitHub Actions (after pushing workflow files)
# - Push to main -> triggers sst-deploy.yml
# - Open a PR -> triggers sst-preview.yml deploy
# - Close/merge PR -> triggers sst-preview.yml teardown
```

---

## Known Issues & Gotchas

1. **Railway cost multiplication.** Each SST stage creates a separate Railway project. PR previews and personal stages MUST skip Railway (implemented via `isPrPreview` guard). Even with 3 core stages (dev/staging/production), Railway costs ~$24-30/month.

2. **Neon free tier: 1 project.** Only `dev` and `production` can have dedicated Neon projects. `staging` must share `dev`'s database. PR previews and personal stages skip Neon entirely (implemented via `isPrPreview` guard in P2).

3. **SST state bucket auto-creation.** SST creates an S3 bucket on first deploy. The IAM policy must allow `s3:CreateBucket` and `s3:PutBucketPolicy`. After initial creation, these permissions can be removed.

4. **Concurrency groups in GitHub Actions.** Deploys to the same stage MUST be serialized. The workflow uses `concurrency.group` keyed by stage name. `cancel-in-progress: false` for production (don't cancel running deploys), `true` for previews (cancel stale preview deploys).

5. **Secret leakage in CI logs.** The `1password/load-secrets-action` automatically masks all resolved secret values in GitHub Actions logs. Additionally, check that SST's verbose output doesn't leak Neon connection URIs (which contain embedded credentials). The `op run` CLI also masks secrets in local terminal output.

6. **`sst remove` is destructive.** It deletes ALL resources for the given stage. The `protect: true` flag on production prevents `sst remove` from deleting protected resources. Never run `sst remove --stage production` without explicit intent.

7. **PR preview URL pattern.** The URL `beep-pr-123.vercel.app` depends on Vercel's project naming and may differ. The actual URL should be extracted from the Vercel provider's output (`project.id` or `vercelProjectUrl` export) rather than assumed.

8. **Provider tokens needed even when resources are skipped.** SST initializes all providers on every deploy, regardless of which resources are created. This means `RAILWAY_TOKEN` and `NEON_API_KEY` must be available (via 1Password) even for PR preview stages that skip those resources. If a token is missing, the provider initialization will fail. The 1Password action resolves all secrets regardless — this is handled automatically.

9. **Teardown failure should not block PR merge.** The preview teardown job uses `continue-on-error: true` to prevent orphaned resources from blocking the development workflow. If teardown fails, resources may leak and need manual cleanup.

10. **`infra/web.ts` must handle undefined Railway/Neon outputs.**

11. **OIDC role trust policy must be carefully scoped.** The prod account role restricts to `ref:refs/heads/main` (exact match), meaning only pushes to `main` can assume it. If you need manual dispatch to production from other branches, update the trust policy condition. The dev account role uses `StringLike` with wildcard, allowing any branch/PR.

12. **OIDC token expiry.** `aws-actions/configure-aws-credentials@v4` issues temporary credentials (default: 1 hour). SST deploys typically complete in 5-15 minutes, well within this limit. If a deploy exceeds 1 hour, increase `role-duration-seconds` in the action config.

---

## Success Criteria Checklist

- [ ] `sst.config.ts` has `removal` and `protect` stage-conditional logic (from P0)
- [ ] All `infra/*.ts` modules use `$app.stage` for naming and conditional behavior
- [ ] `infra/railway.ts` skips Railway for PR preview stages (`isPrPreview` guard)
- [ ] `infra/database.ts` skips Neon for PR preview stages (already in P2)
- [ ] `infra/web.ts` handles undefined Railway/Neon outputs for PR previews
- [ ] `.github/workflows/sst-deploy.yml` deploys on push to `main` (production)
- [ ] `.github/workflows/sst-deploy.yml` supports manual dispatch for dev/staging
- [ ] `.github/workflows/sst-preview.yml` deploys on PR open, tears down on PR close
- [ ] Preview workflow updates existing PR comment (not duplicate comments)
- [ ] Preview teardown uses `continue-on-error: true`
- [ ] Both workflows use concurrency groups to serialize per-stage
- [ ] Production 1Password vault/items configured with production-specific values
- [ ] `.env.op.production` reference file created with production `op://` references
- [ ] `op run --env-file=.env.op.production -- bunx sst deploy --stage production` succeeds with `protect: true`
- [ ] `op run --env-file=.env.op.dev -- bunx sst deploy --stage pr-test` succeeds (Vercel only, Railway/Neon skipped)
- [ ] `op run --env-file=.env.op.dev -- bunx sst remove --stage pr-test` cleanly removes all preview resources
- [ ] `infra/iam-policy.json` documents minimum AWS permissions (S3 + SSM + STS)
- [ ] OIDC identity provider created in both AWS accounts
- [ ] `github-sst-deploy` IAM role created in both AWS accounts with SST policy and trust policy
- [ ] Prod role trust policy restricts to `ref:refs/heads/main` only
- [ ] No static AWS keys in 1Password or GitHub Actions secrets
- [ ] `OP_SERVICE_ACCOUNT_TOKEN` set as the sole GitHub Actions secret
- [ ] Cost implications of multi-stage documented with optimization strategies
