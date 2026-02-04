environment = "prod"
project_id  = "gen-lang-client-0874846742"
region      = "us-central1"
image       = "gcr.io/gen-lang-client-0874846742/effect-ontology-core:latest"
allow_unauthenticated = true

# Enable PostgreSQL for durable workflows and claim persistence
enable_postgres = true

# Keep 1 instance warm for SSE streaming (avoids cold starts)
min_instance_count = 1

# Enable Pub/Sub for real-time event streaming
enable_pubsub = true

# Enable monitoring with alert policies
enable_monitoring = true
