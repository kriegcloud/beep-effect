resource "foundry_group_membership" "example-group-membership" {
  group_id = foundry_group.example-group.id
  group_members = ["example-group-id"]
}