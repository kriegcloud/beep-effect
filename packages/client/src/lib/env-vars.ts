export const envVars = {
  API_URL: new URL(import.meta.env.VITE_API_URL || "http://localhost:3001"),
};
