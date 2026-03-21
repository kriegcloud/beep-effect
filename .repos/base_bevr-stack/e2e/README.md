# E2E Tests

End-to-end tests using Playwright.

## Running Tests

### Local (Quick)

```bash
bun run test:e2e
```

This runs tests directly on your machine. Note that visual regression tests may
fail locally on macOS since snapshots are generated for Linux (CI environment).

### Local (CI-Matching)

To run tests in the same environment as CI, use Docker:

```bash
# Build the Docker image (one-time, or after Playwright version updates)
docker build -t playwright-e2e ./e2e

# Run tests
docker run --rm --ipc=host -e CI=true -v $(pwd):/work playwright-e2e
```

## Visual Regression Testing

Visual regression tests compare screenshots against baseline images. To ensure
consistency between local development and CI, snapshots are generated inside a
Docker container matching the CI environment.

### Updating Snapshots

When UI changes are intentional, update the baseline snapshots:

```bash
# Build the Docker image (if not already built)
docker build -t playwright-e2e ./e2e

# Update snapshots
docker run --rm --ipc=host -e CI=true -v $(pwd):/work playwright-e2e \
  bun run test:e2e -- --update-snapshots
```

Commit the updated snapshots in `e2e/smoke.spec.ts-snapshots/`.

## Docker Image

The `Dockerfile` in this directory creates a consistent test environment based
on the official Playwright image. It includes:

- Playwright browsers (Chromium, Firefox, WebKit)
- Bun runtime
- All system dependencies

The same image version is used in CI (`.github/workflows/post-merge.yml`) to
ensure snapshot consistency.
