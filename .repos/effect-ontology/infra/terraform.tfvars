# Effect Ontology Cloud Deployment
# Generated for Cloud Run deployment

project_id  = "gen-lang-client-0874846742"
environment = "dev"
region      = "us-central1"

# Docker image (will be built and pushed)
image = "gcr.io/gen-lang-client-0874846742/effect-ontology-core:latest"

# Allow public access for testing
allow_unauthenticated = true

# Enable PostgreSQL for workflow persistence
enable_postgres = true
