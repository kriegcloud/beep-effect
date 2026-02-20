resource "foundry_organization" "example-organization" {
  name         = "Example Organization name"
  description  = "An example Organization in Foundry"
  host_name = "example.palantirfoundry.com"
  initial_administrators = ["example-user-id", "example-group-id"]
}