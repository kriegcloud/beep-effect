# @beep/installer-dependencies-config Agent Guide

## Purpose & Fit

- Installer-owned typed configuration contracts for the dependency slice.
- Runtime-only resolution helpers for the Bun repair milestone.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | config exports | Re-export of canonical config surfaces. |
| `/server` | `BunRuntimeServerConfig` | Server-only config contract. |
| `/layer` | `InstallerDependenciesConfig`, `makeInstallerDependenciesConfigLayer` | Runtime-only resolution helpers. |
| `/test` | test layer helpers | Deterministic fixtures for tests. |

## Add Here

- Typed config schemas and services owned by installer-dependencies.
- Runtime-only layer helpers that resolve those contracts.

## Keep Out

- Repair actions, Bun CLI process execution, or UI workflow logic.
- Broad repo constants that are not installer configuration meaning.
