output "postgres_internal_ip" {
  description = "Internal IP address of the PostgreSQL instance"
  value       = google_compute_address.postgres_internal.address
}

output "postgres_connection_string" {
  description = "PostgreSQL connection string (without password)"
  value       = "postgres://workflow@${google_compute_address.postgres_internal.address}:5432/workflow"
  sensitive   = true
}

output "vpc_connector_name" {
  description = "VPC connector name for Cloud Run"
  value       = google_vpc_access_connector.workflow_connector.name
}

output "vpc_connector_id" {
  description = "VPC connector ID for Cloud Run"
  value       = google_vpc_access_connector.workflow_connector.id
}

output "network_name" {
  description = "VPC network name"
  value       = google_compute_network.workflow_vpc.name
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.workflow_subnet.name
}

output "backup_policy_name" {
  description = "Snapshot backup policy name"
  value       = google_compute_resource_policy.postgres_backup.name
}

output "backup_schedule" {
  description = "Backup schedule description"
  value       = "Daily at 03:00 UTC, 7-day retention"
}
