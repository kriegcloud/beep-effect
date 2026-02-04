environment = "dev"
project_id  = "gen-lang-client-0874846742"
region      = "us-central1"
image       = "gcr.io/gen-lang-client-0874846742/effect-ontology-core:dev"
allow_unauthenticated = true

# Enable PostgreSQL for @effect/workflow durable persistence
enable_postgres = true

# Enable Pub/Sub for real-time event streaming
enable_pubsub = true
