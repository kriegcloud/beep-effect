# Cloud Monitoring for Effect Ontology
#
# Provides observability for production deployment:
# - Uptime checks for health endpoint
# - Alert policies for error rate and latency
# - Log-based metrics for structured error tracking

# -----------------------------------------------------------------------------
# Notification Channel (Email)
# -----------------------------------------------------------------------------

resource "google_monitoring_notification_channel" "email" {
  count        = var.notification_email != "" ? 1 : 0
  display_name = "Effect Ontology Alerts - ${var.environment}"
  type         = "email"

  labels = {
    email_address = var.notification_email
  }
}

# -----------------------------------------------------------------------------
# Uptime Check: Health Endpoint
# -----------------------------------------------------------------------------

resource "google_monitoring_uptime_check_config" "health" {
  display_name = "effect-ontology-health-${var.environment}"
  timeout      = "10s"
  period       = "60s" # Check every 60 seconds

  http_check {
    path           = "/health/live"
    port           = 443
    use_ssl        = true
    validate_ssl   = true
    request_method = "GET"

    accepted_response_status_codes {
      status_class = "STATUS_CLASS_2XX"
    }
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = replace(var.cloud_run_service_url, "https://", "")
    }
  }

  checker_type = "STATIC_IP_CHECKERS"
}

# -----------------------------------------------------------------------------
# Alert Policy: Uptime Check Failure
# -----------------------------------------------------------------------------

resource "google_monitoring_alert_policy" "uptime_failure" {
  display_name = "Effect Ontology Uptime Failure - ${var.environment}"
  combiner     = "OR"

  conditions {
    display_name = "Uptime check failing"

    condition_threshold {
      filter          = "resource.type = \"uptime_url\" AND metric.type = \"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id = \"${google_monitoring_uptime_check_config.health.uptime_check_id}\""
      duration        = "300s" # 5 minutes of failure
      comparison      = "COMPARISON_LT"
      threshold_value = 1

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_NEXT_OLDER"
      }
    }
  }

  notification_channels = var.notification_email != "" ? [google_monitoring_notification_channel.email[0].id] : []

  alert_strategy {
    auto_close = "604800s" # 7 days
  }

  documentation {
    content   = "The health endpoint for Effect Ontology (${var.environment}) has been failing for 5+ minutes. Check Cloud Run logs for errors."
    mime_type = "text/markdown"
  }
}

# -----------------------------------------------------------------------------
# Alert Policy: High Error Rate (>5%)
# -----------------------------------------------------------------------------

resource "google_monitoring_alert_policy" "error_rate" {
  display_name = "Effect Ontology High Error Rate - ${var.environment}"
  combiner     = "OR"

  conditions {
    display_name = "Error rate > 5%"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.cloud_run_service_name}\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
      }

      denominator_filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.cloud_run_service_name}\" AND metric.type = \"run.googleapis.com/request_count\""

      denominator_aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
      }
    }
  }

  notification_channels = var.notification_email != "" ? [google_monitoring_notification_channel.email[0].id] : []

  alert_strategy {
    auto_close = "604800s"
  }

  documentation {
    content   = "Effect Ontology (${var.environment}) error rate exceeded 5% for 5+ minutes. Check application logs for error patterns."
    mime_type = "text/markdown"
  }
}

# -----------------------------------------------------------------------------
# Alert Policy: High Latency (P95 > 5s)
# -----------------------------------------------------------------------------

resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "Effect Ontology High Latency - ${var.environment}"
  combiner     = "OR"

  conditions {
    display_name = "P95 latency > 5s"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.cloud_run_service_name}\" AND metric.type = \"run.googleapis.com/request_latencies\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5000 # 5 seconds in ms

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_PERCENTILE_95"
        cross_series_reducer = "REDUCE_MAX"
      }
    }
  }

  notification_channels = var.notification_email != "" ? [google_monitoring_notification_channel.email[0].id] : []

  alert_strategy {
    auto_close = "604800s"
  }

  documentation {
    content   = "Effect Ontology (${var.environment}) P95 latency exceeded 5 seconds for 5+ minutes. Check for LLM rate limiting, large document processing, or resource constraints."
    mime_type = "text/markdown"
  }
}

# -----------------------------------------------------------------------------
# Log-based Metric: Extraction Errors
# -----------------------------------------------------------------------------

resource "google_logging_metric" "extraction_errors" {
  name   = "effect-ontology/extraction-errors-${var.environment}"
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\" AND severity>=ERROR AND jsonPayload.error=~\".*extraction.*\""

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"

    labels {
      key         = "error_type"
      value_type  = "STRING"
      description = "Type of extraction error"
    }
  }

  label_extractors = {
    "error_type" = "REGEXP_EXTRACT(jsonPayload.error, \"([A-Za-z]+Error)\")"
  }
}

# -----------------------------------------------------------------------------
# Log-based Metric: LLM Token Usage
# -----------------------------------------------------------------------------

resource "google_logging_metric" "llm_tokens" {
  name   = "effect-ontology/llm-tokens-${var.environment}"
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\" AND jsonPayload.tokens_used>0"

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "DISTRIBUTION"
    unit        = "1"
  }

  value_extractor = "EXTRACT(jsonPayload.tokens_used)"

  bucket_options {
    exponential_buckets {
      num_finite_buckets = 64
      growth_factor      = 2
      scale              = 1
    }
  }
}
