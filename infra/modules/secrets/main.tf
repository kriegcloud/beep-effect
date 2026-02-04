# Reference existing secret (created manually or via gcloud)
data "google_secret_manager_secret" "anthropic_api_key" {
  secret_id = "ANTHROPIC_API_KEY"
}

# Grant access to the secret for the Cloud Run service account
resource "google_secret_manager_secret_iam_member" "cloud_run_access" {
  secret_id = data.google_secret_manager_secret.anthropic_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.cloud_run_sa}"
}

# Reference existing PostgreSQL password secret (created manually via gcloud)
data "google_secret_manager_secret" "postgres_password" {
  count     = var.enable_postgres ? 1 : 0
  secret_id = "POSTGRES_PASSWORD"
}

# Fetch the latest version of the PostgreSQL password
data "google_secret_manager_secret_version" "postgres_password" {
  count   = var.enable_postgres ? 1 : 0
  secret  = data.google_secret_manager_secret.postgres_password[0].id
  version = "latest"
}

# Grant Cloud Run SA access to PostgreSQL password
resource "google_secret_manager_secret_iam_member" "postgres_access" {
  count     = var.enable_postgres ? 1 : 0
  secret_id = data.google_secret_manager_secret.postgres_password[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.cloud_run_sa}"
}
