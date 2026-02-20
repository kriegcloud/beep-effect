resource "foundry_marking_membership" "example-organization-guest-membership" {
  marking_id = foundry_organization.example-organization.marking_id
  marking_members = ["example-guest-user-id", "example-guest-group-id"]
}