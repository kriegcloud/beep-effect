resource "foundry_enrollment" "example-enrollment" {
  enrollment_roles = [
    {
      "role_id" : "enrollment:example-role",
      "principal_id" : "example-user-id",
    },
    {
      "role_id" : "enrollment:example-role",
      "principal_id" : "example-group-id",
    },
  ]
}