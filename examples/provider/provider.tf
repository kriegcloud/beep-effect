terraform {
  required_providers {
    foundry = {
      source = "palantir/palantir-foundry"
      version = "your-specified-version-here"
    }
  }
}

provider "foundry" {
    client_id = "your-client-id-here"                 # may be specified with CLIENT_ID environment variable
    client_secret = "your-client-secret-here"         # may be specified with CLIENT_SECRET environment variable
    host = "https://example.palantirfoundry.com/"     # may be specified with BASE_HOSTNAME environment variable or omitted entirely when running as a Foundry build inside the targeted enrollment
}