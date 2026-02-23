// Neon PostgreSQL: project, database, roles, and connection string outputs.
//
// Creating a neon.Project auto-creates:
//   - Default branch (accessible via project.defaultBranchId)
//   - Default endpoint (accessible via project.defaultEndpointId)
//   - Default database (accessible via project.databaseName)
//   - Default role (accessible via project.databaseUser / project.databasePassword)
//
// Computed outputs include full connection URIs with credentials:
//   - project.connectionUri       → direct connection (for migrations)
//   - project.connectionUriPooler → pooled connection (for app runtime)
//
// No separate Branch/Database/Endpoint/Role resources needed for the default setup.

const isPrPreview = $app.stage.startsWith("pr-");

// Free tier: 1 project, 0.5GB storage. PR stages skip Neon entirely.
const neonProject = !isPrPreview
  ? new neon.Project("NeonProject", {
      name: `beep-${$app.stage}`,
      pgVersion: 17,
      regionId: "aws-us-east-1",
      // Free tier max is 21600s (6h). Provider defaults to 86400s (24h) which exceeds limit.
      historyRetentionSeconds: 21600,
      branch: {
        name: "main",
        databaseName: "beep_auth",
        roleName: "beep_user",
      },
    })
  : undefined;

// sst.Linkable exposes properties via Resource.NeonDb.xxx in app runtime code.
const db = neonProject
  ? new sst.Linkable("NeonDb", {
      properties: {
        url: neonProject.connectionUriPooler,
        urlUnpooled: neonProject.connectionUri,
        host: neonProject.databaseHost,
        hostPooler: neonProject.databaseHostPooler,
        name: neonProject.databaseName,
        user: neonProject.databaseUser,
        password: neonProject.databasePassword,
      },
    })
  : undefined;

// --- Exports (for use in infra/web.ts) ---
export const connectionUri = neonProject?.connectionUri;
export const connectionUriPooler = neonProject?.connectionUriPooler;
export const projectId = neonProject?.id;
export const neonDb = db;
