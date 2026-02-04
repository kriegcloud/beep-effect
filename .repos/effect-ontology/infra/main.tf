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

# We'll use the default compute service account for Cloud Run for simplicity
# In a real production setup, we should create a dedicated SA
data "google_compute_default_service_account" "default" {
}

module "storage" {
  source       = "./modules/storage"
  environment  = var.environment
  project_id   = var.project_id
  cloud_run_sa = data.google_compute_default_service_account.default.email
}

module "secrets" {
  source          = "./modules/secrets"
  project_id      = var.project_id
  cloud_run_sa    = data.google_compute_default_service_account.default.email
  enable_postgres = var.enable_postgres
}

# PostgreSQL on free-tier Compute Engine for workflow persistence
module "postgres" {
  count  = var.enable_postgres ? 1 : 0
  source = "./modules/postgres"

  project_id                  = var.project_id
  region                      = var.region
  environment                 = var.environment
  postgres_password_secret_id = module.secrets.postgres_password_secret_id
  postgres_password           = module.secrets.postgres_password
  service_account_email       = data.google_compute_default_service_account.default.email
}

module "cloud_run" {
  source                = "./modules/cloud-run"
  environment           = var.environment
  project_id            = var.project_id
  region                = var.region
  image                 = var.image
  storage_bucket        = module.storage.bucket_name
  anthropic_secret_id   = module.secrets.anthropic_secret_id
  cloud_run_sa          = data.google_compute_default_service_account.default.email
  allow_unauthenticated = var.allow_unauthenticated

  # Ontology configuration - use Seattle ontology from GCS with registry
  ontology_path         = "canonical/seattle/ontology.ttl"
  external_vocabs_path  = "canonical/external/merged.ttl"
  registry_path         = "registry.json"

  # PostgreSQL configuration (when enabled)
  enable_postgres             = var.enable_postgres
  vpc_connector_id            = var.enable_postgres ? module.postgres[0].vpc_connector_id : null
  postgres_host               = var.enable_postgres ? module.postgres[0].postgres_internal_ip : null
  postgres_password_secret_id = var.enable_postgres ? module.secrets.postgres_password_secret_id : null

  # SSE streaming configuration - min instances avoids cold starts for streaming
  min_instance_count = var.min_instance_count

  # Pub/Sub configuration (when enabled)
  enable_pubsub              = var.enable_pubsub
  pubsub_events_topic        = var.enable_pubsub ? module.pubsub[0].events_topic_name : null
  pubsub_events_subscription = var.enable_pubsub ? module.pubsub[0].events_broadcast_subscription_name : null
  pubsub_jobs_topic          = var.enable_pubsub ? module.pubsub[0].jobs_topic_name : null
  pubsub_jobs_subscription   = var.enable_pubsub ? module.pubsub[0].jobs_push_subscription_name : null
  pubsub_dlq_topic           = var.enable_pubsub ? module.pubsub[0].jobs_dlq_topic_name : null
}

# Cloud Monitoring for production observability
module "monitoring" {
  count  = var.enable_monitoring ? 1 : 0
  source = "./modules/monitoring"

  project_id             = var.project_id
  environment            = var.environment
  region                 = var.region
  cloud_run_service_name = module.cloud_run.service_name
  cloud_run_service_url  = module.cloud_run.service_url
  notification_email     = var.notification_email
}

# Cloud Pub/Sub for event distribution and background jobs
# Note: cloud_run_url is null initially to avoid circular dependency.
# Run terraform apply twice or add it after initial deploy to enable push subscription.
module "pubsub" {
  count  = var.enable_pubsub ? 1 : 0
  source = "./modules/pubsub"

  project_id    = var.project_id
  environment   = var.environment
  cloud_run_sa  = data.google_compute_default_service_account.default.email
  # cloud_run_url = module.cloud_run.service_url  # Uncomment after initial deploy
}
