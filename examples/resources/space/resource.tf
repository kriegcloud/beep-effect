resource "foundry_space" "example-space" {
  display_name  = "Example space name"
  enrollment_rid = "ri.control-panel.main.customer.example-enrollment-rid"
  description   = "This is an example space"
  organizations = ["ri.multipass..organization.example-org-rid"]
  deletion_policy_organizations = ["ri.multipass..organization.example-org-rid"]
  usage_account_rid             = "ri.resource-policy-manager.global.usage-account.example-usage-account-rid"
  filesystem_id                 = "ri.foundry.main.filesystem.example-filesystem-rid"
  default_role_set_id           = "example-role-set-id"
}