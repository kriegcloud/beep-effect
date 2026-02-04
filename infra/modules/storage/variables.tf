variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "cloud_run_sa" {
  description = "Service Account email for Cloud Run service"
  type        = string
}
