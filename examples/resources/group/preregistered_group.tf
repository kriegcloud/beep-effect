resource "foundry_group" "example-preregistered-group" {
  name                        = "Example preregistered group"
  organizations               = ["example-organization-rid"]
  enrollment_rid              = "ri.control-panel.main.customer.0000000-0000-0000-0000-000000000000"
  authentication_provider_rid = "ri.control-panel.main.saml.0000000-0000-0000-0000-000000000000"
}
