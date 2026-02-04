output "events_topic_id" {
  description = "Events topic ID"
  value       = google_pubsub_topic.events.id
}

output "events_topic_name" {
  description = "Events topic name"
  value       = google_pubsub_topic.events.name
}

output "jobs_topic_id" {
  description = "Jobs topic ID"
  value       = google_pubsub_topic.jobs.id
}

output "jobs_topic_name" {
  description = "Jobs topic name"
  value       = google_pubsub_topic.jobs.name
}

output "jobs_dlq_topic_id" {
  description = "Jobs DLQ topic ID"
  value       = google_pubsub_topic.jobs_dlq.id
}

output "jobs_dlq_topic_name" {
  description = "Jobs DLQ topic name"
  value       = google_pubsub_topic.jobs_dlq.name
}

output "jobs_push_subscription_id" {
  description = "Jobs push subscription ID (null if not created)"
  value       = length(google_pubsub_subscription.jobs_push) > 0 ? google_pubsub_subscription.jobs_push[0].id : null
}

output "jobs_push_subscription_name" {
  description = "Jobs push subscription name (null if not created)"
  value       = length(google_pubsub_subscription.jobs_push) > 0 ? google_pubsub_subscription.jobs_push[0].name : null
}

output "dlq_pull_subscription_id" {
  description = "DLQ pull subscription ID"
  value       = google_pubsub_subscription.dlq_pull.id
}

output "dlq_pull_subscription_name" {
  description = "DLQ pull subscription name"
  value       = google_pubsub_subscription.dlq_pull.name
}

output "events_broadcast_subscription_id" {
  description = "Events broadcast subscription ID"
  value       = google_pubsub_subscription.events_broadcast.id
}

output "events_broadcast_subscription_name" {
  description = "Events broadcast subscription name"
  value       = google_pubsub_subscription.events_broadcast.name
}
