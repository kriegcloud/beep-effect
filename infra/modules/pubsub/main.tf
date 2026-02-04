# =============================================================================
# Pub/Sub Topics
# =============================================================================

# Events topic - for domain events (curation, extraction)
resource "google_pubsub_topic" "events" {
  name    = "ontology-events-${var.environment}"
  project = var.project_id

  message_retention_duration = var.message_retention_duration

  labels = {
    environment = var.environment
    purpose     = "domain-events"
  }
}

# Jobs topic - for background job processing
resource "google_pubsub_topic" "jobs" {
  name    = "ontology-jobs-${var.environment}"
  project = var.project_id

  message_retention_duration = var.message_retention_duration

  labels = {
    environment = var.environment
    purpose     = "background-jobs"
  }
}

# Dead letter queue topic - for failed job retries
resource "google_pubsub_topic" "jobs_dlq" {
  name    = "ontology-jobs-dlq-${var.environment}"
  project = var.project_id

  message_retention_duration = var.message_retention_duration

  labels = {
    environment = var.environment
    purpose     = "dead-letter-queue"
  }
}

# =============================================================================
# Pub/Sub Subscriptions
# =============================================================================

# Push subscription for jobs - sends to Cloud Run (only created when cloud_run_url is provided)
resource "google_pubsub_subscription" "jobs_push" {
  count   = var.cloud_run_url != null ? 1 : 0
  name    = "ontology-jobs-push-${var.environment}"
  topic   = google_pubsub_topic.jobs.id
  project = var.project_id

  ack_deadline_seconds       = var.ack_deadline_seconds
  message_retention_duration = var.message_retention_duration

  # Push configuration - sends to Cloud Run endpoint
  push_config {
    push_endpoint = "${var.cloud_run_url}${var.push_endpoint_path}"

    # OIDC authentication for Cloud Run
    oidc_token {
      service_account_email = var.cloud_run_sa
    }

    # Retry policy attributes
    attributes = {
      "x-goog-version" = "v1"
    }
  }

  # Dead letter policy
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.jobs_dlq.id
    max_delivery_attempts = var.max_delivery_attempts
  }

  # Retry policy
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"  # 10 minutes max
  }

  # Expiration policy (never expire)
  expiration_policy {
    ttl = ""  # Empty string means never expire
  }

  labels = {
    environment = var.environment
    type        = "push"
  }
}

# Pull subscription for DLQ - for manual inspection
resource "google_pubsub_subscription" "dlq_pull" {
  name    = "ontology-jobs-dlq-pull-${var.environment}"
  topic   = google_pubsub_topic.jobs_dlq.id
  project = var.project_id

  ack_deadline_seconds       = 600
  message_retention_duration = "604800s"  # 7 days

  labels = {
    environment = var.environment
    type        = "pull"
    purpose     = "dead-letter-inspection"
  }
}

# Pull subscription for events - for EventBroadcastHub WebSocket streaming
resource "google_pubsub_subscription" "events_broadcast" {
  name    = "ontology-events-broadcast-${var.environment}"
  topic   = google_pubsub_topic.events.id
  project = var.project_id

  ack_deadline_seconds       = 30  # Short ack deadline for real-time events
  message_retention_duration = "3600s"  # 1 hour retention for events

  # Enable message ordering for consistent event delivery
  enable_message_ordering = true

  # Retry policy for transient failures
  retry_policy {
    minimum_backoff = "1s"
    maximum_backoff = "60s"
  }

  # Expiration policy (never expire)
  expiration_policy {
    ttl = ""
  }

  labels = {
    environment = var.environment
    type        = "pull"
    purpose     = "websocket-broadcast"
  }
}

# =============================================================================
# IAM Bindings
# =============================================================================

# Allow Cloud Run SA to publish to events topic
resource "google_pubsub_topic_iam_member" "events_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.events.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${var.cloud_run_sa}"
}

# Allow Cloud Run SA to publish to jobs topic
resource "google_pubsub_topic_iam_member" "jobs_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.jobs.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${var.cloud_run_sa}"
}

# Allow Cloud Run SA to publish to DLQ topic
resource "google_pubsub_topic_iam_member" "dlq_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.jobs_dlq.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${var.cloud_run_sa}"
}

# Allow Cloud Run SA to subscribe to events broadcast subscription
resource "google_pubsub_subscription_iam_member" "events_broadcast_subscriber" {
  project      = var.project_id
  subscription = google_pubsub_subscription.events_broadcast.name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:${var.cloud_run_sa}"
}

# Allow Pub/Sub to invoke Cloud Run for push subscription (only when push subscription exists)
resource "google_cloud_run_service_iam_member" "pubsub_invoker" {
  count    = var.cloud_run_url != null ? 1 : 0
  project  = var.project_id
  location = "us-central1"  # TODO: make configurable
  service  = split("/", var.cloud_run_url)[2]  # Extract service name from URL
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.cloud_run_sa}"
}

# Allow Pub/Sub to manage DLQ for dead letter forwarding (only when push subscription exists)
resource "google_pubsub_subscription_iam_member" "jobs_push_dlq_forwarder" {
  count        = var.cloud_run_url != null ? 1 : 0
  project      = var.project_id
  subscription = google_pubsub_subscription.jobs_push[0].name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}

# Get project details for service account reference
data "google_project" "project" {
  project_id = var.project_id
}
