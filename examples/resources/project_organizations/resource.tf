resource "foundry_project_organizations" "example-project-organizations" {
  project_rid = foundry_project.example-project.id
  project_organizations = ["example-organization-rid"]
}