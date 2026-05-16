# Agent Notes

- Keep the app UI on `@beep/ui` primitives and `@beep/ui/styles/globals.css`.
- Keep installer dry-run composition in TypeScript until later phases introduce live adapters.
- Keep the Tauri bridge narrow: app health and explicit capabilities only.
- Do not add live install commands, Discord mutation, or plaintext-secret handling in this package.
