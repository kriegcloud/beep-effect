# Docker & Build Enhancements (Effect Ontology)

Scope: tighten Docker/build performance and reliability for the Effect-based extraction service and deploy CLI. References: `packages/@core-v2/Dockerfile`, `.dockerignore`, `cloudbuild.yaml`, `tools/deploy/src/Service/DockerRunner.ts`, Terraform `infra/modules/cloud-run`.

## Quick Wins (High Impact, Low Risk)
- Enable BuildKit syntax and caching: add `# syntax=docker/dockerfile:1.7` and use `RUN --mount=type=cache,target=/root/.cache/bun bun install --ci --frozen-lockfile --no-progress` in the builder. Set `ENV BUN_INSTALL_CACHE_DIR=/root/.cache/bun BUN_CONFIG_NO_TELEMETRY=1` to stabilize cache keys.
- Slim runtime layer: in the final stage run `bun install --production --frozen-lockfile` (or `bun pm prune --production`) instead of copying builder `node_modules`; copy only `dist/` + required assets to cut image size and cold starts.
- Tighten .dockerignore: exclude `output/`, `test-output/`, `scratchpad/`, `infra/tfplan`, large datasets, and local logs to reduce context upload and cache churn.
- Always pull patched base: add `--pull` (or `pull: true` in Buildx) to the build invocation to keep `oven/bun` up to date.
- OCI labels and build args: stamp images with `org.opencontainers.image.{source,revision,created}` using build args `GIT_SHA`, `BUILD_ID` and surface them in runtime logs via an Effect Layer (e.g., `BuildInfoLive`).

## Dockerfile Refinements
- Multi-stage clarity: keep the builder on full `oven/bun` but consider `oven/bun:1.2.23-slim` for the runtime if native deps stay minimal.
- Use `--chown=effect:nodejs` on COPY in the runtime stage to avoid extra chown steps; keep the non-root user.
- Make health probe configurable: add `ARG HEALTH_PATH=/health/live` and wire to `HEALTHCHECK` so Cloud Run/readiness can align.
- Platform targeting: default `--platform=linux/amd64` is fine; if ARM Macs are common, support `linux/arm64` multi-arch via Buildx.

## Build Pipeline (Local CLI + Cloud Build)
- Buildx with registry cache: change both local CLI (`DockerRunner.build`) and Cloud Build to `docker buildx build --push --platform=linux/amd64 --cache-to=type=registry,ref=$IMAGE:cache,mode=max --cache-from=type=registry,ref=$IMAGE:cache`. This removes repeated cold builds.
- Single Cloud Build step: replace the four docker steps in `cloudbuild.yaml` with one buildx command tagging `:latest`, `:$BUILD_ID`, `:dev` and pushing once; add `--provenance`/`--sbom` if supply-chain metadata is desired.
- Typed options in DockerRunner: extend `DockerBuildOptions` to carry `cacheFrom`, `cacheTo`, `pull`, `labels`, `target`, `buildContext`, `progress` and pass them through to the CLI command. Add detection of Buildx availability in `PrereqChecker` to fail fast.
- Cloud Build fallback strategy: add a `--build-strategy {local,cloud-build}` flag (already noted in deploy CLI refinements doc) and a `CloudBuildRunner` that streams logs; use it when Docker daemon is absent or network is slow.
- Concurrency and logs: stream build output through Effect spans (`Effect.withSpan("docker.build")`) and surface timings to guide cache tuning.

## Runtime & Release Discipline
- Immutable images in Terraform: keep `image` var pointing at digests (not mutable tags) to avoid drift; teach deploy CLI to resolve tag → digest after push and update tfvars before apply.
- Build info endpoint: generate `dist/build-info.json` during build (git sha, build time, image digest, ontology version) and expose via a small handler; useful for readiness debugging.
- Config parity: ensure Cloud Run env matches container defaults (`PORT`, `ONTOLOGY_PATH`) and consider env overrides for `HEALTH_PATH`/`READINESS_PATH`.

## Optional / Nice-to-Have
- SBOM/attestations: enable `--sbom=true --provenance=true` in buildx for supply chain; store artifacts in GCR/Artifact Registry.
- Parallel test/build: add a `bun run verify` that lints + tests + type-checks before docker build; run it in Cloud Build as a separate step using cached deps.
- Layered ontologies: if ontologies change slower than code, split them into a separate layer (`COPY ontologies` before deps) so schema tweaks don’t invalidate dependency layers.

## Suggested Implementation Order
1) Dockerfile + .dockerignore cleanup (cache mounts, prod-only runtime deps, health arg).  
2) Update DockerRunner + deploy CLI to call buildx with cache-from/cache-to/pull/labels.  
3) Simplify Cloud Build to one buildx step with registry cache and tags.  
4) Digest-based deploys + BuildInfo layer for observability.  
5) Add Cloud Build fallback path and prereq checks for buildx.  
6) Opt-in SBOM/provenance and multi-arch if needed.
