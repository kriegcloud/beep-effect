resource "foundry_group" "example-group" {
  name        = "Example group name"
  description = "An example group in Foundry"
  organizations = ["example-organization-rid"]
}