resource "foundry_marking_membership" "example-marking-membership" {
  marking_id = foundry_marking.example-marking.id
  marking_members = ["example-user-id", "example-group-id"]
}