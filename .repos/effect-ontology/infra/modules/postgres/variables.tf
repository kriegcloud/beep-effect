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

variable "postgres_password_secret_id" {
  description = "Secret Manager secret ID containing PostgreSQL password"
  type        = string
}

variable "postgres_password" {
  description = "PostgreSQL password (sensitive)"
  type        = string
  sensitive   = true
}

variable "service_account_email" {
  description = "Service account email for the Compute Engine instance"
  type        = string
}
