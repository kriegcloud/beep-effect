variable "project_id" {
  type = string
}

variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "image" {
  type = string
}

variable "storage_bucket" {
  type = string
}

variable "anthropic_secret_id" {
  type = string
}

variable "cloud_run_sa" {
  type = string
}

variable "allow_unauthenticated" {
  type    = bool
  default = false
}

variable "ontology_path" {
  type        = string
  description = "Path to ontology file in GCS bucket (relative to STORAGE_BUCKET)"
  default     = "canonical/seattle/ontology.ttl"
}

variable "external_vocabs_path" {
  type        = string
  description = "Path to merged external vocabularies in GCS bucket"
  default     = "canonical/external/merged.ttl"
}

variable "registry_path" {
  type        = string
  description = "Path to ontology registry manifest (registry.json) in GCS bucket"
  default     = "registry.json"
}

# PostgreSQL configuration for @effect/workflow persistence
variable "enable_postgres" {
  type        = bool
  description = "Enable PostgreSQL environment variables for workflow persistence"
  default     = false
}

variable "vpc_connector_id" {
  type        = string
  description = "VPC Connector ID for Cloud Run to access private network"
  default     = null
}

variable "postgres_host" {
  type        = string
  description = "PostgreSQL host IP address"
  default     = null
}

variable "postgres_password_secret_id" {
  type        = string
  description = "Secret Manager secret ID for PostgreSQL password"
  default     = null
}

variable "min_instance_count" {
  type        = number
  description = "Minimum number of Cloud Run instances. Set to 1 for SSE streaming to avoid cold starts."
  default     = 0
}

variable "request_timeout" {
  type        = string
  description = "Maximum request timeout. SSE streaming requires 3600s for long-running batches."
  default     = "3600s"
}

# Pub/Sub configuration for EventBusService
variable "enable_pubsub" {
  type        = bool
  description = "Enable Pub/Sub environment variables for event distribution"
  default     = false
}

variable "pubsub_events_topic" {
  type        = string
  description = "Pub/Sub events topic name"
  default     = null
}

variable "pubsub_jobs_topic" {
  type        = string
  description = "Pub/Sub jobs topic name"
  default     = null
}

variable "pubsub_jobs_subscription" {
  type        = string
  description = "Pub/Sub jobs push subscription name"
  default     = null
}

variable "pubsub_dlq_topic" {
  type        = string
  description = "Pub/Sub dead letter queue topic name"
  default     = null
}

variable "pubsub_events_subscription" {
  type        = string
  description = "Pub/Sub events subscription name for WebSocket broadcast"
  default     = null
}
