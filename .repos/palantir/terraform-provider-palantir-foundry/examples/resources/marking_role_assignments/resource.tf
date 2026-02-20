resource "foundry_marking_role_assignments" "example-marking-role-assignments" {
  marking_id = foundry_marking.example-marking.id
  marking_role_assignments = [
    {
      role = "ADMINISTER"
      principal_id = "example-user-id"
    },
    {
      role = "DECLASSIFY"
      principal_id = "example-user-id"
    },
    {
      role = "USE"
      principal_id = "example-group-id"
    }
  ]
}