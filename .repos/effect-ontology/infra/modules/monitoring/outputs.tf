output "uptime_check_id" {
  description = "Uptime check ID"
  value       = google_monitoring_uptime_check_config.health.uptime_check_id
}

output "alert_policy_uptime_id" {
  description = "Uptime failure alert policy ID"
  value       = google_monitoring_alert_policy.uptime_failure.name
}

output "alert_policy_error_rate_id" {
  description = "Error rate alert policy ID"
  value       = google_monitoring_alert_policy.error_rate.name
}

output "alert_policy_latency_id" {
  description = "High latency alert policy ID"
  value       = google_monitoring_alert_policy.high_latency.name
}

output "extraction_errors_metric" {
  description = "Log-based metric for extraction errors"
  value       = google_logging_metric.extraction_errors.name
}

output "llm_tokens_metric" {
  description = "Log-based metric for LLM token usage"
  value       = google_logging_metric.llm_tokens.name
}
