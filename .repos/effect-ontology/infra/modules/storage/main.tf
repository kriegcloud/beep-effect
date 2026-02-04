resource "google_storage_bucket" "main" {
  name          = "effect-ontology-${var.environment}"
  location      = "US"
  force_destroy = var.environment == "dev"

  lifecycle_rule {
    condition {
      age = var.environment == "dev" ? 7 : 30
    }
    action {
      type = "Delete"
    }
  }

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_member" "cloud_run_access" {
  bucket = google_storage_bucket.main.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.cloud_run_sa}"
}
