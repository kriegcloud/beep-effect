# Topic
Docker

# TLDR
Docker is a local services surface in this repo, not a primary Turbo build surface. The current `docker-compose.yml` plus root ops scripts are a sensible separation from Turborepo. There is no immediate Turbo change to make unless Docker starts participating in app packaging or release.

# Score
0.83 / 1.00

# Current repo evidence
- `docker-compose.yml` defines only local services: `redis`, `postgres`, and `grafana`.
- Root scripts expose `services:up` and `nuke`, both of which are direct Docker operations rather than Turbo tasks.
- The root command surface has `build`, `check`, `test`, `lint`, and `docgen` routed through Turbo, but no Dockerfile or Docker-based CI workflow.
- `bunx turbo query ls @beep/desktop --output json` shows the app build surface is Vite, Tauri, and Bun scripts, not Docker packaging.

# Official Turborepo guidance
- The Docker guide recommends pruning monorepo inputs before container builds with `turbo prune <package> --docker`.
- The prune reference explains that `--docker` splits output into `json` and `full` directories so dependency installation can be cached separately from source copying.
- The prune docs also note that `globalDependencies` are preserved in the pruned config, and can be copied into the pruned output with the `pruneIncludesGlobalFiles` future flag.

# Gaps or strengths
- Strength: local infra is isolated and easy to start or reset without dragging it into the Turbo task graph.
- Strength: there is no fake Docker abstraction layered over a non-Docker deployment path.
- Gap: there is no deploy-oriented `turbo prune` flow, so Docker has no first-class optimization path if an app later ships as a container image.
- Gap: the repo currently uses Docker only for supporting services, so there is no container build cache strategy to evaluate yet.

# Improvement or preservation plan
- Preserve `docker-compose.yml` as local dev infrastructure only.
- If any app gains a Docker deployment path, add a per-app Dockerfile that starts from `turbo prune <app> --docker`.
- Add a `.dockerignore` and use the `out/json` / `out/full` split so dependency installation is cached before source copy.
- Only move Docker into Turbo task modeling if it becomes part of a reproducible build or release path; otherwise keep it as operational tooling.

# Commands and files inspected
- `sed -n '1,220p' docker-compose.yml`
- `node -e 'const p=require("./package.json"); console.log(JSON.stringify({build:p.scripts.build, "build:ci":p.scripts["build:ci"], nuke:p.scripts.nuke, "services:up":p.scripts["services:up"], release:p.scripts.release}, null, 2))'`
- `bunx turbo query ls @beep/desktop --output json`
- `rg -n "docker compose|Dockerfile|turbo prune|prune" -S . --glob '!node_modules' --glob '!.sst/**'`

# Sources
- Repo: `/home/elpresidank/YeeBois/projects/beep-effect/docker-compose.yml`
- Repo: `/home/elpresidank/YeeBois/projects/beep-effect/package.json`
- Repo: `/home/elpresidank/YeeBois/projects/beep-effect/apps/desktop/package.json`
- Turbo: `https://turborepo.dev/docs/guides/tools/docker`
- Turbo: `https://turborepo.dev/docs/reference/prune`
