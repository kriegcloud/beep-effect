// Vercel project and environment variable wiring.
//
// Creates the Vercel project (Git-connected to GitHub) and sets all
// environment variables from 1Password secrets, Railway outputs, and
// Neon computed connection strings.
//
// The IaC provisions the project config — actual app deployments are
// triggered by Git pushes (Vercel's default).

import { connectionUri, connectionUriPooler } from "./database";
import { proxyUrl } from "./railway";
import { allowedEmails, betterAuthSecret, betterAuthUrl, graphitiApiKey, openaiApiKey, resendApiKey } from "./secrets";

const isProduction = $app.stage === "production";

// --- Vercel Project ---
// gitRepository links to GitHub for auto-deployments on push.
// Requires the Vercel GitHub integration to be installed on the repo.
const project = new vercel.Project("VercelProject", {
  name: `beep-${$app.stage}`,
  framework: "nextjs",
  buildCommand: "bun run build",
  installCommand: "bun install",
  rootDirectory: "apps/web",
  gitRepository: {
    type: "github",
    repo: "kriegcloud/beep-effect",
    productionBranch: "main",
  },
});

// --- Environment Variables ---
// Vercel does not allow sensitive env vars to target "development" (local `vercel dev`).
// Sensitive vars: production | preview only.
// Non-sensitive vars: production | preview + development.
const sensitiveTargets = isProduction ? ["production"] : ["preview"];
const publicTargets = isProduction ? ["production"] : ["preview", "development"];

// Secrets are plain strings (from 1Password via process.env).
// Neon outputs are Output<string> | undefined (undefined for PR preview stages).
// Both work as Pulumi Input<string>.
const envVars: Array<{ key: string; value: any; sensitive: boolean }> = [
  // Auth (from 1Password)
  { key: "BETTER_AUTH_SECRET", value: betterAuthSecret, sensitive: true },
  { key: "BETTER_AUTH_URL", value: betterAuthUrl, sensitive: true },
  { key: "ALLOWED_EMAILS", value: allowedEmails, sensitive: false },

  // Graph API (proxyUrl is a string constant from railway.ts;
  // graphitiApiKey is a plain string from 1Password)
  { key: "GRAPHITI_API_URL", value: proxyUrl, sensitive: true },
  { key: "GRAPHITI_API_KEY", value: graphitiApiKey, sensitive: true },

  // AI (from 1Password — mapped from AI_OPENAI_API_KEY to OPENAI_API_KEY)
  { key: "OPENAI_API_KEY", value: openaiApiKey, sensitive: true },

  // Database (from Neon computed outputs — Output<string>, includes credentials)
  ...(connectionUriPooler ? [{ key: "DATABASE_URL", value: connectionUriPooler, sensitive: true }] : []),
  ...(connectionUri
    ? [
        {
          key: "DATABASE_URL_UNPOOLED",
          value: connectionUri,
          sensitive: true,
        },
      ]
    : []),

  // Email (from 1Password)
  { key: "RESEND_API_KEY", value: resendApiKey, sensitive: true },
];

for (const env of envVars) {
  new vercel.ProjectEnvironmentVariable(`VercelEnv-${env.key}`, {
    projectId: project.id,
    key: env.key,
    value: env.value,
    targets: env.sensitive ? sensitiveTargets : publicTargets,
    sensitive: env.sensitive,
  });
}

// OPENAI_MODEL (non-sensitive, static default)
new vercel.ProjectEnvironmentVariable("VercelEnv-OPENAI_MODEL", {
  projectId: project.id,
  key: "OPENAI_MODEL",
  value: "gpt-4o-mini",
  targets: publicTargets,
  sensitive: false,
});

// --- Exports ---
export const vercelProjectId = project.id;
export const vercelProjectUrl = $interpolate`https://beep-${$app.stage}.vercel.app`;
