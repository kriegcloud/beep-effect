resource "foundry_organization_role_assignments" "example-organization-role-assignments" {
  organization_rid = foundry_organization.example-organization.id
  organization_roles = [
    {
      "role_id" : "organization:example-role",
      "principal_id" : "example-user-id",
    },
    {
      "role_id" : "organization:example-role",
      "principal_id" : "example-group-id",
    },
  ]
}