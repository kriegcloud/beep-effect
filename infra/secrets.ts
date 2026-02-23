// Environment variable reads with validation.
// Secrets are sourced from 1Password via `op run --env-file=.env -- <command>`.
//
// This module is the single source of truth for all secret reads.
// Other infra modules (railway.ts, database.ts, web.ts) import from here.
// No process.env reads outside this file.
//
// Vault: beep-dev-secrets
//   beep-app-core → AUTH_SECRET, BETTER_AUTH_URL, APP_ADMINS_EMAILS
//   beep-data     → FALKORDB_PASSWORD, GRAPHITI_API_KEY
//   beep-ai       → AI_OPENAI_API_KEY
//   beep-email    → EMAIL_RESEND_API_KEY
//   beep-build    → RAILWAY_TOKEN, NEON_API_KEY, VERCEL_API_TOKEN (read by providers)

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Run: op run --env-file=.env -- bunx sst deploy --stage <stage>`
    );
  }
  return value;
}

// --- Auth ---
export const betterAuthSecret = requireEnv("BETTER_AUTH_SECRET");
export const betterAuthUrl = requireEnv("BETTER_AUTH_URL");
export const allowedEmails = requireEnv("ALLOWED_EMAILS");

// --- Railway / Graph ---
export const falkordbPassword = requireEnv("FALKORDB_PASSWORD");
export const graphitiApiKey = requireEnv("GRAPHITI_API_KEY");
export const openaiApiKey = requireEnv("AI_OPENAI_API_KEY");

// --- Email ---
export const resendApiKey = requireEnv("RESEND_API_KEY");
