resource "foundry_project_resource_roles" "example-project-resource-roles" {
  project_rid = foundry_project.example-project.id
  project_resource_roles = [
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