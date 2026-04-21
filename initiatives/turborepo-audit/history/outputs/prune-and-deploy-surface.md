# Topic
Prune and deploy surface

# TLDR
`turbo prune` is currently unused, and that is defensible because the repo does not have a real containerized deploy pipeline yet. This topic is mostly about readiness: once an app gains a Docker or deploy artifact path, `turbo prune` should become part of that app’s packaging workflow immediately.

# Score
0.84 / 1.00

# Current repo evidence
- Root `package.json` exposes `services:up` and `nuke`, but there is no deploy-oriented Docker or packaging script.
- `docker-compose.yml` is local-infra only and defines development services rather than app image builds.
- A repo-wide search found no `turbo prune`, `prune --docker`, or Dockerfile usage outside the audit artifacts themselves.
- `release.yml` publishes packages through `changeset publish`, not through app-image or pruned deploy workflows.

# Official Turborepo guidance
- `https://turborepo.dev/docs/reference/prune` documents `turbo prune` as the way to create a reduced workspace for deployment targets.
- The prune reference recommends `--docker` when building container images so dependency installation and source copy can be cached separately.
- `https://turborepo.dev/docs/guides/tools/docker` ties prune directly to smaller build contexts and faster container builds.

# Gaps or strengths
- Strength: the repo is not prematurely adding deploy complexity for a path it does not currently use.
- Strength: package publishing already has its own explicit release workflow, so prune is not being ignored in a deployment-critical path.
- Gap: there is no ready-made app deploy slicing story if one of the Tauri/web app surfaces later needs containerization or focused packaging.
- Gap: contributor familiarity with `turbo prune` will remain low until there is a live workflow using it.

# Improvement or preservation plan
1. Preserve the current non-adoption while Docker remains a local-infra tool only.
2. The moment an app gets a Docker or app-targeted deploy path, add `turbo prune <app> --docker` as the default workspace-packaging step.
3. Keep prune scoped to deploy and packaging workflows; do not force it into everyday local development.
4. Document the trigger condition clearly so future deploy work does not rebuild the same reasoning from scratch.

# Commands and files inspected
- `sed -n '1,240p' package.json`
- `sed -n '1,220p' docker-compose.yml`
- `sed -n '1,260p' .github/workflows/release.yml`
- `rg -n 'turbo prune|prune --docker|Dockerfile' . -S --glob '!node_modules' --glob '!.sst/**' --glob '!.repos/**'`

# Sources
- Repo: `package.json`
- Repo: `docker-compose.yml`
- Repo: `.github/workflows/release.yml`
- Official Turborepo: `https://turborepo.dev/docs/reference/prune`
- Official Turborepo: `https://turborepo.dev/docs/guides/tools/docker`
