variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "cloud_run_sa" {
  description = "Service Account email for Cloud Run service"
  type        = string
}

variable "enable_postgres" {
  description = "Enable PostgreSQL password secret management"
  type        = bool
  default     = false
}
