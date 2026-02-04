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

variable "cloud_run_url" {
  description = "Cloud Run service URL for push subscription (optional - push subscription created only if provided)"
  type        = string
  default     = null
}

variable "push_endpoint_path" {
  description = "Path for push subscription endpoint"
  type        = string
  default     = "/v1/jobs/process"
}

variable "max_delivery_attempts" {
  description = "Maximum delivery attempts before sending to DLQ"
  type        = number
  default     = 5
}

variable "ack_deadline_seconds" {
  description = "Acknowledgement deadline in seconds"
  type        = number
  default     = 600  # 10 minutes for long-running jobs
}

variable "message_retention_duration" {
  description = "Message retention duration (e.g., 7 days = 604800s)"
  type        = string
  default     = "604800s"
}
