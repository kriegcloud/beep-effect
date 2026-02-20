resource "foundry_marking" "example-marking" {
  name = "Example Marking name"
  description = "Example Marking description"
  category_id="example-marking-category-id"
  initial_role_assignments = [
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