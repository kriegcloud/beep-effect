# src-tauri Placeholder

This directory is intentionally a placeholder in the first scaffold pass.

The next implementation step is to add the real Tauri wrapper that:

- launches the packaged Bun sidecar as an external binary
- reads the sidecar bootstrap JSON line from stdout
- health-checks `GET /api/v0/health`
- stops the sidecar on app shutdown

Until that lands, the desktop app remains a thin Vite shell that reserves the final application slot without pulling business logic into the frontend.
