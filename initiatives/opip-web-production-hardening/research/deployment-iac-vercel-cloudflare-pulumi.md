# Deployment, IaC, Vercel, Cloudflare, And Pulumi Research

## Recommendation

Use Vercel Git deployments for the Next.js app and Pulumi for durable project,
environment, domain, DNS, and state-backend wiring.

## Decisions

- Vercel owns staging and production hosting.
- Cloudflare owns DNS for `opip.law`.
- Cloudflare zone `opip.law` is active, and the IaC token has Zone DNS
  read/write access.
- Pulumi state uses a temporary encrypted S3 backend in codedank until a
  dedicated OPIP AWS organization exists.
- No DynamoDB lock table is required for Pulumi's S3 backend.
- AWS MCP is deferred. Use `aws-vault` plus AWS CLI for privileged bootstrap.

## Temporary State Backend

- AWS profile: `codedank-elpresidank`
- Region: `us-east-1`
- Bucket: `opip-law-pulumi-state`
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
- Staging DNS is applied through Pulumi. Production DNS previews cleanly and
  remains unapplied until explicit cutover approval.

## Deferred OPIP AWS Org

Create a dedicated OPIP AWS management account and organization once the OPIP
business email, billing, and MFA are ready. Migrate Pulumi state out of
codedank before OPIP AWS resources become materially business-critical.
