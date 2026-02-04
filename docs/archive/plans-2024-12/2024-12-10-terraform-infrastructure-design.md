# Terraform Infrastructure & Pluggable Storage Design

**Date:** 2024-12-10
**Status:** Ready for Implementation

## Overview

Replace ad-hoc deploy scripts with Terraform-managed infrastructure and add pluggable storage backends using Effect's layer composition. This provides:

- Declarative infrastructure (GCS buckets, Cloud Run, secrets)
- Environment separation (dev/prod)
- Per-ontology storage namespacing
- Runtime-configurable storage backends (local/GCS)

## Goals

1. **Cleaner deployment** - Terraform manages infrastructure, deploy script only builds/pushes
2. **Per-ontology isolation** - Storage paths namespaced by ontology ID
3. **Pluggable backends** - Local filesystem for dev, GCS for prod, in-memory for tests
4. **Foundation for SaaS** - Structure supports future multi-tenancy

## Storage Architecture

### Bucket Structure

```
gs://effect-ontology-{env}/
├── ontologies/
│   ├── {ontology-id}/
│   │   ├── ontology.ttl
│   │   └── runs/
│   │       └── {run-id}/
│   │           ├── input.json
│   │           ├── result.json
│   │           └── metrics.json
│   └── ...
└── jobs/
    └── {job-id}/
        ├── status.json
        └── result.json
```

### Local Development Structure

```
./output/
├── ontologies/
│   ├── {ontology-id}/
│   │   └── runs/...
│   └── ...
└── jobs/...
```

## Pluggable Storage Implementation

### Existing Code (packages/@core-v2/src/Service/Storage.ts)

```typescript
// Already have:
export interface StorageService extends KeyValueStore.KeyValueStore {
  readonly list: (prefix: string) => Effect.Effect<Array<string>, SystemError>
}
export const StorageService = Context.GenericTag<StorageService>("@core-v2/StorageService")
export const StorageConfig = Context.GenericTag<StorageConfig>("@core-v2/StorageConfig")

// Implementations:
export const StorageServiceLive   // GCS
export const StorageServiceTest   // In-memory Map
```

### New: Extended Config & Local Backend

```typescript
// Extended config with storage type
export interface StorageConfig {
  readonly type: "local" | "gcs" | "memory"
  readonly bucketName?: string      // Required for GCS
  readonly localPath?: string       // For local filesystem (default: ./output)
  readonly pathPrefix?: string      // Ontology namespace prefix
}

// Local filesystem implementation
export const LocalStorageLive: Layer<StorageService, never, StorageConfig>

// Factory for runtime layer composition
export const makeStorageLayer = (config: StorageConfig): Layer<StorageService, ConfigError, never> =>
  config.type === "local"   ? LocalStorageLive.pipe(Layer.provide(Layer.succeed(StorageConfig, config))) :
  config.type === "gcs"     ? StorageServiceLive.pipe(Layer.provide(Layer.succeed(StorageConfig, config))) :
  config.type === "memory"  ? StorageServiceTest :
  Layer.fail(new ConfigError({ message: `Unknown storage type: ${config.type}` }))
```

### Server Integration

```typescript
// server.ts - compose storage layer from environment
const storageConfig: StorageConfig = {
  type: (process.env.STORAGE_TYPE || "gcs") as StorageConfig["type"],
  bucketName: process.env.STORAGE_BUCKET,
  localPath: process.env.STORAGE_LOCAL_PATH || "./output",
  pathPrefix: process.env.STORAGE_PREFIX
}

const StorageLayer = makeStorageLayer(storageConfig)

const ServerLive = HttpServerLive.pipe(
  // ... other layers
  Layer.provideMerge(StorageLayer),
  // ...
)
```

## Terraform Infrastructure

### Directory Structure

```
infra/
├── main.tf              # Provider config, backend
├── variables.tf         # Input variables
├── outputs.tf           # Service URL, bucket name
├── environments/
│   ├── dev.tfvars
│   └── prod.tfvars
└── modules/
    ├── storage/
    │   ├── main.tf      # GCS bucket, lifecycle rules
    │   ├── variables.tf
    │   └── outputs.tf
    ├── cloud-run/
    │   ├── main.tf      # Service, env vars, secrets
    │   ├── variables.tf
    │   └── outputs.tf
    └── secrets/
        ├── main.tf      # Secret Manager resources
        ├── variables.tf
        └── outputs.tf
```

### Key Resources

**infra/main.tf:**
```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "effect-ontology-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "storage" {
  source      = "./modules/storage"
  environment = var.environment
  project_id  = var.project_id
}

module "secrets" {
  source     = "./modules/secrets"
  project_id = var.project_id
}

module "cloud_run" {
  source              = "./modules/cloud-run"
  environment         = var.environment
  project_id          = var.project_id
  region              = var.region
  image               = var.image
  storage_bucket      = module.storage.bucket_name
  anthropic_secret_id = module.secrets.anthropic_secret_id
}
```

**infra/modules/storage/main.tf:**
```hcl
resource "google_storage_bucket" "main" {
  name          = "effect-ontology-${var.environment}"
  location      = "US"
  force_destroy = var.environment == "dev"

  lifecycle_rule {
    condition {
      age = var.environment == "dev" ? 7 : 30
    }
    action {
      type = "Delete"
    }
  }

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_member" "cloud_run_access" {
  bucket = google_storage_bucket.main.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.cloud_run_sa}"
}
```

**infra/modules/cloud-run/main.tf:**
```hcl
resource "google_cloud_run_v2_service" "main" {
  name     = "effect-ontology-core-${var.environment}"
  location = var.region

  template {
    containers {
      image = var.image

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "STORAGE_TYPE"
        value = "gcs"
      }
      env {
        name  = "STORAGE_BUCKET"
        value = var.storage_bucket
      }
      env {
        name  = "LLM_PROVIDER"
        value = "anthropic"
      }
      env {
        name  = "LLM_MODEL"
        value = "claude-3-5-sonnet-latest"
      }
      # ... other env vars

      env {
        name = "ANTHROPIC_API_KEY"
        value_source {
          secret_key_ref {
            secret  = var.anthropic_secret_id
            version = "latest"
          }
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    timeout = "300s"
  }
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  count    = var.allow_unauthenticated ? 1 : 0
  location = google_cloud_run_v2_service.main.location
  name     = google_cloud_run_v2_service.main.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
```

### Environment Files

**infra/environments/dev.tfvars:**
```hcl
environment = "dev"
project_id  = "gen-lang-client-0874846742"
region      = "us-central1"
image       = "gcr.io/gen-lang-client-0874846742/effect-ontology-core:dev"
allow_unauthenticated = true
```

**infra/environments/prod.tfvars:**
```hcl
environment = "prod"
project_id  = "gen-lang-client-0874846742"
region      = "us-central1"
image       = "gcr.io/gen-lang-client-0874846742/effect-ontology-core:latest"
allow_unauthenticated = true
```

## Deployment Workflow

### One-Time Setup

```bash
# 1. Create terraform state bucket (manual, one-time)
gcloud storage buckets create gs://effect-ontology-terraform-state

# 2. Initialize terraform
cd infra
terraform init

# 3. Create infrastructure
terraform apply -var-file=environments/prod.tfvars
```

### Code Deployment

**ops/deploy.sh** (simplified):
```bash
#!/bin/bash
set -e

ENV=${1:-prod}
PROJECT_ID=$(gcloud config get-value project)
IMAGE="gcr.io/$PROJECT_ID/effect-ontology-core:$ENV"

echo "Building and deploying to $ENV..."

# Build and push
docker build --platform linux/amd64 -t $IMAGE -f packages/@core-v2/Dockerfile .
docker push $IMAGE

# Update Cloud Run (Terraform manages the service, we just update the image)
gcloud run services update effect-ontology-core-$ENV \
  --image $IMAGE \
  --region us-central1
```

### Local Development

```bash
# Run with local storage
STORAGE_TYPE=local \
STORAGE_LOCAL_PATH=./output \
ANTHROPIC_API_KEY=sk-ant-... \
bun run packages/@core-v2/src/server.ts

# Or test against dev bucket
STORAGE_TYPE=gcs \
STORAGE_BUCKET=effect-ontology-dev \
ANTHROPIC_API_KEY=sk-ant-... \
bun run packages/@core-v2/src/server.ts
```

## Implementation Tasks

### Phase 1: Pluggable Storage (Code Changes)

1. **Add LocalStorageLive implementation**
   - File: `packages/@core-v2/src/Service/Storage.ts`
   - Use Node.js `fs` via `@effect/platform-node` FileSystem
   - Mirror GCS implementation structure

2. **Extend StorageConfig interface**
   - Add `type: "local" | "gcs" | "memory"`
   - Add `localPath?: string`

3. **Add makeStorageLayer factory function**
   - Runtime layer composition based on config type

4. **Update server.ts**
   - Read STORAGE_TYPE from environment
   - Use makeStorageLayer for layer composition

5. **Test local storage**
   - Run server locally with STORAGE_TYPE=local
   - Verify files written to ./output/

### Phase 2: Terraform Infrastructure

6. **Create infra/ directory structure**
   - main.tf, variables.tf, outputs.tf
   - modules/storage, modules/cloud-run, modules/secrets

7. **Implement storage module**
   - GCS bucket with lifecycle rules
   - IAM for Cloud Run service account

8. **Implement secrets module**
   - Reference existing ANTHROPIC_API_KEY secret

9. **Implement cloud-run module**
   - Service definition with env vars
   - Secret references
   - IAM for public access

10. **Create environment tfvars**
    - dev.tfvars, prod.tfvars

11. **Create terraform state bucket**
    - Manual one-time creation

12. **Test terraform apply**
    - Apply to prod environment
    - Verify resources created

### Phase 3: Deploy Workflow

13. **Simplify ops/deploy.sh**
    - Remove infrastructure concerns
    - Just build, push, update image

14. **Test full workflow**
    - terraform apply (infra)
    - ./ops/deploy.sh prod (code)
    - Verify health endpoints
    - Test extraction

15. **Update documentation**
    - README deployment instructions
    - DEPLOY.md or similar

## Verification

- [ ] Local dev: `STORAGE_TYPE=local bun run server.ts` writes to ./output/
- [ ] Health endpoints return OK
- [ ] Extraction job completes and result stored in GCS
- [ ] Terraform plan shows no drift after apply
- [ ] Deploy script successfully updates running service

## Future Enhancements

- Add staging environment
- Implement per-ontology path prefixing in requests
- Add Cloud Build CI/CD trigger
- Terraform workspaces for environment management
- Firebase Auth integration for multi-tenancy
