# SST Setup Guide for beep-effect Monorepo

This guide covers bootstrapping SST (Serverless Stack) v3.x in the beep-effect Turborepo monorepo. It draws patterns from the reference implementation in `tmp/printdesk/`.

---

## Prerequisites

1. **AWS Identity Center (SSO) Access** - Already configured with `todox-dev` profile
2. **Bun** - Package manager (v1.3.x)
3. **SST** - Already installed as a root dependency (`sst@^3.17.25`)

### AWS SSO Login

```bash
# Login to your AWS Identity Center account
aws sso login --profile todox-dev
```

---

## Phase 1: Initialize SST Configuration

### 1.1 Create `sst.config.ts`

Create the root SST configuration file:

```typescript
// sst.config.ts
/// <reference path="./.sst/platform/config.d.ts" />

const AWS_REGION = process.env.AWS_REGION ?? process.env.CLOUD_AWS_REGION;
if (!AWS_REGION) throw new Error("AWS_REGION is not set");

export default $config({
  app(input) {
    return {
      name: "beep",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
      providers: {
        aws: {
          profile: input?.stage === "production" ? "todox-prod" : "todox-dev",
          region: AWS_REGION as aws.Region,
          version: "6.83.0",
        },
        // Add additional providers as needed:
        // cloudflare: { version: "6.9.1" },
        // random: true,
        // tls: true,
      },
      version: ">= 3.0.1",
    };
  },
  async run() {
    const { readdirSync } = await import("node:fs");

    // Set default function configuration
    $transform(sst.aws.Function, (args) => {
      args.architecture ??= "arm64";
      args.runtime ??= "nodejs22.x";
    });

    const outputs = {};

    // Dynamically load all infrastructure modules
    const dir = readdirSync("./infra");
    for (const file of dir) {
      if (file === "lib" || file.startsWith(".")) continue;
      if (!file.endsWith(".ts")) continue;

      const infra = await import(`./infra/${file}`);
      if (infra.outputs) Object.assign(outputs, infra.outputs);
    }

    return outputs;
  },
});
```

### 1.2 Create Infrastructure Directory

```bash
mkdir -p infra/lib/components
```

---

## Phase 2: Infrastructure Modules

### 2.1 Core Infrastructure Files

Create modular infrastructure definitions in `/infra/`:

| File | Purpose |
|------|---------|
| `misc.ts` | App metadata, AWS account linkables, shared secrets |
| `vpc.ts` | VPC configuration (optional for Lambda-only deployments) |
| `db.ts` | PostgreSQL/Aurora database, migrations |
| `storage.ts` | S3 buckets for documents, temporary files |
| `api.ts` | Effect Platform backend (Lambda or container) |
| `web.ts` | Next.js frontend deployment |
| `auth.ts` | Better Auth configuration, OAuth providers |
| `dns.ts` | Domain management (Route53 or Cloudflare) |

### 2.2 Example: `infra/misc.ts`

```typescript
// infra/misc.ts
import * as aws from "@pulumi/aws";

// Stage detection
export const isProdStage = $app.stage === "production";
export const isDevMode = $dev;

// App metadata linkable
export const appData = new sst.Linkable("AppData", {
  properties: {
    name: $app.name,
    stage: $app.stage,
    isProduction: isProdStage,
    isDev: isDevMode,
  },
});

// AWS account info
const callerIdentity = aws.getCallerIdentityOutput();
export const awsInfo = new sst.Linkable("AwsInfo", {
  properties: {
    accountId: callerIdentity.accountId,
    region: aws.config.region ?? "us-east-1",
  },
});

export const outputs = {
  stage: $app.stage,
  region: aws.config.region,
};
```

### 2.3 Example: `infra/storage.ts`

```typescript
// infra/storage.ts
import { isProdStage } from "./misc";

// Documents bucket (maps to @beep/documents-infra S3 storage)
export const documentsBucket = new sst.aws.Bucket("DocumentsBucket", {
  versioning: isProdStage,
  // Access control handled via IAM, not public
});

// Temporary uploads with lifecycle rules
export const temporaryBucket = new sst.aws.Bucket("TemporaryBucket", {
  transform: {
    bucket: (args) => {
      args.lifecycleRules = [
        {
          enabled: true,
          prefix: "uploads/",
          expiration: { days: 1 },
        },
      ];
    },
  },
});

export const outputs = {
  documentsBucket: documentsBucket.name,
  temporaryBucket: temporaryBucket.name,
};
```

### 2.4 Example: `infra/db.ts`

```typescript
// infra/db.ts
import * as aws from "@pulumi/aws";
import { isProdStage } from "./misc";

// Option A: RDS PostgreSQL (simpler, lower cost for dev)
export const database = new sst.aws.Postgres("Database", {
  vpc: vpc, // Reference from vpc.ts if using VPC
  scaling: {
    min: isProdStage ? "0.5 ACU" : "0.5 ACU",
    max: isProdStage ? "4 ACU" : "1 ACU",
  },
  // Deletion protection in production
  transform: {
    cluster: (args) => {
      args.deletionProtection = isProdStage;
    },
  },
});

// Option B: Aurora DSQL (as used in printdesk reference)
// Requires custom component - see Phase 4

// Database migrator function
export const dbMigrator = new sst.aws.Function("DbMigrator", {
  handler: "packages/_internal/db-admin/src/migrator.handler",
  link: [database],
  timeout: "60 seconds",
  copyFiles: [
    {
      from: "packages/_internal/db-admin/drizzle",
      to: "drizzle",
    },
  ],
});

export const outputs = {
  databaseHost: database.host,
  databasePort: database.port,
};
```

### 2.5 Example: `infra/api.ts`

```typescript
// infra/api.ts
import { database } from "./db";
import { documentsBucket, temporaryBucket } from "./storage";
import { appData, awsInfo } from "./misc";

// Effect Platform backend as Lambda
export const api = new sst.aws.Function("Api", {
  handler: "apps/server/src/lambda.handler",
  link: [
    database,
    documentsBucket,
    temporaryBucket,
    appData,
    awsInfo,
  ],
  url: true, // Creates a Lambda function URL
  memory: "512 MB",
  timeout: "30 seconds",
  environment: {
    NODE_ENV: $app.stage === "production" ? "production" : "development",
  },
});

// Alternative: API Gateway + Lambda
export const apiGateway = new sst.aws.ApiGatewayV2("ApiGateway", {
  transform: {
    route: {
      handler: {
        link: [database, documentsBucket],
      },
    },
  },
});

apiGateway.route("$default", {
  handler: "apps/server/src/lambda.handler",
});

export const outputs = {
  apiUrl: api.url,
  // or: apiUrl: apiGateway.url,
};
```

### 2.6 Example: `infra/web.ts`

```typescript
// infra/web.ts
import { api } from "./api";
import { appData } from "./misc";

// Next.js deployment
export const web = new sst.aws.Nextjs("Web", {
  path: "apps/web",
  buildCommand: "bun run build",
  environment: {
    NEXT_PUBLIC_API_URL: api.url,
    NEXT_PUBLIC_STAGE: $app.stage,
  },
  link: [appData],
  // Domain configuration (optional)
  // domain: isProdStage ? "app.yourdomain.com" : undefined,
});

export const outputs = {
  webUrl: web.url,
};
```

---

## Phase 3: Integration with Turbo

### 3.1 Update `turbo.json`

The existing `turbo.json` already passes through `SST_*` and `AWS_*` environment variables. Add SST-specific tasks if needed:

```json
{
  "tasks": {
    "sst:dev": {
      "cache": false,
      "persistent": true,
      "env": ["AWS_PROFILE", "AWS_REGION"]
    },
    "sst:deploy": {
      "dependsOn": ["^build"],
      "cache": false,
      "env": ["AWS_PROFILE", "AWS_REGION"]
    }
  }
}
```

### 3.2 Update `package.json` Scripts

Add SST commands to root `package.json`:

```json
{
  "scripts": {
    "sst:dev": "bun run dotenvx -- sst dev",
    "sst:deploy": "bun run dotenvx -- sst deploy",
    "sst:remove": "bun run dotenvx -- sst remove",
    "sst:secrets": "bun run dotenvx -- sst secret",
    "sst:console": "sst console"
  }
}
```

---

## Phase 4: Custom Components (Advanced)

For advanced patterns like the printdesk reference, create custom components in `infra/lib/components/`:

### 4.1 Physical Name Component

```typescript
// infra/lib/components/physical-name.ts
import * as random from "@pulumi/random";

export class PhysicalName extends $util.ComponentResource {
  public readonly name: $util.Output<string>;

  constructor(
    name: string,
    args: { maxLength?: number; prefix?: string },
    opts?: $util.ComponentResourceOptions
  ) {
    super("beep:sst:PhysicalName", name, args, opts);

    const maxLength = args.maxLength ?? 64;
    const prefix = args.prefix ?? $app.name;

    const suffix = new random.RandomString(`${name}Suffix`, {
      length: 8,
      special: false,
      upper: false,
    }, { parent: this });

    this.name = $util.interpolate`${prefix}-${$app.stage}-${suffix.result}`.apply(
      (n) => n.slice(0, maxLength)
    );
  }
}
```

### 4.2 Extended Linkable Wrappers

Create wrappers for AWS resources that need additional properties exposed:

```typescript
// infra/lib/linkables.ts
import * as aws from "@pulumi/aws";

// Wrap IAM Role with assume permission
export function linkableRole(role: aws.iam.Role, name: string) {
  return new sst.Linkable(name, {
    properties: {
      name: role.name,
      arn: role.arn,
    },
    include: [
      sst.aws.permission({
        actions: ["sts:AssumeRole"],
        resources: [role.arn],
      }),
    ],
  });
}

// Wrap S3 Bucket with full permissions
export function linkableBucket(bucket: aws.s3.Bucket, name: string) {
  return new sst.Linkable(name, {
    properties: {
      name: bucket.id,
      arn: bucket.arn,
    },
    include: [
      sst.aws.permission({
        actions: ["s3:*"],
        resources: [bucket.arn, $util.interpolate`${bucket.arn}/*`],
      }),
    ],
  });
}
```

---

## Phase 5: Environment Configuration

### 5.1 SST Secrets

Store sensitive values using SST secrets:

```bash
# Set secrets for development
bun run sst:secrets set DB_PASSWORD "your-secure-password" --stage dev
bun run sst:secrets set BETTER_AUTH_SECRET "your-auth-secret" --stage dev

# Set secrets for production
bun run sst:secrets set DB_PASSWORD "production-password" --stage production
```

### 5.2 Environment Variable Mapping

Map SST-injected values to existing `.env` patterns:

```typescript
// apps/server/src/config.ts
import { Resource } from "sst";

export const config = {
  database: {
    host: Resource.Database.host,
    port: Resource.Database.port,
    // ... other connection params
  },
  storage: {
    documentsBucket: Resource.DocumentsBucket.name,
  },
};
```

### 5.3 Generate `sst-env.d.ts`

SST automatically generates type definitions. Add to each app's `tsconfig.json`:

```json
{
  "include": ["sst-env.d.ts", "src/**/*"]
}
```

---

## Phase 6: Development Workflow

### 6.1 Local Development with SST Dev

```bash
# Start SST dev mode (watches for changes, deploys incrementally)
bun run sst:dev

# In another terminal, run the web app
bun run --filter @beep/web dev
```

### 6.2 Database Migrations

```bash
# Generate migrations locally
bun run db:generate

# Apply migrations (in SST dev mode, this connects to deployed DB)
bun run db:migrate
```

### 6.3 Deployment

```bash
# Deploy to dev stage
AWS_PROFILE=todox-dev bun run sst:deploy --stage dev

# Deploy to production
AWS_PROFILE=todox-prod bun run sst:deploy --stage production
```

---

## Phase 7: CI/CD Integration

### 7.1 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      stage:
        description: 'Deployment stage'
        required: true
        default: 'dev'
        type: choice
        options:
          - dev
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: 1.3.2

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/GitHubActionsRole
          aws-region: us-east-1

      - name: Install dependencies
        run: bun install

      - name: Build
        run: bun run build

      - name: Deploy
        run: bunx sst deploy --stage ${{ github.event.inputs.stage || 'dev' }}
```

---

## Phase 8: Production Checklist

Before deploying to production:

- [ ] Set all required SST secrets
- [ ] Configure custom domain in `infra/dns.ts`
- [ ] Enable deletion protection on database
- [ ] Set up CloudWatch alarms
- [ ] Configure backup retention
- [ ] Review IAM permissions (least privilege)
- [ ] Enable WAF on API Gateway (optional)
- [ ] Set up budget alerts

---

## Reference: Printdesk Patterns Worth Adopting

From the `tmp/printdesk/` reference implementation:

1. **Ciphertext Encryption** - AES-256-GCM for sensitive config in Lambda
2. **Dynamic Module Loading** - `readdirSync("./infra")` for modular infrastructure
3. **Stage-Based Profiles** - `profile: isProdStage ? "prod" : "dev"`
4. **VPC Reuse in Dev** - Reference existing VPC to save costs
5. **Default Function Transforms** - `$transform(sst.aws.Function, ...)` for ARM64/Node22
6. **Multi-Tenant Patterns** - Bucket/role name templates with tenant ID placeholders
7. **Secret Rotation** - Time-based rotation using `@pulumiverse/time`

---

## File Structure Summary

```
beep-effect/
├── sst.config.ts              # Root SST configuration
├── sst-env.d.ts               # Generated type definitions
├── infra/
│   ├── misc.ts                # App metadata, AWS info
│   ├── vpc.ts                 # VPC configuration
│   ├── db.ts                  # Database resources
│   ├── storage.ts             # S3 buckets
│   ├── api.ts                 # Backend API
│   ├── web.ts                 # Next.js frontend
│   ├── auth.ts                # Authentication
│   ├── dns.ts                 # Domain management
│   └── lib/
│       └── components/        # Custom SST components
│           ├── physical-name.ts
│           └── linkables.ts
├── apps/
│   ├── web/
│   │   └── sst-env.d.ts       # Web app SST types
│   └── server/
│       └── sst-env.d.ts       # Server SST types
└── packages/
    └── _internal/
        └── db-admin/
            └── drizzle/       # Migration files
```

---

## Troubleshooting

### "AWS_REGION is not set"

Ensure your `.env` file has:
```
AWS_REGION=us-east-1
# or
CLOUD_AWS_REGION=us-east-1
```

### SSO Session Expired

```bash
aws sso login --profile todox-dev
```

### TypeScript errors in sst.config.ts

Run `bunx sst install` to regenerate platform types after provider changes.

### Build failures in CI

Ensure Turbo cache is cleared for SST-related tasks:
```bash
bunx turbo run build --force
```
