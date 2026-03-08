# Status
fixed on current branch

## Outcome
The default `dozzle` service was removed from `docker-compose.yml`, so the shipped compose stack no longer exposes an unauthenticated Docker-socket-backed log UI.

## Evidence
- Code: `docker-compose.yml`
- Verification: `git diff -- docker-compose.yml`
