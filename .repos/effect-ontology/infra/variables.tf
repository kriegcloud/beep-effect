variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "image" {
  description = "Docker image to deploy"
  type        = string
}

variable "allow_unauthenticated" {
  description = "Allow public access to Cloud Run service"
  type        = bool
  default     = false
}

variable "enable_postgres" {
  description = "Enable PostgreSQL for workflow persistence"
  type        = bool
  default     = false
}

variable "enable_monitoring" {
  description = "Enable Cloud Monitoring with uptime checks and alert policies"
  type        = bool
  default     = true
}

variable "notification_email" {
  description = "Email address for alert notifications (optional)"
  type        = string
  default     = ""
}

variable "min_instance_count" {
  description = "Minimum Cloud Run instances. Set to 1 for production SSE to avoid cold starts."
  type        = number
  default     = 0
}

variable "enable_pubsub" {
  description = "Enable Cloud Pub/Sub for event distribution and background jobs"
  type        = bool
  default     = false
}
