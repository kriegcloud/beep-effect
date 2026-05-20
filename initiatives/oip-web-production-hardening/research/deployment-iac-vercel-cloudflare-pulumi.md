# Deployment, IaC, Vercel, Cloudflare, And Pulumi Research

## Recommendation

Use Vercel Git deployments for the Next.js app and Pulumi for durable project,
environment, domain, DNS, and state-backend wiring.

## Decisions

- Vercel owns staging and production hosting.
- Cloudflare owns DNS for `oip.law`.
- Cloudflare zone `oip.law` is active, and the IaC token has Zone DNS
  read/write access.
- Pulumi state uses a temporary encrypted S3 backend in codedank until a
  dedicated OIP AWS organization exists.
- No DynamoDB lock table is required for Pulumi's S3 backend.
- AWS MCP is deferred. Use `aws-vault` plus AWS CLI for privileged bootstrap.
- Vercel Authentication is set to the provider's disabled posture for OIP
  projects so preview links can be shared without requiring additional Vercel
  seats.

## Temporary State Backend

- AWS profile: `codedank-elpresidank`
- Region: `us-east-1`
- Bucket: `opip-law-pulumi-state` (historical name retained for state
  continuity during the OIP rename)
- Public access: blocked
- Versioning: enabled
- Encryption: default SSE-S3
- Transport: deny insecure HTTP
- Lifecycle: retain recent noncurrent state versions, expire old ones

## Applied Staging Posture

- S3 backend bucket `opip-law-pulumi-state` exists and is hardened.
- Staging stack `staging` applies the Vercel project/domain/env and staging
  asset bucket.
- Production stack `production` is initialized and preview-only until explicit
  launch approval.
- Historical staging DNS for `staging.opip.law` is applied through Pulumi. OIP
  DNS records are modeled in IaC and remain pending provider apply until
  explicit cutover approval.
- Current staging proof split:
  - `oip-web-staging.vercel.app` responds but reflects the last deployed
    `main` commit until the current hardening changes deploy.
  - `staging.oip.law` DNS/TLS/public proof is pending provider apply.
  - `staging.opip.law` remains the verified historical staging endpoint until
    the redirect cutover completes.

## Deferred OIP AWS Org

Create a dedicated OIP AWS management account and organization once the OIP
business email, billing, and MFA are ready. Migrate Pulumi state out of
codedank before OIP AWS resources become materially business-critical.
