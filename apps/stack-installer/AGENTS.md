# Agent Notes

- Keep the app UI on `@beep/ui` primitives and `@beep/ui/styles/globals.css`.
- Keep app-local runtime composition in TypeScript; live dependency mutation must stay owned by installer slice contracts and drivers, not ad hoc app shell glue.
- Keep the Tauri bridge narrow: app health and explicit capabilities only.
- Do not add Discord mutation, plaintext-secret handling, or product logic that belongs in installer slice packages.
