# Repo Health Scorecard

## Baseline Score

| Area | Points | Baseline | Notes |
| --- | ---: | ---: | --- |
| Canonical gates and release | 50 | 30 | `check` and export catalog are green, but `lint` and Release are red. |
| Governance drift | 20 | 13 | Generated docs are scanned as source and changesets reference removed packages. |
| Agent and contributor ergonomics | 15 | 12 | Command surface is strong, but release readiness lacks a named preflight. |
| Initiative hygiene | 10 | 8 | Initiative lifecycle rules exist; active packet currentness needs inventory. |
| Measured performance | 5 | 4 | Acceleration packet has current timing evidence and ranked recommendations. |
| **Total** | **100** | **67** | Rounded initiative headline score: 70/100. |

## Target Score

The closure target is **90/100 or better** with no hard blockers.

Expected score after P1-P3:

| Area | Points | Target |
| --- | ---: | ---: |
| Canonical gates and release | 50 | 50 |
| Governance drift | 20 | 18 |
| Agent and contributor ergonomics | 15 | 14 |
| Initiative hygiene | 10 | 9 |
| Measured performance | 5 | 4 |
| **Total** | **100** | **95** |

## Scoring Rule

A high numeric score cannot override a hard blocker. If any hard blocker in
`SPEC.md` is red, the repo-health score must be reported as below 90.

## Post-Implementation Local Candidate

Captured on 2026-05-16 after P1-P3 local proof.

| Area | Points | Local Candidate | Notes |
| --- | ---: | ---: | --- |
| Canonical gates and release | 50 | 45 | Local gates, repo-sanity, changeset graph, and throwaway `changeset version` proof pass; fresh GitHub Check and Release evidence still requires landing. |
| Governance drift | 20 | 19 | Generated docs are excluded from source-law scanning, stale changeset package refs are removed, stale tsconfig excludes are gone, and the export catalog is current. |
| Agent and contributor ergonomics | 15 | 15 | `bun run beep quality changeset-graph` is discoverable through the quality command surface and wired into repo-sanity plus Release. |
| Initiative hygiene | 10 | 9 | Packet, manifest, evidence, scorecard, and stale-reference inventory are present; final closure waits on fresh GitHub evidence. |
| Measured performance | 5 | 4 | Performance remains owned by `repo-quality-acceleration`; this packet records the current measured score only. |
| **Total** | **100** | **92** | Local candidate score clears 90; final closure is blocked on fresh GitHub Check and Release evidence by `SPEC.md`. |
