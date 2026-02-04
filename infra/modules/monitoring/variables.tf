variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "cloud_run_service_name" {
  description = "Cloud Run service name to monitor"
  type        = string
}

variable "cloud_run_service_url" {
  description = "Cloud Run service URL for uptime checks"
  type        = string
}

variable "notification_email" {
  description = "Email address for alert notifications"
  type        = string
  default     = ""
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}
