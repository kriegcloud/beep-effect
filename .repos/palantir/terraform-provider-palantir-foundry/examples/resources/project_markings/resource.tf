resource "foundry_project_markings" "example-project-markings" {
  project_rid = foundry_project.example-project.id
  project_markings = ["example-marking-id"]
}