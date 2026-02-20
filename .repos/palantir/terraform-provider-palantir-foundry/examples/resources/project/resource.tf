resource "foundry_project" "example-project" {
  display_name = "Example Project name"
  space_rid    = "ri.compass.main.folder.example-space-rid"
  initial_organizations = ["example-organization-rid"]
  initial_resource_roles = [
    {
      resource_role_principal = {
        principal_id = "example-group-id"
        principal_type = "GROUP"
        type = "principalWithId"
      }
      role_id: "example-project-role-id"
    },
    {
      resource_role_principal = {
        principal_id = "example-user-id"
        principal_type = "USER"
        type = "principalWithId"
      }
      role_id: "example-project-role-id"
    },
    {
      resource_role_principal = {
        type = "everyone"
      }
      role_id: "example-project-role-id"
    }]
}